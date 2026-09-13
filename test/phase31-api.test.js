import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { createApp } from '../src/app.js';

const migrationsDir = path.resolve('migrations');
const publicDir = path.resolve('public');

test('Phase 3.1 API exposes adaptive discovery state and fails closed without an eligible free reasoning route', async (t) => {
  const dataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'workflow-os-phase31-api-'));
  const app = createApp({ databasePath: path.join(dataDir, 'test.sqlite'), dataDir, migrationsDir, publicDir });
  await new Promise((resolve) => app.server.listen(0, '127.0.0.1', resolve));
  t.after(async () => {
    await new Promise((resolve) => app.server.close(resolve));
    app.close();
  });
  const address = app.server.address();
  const origin = `http://127.0.0.1:${address.port}`;

  const intakeResponse = await fetch(`${origin}/api/intakes`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ workspaceName: 'Phase 3.1 API', mode: 'internal', title: 'Adaptive intake', rawRequest: 'I need somewhere prospects can understand an offer and leave details.', requestedSolution: 'Simple website with a contact form' })
  });
  assert.equal(intakeResponse.status, 201);
  const intake = await intakeResponse.json();

  const snapshotResponse = await fetch(`${origin}/api/phase31/intakes/${encodeURIComponent(intake.intake.id)}?workspaceId=${encodeURIComponent(intake.intake.workspace_id)}`);
  assert.equal(snapshotResponse.status, 200);
  const snapshot = await snapshotResponse.json();
  assert.deepEqual(snapshot.phase31.runs, []);
  assert.equal(snapshot.intake.requested_solution, 'Simple website with a contact form');

  const analyzeResponse = await fetch(`${origin}/api/phase31/intakes/${encodeURIComponent(intake.intake.id)}/analyze`, {
    method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ workspaceId: intake.intake.workspace_id })
  });
  assert.equal(analyzeResponse.status, 409);
  assert.deepEqual(await analyzeResponse.json(), { error: 'phase31_free_first_reasoning_route_unavailable' });
});
