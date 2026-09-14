import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { openDatabase } from '../src/db/database.js';
import { CanonicalStore } from '../src/domain/canonical-store.js';
import { Phase40ExternalActions } from '../src/domain/phase40-external-actions.js';

const migrationsDir = path.resolve('migrations');

test('Phase 4.0 detects direct mutation of authority-bearing plan content', () => {
  const dataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'workflow-os-p40-integrity-'));
  const { db } = openDatabase({ databasePath: path.join(dataDir, 'db.sqlite'), dataDir, migrationsDir });
  try {
    const store = new CanonicalStore(db);
    const workspace = store.createWorkspace({ name: 'Plan integrity' });
    const project = store.createProject({ workspaceId: workspace.id, kind: 'internal_product', title: 'Plan integrity' });
    const item = store.createWorkItem({ workspaceId: workspace.id, projectId: project.id, class: 'delivery', title: 'External effect', outcome: 'Bounded effect', status: 'ready', riskTier: 'R2' });
    const actions = new Phase40ExternalActions(db);
    const plan = actions.createPlan({ workspaceId: workspace.id, projectId: project.id, workItemId: item.id, adapterClass: 'fixture_external', actionKind: 'mutate', target: { key: 'approved-target' }, inputSha256: '1'.repeat(64) });
    actions.requestAuthority({ workspaceId: workspace.id, projectId: project.id, planId: plan.id });
    actions.resolveAuthority({ workspaceId: workspace.id, projectId: project.id, planId: plan.id, decision: 'approved' });
    db.prepare('UPDATE external_action_plans SET target_json=? WHERE id=?').run(JSON.stringify({ key: 'tampered-target' }), plan.id);
    const check = actions.preflight({ workspaceId: workspace.id, projectId: project.id, planId: plan.id });
    assert.equal(check.ok, false);
    assert.ok(check.blockers.includes('plan_content_hash_mismatch'));
  } finally { db.close(); }
});
