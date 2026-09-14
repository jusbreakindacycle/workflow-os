import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { openDatabase } from '../src/db/database.js';
import { CanonicalStore } from '../src/domain/canonical-store.js';
import { Phase40ExternalActions } from '../src/domain/phase40-external-actions.js';

const migrationsDir = path.resolve('migrations');

test('Phase 4.0 invalidates approved authority when the WorkItem version changes', () => {
  const dataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'workflow-os-p40-stale-'));
  const { db } = openDatabase({ databasePath: path.join(dataDir, 'db.sqlite'), dataDir, migrationsDir });
  try {
    const store = new CanonicalStore(db);
    const workspace = store.createWorkspace({ name: 'Stale authority' });
    const project = store.createProject({ workspaceId: workspace.id, kind: 'internal_product', title: 'Stale authority' });
    const item = store.createWorkItem({ workspaceId: workspace.id, projectId: project.id, class: 'delivery', title: 'External effect', outcome: 'Bounded effect', status: 'ready', riskTier: 'R2' });
    const actions = new Phase40ExternalActions(db);
    const plan = actions.createPlan({ workspaceId: workspace.id, projectId: project.id, workItemId: item.id, adapterClass: 'fixture_external', actionKind: 'mutate', target: { key: 'x' }, inputSha256: 'f'.repeat(64) });
    actions.requestAuthority({ workspaceId: workspace.id, projectId: project.id, planId: plan.id });
    actions.resolveAuthority({ workspaceId: workspace.id, projectId: project.id, planId: plan.id, decision: 'approved' });
    db.prepare('UPDATE work_items SET version=version+1,updated_at=? WHERE id=?').run(new Date().toISOString(), item.id);
    const check = actions.preflight({ workspaceId: workspace.id, projectId: project.id, planId: plan.id });
    assert.equal(check.ok, false);
    assert.ok(check.blockers.includes('work_item_version_stale'));
  } finally { db.close(); }
});
