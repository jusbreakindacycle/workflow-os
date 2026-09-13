import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { openDatabase } from '../src/db/database.js';
import { GovernedWorkspace } from '../src/runtime/governed-workspace.js';
import { Phase35Certification } from '../src/domain/phase35-certification.js';

const migrationsDir = path.resolve('migrations');

test('Phase 3.5 moves synthetic request through discovery, dynamic graph, real local execution, L2/L3 verification and delivery', async () => {
  const dataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'workflow-os-p35-'));
  const { db } = openDatabase({ databasePath: path.join(dataDir, 'db.sqlite'), dataDir, migrationsDir });
  const runtime = new GovernedWorkspace(db, { rootDir: path.join(dataDir, 'execution-root') });
  const result = await new Phase35Certification(db, { workspaceRuntime: runtime }).run();

  assert.equal(result.acceptedBrief.delivery_strategy, 'custom_build');
  assert.equal(result.commandCenter.project.operational_status, 'complete');
  assert.equal(result.commandCenter.project.lifecycle_phase, 'closed');
  assert.equal(result.plan.items.every((item) => item.status === 'complete'), true);
  assert.equal(result.deliveryRecord.status, 'delivered');
  assert.equal(result.executionWorkspace.policy.network, 'loopback_only');
  assert.ok(result.executionWorkspace.manifest.some((row) => row.path === 'server.js'));

  const evidence = db.prepare('SELECT evidence_type,level FROM evidence_references WHERE workspace_id=? AND project_id=?').all(result.workspaceId, result.projectId);
  assert.ok(evidence.some((row) => row.evidence_type === 'automated_test_result' && row.level === 'L2'));
  assert.ok(evidence.some((row) => row.evidence_type === 'local_flow_result' && row.level === 'L3'));
  assert.ok(evidence.some((row) => row.evidence_type === 'independent_verification' && row.level === 'L3'));
  assert.ok(evidence.some((row) => row.evidence_type === 'delivery_record' && row.level === 'L3'));

  const costs = db.prepare('SELECT COUNT(*) AS n FROM cost_records WHERE workspace_id=?').get(result.workspaceId);
  const spends = db.prepare('SELECT COUNT(*) AS n FROM spend_envelopes WHERE workspace_id=?').get(result.workspaceId);
  assert.equal(Number(costs.n), 0);
  assert.equal(Number(spends.n), 0);

  const review = JSON.parse(db.prepare("SELECT summary FROM evidence_references WHERE workspace_id=? AND project_id=? AND evidence_type='independent_verification' ORDER BY created_at DESC LIMIT 1").get(result.workspaceId, result.projectId).summary);
  assert.equal(review.passed, true);
  assert.equal(review.workerSelfReportTrusted, false);
  assert.match(review.independenceBasis, /deterministic verifier/i);

  const deliveryBundle = JSON.parse(result.deliveryRecord.evidence_bundle_json);
  assert.equal(deliveryBundle.strategy, 'custom_build');
  assert.equal(deliveryBundle.independentReview.passed, true);
  assert.ok(Array.isArray(deliveryBundle.manifest));
  db.close();
});
