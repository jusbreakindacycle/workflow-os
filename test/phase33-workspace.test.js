import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { openDatabase } from '../src/db/database.js';
import { CanonicalStore } from '../src/domain/canonical-store.js';
import { GovernedWorkspace } from '../src/runtime/governed-workspace.js';

const migrationsDir = path.resolve('migrations');

function setup() {
  const dataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'workflow-os-p33-'));
  const { db } = openDatabase({ databasePath: path.join(dataDir, 'db.sqlite'), dataDir, migrationsDir });
  const store = new CanonicalStore(db);
  const workspace = store.createWorkspace({ name: 'Phase33' });
  const project = store.createProject({ workspaceId: workspace.id, kind: 'internal_product', title: 'Workspace isolation' });
  const rootDir = path.join(dataDir, 'execution-root');
  return { db, dataDir, workspaceId: workspace.id, projectId: project.id, runtime: new GovernedWorkspace(db, { rootDir }) };
}

test('governed workspace allows bounded writes but rejects traversal, absolute paths, symlink escape and arbitrary commands', () => {
  const env = setup();
  const ws = env.runtime.prepare({ workspaceId: env.workspaceId, projectId: env.projectId });
  env.runtime.writeFile({ workspaceId: env.workspaceId, projectId: env.projectId, relativePath: 'src/app.js', content: 'export const ok = true;\n' });
  assert.match(env.runtime.readFile({ workspaceId: env.workspaceId, projectId: env.projectId, relativePath: 'src/app.js' }), /ok = true/);
  assert.throws(() => env.runtime.writeFile({ workspaceId: env.workspaceId, projectId: env.projectId, relativePath: '../escape.txt', content: 'no' }), /workspace_path_escape_rejected/);
  assert.throws(() => env.runtime.writeFile({ workspaceId: env.workspaceId, projectId: env.projectId, relativePath: path.resolve(env.dataDir, 'absolute.txt'), content: 'no' }), /workspace_path_escape_rejected/);

  const outside = path.join(env.dataDir, 'outside');
  fs.mkdirSync(outside);
  fs.symlinkSync(outside, path.join(ws.root_path, 'link'));
  assert.throws(() => env.runtime.writeFile({ workspaceId: env.workspaceId, projectId: env.projectId, relativePath: 'link/escape.txt', content: 'no' }), /workspace_symlink_escape_rejected/);
  fs.unlinkSync(path.join(ws.root_path, 'link'));

  assert.throws(() => env.runtime.runCommand({ workspaceId: env.workspaceId, projectId: env.projectId, commandClass: 'shell', relativePath: 'src/app.js' }), /workspace_command_class_forbidden/);
  const check = env.runtime.runCommand({ workspaceId: env.workspaceId, projectId: env.projectId, commandClass: 'syntax_check', relativePath: 'src/app.js' });
  assert.equal(check.passed, true);
  assert.equal(env.runtime.get({ workspaceId: env.workspaceId, projectId: env.projectId }).policy.network, 'loopback_only');
  env.db.close();
});
