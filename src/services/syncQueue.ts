import { useSyncStore } from "../store/syncStore";
import type { SyncQueueItem, SyncStatus } from "../types";

export class SyncQueueService {
  /**
   * Add an item to the sync queue whenever
   * data is created/updated/deleted offline
   */
  async addToQueue(
    item: Omit<SyncQueueItem, "id | status | created_at">
  ): Promise<number> {
    try {
      const result = await window.db.execute(
        `
        INSERT INTO sync_queue (table_name, record_id, operation, data, status)
        VALUES (?, ?, ?, ?, 'pending')
        `,
        [
          item.table_name,
          item.record_id,
          item.operation,
          JSON.stringify(item.data),
        ]
      );

      // Update the pending count when items are added to queue
      await this.updatePendingCount();

      return result.lastInsertRowid;
    } catch (error) {
      console.error("Error adding to sync queue:", error);
      throw error;
    }
  }

  /**
   * Get all pending items from the queue
   */
  async getAllPendingItems(limit = 50): Promise<SyncQueueItem[]> {
    try {
      const items = await window.db.query<SyncQueueItem>(
        `SELECT * FROM sync_queue
        WHERE status IN ('pending', 'failed')
        ORDER BY created_at ASC
        LIMIT ?`,
        [limit]
      );

      return items;
    } catch (error) {
      console.error("Error getting pending items:", error);
      return [];
    }
  }

  /**
   * Update the status of the item in the queue
   */
  async updateQueueItemStatus(
    id: number,
    status: SyncStatus,
    errorMessage?: string
  ): Promise<void> {
    try {
      await window.db.execute(
        `
        UPDATE sync_queue
        SET status = ?,
            error_message = ?,
            synced_at = CASE WHEN ? = 'synced' THEN strftime('%s', 'now') ELSE synced_at END
        WHERE id = ?`,
        [status, errorMessage ?? null, status, id]
      );

      await this.updatePendingCount();
    } catch (error) {
      console.error("Error updating queue item:", error);
      throw error;
    }
  }

  /**
   * Increment retry count for failed item
   */
  async incrementRetryCount(id: number): Promise<void> {
    try {
      await window.db.execute(
        `UPDATE sync_queue
        SET retry_count = retry_count + 1,
            last_retry_at = strftime('%s', 'now')
        WHERE id = ?`,
        [id]
      );
    } catch (error) {
      console.error("Error incrementing retry count:", error);
      throw error;
    }
  }

  /**
   * Mark items as syncing
   */
  async markAsSyncing(ids: number[]): Promise<void> {
    try {
      const placeholders = ids.map(() => "?").join(", ");
      await window.db.execute(
        `UPDATE sync_queue
        SET status = 'syncing'
        WHERE id IN (${placeholders})`,
        ids
      );
    } catch (error) {
      console.error("Error marking as syncing:", error);
      throw error;
    }
  }

  /**
   * Get the count of pending items
   */
  async getPendingCount(): Promise<number> {
    try {
      const result = await window.db.queryOne<{ count: number }>(
        `SELECT COUNT(*) as count FROM sync_queue
        WHERE status IN ('pending', 'failed')`
      );

      return result?.count ?? 0;
    } catch (error) {
      console.error("Error getting pending items count:", error);
      throw error;
    }
  }

  /**
   * Update pending count in store
   */
  async updatePendingCount(): Promise<void> {
    const count = await this.getPendingCount();
    useSyncStore.getState().setPendingCount(count);
  }

  /**
   * Clear synced items
   * Only remove items synced more than 7 days ago
   */
  async clearSyncedItems(): Promise<void> {
    try {
      const sevenDaysAgo = Math.floor(Date.now() / 1000) - 7 * 24 * 60 * 60;

      await window.db.execute(
        `DELETE FROM sync_queue
        WHERE status = 'synced'
        AND synced_at < ?`,
        [sevenDaysAgo]
      );
    } catch (error) {
      console.error("Error cleaning up:", error);
      throw error;
    }
  }

  /**
   * Get items by table and record (for conflict detection)
   */
  async getQueueItemsByRecord(
    tableName: string,
    recordId: string
  ): Promise<SyncQueueItem[]> {
    try {
      return await window.db.query<SyncQueueItem>(
        `SELECT * FROM sync_queue
        WHERE table_name = ?
        AND record_id = ?
        AND status IN ('pending', 'failed')
        ORDER BY created_at ASC`,
        [tableName, recordId]
      );
    } catch (error) {
      console.error("Error getting queue items by record", error);
      return [];
    }
  }

  /**
   * Get count of conflicts in the queue
   */
  async getConflictCount(): Promise<number> {
    try {
      const result = await window.db.queryOne<{ count: number }>(
        `SELECT COUNT(*) as count FROM sync_queue WHERE status = 'conflict'`
      );
      return result?.count ?? 0;
    } catch (error) {
      console.error("Error getting conflict count:", error);
      return 0;
    }
  }
}

export const syncQueueService = new SyncQueueService();
