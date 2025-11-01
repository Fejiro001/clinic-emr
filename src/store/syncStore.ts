import { create } from "zustand";

type SyncStatus = "idle" | "offline" | "error" | "syncing" | "synced" | "conflict";

interface SyncState {
  // Network status
  isOnline: boolean;
  // Sync status
  syncStatus: SyncStatus;
  syncError: string | null;
  lastSyncTime: number | null;
  // Pending items count
  pendingCount: number;
  conflictsCount: number;
  setOnline: (online: boolean) => void;
  setSyncStatus: (status: SyncStatus) => void;
  setSyncError: (error: string | null) => void;
  setLastSyncTime: (time: number) => void;
  setPendingCount: (count: number) => void;
  setConflictsCount: (count: number) => void;
  resetSync: () => void;
}

export const useSyncStore = create<SyncState>((set) => ({
  isOnline: true,
  syncStatus: "idle",
  syncError: null,
  lastSyncTime: null,
  pendingCount: 0,
  conflictsCount: 0,

  setOnline: (online) => {
    set({
      isOnline: online,
      syncStatus: online ? "idle" : "offline",
    });
  },

  setSyncStatus: (status) => {
    set({ syncStatus: status });
  },

  setSyncError: (error) => {
    set({ syncError: error, syncStatus: error ? "error" : "idle" });
  },

  setLastSyncTime: (time) => {
    set({ lastSyncTime: time });
  },

  setPendingCount: (count) => {
    set({ pendingCount: count });
  },

  setConflictsCount: (count) => {
    set({ conflictsCount: count });
  },

  resetSync: () => {
    set({
      syncStatus: "idle",
      syncError: null,
      lastSyncTime: null,
      pendingCount: 0,
      conflictsCount: 0,
    });
  },
}));
