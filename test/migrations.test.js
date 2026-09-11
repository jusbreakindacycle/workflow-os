import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { openDatabase } from '../src/db/database.js';

const migrationsDir = path.resolve('migrations');

test('migrations are persistent and idempotent', () => {
  const dataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'workflow-os-migrate-'));
  const databasePath = path.join(dataDir, 'test.sqlite');

  const first = openDatabase({ databasePath, dataDir, migrationsDir });
  assert.equal(first.migrations, 2);
  const metadata = first.db.prepare('SELECT value FROM app_metadata WHERE key = ?').get('foundation_gate');
  assert.equal(metadata.value, '2');
  first.db.close();

  const second = openDatabase({ databasePath, dataDir, migrationsDir });
  assert.equal(second.migrations, 2);
  second.db.close();
});
