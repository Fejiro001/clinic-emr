import { getDatabase } from "../../src/db/database";
import { ipcMain } from "electron";

interface DbQuery {
  sql: string;
  params?: unknown[];
}

export function setupDatabaseIPC(): void {
  console.log("Setting up database IPC handlers.");

  ipcMain.handle("db:query", (_event, sql: string, params?: unknown[]) => {
    try {
      const db = getDatabase();
      const stmt = db.prepare(sql);
      return stmt.all(...(params ?? []));
    } catch (error) {
      console.error("Database query error", error);
      throw error;
    }
  });

  ipcMain.handle("db:query-one", (_event, sql: string, params?: unknown[]) => {
    try {
      const db = getDatabase();
      const stmt = db.prepare(sql);
      return stmt.get(...(params ?? []));
    } catch (error) {
      console.error("Database query-one error", error);
      throw error;
    }
  });

  ipcMain.handle("db:execute", (_event, sql: string, params?: unknown[]) => {
    try {
      const db = getDatabase();
      const stmt = db.prepare(sql);
      const result = stmt.run(...(params ?? []));
      return {
        success: true,
        changes: result.changes,
        lastInsertRowid: result.lastInsertRowid,
      };
    } catch (error) {
      console.error("Database execute error", error);
      throw error;
    }
  });

  ipcMain.handle("db:transaction", (_event, queries: DbQuery[]) => {
    try {
      const db = getDatabase();

      const transaction = db.transaction((queries: DbQuery[]) => {
        const results = [];

        for (const query of queries) {
          const stmt = db.prepare(query.sql);
          results.push(stmt.run(...(query.params ?? [])));
        }
        return results;
      });

      const results = transaction(queries);
      return { success: true, count: results.length, results };
    } catch (error) {
      console.error("Database transaction error", error);
      throw error;
    }
  });
}
