import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { openDatabase } from '../src/db/database.js';
import { CanonicalStore } from '../src/domain/canonical-store.js';

const migrationsDir = path.resolve('migrations');
const expectedTables = [
  'workspaces','clients','engagements','projects','project_briefs','project_revisions',
  'work_items','work_dependencies','work_item_proposals','decisions','approvals',
  'artifact_references','evidence_references','project_events','project_pack_versions',
  'context_slices','spend_envelopes','cost_records','assignments',
  'project_intakes','discovery_responses','delivery_strategy_decisions'
];

function fixture() {
  const dataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'workflow-os-schema-'));
  const opened = openDatabase({ databasePath: path.join(dataDir, 'test.sqlite'), dataDir, migrationsDir });
  return { ...opened, store: new CanonicalStore(opened.db) };
}

test('Phase 1 canonical tables exist and every scoped table carries workspace_id', () => {
  const { db } = fixture();
  const tables = new Set(db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all().map((row) => row.name));
  for (const table of expectedTables) assert.ok(tables.has(table), `missing ${table}`);
  for (const table of expectedTables.filter((name) => name !== 'workspaces')) {
    const columns = db.prepare(`PRAGMA table_info(${table})`).all().map((row) => row.name);
    assert.ok(columns.includes('workspace_id'), `${table} must carry workspace_id`);
  }
  db.close();
});

test('assignment snapshots must bind to the exact current WorkItem version', () => {
  const { db, store } = fixture();
  store.createWorkspace({ id: 'ws', name: 'Workspace' });
  store.createProject({ id: 'p', workspaceId: 'ws', kind: 'internal_product', title: 'P' });
  store.createWorkItem({ id: 'w', workspaceId: 'ws', projectId: 'p', class: 'implementation', title: 'W', outcome: 'O', status: 'ready' });
  store.transitionWorkItem({ workspaceId: 'ws', projectId: 'p', workItemId: 'w', expectedVersion: 1, toStatus: 'running' });
  const now = new Date().toISOString();
  assert.throws(() => db.prepare(`INSERT INTO assignments
    (id,workspace_id,project_id,work_item_id,work_item_version,assignee_kind,status,created_at)
    VALUES (?,?,?,?,?,'human','created',?)`).run('bad','ws','p','w',1,now), /assignment_work_item_version_mismatch/);
  db.prepare(`INSERT INTO assignments
    (id,workspace_id,project_id,work_item_id,work_item_version,assignee_kind,status,created_at)
    VALUES (?,?,?,?,?,'human','created',?)`).run('good','ws','p','w',2,now);
  assert.equal(db.prepare('SELECT work_item_version FROM assignments WHERE id=?').get('good').work_item_version, 2);
  db.close();
});
