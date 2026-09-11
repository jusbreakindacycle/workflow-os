import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { createApp } from '../src/app.js';

const migrationsDir = path.resolve('migrations');
const publicDir = path.resolve('public');

test('Phase 1 HTTP golden path reaches verified work and explainable Command Center state', async (t) => {
  const dataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'workflow-os-phase1-api-'));
  const app = createApp({ databasePath: path.join(dataDir, 'test.sqlite'), dataDir, migrationsDir, publicDir });
  await new Promise((resolve) => app.server.listen(0, '127.0.0.1', resolve));
  t.after(async () => {
    await new Promise((resolve) => app.server.close(resolve));
    app.close();
  });
  const address = app.server.address();
  assert.equal(typeof address, 'object');
  const origin = `http://127.0.0.1:${address.port}`;

  const start = await request(origin, '/api/intakes', 'POST', {
    workspaceName: 'Phase 1 API Workspace', mode: 'internal', title: 'API golden path',
    rawRequest: 'Reduce errors in a repeated handoff.', requestedSolution: 'Maybe an app'
  }, 201);
  const workspaceId = start.intake.workspace_id;
  const projectId = start.project.id;

  await request(origin, `/api/intakes/${start.intake.id}/discovery`, 'PUT', {
    workspaceId,
    responses: [
      { questionKey: 'problem', responseState: 'answered', answerText: 'The handoff is inconsistent.' },
      { questionKey: 'desired_outcome', responseState: 'answered', answerText: 'The handoff is repeatable and verified.' },
      { questionKey: 'primary_users', responseState: 'answered', answerText: 'Operator' },
      { questionKey: 'constraints', responseState: 'unknown' },
      { questionKey: 'success', responseState: 'answered', answerText: 'The synthetic golden path verifies.' }
    ]
  }, 200);
  const strategy = await request(origin, `/api/intakes/${start.intake.id}/strategy`, 'PUT', { workspaceId, strategy: 'custom_build' }, 200);
  await request(origin, `/api/intakes/${start.intake.id}/accept`, 'POST', { workspaceId, expectedProjectVersion: strategy.project.version }, 200);

  const graph = await request(origin, `/api/projects/${projectId}/work-graph/initialize`, 'POST', { workspaceId }, 200);
  assert.equal(graph.nextReady.length, 1);
  const pack = await request(origin, `/api/projects/${projectId}/project-pack`, 'POST', { workspaceId }, 201);
  assert.equal(pack.version, 1);

  const assignment = await request(origin, `/api/projects/${projectId}/assignments`, 'POST', { workspaceId, workItemId: graph.nextReady[0].id }, 201);
  await request(origin, `/api/assignments/${assignment.row.id}/start`, 'POST', { workspaceId, projectId }, 200);
  await request(origin, `/api/assignments/${assignment.row.id}/finish`, 'POST', { workspaceId, projectId }, 200);
  await request(origin, `/api/assignments/${assignment.row.id}/evidence`, 'POST', { workspaceId, projectId, level: 'L2', summary: 'HTTP synthetic evidence.' }, 201);
  const verified = await request(origin, `/api/assignments/${assignment.row.id}/verify`, 'POST', { workspaceId, projectId, outcome: 'pass', level: 'L2', summary: 'HTTP verifier passed.' }, 200);
  assert.equal(verified.workItem.status, 'complete');
  await request(origin, `/api/projects/${projectId}/readiness/refresh`, 'POST', { workspaceId }, 200);

  const center = await request(origin, `/api/projects/${projectId}/command-center?workspaceId=${encodeURIComponent(workspaceId)}`, 'GET', null, 200);
  assert.ok(center.nextReady.some((item) => item.title === 'Prepare delivery plan'));
  assert.ok(center.activityFeed.some((event) => event.event_type === 'verification.pass'));

  const portfolio = await request(origin, `/api/command-center?workspaceId=${encodeURIComponent(workspaceId)}`, 'GET', null, 200);
  assert.equal(portfolio.projects.length, 1);
  assert.equal(portfolio.projects[0].id, projectId);
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
