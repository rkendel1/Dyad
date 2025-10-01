// db.ts
import {
  type BetterSQLite3Database,
  drizzle,
} from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import * as schema from "./schema";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import path from "node:path";
import fs from "node:fs";
import { getDyadAppPath, getUserDataPath } from "../paths/paths";
import log from "electron-log";

const logger = log.scope("db");

// Database connection factory
let _db: ReturnType<typeof drizzle> | null = null;

/**
 * Get the database path based on the current environment
 */
export function getDatabasePath(): string {
  return path.join(getUserDataPath(), "sqlite.db");
}

/**
 * Initialize the database connection
 */
export function initializeDatabase(): BetterSQLite3Database<typeof schema> & {
  $client: Database.Database;
} {
  if (_db) {
    logger.log("Database already initialized, returning existing instance");
    return _db as any;
  }

  const dbPath = getDatabasePath();
  logger.log("Initializing database at:", dbPath);

  // Ensure required directories exist
  try {
    const userDataPath = getUserDataPath();
    const dyadAppPath = getDyadAppPath(".");

    logger.log("Creating user data directory:", userDataPath);
    fs.mkdirSync(userDataPath, { recursive: true });

    logger.log("Creating Dyad app directory:", dyadAppPath);
    fs.mkdirSync(dyadAppPath, { recursive: true });
  } catch (error) {
    logger.error("Error creating required directories:", error);
    throw new Error(`Failed to create required directories: ${error}`);
  }

  // Check if the database file exists and remove it if it has issues
  try {
    if (fs.existsSync(dbPath)) {
      const stats = fs.statSync(dbPath);
      if (stats.size < 100) {
        logger.warn(
          "Database file exists but is too small (may be corrupted). Removing it...",
        );
        fs.unlinkSync(dbPath);
      } else {
        logger.log("Existing database file found, size:", stats.size, "bytes");
      }
    }
  } catch (error) {
    logger.error("Error checking database file:", error);
    throw new Error(`Failed to check database file: ${error}`);
  }

  // Create database connection
  let sqlite: Database.Database;
  try {
    logger.log("Creating SQLite database connection...");
    sqlite = new Database(dbPath, { timeout: 10000 });
    sqlite.pragma("foreign_keys = ON");
    logger.log("Database connection established successfully");
  } catch (error) {
    logger.error("Error creating database connection:", error);
    throw new Error(`Failed to create database connection: ${error}`);
  }

  _db = drizzle(sqlite, { schema });

  // Run migrations
  try {
    const migrationsFolder = path.join(__dirname, "..", "..", "drizzle");
    logger.log("Checking for migrations folder at:", migrationsFolder);

    if (!fs.existsSync(migrationsFolder)) {
      const errorMsg = `Migrations folder not found at: ${migrationsFolder}`;
      logger.error(errorMsg);
      throw new Error(errorMsg);
    }

    // Check if migrations folder has any SQL files
    const migrationFiles = fs
      .readdirSync(migrationsFolder)
      .filter((file) => file.endsWith(".sql"));
    logger.log(`Found ${migrationFiles.length} migration file(s)`);

    if (migrationFiles.length === 0) {
      logger.warn("No migration files found in migrations folder");
    } else {
      logger.log("Running migrations from:", migrationsFolder);
      migrate(_db, { migrationsFolder });
      logger.log("Migrations completed successfully");
    }
  } catch (error) {
    logger.error("Migration error:", error);
    throw new Error(`Failed to run migrations: ${error}`);
  }

  logger.log("Database initialization completed successfully");
  return _db as any;
}

/**
 * Get the database instance (throws if not initialized)
 */
export function getDb(): BetterSQLite3Database<typeof schema> & {
  $client: Database.Database;
} {
  if (!_db) {
    throw new Error(
      "Database not initialized. Call initializeDatabase() first.",
    );
  }
  return _db as any;
}

export const db = new Proxy({} as any, {
  get(target, prop) {
    const database = getDb();
    return database[prop as keyof typeof database];
  },
}) as BetterSQLite3Database<typeof schema> & {
  $client: Database.Database;
};
