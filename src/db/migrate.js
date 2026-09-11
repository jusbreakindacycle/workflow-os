// @ts-check
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

/**
 * @param {import('node:sqlite').DatabaseSync} db
 * @param {string} migrationsDir
 * @returns {number}
 */
export function runMigrations(db, migrationsDir) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      name TEXT PRIMARY KEY,
      sha256 TEXT NOT NULL,
      applied_at TEXT NOT NULL
    ) STRICT;
  `);

  const files = fs.readdirSync(migrationsDir)
    .filter((name) => /^\d+_.+\.sql$/.test(name))
    .sort();

  const lookup = db.prepare('SELECT sha256 FROM schema_migrations WHERE name = ?');
  const record = db.prepare('INSERT INTO schema_migrations (name, sha256, applied_at) VALUES (?, ?, ?)');

  for (const name of files) {
    const sql = fs.readFileSync(path.join(migrationsDir, name), 'utf8');
    const sha256 = crypto.createHash('sha256').update(sql).digest('hex');
    const existing = lookup.get(name);

    if (existing) {
      if (existing.sha256 !== sha256) throw new Error(`Applied migration changed on disk: ${name}`);
      continue;
    }

    db.exec('BEGIN IMMEDIATE');
    try {
      db.exec(sql);
      record.run(name, sha256, new Date().toISOString());
      db.exec('COMMIT');
    } catch (error) {
      db.exec('ROLLBACK');
      throw error;
    }
  }

  const row = db.prepare('SELECT COUNT(*) AS count FROM schema_migrations').get();
  return Number(row.count);
}
