import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { createApp } from '../src/app.js';

const migrationsDir = path.resolve('migrations');
const publicDir = path.resolve('public');

test('Phase 2 HTTP API routes one WorkItem through worker and independent verifier fixtures', async (t) => {
  const dataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'workflow-os-phase2-api-'));
  const app = createApp({ databasePath: path.join(dataDir, 'test.sqlite'), dataDir, migrationsDir, publicDir });
  await new Promise((resolve) => app.server.listen(0, '127.0.0.1', resolve));
  t.after(async () => {
    await new Promise((resolve) => app.server.close(resolve));
    app.close();
  });
  const address = app.server.address();
  assert.equal(typeof address, 'object');
  const origin = `http://127.0.0.1:${address.port}`;

  const intake = await request(origin, '/api/intakes', 'POST', {
    workspaceName: 'Phase 2 HTTP Workspace', mode: 'internal', title: 'Autonomy fixture',
    rawRequest: 'I need a reliable internal handoff.', requestedSolution: 'Custom app'
  }, 201);
  const workspaceId = intake.intake.workspace_id;
  const projectId = intake.project.id;
  await request(origin, `/api/intakes/${intake.intake.id}/discovery`, 'PUT', {
    workspaceId,
    responses: [
      { questionKey: 'problem', responseState: 'answered', answerText: 'Manual handoffs fail.' },
      { questionKey: 'desired_outcome', responseState: 'answered', answerText: 'Handoffs become reliable.' },
      { questionKey: 'primary_users', responseState: 'answered', answerText: 'Operator' },
      { questionKey: 'constraints', responseState: 'answered', answerText: 'Synthetic only.' },
      { questionKey: 'success', responseState: 'answered', answerText: 'Independent verifier accepts evidence.' }
    ]
  }, 200);
  const strategy = await request(origin, `/api/intakes/${intake.intake.id}/strategy`, 'PUT', { workspaceId, strategy: 'custom_build' }, 200);
  await request(origin, `/api/intakes/${intake.intake.id}/accept`, 'POST', { workspaceId, expectedProjectVersion: strategy.project.version }, 200);
  const graph = await request(origin, `/api/projects/${projectId}/work-graph/initialize`, 'POST', { workspaceId }, 200);
  const workItemId = graph.nextReady[0].id;

  const workerConnection = await request(origin, `/api/phase2/workspaces/${workspaceId}/provider-connections`, 'POST', {
    providerKey: 'fixture', connectionType: 'local_service', billingMode: 'zero_incremental', locality: 'local'
  }, 201);
  const verifierConnection = await request(origin, `/api/phase2/workspaces/${workspaceId}/provider-connections`, 'POST', {
    providerKey: 'fixture', connectionType: 'local_service', billingMode: 'zero_incremental', locality: 'local'
  }, 201);
  await request(origin, `/api/phase2/workspaces/${workspaceId}/routes`, 'POST', {
    providerConnectionId: workerConnection.connection.id, routeName: 'http-worker', runtimeKey: 'fixture', adapterKind: 'fixture',
    capabilities: ['reasoning'], independenceGroup: 'http-worker-group', config: { mode: 'worker' }
  }, 201);
  await request(origin, `/api/phase2/workspaces/${workspaceId}/routes`, 'POST', {
    providerConnectionId: verifierConnection.connection.id, routeName: 'http-verifier', runtimeKey: 'fixture', adapterKind: 'fixture',
    capabilities: ['verification'], independenceGroup: 'http-verifier-group', config: { mode: 'verifier' }
  }, 201);

  const executed = await request(origin, `/api/phase2/projects/${projectId}/work-items/${workItemId}/run`, 'POST', {
    workspaceId, maxIterations: 2
  }, 200);
  assert.equal(executed.status, 'passed');
  assert.equal(executed.verification.workItem.status, 'complete');

  const state = await request(origin, `/api/phase2/autonomy?workspaceId=${encodeURIComponent(workspaceId)}&projectId=${encodeURIComponent(projectId)}`, 'GET', null, 200);
  assert.equal(state.executionAttempts.length, 2);
  assert.equal(state.loops[0].status, 'passed');
});

async function request(origin, pathname, method, body, expectedStatus) {
  const response = await fetch(`${origin}${pathname}`, {
    method,
    headers: body ? { 'content-type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined
  });
  const payload = await response.json();
  assert.equal(response.status, expectedStatus, JSON.stringify(payload));
  return payload;
}
