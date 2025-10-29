import { getDatabase } from "../../src/db/database.js";
import { ipcMain } from "electron";

interface DbQuery {
  sql: string;
  params?: unknown[];
}

export function setupDatabaseIPC(): void {
  ipcMain.handle("db:query", (_event, sql: string, params?: unknown[]) => {
    try {
      const db = getDatabase();
      const statement = db.prepare(sql);
      return statement.all(...(params ?? []));
    } catch (error) {
      console.error("Database query error", error);
      throw error;
    }
  });

  ipcMain.handle("db:query-one", (_event, sql: string, params?: unknown[]) => {
    try {
      const db = getDatabase();
      const statement = db.prepare(sql);
      return statement.get(...(params ?? []));
    } catch (error) {
      console.error("Database query-one error", error);
      throw error;
    }
  });

  ipcMain.handle("db:execute", (_event, sql: string, params?: unknown[]) => {
    try {
      const db = getDatabase();
      const statement = db.prepare(sql);
      const result = statement.run(...(params ?? []));
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
          const statement = db.prepare(query.sql);
          results.push(statement.run(...(query.params ?? [])));
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
