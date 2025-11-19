import { useSyncStore } from "../store/syncStore";
import type { BatchWriteOperation } from "../types";
import { syncService } from "./sync";
import { syncQueueService } from "./syncQueue";

export class BatchOperationsService {
  /**
   * Execute a write operation (insert/update/delete)
   * Adds to sync queue if offline, syncs immediately if online
   */
  async executeWrite(operation: BatchWriteOperation): Promise<boolean> {
    const { isOnline } = useSyncStore.getState();

    try {
      // Write to local SQLite
      await this.writeToLocal(operation);

      // Add to sync queue
      await syncQueueService.addToQueue({
        table_name: operation.table,
        record_id: operation.recordId,
        operation: operation.operation,
        data: operation.data,
      });

      // If online sync immediately, will be implemented in a sync service
      if (isOnline) {
        console.log("Online - Sync will begin");
        void syncService.syncNow();
      } else {
        console.log("Offline - queued for later sync");
      }

      return true;
    } catch (error) {
      console.error("Error executing write:", error);
      return false;
    }
  }

  /**
   * Write to the local SQLite database
   */
  private async writeToLocal(operation: BatchWriteOperation): Promise<void> {
    const { table, data, recordId, operation: op } = operation;

    switch (op) {
      case "insert":
        await this.insertLocal(table, data);
        break;
      case "update":
        await this.updateLocal(table, recordId, data);
        break;
      case "delete":
        await this.deleteLocal(table, recordId);
        break;
    }
  }

  /**
   * Insert record to local database
   */
  private async insertLocal(
    table: string,
    data: Record<string, unknown>
  ): Promise<void> {
    const columns = Object.keys(data);
    const values = Object.values(data);
    const placeholders = columns.map(() => "?").join(", ");

    await window.db.execute(
      `INSERT INTO ${table} (${columns.join(", ")})
        VALUES (${placeholders})`,
      values
    );

    console.log(`Inserted into local ${table}:`, data.id);
  }

  /**
   * Update record in local database
   */
  private async updateLocal(
    table: string,
    recordId: string,
    data: Record<string, unknown>
  ): Promise<void> {
    const columns = Object.keys(data);
    const updates = columns.map((key) => `${key} = ?`).join(", ");
    const values = [...Object.values(data), recordId];

    await window.db.execute(
      `UPDATE ${table}
        SET ${updates}, updated_at = datetime('now')
        WHERE id = ? AND deleted_at IS NULL`,
      values
    );

    console.log(`Updated local ${table}:`, recordId);
  }

  /**
   * Soft delete record in local database
   */
  private async deleteLocal(table: string, recordId: string): Promise<void> {
    await window.db.execute(
      `UPDATE ${table}
        SET deleted_at = datetime('now')
        WHERE id = ?`,
      [recordId]
    );

    console.log(`Soft deleted from local ${table}:`, recordId);
  }

  /**
   * Execute multiple operations in a transaction (batched)
   */
  async executeBatch(operations: BatchWriteOperation[]): Promise<boolean> {
    try {
      console.log(`Executing batch of ${String(operations.length)} operations`);

      // Transaction queries preparation
      const queries = operations.flatMap((op) => {
        const queries: { sql: string; params: unknown[] }[] = [];

        // Add local write query
        switch (op.operation) {
          case "insert":
            queries.push(this.buildInsertQuery(op.table, op.data));
            break;
          case "update":
            queries.push(this.buildUpdateQuery(op.table, op.data, op.recordId));
            break;
          case "delete":
            queries.push(this.buildDeleteQuery(op.table, op.recordId));
            break;
        }

        // Add sync queue entry
        queries.push({
          sql: `INSERT INTO sync_queue (table_name, record_id, operation, data, status) VALUES (?, ?, ?, ?, 'pending')`,
          params: [
            op.table,
            op.recordId,
            op.operation,
            JSON.stringify(op.data),
          ],
        });

        return queries;
      });

      // Execute all queries in a single transaction
      const result = await window.db.transaction(queries);

      if (result.success) {
        await syncQueueService.updatePendingCount();
        return true;
      }

      return false;
    } catch (error) {
      console.error("Error executing batch transactions:", error);
      return false;
    }
  }

  /**
   * Build insert query
   */
  private buildInsertQuery(
    table: string,
    data: Record<string, unknown>
  ): { sql: string; params: unknown[] } {
    const columns = Object.keys(data);
    const values = Object.values(data);
    const placeholders = columns.map(() => "?").join(", ");

    return {
      sql: `INSERT INTO ${table} (${columns.join(", ")}) VALUES (${placeholders})`,
      params: values,
    };
  }

  /**
   * Build update query
   */
  private buildUpdateQuery(
    table: string,
    data: Record<string, unknown>,
    recordId: string
  ): { sql: string; params: unknown[] } {
    const columns = Object.keys(data);
    const updates = columns.map((key) => `${key} = ?`).join(", ");
    const values = [...Object.values(data), recordId];

    return {
      sql: `UPDATE ${table} SET ${updates}, updated_at = datetime('now') WHERE id = ?`,
      params: values,
    };
  }

  /**
   * Build soft delete query
   */
  private buildDeleteQuery(
    table: string,
    recordId: string
  ): { sql: string; params: unknown[] } {
    return {
      sql: `UPDATE ${table} SET deleted_at = datetime('now') WHERE id = ?`,
      params: [recordId],
    };
  }
}

export const batchOperationsService = new BatchOperationsService();
