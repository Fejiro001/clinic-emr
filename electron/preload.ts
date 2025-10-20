import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("db", {
  query: (sql: string, params?: unknown[]) =>
    ipcRenderer.invoke("db:query", sql, params),

  queryOne: (sql: string, params?: unknown[]) =>
    ipcRenderer.invoke("db:query-one", sql, params),

  //   For INSERT/UPDATE/DELETE operations
  execute: (sql: string, params?: unknown[]) =>
    ipcRenderer.invoke("db:execute", sql, params),

  //   Run multiple queries
  transaction: (queries: { sql: string; params?: unknown[] }[]) =>
    ipcRenderer.invoke("db:transaction", queries),
});

declare global {
  interface Window {
    db: {
      query: <T = unknown>(sql: string, params?: unknown[]) => Promise<T[]>;
      queryOne: <T = unknown>(
        sql: string,
        params?: unknown[]
      ) => Promise<T | undefined>;
      execute: (sql: string, params?: unknown[]) => Promise<unknown>;
      transaction: (
        queries: { sql: string; params?: unknown[] }[]
      ) => Promise<unknown>;
    };
  }
}
