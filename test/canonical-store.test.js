import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { openDatabase } from '../src/db/database.js';
import { CanonicalStore } from '../src/domain/canonical-store.js';

const migrationsDir = path.resolve('migrations');
function fixture() {
  const dataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'workflow-os-g2-'));
  const opened = openDatabase({ databasePath: path.join(dataDir, 'test.sqlite'), dataDir, migrationsDir });
  return { ...opened, store: new CanonicalStore(opened.db) };
}

test('canonical hierarchy supports client and internal projects while preserving workspace scope', () => {
  const { db, store } = fixture();
  store.createWorkspace({ id: 'ws-a', name: 'A' });
  store.createWorkspace({ id: 'ws-b', name: 'B' });
  store.createClient({ id: 'client-a', workspaceId: 'ws-a', name: 'Client A' });
  store.createEngagement({ id: 'eng-a', workspaceId: 'ws-a', clientId: 'client-a', title: 'Delivery' });
  const clientProject = store.createProject({ id: 'proj-a', workspaceId: 'ws-a', engagementId: 'eng-a', kind: 'client_delivery', title: 'Client project' });
  assert.equal(clientProject.engagement_id, 'eng-a');
  const internal = store.createProject({ id: 'proj-internal', workspaceId: 'ws-b', kind: 'internal_product', title: 'Internal' });
  assert.equal(internal.engagement_id, null);
  assert.throws(() => store.createEngagement({ id: 'bad', workspaceId: 'ws-b', clientId: 'client-a', title: 'Cross' }), /clients_not_found_in_workspace/);
  db.close();
});

test('database foreign keys reject cross-workspace references even when bypassing the domain store', () => {
  const { db, store } = fixture();
  const now = new Date().toISOString();
  store.createWorkspace({ id: 'ws-a', name: 'A' });
  store.createWorkspace({ id: 'ws-b', name: 'B' });
  store.createClient({ id: 'client-a', workspaceId: 'ws-a', name: 'A' });
  assert.throws(() => db.prepare(`INSERT INTO engagements (id,workspace_id,client_id,title,created_at,updated_at) VALUES (?,?,?,?,?,?)`).run('eng-bad','ws-b','client-a','Bad',now,now), /FOREIGN KEY constraint failed/);
  db.close();
});

test('project brief append is versioned and stale project writes are rejected', () => {
  const { db, store } = fixture();
  store.createWorkspace({ id: 'ws', name: 'W' });
  const project = store.createProject({ id: 'p', workspaceId: 'ws', kind: 'internal_product', title: 'P' });
  const first = store.appendAcceptedProjectBrief({ id: 'b1', workspaceId: 'ws', projectId: 'p', expectedProjectVersion: project.version, problem: 'Problem', desiredOutcome: 'Outcome', deliveryStrategy: 'custom_build', workingScope: { in: ['one'] } });
  assert.equal(first.version, 1);
  const updated = db.prepare('SELECT version,current_brief_version FROM projects WHERE id=?').get('p');
  assert.equal(updated.version, 2);
  assert.equal(updated.current_brief_version, 1);
  assert.throws(() => store.appendAcceptedProjectBrief({ id: 'b2', workspaceId: 'ws', projectId: 'p', expectedProjectVersion: 1, problem: 'New', desiredOutcome: 'New', deliveryStrategy: 'custom_build' }), /concurrency_conflict:project/);
  const second = store.appendAcceptedProjectBrief({ id: 'b2', workspaceId: 'ws', projectId: 'p', expectedProjectVersion: 2, problem: 'New', desiredOutcome: 'New', deliveryStrategy: 'hybrid', reason: 'goal_changed' });
  assert.equal(second.version, 2);
  assert.equal(db.prepare('SELECT status FROM project_briefs WHERE id=?').get('b1').status, 'superseded');
  assert.equal(db.prepare('SELECT COUNT(*) AS n FROM project_revisions WHERE project_id=?').get('p').n, 1);
  db.close();
});

test('work item transitions use optimistic versioning and dependencies stay inside one project', () => {
  const { db, store } = fixture();
  store.createWorkspace({ id: 'ws', name: 'W' });
  store.createProject({ id: 'p1', workspaceId: 'ws', kind: 'internal_product', title: 'P1' });
  store.createProject({ id: 'p2', workspaceId: 'ws', kind: 'internal_product', title: 'P2' });
  store.createWorkItem({ id: 'a', workspaceId: 'ws', projectId: 'p1', class: 'planning', title: 'A', outcome: 'A', status: 'ready' });
  store.createWorkItem({ id: 'b', workspaceId: 'ws', projectId: 'p1', class: 'implementation', title: 'B', outcome: 'B' });
  store.createWorkItem({ id: 'other', workspaceId: 'ws', projectId: 'p2', class: 'implementation', title: 'Other', outcome: 'Other' });
  store.addWorkDependency({ workspaceId: 'ws', projectId: 'p1', workItemId: 'b', dependsOnWorkItemId: 'a' });
  assert.throws(() => store.addWorkDependency({ workspaceId: 'ws', projectId: 'p1', workItemId: 'b', dependsOnWorkItemId: 'other' }), /work_item_not_found_in_project/);
  const running = store.transitionWorkItem({ workspaceId: 'ws', projectId: 'p1', workItemId: 'a', expectedVersion: 1, toStatus: 'running' });
  assert.equal(running.version, 2);
  assert.equal(running.status, 'running');
  assert.throws(() => store.transitionWorkItem({ workspaceId: 'ws', projectId: 'p1', workItemId: 'a', expectedVersion: 1, toStatus: 'blocked' }), /concurrency_conflict:work_item/);
  assert.throws(() => store.transitionWorkItem({ workspaceId: 'ws', projectId: 'p1', workItemId: 'a', expectedVersion: 2, toStatus: 'complete' }), /invalid_work_item_transition/);
  assert.ok(Number(db.prepare("SELECT COUNT(*) AS n FROM project_events WHERE project_id='p1'").get().n) >= 3);
  db.close();
});

test('proposals and approvals remain explicit records instead of silently mutating canonical work', () => {
  const { db, store } = fixture();
  store.createWorkspace({ id: 'ws', name: 'W' });
  store.createProject({ id: 'p', workspaceId: 'ws', kind: 'internal_product', title: 'P' });
  store.createWorkItem({ id: 'w', workspaceId: 'ws', projectId: 'p', class: 'research', title: 'Research', outcome: 'Evidence' });
  const before = Number(db.prepare('SELECT COUNT(*) AS n FROM work_items WHERE project_id=?').get('p').n);
  const proposal = store.createWorkItemProposal({ id: 'proposal', workspaceId: 'ws', projectId: 'p', sourceWorkItemId: 'w', title: 'Add integration', outcome: 'Integration exists', proposedClass: 'implementation', impact: { scope: 'material' } });
  assert.equal(proposal.status, 'proposed');
  assert.equal(Number(db.prepare('SELECT COUNT(*) AS n FROM work_items WHERE project_id=?').get('p').n), before);
  const decision = store.createDecision({ id: 'decision', workspaceId: 'ws', projectId: 'p', question: 'Accept material scope change?' });
  const approval = store.requestApproval({ id: 'approval', workspaceId: 'ws', projectId: 'p', subjectType: 'work_item_proposal', subjectId: proposal.id, subjectVersion: 1, authorityReason: 'material_scope_change' });
  assert.equal(decision.status, 'open');
  assert.equal(approval.status, 'requested');
  db.close();
});
