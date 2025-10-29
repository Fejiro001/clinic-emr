/* eslint-disable @typescript-eslint/no-require-imports */
import type { IpcRenderer, ContextBridge } from "electron";

const { contextBridge, ipcRenderer } = require("electron") as {
  contextBridge: ContextBridge;
  ipcRenderer: IpcRenderer;
};

contextBridge.exposeInMainWorld("db", {
  query: <T = unknown,>(sql: string, params?: unknown[]) =>
    ipcRenderer.invoke("db:query", sql, params) as Promise<T[]>,

  queryOne: <T = unknown,>(sql: string, params?: unknown[]) =>
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

contextBridge.exposeInMainWorld("auth", {
  // Auth methods
  saveToken: (token: string) => ipcRenderer.invoke("auth:save-token", token),
  getToken: () => ipcRenderer.invoke("auth:get-token"),
  clearToken: () => ipcRenderer.invoke("auth:clear-token"),
  hasToken: () => ipcRenderer.invoke("auth:has-token"),
  saveUserProfile: (profile: string) =>
    ipcRenderer.invoke("auth:save-user-profile", profile),
  getUserProfile: () => ipcRenderer.invoke("auth:get-user-profile"),
});

contextBridge.exposeInMainWorld("network", {
  // Check if application is online
  isOnline: () => ipcRenderer.invoke("network:is-online"),
  // Check current connectivity
  checkConnectivity: () => ipcRenderer.invoke("network:check-connectivity"),

  // Listen to online/offline events from renderer
  onOnline: (callback: () => void) => {
    window.addEventListener("online", callback);
    return () => window.removeEventListener("online", callback);
  },
  onOffline: (callback: () => void) => {
    window.addEventListener("offline", callback);
    return () => window.removeEventListener("offline", callback);
  },
});
