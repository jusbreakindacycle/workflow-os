import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { openDatabase } from '../src/db/database.js';
import { CanonicalStore } from '../src/domain/canonical-store.js';
import { Phase40ExternalActions } from '../src/domain/phase40-external-actions.js';

const migrationsDir = path.resolve('migrations');

test('Phase 4.0 cannot bind another Project WorkItem into an external action plan', () => {
  const dataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'workflow-os-p40-scope-'));
  const { db } = openDatabase({ databasePath: path.join(dataDir, 'db.sqlite'), dataDir, migrationsDir });
  try {
    const store = new CanonicalStore(db);
    const workspace = store.createWorkspace({ name: 'Scope fixture' });
    const first = store.createProject({ workspaceId: workspace.id, kind: 'internal_product', title: 'First' });
    const second = store.createProject({ workspaceId: workspace.id, kind: 'internal_product', title: 'Second' });
    const item = store.createWorkItem({ workspaceId: workspace.id, projectId: first.id, class: 'delivery', title: 'First effect', outcome: 'First only', status: 'ready', riskTier: 'R2' });
    const actions = new Phase40ExternalActions(db);
    assert.throws(() => actions.createPlan({ workspaceId: workspace.id, projectId: second.id, workItemId: item.id, adapterClass: 'fixture_external', actionKind: 'mutate', target: { key: 'wrong-project' }, inputSha256: '3'.repeat(64) }), /work_item_not_found/);
  } finally { db.close(); }
});
