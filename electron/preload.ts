import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("db", {
  query: <T = unknown>(sql: string, params?: unknown[]) =>
    ipcRenderer.invoke("db:query", sql, params) as Promise<T[]>,

  queryOne: <T = unknown>(sql: string, params?: unknown[]) =>
    ipcRenderer.invoke("db:query-one", sql, params) as Promise<T | undefined>,

  //   For INSERT/UPDATE/DELETE operations
  execute: (sql: string, params?: unknown[]) =>
    ipcRenderer.invoke("db:execute", sql, params) as Promise<{
      success: boolean;
      changes: number;
      lastInsertRowid: number;
    }>,

  //   Run multiple queries
  transaction: (queries: { sql: string; params?: unknown[] }[]) =>
    ipcRenderer.invoke("db:transaction", queries) as Promise<{
      success: boolean;
      count: number;
    }>,
});
