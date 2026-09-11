import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { openDatabase } from '../src/db/database.js';

const migrationsDir = path.resolve('migrations');

test('migrations are persistent and idempotent through Phase 2 autonomy kernel', () => {
  const dataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'workflow-os-migrate-'));
  const databasePath = path.join(dataDir, 'test.sqlite');

  const first = openDatabase({ databasePath, dataDir, migrationsDir });
  assert.equal(first.migrations, 5);
  const phase1 = first.db.prepare('SELECT value FROM app_metadata WHERE key = ?').get('foundation_gate');
  const phase2 = first.db.prepare('SELECT value FROM app_metadata WHERE key = ?').get('phase2_gate');
  assert.equal(phase1.value, '10');
  assert.equal(phase2.value, '1');
  assert.ok(first.db.prepare("SELECT 1 FROM sqlite_master WHERE type = 'table' AND name = 'provider_connections'").get());
  assert.ok(first.db.prepare("SELECT 1 FROM sqlite_master WHERE type = 'table' AND name = 'execution_attempts'").get());
  assert.ok(first.db.prepare("SELECT 1 FROM sqlite_master WHERE type = 'table' AND name = 'loop_runs'").get());
  first.db.close();

  const second = openDatabase({ databasePath, dataDir, migrationsDir });
  assert.equal(second.migrations, 5);
  second.db.close();
});
