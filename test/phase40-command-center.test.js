import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { openDatabase } from '../src/db/database.js';
import { CanonicalStore } from '../src/domain/canonical-store.js';
import { Phase40ExternalActions } from '../src/domain/phase40-external-actions.js';
import { handlePhase40CommandCenterApi } from '../src/http/phase40-command-center-api.js';

const migrationsDir = path.resolve('migrations');

test('Project Command Center exposes proposed external action and required attention', () => {
  const dataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'workflow-os-p40-center-'));
  const { db } = openDatabase({ databasePath: path.join(dataDir, 'db.sqlite'), dataDir, migrationsDir });
  try {
    const store = new CanonicalStore(db);
    const workspace = store.createWorkspace({ name: 'Command Center' });
    const project = store.createProject({ workspaceId: workspace.id, kind: 'internal_product', title: 'Command Center' });
    const item = store.createWorkItem({ workspaceId: workspace.id, projectId: project.id, class: 'delivery', title: 'External effect', outcome: 'Bounded effect', status: 'ready', riskTier: 'R2' });
    const actions = new Phase40ExternalActions(db);
    const plan = actions.createPlan({ workspaceId: workspace.id, projectId: project.id, workItemId: item.id, adapterClass: 'fixture_external', actionKind: 'mutate', target: { key: 'command-center' }, inputSha256: '4'.repeat(64) });
    const url = new URL(`http://local/api/projects/${project.id}/command-center?workspaceId=${workspace.id}`);
    const response = handlePhase40CommandCenterApi({ request: { method: 'GET' }, url, db });
    assert.equal(response.status, 200);
    assert.equal(response.body.externalActions[0].id, plan.id);
    assert.ok(response.body.needsMyAttention.some((entry) => entry.type === 'external_action' && entry.planId === plan.id));
  } finally { db.close(); }
});
