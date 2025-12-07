import { supabase } from "./supabase";
import { useSyncStore } from "../store/syncStore";
import { syncQueueService } from "./syncQueue";
import { conflictDetectionService } from "./conflictDetection";
import { showToast } from "../utils/toast";
import type { ConflictInfo } from "../types";

const SYNC_BATCH_SIZE = 50;
const SYNC_TABLES = [
  "patients",
  "inpatient_records",
  "operations",
  "outpatient_visits",
  "users",
] as const;

type SyncTable = (typeof SYNC_TABLES)[number];

/**
 * Pull Sync Service - Syncs data from Supabase to local SQLite
 */
export class PullSyncService {
  private isPulling = false;

  /**
   * Get last sync timestamp for a specific table
   */
  private async getLastSyncTime(tableName: string): Promise<string | null> {
    try {
      const result = await window.db.queryOne<{ last_sync: string }>(
        `SELECT value as last_sync FROM sync_metadata WHERE key = ?`,
        [`last_pull_sync_${tableName}`]
      );
      return result?.last_sync ?? null;
    } catch {
      return null;
    }
  }

  /**
   * Update last sync timestamp for a table
   */
  private async updateLastSyncTime(
    tableName: string,
    timestamp: string
  ): Promise<void> {
    await window.db.execute(
      `INSERT OR REPLACE INTO sync_metadata (key, value, updated_at)
       VALUES (?, ?, strftime('%s', 'now'))`,
      [`last_pull_sync_${tableName}`, timestamp]
    );
  }

  /**
   * Check if a record has pending local changes in sync queue
   */
  private async hasPendingLocalChanges(
    tableName: string,
    recordId: string
  ): Promise<boolean> {
    const queueItems = await syncQueueService.getQueueItemsByRecord(
      tableName,
      recordId
    );
    return queueItems.some((item) =>
      ["pending", "failed", "syncing"].includes(item.status)
    );
  }

  /**
   * Pull all changes from Supabase for a specific table
   */
  private async pullTableChanges(tableName: SyncTable): Promise<number> {
    const lastSync = await this.getLastSyncTime(tableName);
    let recordsProcessed = 0;

    try {
      // Build query - get records updated since last sync
      let query = supabase
        .from(tableName)
        .select("*")
        .order("updated_at", { ascending: true })
        .limit(SYNC_BATCH_SIZE);

      if (lastSync) {
        // Incremental sync - only get records updated after last sync
        query = query.gt("updated_at", lastSync);
      }

      const { data: remoteRecords, error } = await query;

      if (error) throw error;
      if (remoteRecords.length === 0) {
        return 0;
      }

      console.log(
        `Pulling ${String(remoteRecords.length)} records from ${tableName}...`
      );

      // Process each record
      for (const remoteRecord of remoteRecords) {
        const recordId = remoteRecord.id;

        // Skip if there are pending local changes for this record
        const hasPendingChanges = await this.hasPendingLocalChanges(
          tableName,
          recordId
        );

        if (hasPendingChanges) {
          console.log(
            `Skipping ${tableName}:${recordId} - has pending local changes`
          );
          continue;
        }

        // Check if record exists locally
        const localRecord = await window.db.queryOne<Record<string, unknown>>(
          `SELECT * FROM ${tableName} WHERE id = ?`,
          [recordId]
        );

        if (!localRecord) {
          // Record doesn't exist locally - insert it
          await this.insertLocalRecord(tableName, remoteRecord);
          recordsProcessed++;
        } else {
          // Record exists - check for conflicts
          const conflict = conflictDetectionService.detectConflict(
            tableName,
            recordId,
            localRecord,
            remoteRecord
          );

          if (conflict) {
            // Conflict detected - needs resolution
            await this.handlePullConflict(conflict);
          } else {
            // No conflict - update local record with remote data
            await this.updateLocalRecord(tableName, recordId, remoteRecord);
            recordsProcessed++;
          }
        }
      }

      // Update last sync timestamp to the latest record's updated_at
      if (remoteRecords.length > 0) {
        const latestTimestamp =
          remoteRecords[remoteRecords.length - 1].updated_at;
        await this.updateLastSyncTime(tableName, latestTimestamp);
      }

      return recordsProcessed;
    } catch (error) {
      console.error(`Error pulling ${tableName}:`, error);
      throw error;
    }
  }

  /**
   * Insert a new record into local SQLite
   */
  private async insertLocalRecord(
    tableName: string,
    record: Record<string, unknown>
  ): Promise<void> {
    const columns = Object.keys(record);
    const values = Object.values(record);
    const placeholders = columns.map(() => "?").join(", ");

    await window.db.execute(
      `INSERT OR REPLACE INTO ${tableName} (${columns.join(", ")})
       VALUES (${placeholders})`,
      values
    );

    console.log(`Inserted ${tableName}:${String(record.id)} from remote`);
  }

