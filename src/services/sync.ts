import { useSyncStore } from "../store/syncStore";
import { supabase } from "./supabase";
import { syncQueueService } from "./syncQueue";
import type { SyncQueueItem } from "./syncQueue";

const MAX_BATCH_SIZE = 50;
const MAX_RETRY_COUNT = 5;

// Syncing to Supabase
export class SyncService {
  private isSyncing = false;

  /**
   * Sync all pending items to Supabase
   */
  async syncAll() {
    const { isOnline } = useSyncStore.getState();

    // Don't sync offline or already synced
    if (!isOnline || this.isSyncing) {
      console.log("Sync skipped", { isOnline, isSyncing: this.isSyncing });
      return;
    }

    try {
      this.isSyncing = true;
      useSyncStore.getState().setSyncStatus("syncing");

      console.log("Sync starting");

      // Get pending items
      const pendingItems =
        await syncQueueService.getAllPendingItems(MAX_BATCH_SIZE);

      if (pendingItems.length === 0) {
        console.log("No items to sync");
        useSyncStore.getState().setSyncStatus("synced");
        useSyncStore.getState().setLastSyncTime(Date.now());
        return;
      }

      console.log(`Syncing ${String(pendingItems.length)} items`);

      // Mark as syncing
      const itemIds = pendingItems.map((item) => item.id) as number[];
      await syncQueueService.markAsSyncing(itemIds);

      // Group by table for efficient batch uploads
      const groupedByTable = this.groupByTable(pendingItems);

      // Sync each table's items
      for (const [tableName, items] of Object.entries(groupedByTable)) {
        await this.syncTableItems(tableName, items);
      }

      // Update sync status
      useSyncStore.getState().setSyncStatus("synced");
      useSyncStore.getState().setLastSyncTime(Date.now());
      useSyncStore.getState().setSyncError(null);

      console.log("Sync completed successfully");

      // If there are more items, sync again
      const remainingCount = await syncQueueService.getPendingCount();
      if (remainingCount > 0) {
        const remainingItems = await syncQueueService.getAllPendingItems(10);
        const hasRetryableItems = remainingItems.some(
          (item) => (item.retry_count ?? 0) < MAX_RETRY_COUNT
        );

        if (hasRetryableItems) {
          console.log(
            `🔄 ${String(remainingCount)} items remaining, syncing again...`
          );
          setTimeout(() => void this.syncAll(), 1000);
        } else {
          console.log(
            `⚠️ ${String(remainingCount)} items failed permanently, stopping sync`
          );
          useSyncStore
            .getState()
            .setSyncError(
              `${String(remainingCount)} items failed after max retries`
            );
        }
      }
    } catch (error) {
      console.error("❌ Sync failed:", error);
      useSyncStore.getState().setSyncStatus("error");
      useSyncStore
        .getState()
        .setSyncError(error instanceof Error ? error.message : "Sync failed");
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
      if (!Object.prototype.hasOwnProperty.call(acc, key)) {
        acc[key] = [];
      }

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
    console.log(
      `Syncing ${String(items.length)} items for table: ${tableName}`
    );

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
          } else {
            console.warn(
              `Cannot mark item as failed due to missing id (record_id=${item.record_id})`
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
        } else {
          console.warn(
            `Cannot mark item as synced due to missing id (record_id=${item.record_id})`
          );
        }
        console.log(
          `✅ Synced ${item.operation} for ${tableName}:`,
          item.record_id
        );
      } catch (error) {
        console.error(`❌ Failed to sync item ${String(item.id)}:`, error);

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
   * Sync update operation
   */
  private async syncUpdate(
    tableName: string,
    item: SyncQueueItem
  ): Promise<void> {
    const data =
      typeof item.data === "string"
        ? (JSON.parse(item.data) as Record<string, unknown>)
        : item.data;

    const { error } = await supabase
      .from(tableName)
      .update(data)
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
    console.log("Automatically syncing");
    await this.syncAll();
  }

  /**
   * Manually trigger sync
   */
  async syncNow(): Promise<void> {
    console.log("Manual sync");
    await this.syncAll();
  }
}

export const syncService = new SyncService();
