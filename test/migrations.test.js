import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { openDatabase } from '../src/db/database.js';

const migrationsDir = path.resolve('migrations');

test('migrations are persistent and idempotent through Phase 2.2 canonical authority hardening', () => {
  const dataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'workflow-os-migrate-'));
  const databasePath = path.join(dataDir, 'test.sqlite');

  const first = openDatabase({ databasePath, dataDir, migrationsDir });
  assert.equal(first.migrations, 8);
  const phase1 = first.db.prepare('SELECT value FROM app_metadata WHERE key = ?').get('foundation_gate');
  const phase2 = first.db.prepare('SELECT value FROM app_metadata WHERE key = ?').get('phase2_gate');
  const phase21 = first.db.prepare('SELECT value FROM app_metadata WHERE key = ?').get('phase21_free_first');
  const phase22 = first.db.prepare('SELECT value FROM app_metadata WHERE key = ?').get('phase22_authority_hardening');
  assert.equal(phase1.value, '10');
  assert.equal(phase2.value, '8');
  assert.equal(phase21.value, '1');
  assert.equal(phase22.value, '1');
  assert.ok(first.db.prepare("SELECT 1 FROM sqlite_master WHERE type = 'table' AND name = 'provider_connections'").get());
  assert.ok(first.db.prepare("SELECT 1 FROM sqlite_master WHERE type = 'table' AND name = 'execution_attempts'").get());
  assert.ok(first.db.prepare("SELECT 1 FROM sqlite_master WHERE type = 'table' AND name = 'loop_runs'").get());
  assert.ok(first.db.prepare("SELECT 1 FROM sqlite_master WHERE type = 'table' AND name = 'free_routing_policies'").get());
  assert.ok(first.db.prepare("SELECT 1 FROM sqlite_master WHERE type = 'table' AND name = 'quota_snapshots'").get());
  assert.ok(first.db.prepare("SELECT 1 FROM sqlite_master WHERE type = 'trigger' AND name = 'trg_execution_attempt_assignment_budget_guard'").get());
  assert.ok(first.db.prepare("SELECT 1 FROM sqlite_master WHERE type = 'trigger' AND name = 'trg_work_item_initial_status_guard'").get());
  assert.ok(first.db.prepare("SELECT 1 FROM sqlite_master WHERE type = 'trigger' AND name = 'trg_approval_approved_subject_current_guard'").get());
  assert.ok(first.db.prepare("SELECT 1 FROM sqlite_master WHERE type = 'trigger' AND name = 'trg_repository_mock_authority_guard'").get());
  first.db.close();

  const second = openDatabase({ databasePath, dataDir, migrationsDir });
  assert.equal(second.migrations, 8);
  second.db.close();
});