  /**
   * Update an existing local record with remote data
   */
  private async updateLocalRecord(
    tableName: string,
    recordId: string,
    remoteRecord: Record<string, unknown>
  ): Promise<void> {
    const columns = Object.keys(remoteRecord).filter((key) => key !== "id");
    const updates = columns.map((col) => `${col} = ?`).join(", ");
    const values = [...columns.map((col) => remoteRecord[col]), recordId];

    await window.db.execute(
      `UPDATE ${tableName}
       SET ${updates}
       WHERE id = ?`,
      values
    );

    console.log(`Updated ${tableName}:${recordId} from remote`);
  }

  /**
   * Handle conflicts detected during pull sync
   * Strategy: Remote wins during pull (local changes should be in sync queue)
   */
  private async handlePullConflict(conflict: ConflictInfo): Promise<void> {
    console.warn("Conflict detected during pull sync:", conflict);

    // Save conflict to local database for user resolution
    await window.db.execute(
      `INSERT INTO sync_conflicts (
        table_name,
        record_id,
        local_version,
        remote_version,
        conflict_type,
        resolved,
        timestamp
      ) VALUES (?, ?, ?, ?, ?, 0, strftime('%s', 'now'))`,
      [
        conflict.tableName,
        conflict.recordId,
        JSON.stringify(conflict.localData),
        JSON.stringify(conflict.remoteData),
        "pull_conflict",
      ]
    );

    // Also save to Supabase for tracking
    await supabase.from("sync_conflicts").insert({
      table_name: conflict.tableName,
      record_id: conflict.recordId,
      local_version: conflict.localData,
      remote_version: conflict.remoteData,
      conflict_type: "pull_conflict",
    });

    // Update sync status
    useSyncStore.getState().setSyncStatus("conflict");
  }

  /**
   * Pull changes from Supabase for all tables
   */
  async pullAll(): Promise<void> {
    const { isOnline } = useSyncStore.getState();

    if (!isOnline || this.isPulling) {
      return;
    }

    try {
      this.isPulling = true;
      useSyncStore.getState().setSyncStatus("syncing");

      let totalRecordsPulled = 0;

      // Pull each table sequentially
      for (const table of SYNC_TABLES) {
        const recordsPulled = await this.pullTableChanges(table);
        totalRecordsPulled += recordsPulled;
      }

      // Check for conflicts
      const conflictCount = await this.getLocalConflictCount();
      if (conflictCount > 0) {
        useSyncStore.getState().setSyncStatus("conflict");
        useSyncStore.getState().setConflictsCount(conflictCount);

        showToast.conflicts(conflictCount, () => {
          window.dispatchEvent(new CustomEvent("open-conflict-resolver"));
        });

        window.dispatchEvent(new CustomEvent("sync-conflicts-detected"));
        return;
      }

      // Update sync status
      useSyncStore.getState().setSyncStatus("synced");
      useSyncStore.getState().setLastSyncTime(Date.now());

      if (totalRecordsPulled > 0) {
        showToast.success(`Pulled ${String(totalRecordsPulled)} updates from server`);
      }
    } catch (error) {
      console.error("Pull sync error:", error);
      useSyncStore.getState().setSyncStatus("error");
      useSyncStore
        .getState()
        .setSyncError(
          error instanceof Error ? error.message : "Pull sync failed"
        );
      showToast.error("Failed to sync from server");
    } finally {
      this.isPulling = false;
    }
  }

  /**
   * Get local conflict count
   */
  private async getLocalConflictCount(): Promise<number> {
    const result = await window.db.queryOne<{ count: number }>(
      `SELECT COUNT(*) as count FROM sync_conflicts WHERE resolved = 0`
    );
    return result?.count ?? 0;
  }

  /**
   * Full sync on app startup
   */
  async syncOnStartup(): Promise<void> {
    console.log("Running pull sync on startup...");
    await this.pullAll();
  }

  /**
   * Periodic sync (called every 30 minutes)
   */
  async periodicSync(): Promise<void> {
    if (!this.isPulling) {
      console.log("Running periodic pull sync...");
      await this.pullAll();
    }
  }

  /**
   * Manual sync trigger
   */
  async syncNow(): Promise<void> {
    if (this.isPulling) {
      showToast.warning("Sync already in progress");
      return;
    }
    await this.pullAll();
  }
}

export const pullSyncService = new PullSyncService();
