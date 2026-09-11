import assert from 'node:assert/strict';
import test from 'node:test';
import { loadConfig } from '../src/config.js';

test('loadConfig uses safe local defaults', () => {
  const config = loadConfig({}, '/tmp/workflow-os-config-test');
  assert.equal(config.host, '127.0.0.1');
  assert.equal(config.port, 4310);
  assert.match(config.databasePath, /workflow-os\.sqlite$/);
});

test('loadConfig rejects invalid ports', () => {
  assert.throws(() => loadConfig({ WORKFLOW_OS_PORT: '70000' }, '/tmp'), /WORKFLOW_OS_PORT/);
});
