import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { createApp } from '../src/app.js';

const migrationsDir = path.resolve('migrations');
const publicDir = path.resolve('public');

test('local app serves control-plane UI and Phase 2 database-backed health endpoint', async (t) => {
  const dataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'workflow-os-server-'));
  const app = createApp({ databasePath: path.join(dataDir, 'test.sqlite'), dataDir, migrationsDir, publicDir });

  await new Promise((resolve) => app.server.listen(0, '127.0.0.1', resolve));
  t.after(async () => {
    await new Promise((resolve) => app.server.close(resolve));
    app.close();
  });

  const address = app.server.address();
  assert.equal(typeof address, 'object');
  const origin = `http://127.0.0.1:${address.port}`;

  const healthResponse = await fetch(`${origin}/api/health`);
  assert.equal(healthResponse.status, 200);
  const health = await healthResponse.json();
  assert.equal(health.phase, 'phase-2');
  assert.equal(health.gate, 'autonomy-kernel-implemented-live-certification-pending');
  assert.equal(health.database.status, 'ready');
  assert.equal(health.database.migrations, 6);

  const uiResponse = await fetch(`${origin}/`);
  assert.equal(uiResponse.status, 200);
  const ui = await uiResponse.text();
  assert.match(ui, /Local Control Plane/);
  assert.match(ui, /Command Center/);
  assert.match(ui, /Start from the real request/);
});
