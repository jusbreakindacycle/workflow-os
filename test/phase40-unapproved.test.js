import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { openDatabase } from '../src/db/database.js';
import { CanonicalStore } from '../src/domain/canonical-store.js';
import { Phase40ExternalActions } from '../src/domain/phase40-external-actions.js';

const migrationsDir = path.resolve('migrations');

test('Phase 4.0 refuses a durable external attempt without approval', () => {
  const dataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'workflow-os-p40-noauth-'));
  const { db } = openDatabase({ databasePath: path.join(dataDir, 'db.sqlite'), dataDir, migrationsDir });
  try {
    const store = new CanonicalStore(db);
    const workspace = store.createWorkspace({ name: 'No authority' });
    const project = store.createProject({ workspaceId: workspace.id, kind: 'internal_product', title: 'No authority' });
    const item = store.createWorkItem({ workspaceId: workspace.id, projectId: project.id, class: 'delivery', title: 'External effect', outcome: 'Bounded effect', status: 'ready', riskTier: 'R2' });
    const actions = new Phase40ExternalActions(db);
    const plan = actions.createPlan({ workspaceId: workspace.id, projectId: project.id, workItemId: item.id, adapterClass: 'fixture_external', actionKind: 'mutate', target: { key: 'x' }, inputSha256: 'e'.repeat(64) });
    const check = actions.preflight({ workspaceId: workspace.id, projectId: project.id, planId: plan.id });
    assert.equal(check.ok, false);
    assert.ok(check.blockers.includes('approval_missing_or_not_approved'));
    assert.throws(() => actions.startAttempt({ workspaceId: workspace.id, projectId: project.id, planId: plan.id, adapterProvider: 'fixture', adapterVersion: 'v1', operationKind: 'mutate' }), /preflight_blocked/);
  } finally { db.close(); }
});
