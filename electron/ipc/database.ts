import { ipcMain } from "electron";

interface DbQuery {
  sql: string;
  params?: unknown[];
}

export function setupDatabaseIPC() {
  console.log("Setting up database IPC handlers.");

  ipcMain.handle("db:query", (event, sql: string, params?: unknown[]) => {
    // TODO: Implemented later
    return [];
  });

  ipcMain.handle("db:query-one", (event, sql: string, params?: unknown[]) => {
    // TODO: Implemented later
    return undefined;
  });

  ipcMain.handle("db:execute", (event, sql: string, params?: unknown[]) => {
    // TODO: Implemented later
    return { success: true, changes: 1 };
  });

  ipcMain.handle("db:transaction", (event, queries: DbQuery[]) => {
    // TODO: Implemented later
    return { success: true, count: queries.length };
  });
}
