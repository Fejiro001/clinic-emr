import type Database from "better-sqlite3";
// import { createTables } from "./schema.js";
// import { createIndexes } from "./indexes.js";
import { existsSync, readdirSync, readFileSync } from "fs";
import { join } from "path";

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

/**
 * Execute SQL from migration files
 */
function executeSQLFiles(db: Database.Database, filepath: string): void {
  const sql = readFileSync(filepath, "utf-8");

  const statements = sql.split(";").map((s) => s.trim());
  console.log(statements);

  for (const statement of statements) {
    try {
      db.exec(statement);
    } catch (error) {
      console.error(
        `Error executing statement: ${statement.substring(0, 50)}...`
      );
      throw error;
    }
  }
}

export function runMigrations(
  db: Database.Database,
  migrationsDir?: string
): void {
  console.log("Running migrations");

  setupMigrations(db);

  const migrations: {
    id: number;
    name: string;
    run: () => void;
  }[] = [];

  if (migrationsDir && existsSync(migrationsDir)) {
    console.log(`Loading migrations from ${migrationsDir}`);

    const files = readdirSync(migrationsDir)
      .filter((f) => f.endsWith(".sql"))
      .sort();

    for (const file of files) {
      const match = /^(\d+)_(.+)\.sql$/.exec(file);
      if (match) {
        const id = parseInt(match[1], 10);
        const name = match[0].replace(".sql", "");
        const filePath = join(migrationsDir, file);

        if (!migrations.find((m) => m.id === id)) {
          migrations.push({
            id,
            name,
            run: () => {
              executeSQLFiles(db, filePath);
            },
          });
        }
      }
    }
  }

  migrations.sort((a, b) => a.id - b.id);

  const appliedMigrations = db
    .prepare("SELECT name FROM migrations")
    .all() as Migration[];

  const appliedNames = new Set(appliedMigrations.map((m) => m.name));

  for (const migration of migrations) {
    if (!appliedNames.has(migration.name)) {
      console.log(`Running migration: ${migration.name}`);

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
