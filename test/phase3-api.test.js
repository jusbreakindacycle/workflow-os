import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { createApp } from '../src/app.js';
import { openDatabase } from '../src/db/database.js';
import { CanonicalStore } from '../src/domain/canonical-store.js';

const migrationsDir = path.resolve('migrations');
const publicDir = path.resolve('public');

test('Phase 3.1-accepted Project receives strategy-specific graph through the public work-graph route', async (t) => {
  const dataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'workflow-os-phase3-api-'));
  const databasePath = path.join(dataDir, 'test.sqlite');
  const seeded = openDatabase({ databasePath, dataDir, migrationsDir });
  const store = new CanonicalStore(seeded.db);
  const workspace = store.createWorkspace({ name: 'Phase 3 API' });
  const project = store.createProject({ workspaceId: workspace.id, kind: 'client_delivery', title: 'Accepted Phase 3 Project' });
  store.appendAcceptedProjectBrief({
    workspaceId: workspace.id,
    projectId: project.id,
    expectedProjectVersion: project.version,
    problem: 'Synthetic prospects need lead capture.',
    desiredOutcome: 'A local synthetic lead flow is verifiable.',
    deliveryStrategy: 'custom_build',
    workingScope: { success: 'Local validation and submission pass.', phase31AnalysisRunId: 'synthetic-phase31-run' }
  });
  seeded.db.close();

  const app = createApp({ databasePath, dataDir, migrationsDir, publicDir });
  await new Promise((resolve) => app.server.listen(0, '127.0.0.1', resolve));
  t.after(async () => {
    await new Promise((resolve) => app.server.close(resolve));
    app.close();
  });
  const address = app.server.address();
  assert.equal(typeof address, 'object');
  const origin = `http://127.0.0.1:${address.port}`;

  const response = await fetch(`${origin}/api/projects/${encodeURIComponent(project.id)}/work-graph/initialize`, {
    method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ workspaceId: workspace.id })
  });
  assert.equal(response.status, 200);
  const graph = await response.json();
  assert.equal(graph.phase3.plannerVersion, 'phase-3.2-v1');
  assert.ok(graph.nodes.length >= 7);
  assert.ok(graph.phase3.specs.some((spec) => spec.logical_role === 'implementation_worker'));
  assert.ok(graph.phase3.specs.some((spec) => spec.logical_role === 'independent_reviewer'));
  assert.equal(graph.phase3.specs.some((spec) => spec.logical_role === 'research_worker'), false);
});
