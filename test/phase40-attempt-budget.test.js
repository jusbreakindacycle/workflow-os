import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { openDatabase } from '../src/db/database.js';
import { CanonicalStore } from '../src/domain/canonical-store.js';
import { Phase40ExternalActions } from '../src/domain/phase40-external-actions.js';

const migrationsDir = path.resolve('migrations');

test('Phase 4.0 stops when the external attempt budget is exhausted', () => {
  const dataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'workflow-os-p40-budget-'));
  const { db } = openDatabase({ databasePath: path.join(dataDir, 'db.sqlite'), dataDir, migrationsDir });
  try {
    const store = new CanonicalStore(db);
    const workspace = store.createWorkspace({ name: 'Attempt budget' });
    const project = store.createProject({ workspaceId: workspace.id, kind: 'internal_product', title: 'Attempt budget' });
    const item = store.createWorkItem({ workspaceId: workspace.id, projectId: project.id, class: 'delivery', title: 'External effect', outcome: 'Bounded effect', status: 'ready', riskTier: 'R2' });
    const actions = new Phase40ExternalActions(db);
    const plan = actions.createPlan({ workspaceId: workspace.id, projectId: project.id, workItemId: item.id, adapterClass: 'fixture_external', actionKind: 'mutate', target: { key: 'budget' }, inputSha256: '2'.repeat(64), recovery: { maxAttempts: 1 } });
    actions.requestAuthority({ workspaceId: workspace.id, projectId: project.id, planId: plan.id });
    actions.resolveAuthority({ workspaceId: workspace.id, projectId: project.id, planId: plan.id, decision: 'approved' });
    const attempt = actions.startAttempt({ workspaceId: workspace.id, projectId: project.id, planId: plan.id, adapterProvider: 'fixture', adapterVersion: 'v1', operationKind: 'mutate' });
    actions.finishAttempt({ workspaceId: workspace.id, projectId: project.id, attemptId: attempt.id, outcome: 'uncertain', errorClass: 'transport_unknown' });
    actions.reconcile({ workspaceId: workspace.id, projectId: project.id, attemptId: attempt.id, classification: 'not_applied', observedState: { exists: false } });
    const check = actions.preflight({ workspaceId: workspace.id, projectId: project.id, planId: plan.id });
    assert.equal(check.ok, false);
    assert.ok(check.blockers.includes('attempt_budget_exhausted'));
  } finally { db.close(); }
});
