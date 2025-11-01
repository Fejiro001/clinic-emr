import Database from "better-sqlite3";

let db: Database.Database | null = null;

/**
 * Initializes the SQLite database at the given path.
 * If the database is already initialized, it returns the existing instance.
 */
export function initDatabase(dbPath: string): Database.Database {
  if (db) return db;

  db = new Database(dbPath, { verbose: console.log });

  //   Enable WAL mode for better concurrency
  db.pragma("journal_mode = WAL");

  //   Enable foreign key constraints
  db.pragma("foreign_keys = ON");

  return db;
}

/**
 * Returns the initialized database instance.
 * Throws an error if the database is not initialized.
 */
export function getDatabase(): Database.Database {
  if (!db) {
    throw new Error("Database not initialized. Call initDatabase() first.");
  }
  return db;
}

/**
 * Closes the database connection if it is open.
 */
export function closeDatabase(): void {
  if (db) {
    db.close();
    db = null;
  }
}
