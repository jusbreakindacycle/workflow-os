import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { createApp } from '../src/app.js';

const migrationsDir = path.resolve('migrations');
const publicDir = path.resolve('public');

test('Gate 3 API supports New Project -> discovery -> strategy -> accept', async (t) => {
  const dataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'workflow-os-gate3-api-'));
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
    workspaceName: 'Gate 3 Workspace',
    mode: 'client',
    title: 'Reservation flow',
    rawRequest: 'Build something so customers can reserve without messaging staff.',
    requestedSolution: 'Website form',
    clientName: 'Synthetic Bistro'
  }, 201);
  assert.equal(start.intake.status, 'draft');
  assert.equal(start.engagement.status, 'draft');

  const discovery = await request(origin, `/api/intakes/${start.intake.id}/discovery`, 'PUT', {
    workspaceId: start.intake.workspace_id,
    responses: [
      { questionKey: 'problem', responseState: 'answered', answerText: 'Staff manually coordinate every reservation.' },
      { questionKey: 'desired_outcome', responseState: 'answered', answerText: 'Customers submit reservation requests consistently.' },
      { questionKey: 'primary_users', responseState: 'answered', answerText: 'Customers and staff' },
      { questionKey: 'constraints', responseState: 'unknown' },
      { questionKey: 'success', responseState: 'answered', answerText: 'A test reservation is captured with all required details.' }
    ]
  }, 200);
  assert.equal(discovery.intake.status, 'discovery');

  const strategy = await request(origin, `/api/intakes/${start.intake.id}/strategy`, 'PUT', {
    workspaceId: start.intake.workspace_id,
    strategy: 'hybrid',
    rationale: 'Use existing services where possible and custom-build only the missing workflow.'
  }, 200);
  assert.equal(strategy.intake.status, 'review');

  const accepted = await request(origin, `/api/intakes/${start.intake.id}/accept`, 'POST', {
    workspaceId: start.intake.workspace_id,
    expectedProjectVersion: strategy.project.version
  }, 200);
  assert.equal(accepted.intake.status, 'accepted');
  assert.equal(accepted.acceptedBrief.problem, 'Staff manually coordinate every reservation.');
  assert.equal(accepted.acceptedBrief.requested_solution, 'Website form');
  assert.equal(accepted.acceptedBrief.delivery_strategy, 'hybrid');
  assert.equal(accepted.engagement.status, 'draft');

  const page = await fetch(`${origin}/`);
  assert.equal(page.status, 200);
  const html = await page.text();
  assert.match(html, /Local Control Plane/);
  assert.match(html, /Start from the real request/);
});

async function request(origin, pathname, method, body, expectedStatus) {
  const response = await fetch(`${origin}${pathname}`, {
    method,
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body)
  });
  const payload = await response.json();
  assert.equal(response.status, expectedStatus, JSON.stringify(payload));
  return payload;
}
