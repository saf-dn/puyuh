import { openDatabaseAsync, SQLiteDatabase } from "expo-sqlite";
import { initializeDatabase } from "./schema";

let db: SQLiteDatabase | null = null;

export async function getDatabase(): Promise<SQLiteDatabase> {
  if (!db) {
    db = await openDatabaseAsync("projectpuyuh.db");
    await initializeDatabase(db);
  }
  return db;
}

export async function closeDatabase(): Promise<void> {
  if (db) {
    await db.closeAsync();
    db = null;
  }
}

export function isDbReady(): boolean {
  return db !== null;
}

export { SQLiteDatabase };

