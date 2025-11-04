// db.ts
// Base local de datos (SQLite) para laps, tracks y records
import * as SQLite from "expo-sqlite";

export const db = SQLite.openDatabaseSync("racing.db");

export function initDB() {
  db.execSync(`
    CREATE TABLE IF NOT EXISTS laps(
      id TEXT PRIMARY KEY,
      trackId TEXT,
      userId TEXT,
      totalMs INTEGER,
      date INTEGER
    );
  `);
  console.log("Database initialized");
}