import { supabase } from "./supabase";
import { syncQueueService } from "./syncQueue";
import { useSyncStore } from "../store/syncStore";
import type { ConflictInfo, SyncQueueItem } from "../types";
import { parseTime } from "../utils/dateUtils";
import { showToast } from "../utils/toast";
import { conflictDetectionService } from "./conflictDetection";

const MAX_BATCH_SIZE = 50;
const MAX_RETRY_COUNT = 5;
const MAX_BACKOFF_MS = 5 * 60 * 1000; // 5 minutes

// Syncing to Supabase
export class SyncService {
  private isSyncing = false;
  private retryTimeouts = new Map<number, NodeJS.Timeout>();

  /**
   * Calculate exponential backoff in milliseconds
   */
  private calculateBackoff(retryCount: number): number {
    const backoffMs = Math.pow(2, retryCount) * 1000;
    return Math.min(backoffMs, MAX_BACKOFF_MS);
  }

  /**
   * Check if an item is ready to be retried
   */
  private isReadyToRetry(item: SyncQueueItem) {
    if (!item.last_retry_at || item.retry_count === 0) {
      return true;
    }

    const backoffMs = this.calculateBackoff(item.retry_count ?? 0);
    const nextRetryTime = item.last_retry_at * 1000 + backoffMs;
    const now = Date.now();

    return now >= nextRetryTime;
  }

  /**
   * Get time remaining until next retry (in seconds)
   */
  getNextRetryTime(item: SyncQueueItem): number | null {
    if (!item.last_retry_at || item.retry_count === 0) {
      return 0;
    }

    const backoffMs = this.calculateBackoff(item.retry_count ?? 0);
    const nextRetryTime = item.last_retry_at * 1000 + backoffMs;
    const now = Date.now();

    if (now >= nextRetryTime) {
      // Retry now
      return 0;
    }

    return Math.ceil((nextRetryTime - now) / 1000);
  }

  /**
   * Schedule a retry for a specific item after backoff period
   */
  private scheduleRetry(item: SyncQueueItem): void {
    const itemId = item.id;
    if (itemId == null) return;

    const existingTimeout = this.retryTimeouts.get(itemId);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }

    const backoffMs = this.calculateBackoff(item.retry_count ?? 0);

    console.log(
      `Scheduling retry for item ${String(itemId)} in ${String(backoffMs / 1000)}s (attempt ${String(item.retry_count ?? 0 + 1)}/${String(MAX_RETRY_COUNT)})`
    );

    const timeout = setTimeout(() => {
      this.retryTimeouts.delete(itemId);
      void this.syncAll();
    }, backoffMs);

