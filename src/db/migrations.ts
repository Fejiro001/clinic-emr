import type Database from "better-sqlite3";
import { createTables } from "./schema.js";
import { createIndexes } from "./indexes.js";

interface Migration {
  id: number;
  name: string;
  applied_at: string;
}

export function setupMigrations(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS migrations (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      applied_at TEXT DEFAULT (datetime('now'))
    )
  `);
}

export function runMigrations(db: Database.Database): void {
  console.log("Running migrations");

  setupMigrations(db);

  const migrations = [
    {
      id: 1,
      name: "001_initial_schema",
      run: () => {
        createTables(db);
        createIndexes(db);
      },
    },
    // Add more migrations here as needed
  ];

  const appliedMigrations = db
    .prepare("SELECT name FROM migrations")
    .all() as Migration[];

  const appliedNames = new Set(appliedMigrations.map((m) => m.name));

  for (const migration of migrations) {
    if (!appliedNames.has(migration.name)) {
      console.log(`Running migartion: ${migration.name}`);

      try {
        migration.run();

        db.prepare("INSERT INTO migrations (id, name) VALUES (?, ?)").run(
          migration.id,
          migration.name
        );

        console.log(`Migration ${migration.name} completed`);
      } catch (error) {
        console.error(`Migration ${migration.name} failed:`, error);
        throw error;
      }
    } else {
      console.log(`Skipping ${migration.name} (already applied)`);
    }
  }
  console.log("All migrations completed");
}
