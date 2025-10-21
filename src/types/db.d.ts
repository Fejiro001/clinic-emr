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
  }
}

export {};