    this.retryTimeouts.set(itemId, timeout);
  }

  /**
   * Sync all pending items to Supabase
   */
  async syncAll(force = false) {
    const { isOnline } = useSyncStore.getState();

    // Don't sync offline or already syncing
    if (!isOnline || this.isSyncing) return;

    try {
      this.isSyncing = true;
      useSyncStore.getState().setSyncStatus("syncing");

      // Get pending items
      const pendingItems =
        await syncQueueService.getAllPendingItems(MAX_BATCH_SIZE);

      if (pendingItems.length === 0) {
        useSyncStore.getState().setSyncStatus("synced");
        useSyncStore.getState().setLastSyncTime(Date.now());
        return;
      }

      // Filter items that are ready to retry (unless forced)
      const itemsToSync = force
        ? pendingItems
        : pendingItems.filter((item) => this.isReadyToRetry(item));

      if (itemsToSync.length === 0) {
        console.log("No items ready to retry yet (backoff period active)");
        useSyncStore.getState().setSyncStatus("synced");

        // Schedule retries for items still in backoff
        pendingItems.forEach((item) => {
          if (
            (item.retry_count ?? 0) > 0 &&
            (item.retry_count ?? 0) < MAX_RETRY_COUNT
          ) {
            this.scheduleRetry(item);
          }
        });
        return;
      }

      // Mark as syncing
      const itemIds = pendingItems.map((item) => item.id) as number[];
      await syncQueueService.markAsSyncing(itemIds);

      // Group by table for efficient batch uploads
      const groupedByTable = this.groupByTable(pendingItems);

      // Sync each table's items
      for (const [tableName, items] of Object.entries(groupedByTable)) {
        await this.syncTableItems(tableName, items);
      }

      // Check for conflicts detected during this sync
      const conflictCount = await syncQueueService.getConflictCount();
      if (conflictCount > 0) {
        useSyncStore.getState().setSyncStatus("conflict");
        useSyncStore.getState().setConflictsCount(conflictCount);

        showToast.conflicts(conflictCount, () => {
          window.dispatchEvent(new CustomEvent("open-conflict-resolver"));
        });

        // Trigger UI to show conflict modal
        window.dispatchEvent(new CustomEvent("sync-conflicts-detected"));

        return;
      }

      // Update sync status
      useSyncStore.getState().setSyncStatus("synced");
      useSyncStore.getState().setLastSyncTime(Date.now());
      useSyncStore.getState().setSyncError(null);

      showToast.syncSuccess();

      // Check if there are more items to sync
      const remainingCount = await syncQueueService.getPendingCount();
      if (remainingCount > 0) {
        const remainingItems =
          await syncQueueService.getAllPendingItems(MAX_BATCH_SIZE);

        // Check if any items are ready to retry now
        const readyItems = remainingItems.filter((item) =>
          this.isReadyToRetry(item)
        );

        if (readyItems.length > 0) {
          setTimeout(() => void this.syncAll(), 1000);
        } else {
          // Schedule retry for items in backoff
          remainingItems.forEach((item) => {
            if (
              (item.retry_count ?? 0) > 0 &&
              (item.retry_count ?? 0) < MAX_RETRY_COUNT
            ) {
              this.scheduleRetry(item);
            }
          });
        }
      }
    } catch (error) {
      useSyncStore.getState().setSyncStatus("error");
      useSyncStore
        .getState()
        .setSyncError(error instanceof Error ? error.message : "Sync failed");
      showToast.syncError(
        error instanceof Error ? error.message : "Unknown error"
      );
    } finally {
      this.isSyncing = false;
    }
  }

  /**
   * Group queue items by table name
   */
  private groupByTable(
    items: SyncQueueItem[]
  ): Record<string, SyncQueueItem[]> {
    return items.reduce<Record<string, SyncQueueItem[]>>((acc, item) => {
      const key = item.table_name;
      acc[key] ??= [];
      acc[key].push(item);
      return acc;
    }, {});
  }

  /**
   * Sync items for a specific table
   */
  private async syncTableItems(
    tableName: string,
    items: SyncQueueItem[]
  ): Promise<void> {
    for (const item of items) {
      const id = item.id;
      try {
        // Check retry limit
        if ((item.retry_count ?? 0) >= MAX_RETRY_COUNT) {
          console.warn(
            `Max retries reached for item ${String(item.id)} skipping`
          );

          if (id != null) {
            await syncQueueService.updateQueueItemStatus(
              id,
              "failed",
              "Max retry count exceeded"
            );
          }
          continue;
        }

        // Execute sync operation based on type
        switch (item.operation) {
          case "insert":
            await this.syncInsert(tableName, item);
            break;
          case "update":
            await this.syncUpdate(tableName, item);
            break;
          case "delete":
            await this.syncDelete(tableName, item);
            break;
        }

        // Mark as synced
        if (id != null) {
          await syncQueueService.updateQueueItemStatus(id, "synced");
        }
      } catch (error) {
        // Increment retry count and mark failed if id exists
        if (id != null) {
          await syncQueueService.incrementRetryCount(id);
          await syncQueueService.updateQueueItemStatus(
            id,
            "failed",
            error instanceof Error ? error.message : "Unknown error"
          );
        } else {
          console.warn(
            `Cannot update retry/status for item due to missing id (record_id=${item.record_id})`
          );
        }
      }
    }
  }

  /**
   * Sync insert operation
   */
  private async syncInsert(
    tableName: string,
    item: SyncQueueItem
  ): Promise<void> {
    const data =
      typeof item.data === "string"
        ? (JSON.parse(item.data) as Record<string, unknown>)
        : item.data;

    const { error } = await supabase.from(tableName).insert([data]);

    if (error) throw error;
  }

  /**
   * Sync update operation (with conflict detection)
   */
  private async syncUpdate(
    tableName: string,
    item: SyncQueueItem
  ): Promise<void> {
    const localData =
      typeof item.data === "string"
        ? (JSON.parse(item.data) as Record<string, unknown>)
        : item.data;

    const { data: remoteData, error: fetchError } = await supabase
      .from(tableName)
      .select("*")
      .eq("id", item.record_id)
      .single<Record<string, unknown>>();

    if (fetchError) throw fetchError;

    // Detect conflicts
    const conflict = conflictDetectionService.detectConflict(
      tableName,
      item.record_id,
      localData,
      remoteData
    );

    if (conflict) {
      console.log("Conflict detected:", conflict);

      // Try to auto-resolve
      const resolved = this.tryAutoResolver(conflict);

      if (resolved) {
        // Auto-resolved, update with merged data
        const { error } = await supabase
          .from(tableName)
          .update(resolved)
          .eq("id", item.record_id);

        if (error) throw error;
        console.log("Auto-resolved conflict for record_id:", item.record_id);
        return;
      } else {
        // Needs manual resolution - save to Supabase
        await this.saveConflictToSupabase(conflict);

        // Mark queue item as conflict
        const id = item.id;

        if (id != null) {
          await syncQueueService.updateQueueItemStatus(
            id,
            "conflict",
            `Conflict on fields: ${conflict.changedFields.map((f) => f.fieldName).join(", ")}`
          );
        }
      }
    }

    // No conflict, sync normally
    const { error } = await supabase
      .from(tableName)
      .update(localData)
      .eq("id", item.record_id);

    if (error) throw error;
  }

  /**
   * Sync delete operation (soft delete)
   */
  private async syncDelete(
    tableName: string,
    item: SyncQueueItem
  ): Promise<void> {
    const { error } = await supabase
      .from(tableName)
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", item.record_id);

    if (error) throw error;
  }

  /**
   * Auto-sync when online
   */
  async syncOnOnline(): Promise<void> {
    await this.syncAll();
  }

  /**
   * Manually trigger sync
   */
  async syncNow(): Promise<void> {
    if (this.isSyncing) {
      showToast.warning("Sync is already in progress");
      return;
    }
    await this.syncAll(true);
  }

  /**
   * Retry all failed items (bypasses backoff)
   */
  async retryFailed(): Promise<void> {
    if (this.isSyncing) {
      showToast.warning("Sync is already in progress");
      return;
    }

    const failedCount = await syncQueueService.getPendingCount();

    if (failedCount === 0) {
      showToast.info("No failed items to retry");
      return;
    }

    showToast.info(`Retrying ${String(failedCount)} failed items...`);
    await this.syncAll(true); // Force sync all failed items
  }

  /**
   * Clear all scheduled retries
   */
  clearRetrySchedules(): void {
    this.retryTimeouts.forEach((timeout) => {
      clearTimeout(timeout);
    });
    this.retryTimeouts.clear();
  }

  /**
   * Try to auto-resolve conflict using CONFLICT_RULES
   */
  private tryAutoResolver(
    conflict: ConflictInfo
  ): Record<string, unknown> | null {
    const resolvedData = { ...conflict.localData };
    let allResolved = true;

    for (const field of conflict.changedFields) {
      switch (field.strategy) {
        case "prefer_recent": {
          const localUpdated = parseTime(conflict.localData.updated_at);
          const remoteUpdated = parseTime(conflict.remoteData.updated_at);

          if (localUpdated > remoteUpdated) {
            resolvedData[field.fieldName] = field.localValue;
          } else {
            resolvedData[field.fieldName] = field.remoteValue;
          }
          break;
        }

        case "prefer_remote":
          resolvedData[field.fieldName] = field.remoteValue;
          break;

        case "prefer_local":
          resolvedData[field.fieldName] = field.localValue;
          break;

        case "flag_for_review":
          allResolved = false;
          break;
      }
    }

    return allResolved ? resolvedData : null;
  }

  /**
   * Save conflict to Supabase for manual resolution
   */
  private async saveConflictToSupabase(conflict: ConflictInfo): Promise<void> {
    const { error } = await supabase.from("sync_conflicts").insert({
      table_name: conflict.tableName,
      record_id: conflict.recordId,
      local_version: conflict.localData,
      remote_version: conflict.remoteData,
      conflict_type: "field_mismatch",
    });

    if (error) {
      console.error("Error saving conflict to Supabase:", error);
      throw error;
    }
  }
}

export const syncService = new SyncService();
