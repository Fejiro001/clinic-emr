declare global {
  interface Window {
    db: {
      query: <T = unknown>(sql: string, params?: unknown[]) => Promise<T[]>;
      queryOne: <T = unknown>(
        sql: string,
        params?: unknown[]
      ) => Promise<T | undefined>;
      execute: (
        sql: string,
        params?: unknown[]
      ) => Promise<{
        success: boolean;
        changes: number;
        lastInsertRowid: number;
      }>;
      transaction: (queries: { sql: string; params?: unknown[] }[]) => Promise<{
        success: boolean;
        count: number;
      }>;
    };

    auth: {
      saveToken: (
        token: string
      ) => Promise<{ success: boolean; error?: string }>;
      getToken: () => Promise<string | null>;
      clearToken: () => Promise<{ success: boolean }>;
      hasToken: () => Promise<boolean>;
      saveUserProfile: (
        profile: string
      ) => Promise<{ success: boolean; error?: string }>;
      getUserProfile: () => Promise<string | null>;
    };

    network: {
      isOnline: () => Promise<boolean>;
      checkConnectivity: () => Promise<boolean>;
      onOnline: (callback: () => void) => () => void;
      onOffline: (callback: () => void) => () => void;
    };
  }
}

export {};
