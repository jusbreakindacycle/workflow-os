import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { openDatabase } from '../src/db/database.js';

const migrationsDir = path.resolve('migrations');

test('migrations are persistent and idempotent through Phase 4.1 governed source control', () => {
  const dataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'workflow-os-migrate-'));
  const databasePath = path.join(dataDir, 'test.sqlite');

  const first = openDatabase({ databasePath, dataDir, migrationsDir });
  assert.equal(first.migrations, 16);
  const phase1 = first.db.prepare('SELECT value FROM app_metadata WHERE key = ?').get('foundation_gate');
  const phase2 = first.db.prepare('SELECT value FROM app_metadata WHERE key = ?').get('phase2_gate');
  const phase21 = first.db.prepare('SELECT value FROM app_metadata WHERE key = ?').get('phase21_free_first');
  const phase22 = first.db.prepare('SELECT value FROM app_metadata WHERE key = ?').get('phase22_authority_hardening');
  const phase31 = first.db.prepare('SELECT value FROM app_metadata WHERE key = ?').get('phase31_adaptive_discovery');
  const phase3 = first.db.prepare('SELECT value FROM app_metadata WHERE key = ?').get('phase3_delivery_golden_path');
  const phase40 = first.db.prepare('SELECT value FROM app_metadata WHERE key = ?').get('phase40_external_action_contract');
  const phase41 = first.db.prepare('SELECT value FROM app_metadata WHERE key = ?').get('phase41_governed_source_control');
  assert.equal(phase1.value, '10');
  assert.equal(phase2.value, '8');
  assert.equal(phase21.value, '1');
  assert.equal(phase22.value, '1');
  assert.equal(phase31.value, '1');
  assert.equal(phase3.value, '1');
  assert.equal(phase40.value, '1');
  assert.equal(phase41.value, '1');
  for (const table of ['provider_connections','execution_attempts','loop_runs','free_routing_policies','quota_snapshots','phase31_discovery_runs','phase31_discovery_questions','phase31_discovery_findings','phase31_research_decisions','phase31_strategy_recommendations','phase3_work_specs','phase3_workforce_activations','execution_workspaces','execution_processes','phase3_repair_attempts','phase3_delivery_records','external_action_plans','external_action_plan_details','external_action_attempts','action_reconciliation_records','external_action_mappings','source_control_delivery_plans']) {
    assert.ok(first.db.prepare("SELECT 1 FROM sqlite_master WHERE type='table' AND name=?").get(table), `missing table ${table}`);
  }
  for (const trigger of ['trg_execution_attempt_assignment_budget_guard','trg_work_item_initial_status_guard','trg_approval_approved_subject_current_guard','trg_repository_mock_authority_guard','trg_phase3_work_spec_scope_guard','trg_phase3_activation_scope_guard']) {
    assert.ok(first.db.prepare("SELECT 1 FROM sqlite_master WHERE type='trigger' AND name=?").get(trigger), `missing trigger ${trigger}`);
  }
  first.db.close();

  const second = openDatabase({ databasePath, dataDir, migrationsDir });
  assert.equal(second.migrations, 16);
  second.db.close();
});
