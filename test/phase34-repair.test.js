import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { openDatabase } from '../src/db/database.js';
import { CanonicalStore } from '../src/domain/canonical-store.js';
import { Phase32Workforce } from '../src/domain/phase32-workforce.js';
import { Phase34Delivery } from '../src/domain/phase34-delivery.js';
import { GovernedWorkspace } from '../src/runtime/governed-workspace.js';

const migrationsDir = path.resolve('migrations');

test('repair attempts are classified and bounded instead of looping indefinitely', () => {
  const dataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'workflow-os-p34-'));
  const { db } = openDatabase({ databasePath: path.join(dataDir, 'db.sqlite'), dataDir, migrationsDir });
  const store = new CanonicalStore(db);
  const workspace = store.createWorkspace({ name: 'Phase34 Repair' });
  const project = store.createProject({ workspaceId: workspace.id, kind: 'internal_product', title: 'Repair budget' });
  store.appendAcceptedProjectBrief({ workspaceId: workspace.id, projectId: project.id, expectedProjectVersion: project.version, problem: 'Need a bounded synthetic build.', desiredOutcome: 'Synthetic build is verified.', deliveryStrategy: 'custom_build', workingScope: { success: 'Verification passes.' } });
  const plan = new Phase32Workforce(db).ensurePlan({ workspaceId: workspace.id, projectId: project.id });
  const target = plan.specs.find((spec) => spec.logical_role === 'implementation_worker');
  const runtime = new GovernedWorkspace(db, { rootDir: path.join(dataDir, 'execution-root') });
  const delivery = new Phase34Delivery(db, { workspaceRuntime: runtime });
  const first = delivery.recordRepair({ workspaceId: workspace.id, projectId: project.id, workItemId: target.work_item_id, failureClass: 'test_failure', actionSummary: 'Apply bounded repair.', status: 'applied' });
  const second = delivery.recordRepair({ workspaceId: workspace.id, projectId: project.id, workItemId: target.work_item_id, failureClass: 'test_failure', actionSummary: 'Escalate after second bounded attempt.', status: 'escalated' });
  assert.equal(first.attempt_number, 1);
  assert.equal(second.attempt_number, 2);
  assert.throws(() => delivery.recordRepair({ workspaceId: workspace.id, projectId: project.id, workItemId: target.work_item_id, failureClass: 'test_failure', actionSummary: 'Not allowed.', status: 'applied' }), /phase3_repair_budget_exhausted/);
  db.close();
});
