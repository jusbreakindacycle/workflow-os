import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { openDatabase } from '../src/db/database.js';
import { CanonicalStore } from '../src/domain/canonical-store.js';
import { Phase32Workforce } from '../src/domain/phase32-workforce.js';

const migrationsDir = path.resolve('migrations');

function setup(strategy) {
  const dataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'workflow-os-p32-'));
  const { db } = openDatabase({ databasePath: path.join(dataDir, 'db.sqlite'), dataDir, migrationsDir });
  const store = new CanonicalStore(db);
  const workspace = store.createWorkspace({ name: `Phase32 ${strategy}` });
  const project = store.createProject({ workspaceId: workspace.id, kind: 'internal_product', title: `${strategy} case` });
  store.appendAcceptedProjectBrief({ workspaceId: workspace.id, projectId: project.id, expectedProjectVersion: project.version, problem: 'A business outcome is not yet delivered.', desiredOutcome: `Deliver the ${strategy} outcome with synthetic evidence.`, deliveryStrategy: strategy, workingScope: { success: 'Observable synthetic acceptance passes.', nonGoals: ['production deployment'] } });
  return { db, dataDir, workspaceId: workspace.id, projectId: project.id };
}

test('custom_build graph activates only work-driven capabilities and includes real local verification path', () => {
  const env = setup('custom_build');
  const planner = new Phase32Workforce(env.db);
  const state = planner.ensurePlan({ workspaceId: env.workspaceId, projectId: env.projectId });
  const roles = new Set(state.specs.map((spec) => spec.logical_role));
  assert.ok(roles.has('implementation_worker'));
  assert.ok(roles.has('flow_verifier'));
  assert.ok(roles.has('independent_reviewer'));
  assert.ok(state.specs.some((spec) => spec.action_class === 'local_workspace_mutation' && spec.risk_tier === 'R1'));
  assert.ok(state.specs.some((spec) => spec.verification_level === 'L3'));
  assert.equal(state.activations.every((row) => row.status === 'required'), true);
  assert.equal(state.activations.some((row) => row.logical_role === 'research_worker'), false);
  env.db.close();
});

test('configure graph does not fabricate software-development roles or local-flow work', () => {
  const env = setup('configure');
  const planner = new Phase32Workforce(env.db);
  const state = planner.ensurePlan({ workspaceId: env.workspaceId, projectId: env.projectId });
  const roles = new Set(state.specs.map((spec) => spec.logical_role));
  assert.ok(roles.has('configuration_specialist'));
  assert.equal(roles.has('implementation_worker'), false);
  assert.equal(roles.has('solution_architect'), false);
  assert.equal(roles.has('flow_verifier'), false);
  assert.equal(state.specs.some((spec) => spec.action_class === 'local_workspace_prepare'), false);
  env.db.close();
});

test('defer strategy creates no implementation work', () => {
  const env = setup('defer');
  const state = new Phase32Workforce(env.db).ensurePlan({ workspaceId: env.workspaceId, projectId: env.projectId });
  assert.equal(state.items.length, 1);
  assert.equal(state.specs[0].logical_role, 'decision_reconciler');
  assert.deepEqual(state.specs[0].capabilities, ['decision_support']);
  env.db.close();
});
