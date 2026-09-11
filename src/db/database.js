// @ts-check
import fs from 'node:fs';
import { DatabaseSync } from 'node:sqlite';
import { runMigrations } from './migrate.js';

/** @param {{databasePath:string,dataDir:string,migrationsDir:string}} options */
export function openDatabase(options) {
  fs.mkdirSync(options.dataDir, { recursive: true });
  const db = new DatabaseSync(options.databasePath, { timeout: 5000 });
  db.exec('PRAGMA foreign_keys = ON');
  db.exec('PRAGMA journal_mode = WAL');
  db.exec('PRAGMA busy_timeout = 5000');
  const migrations = runMigrations(db, options.migrationsDir);
  return { db, migrations };
}
