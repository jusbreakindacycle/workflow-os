import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { openDatabase } from '../src/db/database.js';
import { CanonicalStore } from '../src/domain/canonical-store.js';
import { Phase1ControlPlane } from '../src/domain/phase1-control-plane.js';

const migrationsDir = path.resolve('migrations');

function fixture(prefix = 'workflow-os-phase22-') {
  const dataDir = fs.mkdtempSync(path.join(os.tmpdir(), prefix));
  const opened = openDatabase({ databasePath: path.join(dataDir, 'test.sqlite'), dataDir, migrationsDir });
  return { ...opened, store: new CanonicalStore(opened.db), control: new Phase1ControlPlane(opened.db) };
}

function acceptedProject(store, { workspaceId = 'ws', projectId = 'project', strategy = 'custom_build' } = {}) {
  let workspace;
  try { workspace = store.getWorkspace(workspaceId); }
  catch { workspace = store.createWorkspace({ id: workspaceId, name: workspaceId }); }
  const project = store.createProject({ id: projectId, workspaceId, kind: 'internal_product', title: projectId });
  const brief = store.appendAcceptedProjectBrief({
    id: `${projectId}-brief-1`,
    workspaceId,
    projectId,
    expectedProjectVersion: project.version,
    problem: 'Synthetic authority-hardening problem.',
    desiredOutcome: 'Only current, scoped authority may cause consequential effects.',
    deliveryStrategy: strategy,
    workingScope: { success: 'Authority checks remain fail-closed.' }
  });
  return { workspace, project: store.getWorkspace ? null : project, projectId, brief };
}

test('Phase 2.2 only allows WorkItems to be created as draft or ready, including direct SQL inserts', () => {
  const { db, store } = fixture();
  try {
    store.createWorkspace({ id: 'ws', name: 'W' });
    store.createProject({ id: 'p', workspaceId: 'ws', kind: 'internal_product', title: 'P' });

    const draft = store.createWorkItem({ id: 'draft', workspaceId: 'ws', projectId: 'p', class: 'planning', title: 'Draft', outcome: 'Draft outcome' });
    const ready = store.createWorkItem({ id: 'ready', workspaceId: 'ws', projectId: 'p', class: 'planning', title: 'Ready', outcome: 'Ready outcome', status: 'ready' });
    assert.equal(draft.status, 'draft');
    assert.equal(ready.status, 'ready');

    assert.throws(
      () => store.createWorkItem({ id: 'complete', workspaceId: 'ws', projectId: 'p', class: 'planning', title: 'Complete', outcome: 'Impossible initial state', status: 'complete' }),
      /work_item_initial_status_invalid/
    );

    const now = new Date().toISOString();
    assert.throws(
      () => db.prepare(`INSERT INTO work_items
        (id, workspace_id, project_id, class, title, outcome, status, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`).run('sql-running', 'ws', 'p', 'implementation', 'SQL bypass', 'Must fail', 'running', now, now),
      /work_item_initial_status_invalid/
    );
  } finally { db.close(); }
});

test('Phase 2.2 approvals reject unknown, cross-project, stale-version, and mutable authority subjects', () => {
  const { db, store } = fixture();
  try {
    store.createWorkspace({ id: 'ws', name: 'W' });
    store.createProject({ id: 'p1', workspaceId: 'ws', kind: 'internal_product', title: 'P1' });
    store.createProject({ id: 'p2', workspaceId: 'ws', kind: 'internal_product', title: 'P2' });
    const item = store.createWorkItem({ id: 'w1', workspaceId: 'ws', projectId: 'p1', class: 'implementation', title: 'W1', outcome: 'O1', status: 'ready' });
    const other = store.createWorkItem({ id: 'w2', workspaceId: 'ws', projectId: 'p2', class: 'implementation', title: 'W2', outcome: 'O2' });

    const approval = store.requestApproval({
      id: 'approval-current', workspaceId: 'ws', projectId: 'p1', subjectType: 'work_item', subjectId: item.id,
      subjectVersion: item.version, authorityReason: 'synthetic_current_subject', bounds: { action: 'test' }
    });
    assert.equal(approval.status, 'requested');

    assert.throws(() => store.requestApproval({
      id: 'approval-cross', workspaceId: 'ws', projectId: 'p1', subjectType: 'work_item', subjectId: other.id,
      subjectVersion: other.version, authorityReason: 'cross_project'
    }), /approval_subject_invalid_or_stale/);

    assert.throws(() => store.requestApproval({
      id: 'approval-stale', workspaceId: 'ws', projectId: 'p1', subjectType: 'work_item', subjectId: item.id,
      subjectVersion: item.version + 1, authorityReason: 'stale_version'
    }), /approval_subject_invalid_or_stale/);

    assert.throws(() => store.requestApproval({
      id: 'approval-unknown', workspaceId: 'ws', projectId: 'p1', subjectType: 'made_up_subject', subjectId: item.id,
      subjectVersion: item.version, authorityReason: 'unknown_subject'
    }), /approval_subject_invalid_or_stale/);

    assert.throws(
      () => db.prepare("UPDATE approvals SET bounds_json = '{\"action\":\"expanded\"}' WHERE id = ?").run(approval.id),
      /approval_authority_immutable/
    );
  } finally { db.close(); }
});

test('Phase 2.2 repository approval is checked at resolution and again at consequential use time', () => {
  const { db, store, control } = fixture();
  try {
    store.createWorkspace({ id: 'ws', name: 'W' });
    const project = store.createProject({ id: 'p', workspaceId: 'ws', kind: 'internal_product', title: 'P' });
    store.appendAcceptedProjectBrief({
      id: 'brief-1', workspaceId: 'ws', projectId: 'p', expectedProjectVersion: project.version,
      problem: 'Need source control.', desiredOutcome: 'A governed repository exists.', deliveryStrategy: 'custom_build'
    });

    const proposal = control.proposeRepository({ workspaceId: 'ws', projectId: 'p', reason: 'Synthetic governed repo.' });
    const approval = control.requestRepositoryApproval({ workspaceId: 'ws', projectId: 'p', repositoryProposalId: proposal.id });

    const currentProject = db.prepare('SELECT * FROM projects WHERE id = ?').get('p');
    store.appendAcceptedProjectBrief({
      id: 'brief-2', workspaceId: 'ws', projectId: 'p', expectedProjectVersion: currentProject.version,
      problem: 'Goal changed before approval.', desiredOutcome: 'New governed outcome.', deliveryStrategy: 'custom_build', reason: 'phase22_stale_resolution'
    });

    assert.throws(
      () => control.resolveApproval({ workspaceId: 'ws', projectId: 'p', approvalId: approval.id, decision: 'approved', evidence: ['operator'] }),
      /approval_subject_invalid_or_stale/
    );
    assert.equal(db.prepare('SELECT status FROM approvals WHERE id = ?').get(approval.id).status, 'requested');

    const project2 = store.createProject({ id: 'p2', workspaceId: 'ws', kind: 'internal_product', title: 'P2' });
    store.appendAcceptedProjectBrief({
      id: 'p2-brief-1', workspaceId: 'ws', projectId: 'p2', expectedProjectVersion: project2.version,
      problem: 'Need another repo.', desiredOutcome: 'Second governed repository exists.', deliveryStrategy: 'custom_build'
    });
    const proposal2 = control.proposeRepository({ workspaceId: 'ws', projectId: 'p2', reason: 'Use-time TOCTOU fixture.' });
    const approval2 = control.requestRepositoryApproval({ workspaceId: 'ws', projectId: 'p2', repositoryProposalId: proposal2.id });
    control.resolveApproval({ workspaceId: 'ws', projectId: 'p2', approvalId: approval2.id, decision: 'approved', evidence: ['operator'] });

    const currentProject2 = db.prepare('SELECT * FROM projects WHERE id = ?').get('p2');
    store.appendAcceptedProjectBrief({
      id: 'p2-brief-2', workspaceId: 'ws', projectId: 'p2', expectedProjectVersion: currentProject2.version,
      problem: 'Changed after approval.', desiredOutcome: 'Old approval must not execute.', deliveryStrategy: 'custom_build', reason: 'phase22_use_time_stale'
    });

    assert.throws(
      () => control.executeMockRepository({ workspaceId: 'ws', projectId: 'p2', repositoryProposalId: proposal2.id }),
      /repository_authority_stale_or_missing/
    );
    assert.equal(db.prepare('SELECT COUNT(*) AS n FROM repository_mock_results WHERE project_id = ?').get('p2').n, 0);
  } finally { db.close(); }
});

test('Phase 2.2 spend approval binds to exact request versions and becomes unusable after WorkItem change', () => {
  const { db, store, control } = fixture();
  try {
    store.createWorkspace({ id: 'ws', name: 'W' });
    const project = store.createProject({ id: 'p', workspaceId: 'ws', kind: 'internal_product', title: 'P' });
    store.appendAcceptedProjectBrief({
      id: 'brief-1', workspaceId: 'ws', projectId: 'p', expectedProjectVersion: project.version,
      problem: 'Synthetic paid action.', desiredOutcome: 'Spend is bounded to current authority.', deliveryStrategy: 'custom_build'
    });
    const graph = control.ensureInitialWorkGraph({ workspaceId: 'ws', projectId: 'p' });
    const item = graph.nextReady[0];
    const requested = control.requestSpend({ workspaceId: 'ws', projectId: 'p', workItemId: item.id, purpose: 'phase22_metered_fixture', currency: 'USD', maxAmountMinor: 100 });
    const persisted = db.prepare('SELECT * FROM spend_requests WHERE id = ?').get(requested.request.id);
    const currentProject = db.prepare('SELECT * FROM projects WHERE id = ?').get('p');
    assert.equal(persisted.project_version, currentProject.version);
    assert.equal(persisted.work_item_version, item.version);

    store.transitionWorkItem({ workspaceId: 'ws', projectId: 'p', workItemId: item.id, expectedVersion: item.version, toStatus: 'running', reason: 'simulate_subject_change' });

    assert.throws(
      () => control.resolveSpendRequest({ workspaceId: 'ws', projectId: 'p', spendRequestId: requested.request.id, decision: 'approved', evidence: ['operator'] }),
      /approval_subject_invalid_or_stale/
    );
    assert.equal(db.prepare('SELECT status FROM approvals WHERE id = ?').get(requested.approval.id).status, 'requested');
    assert.equal(db.prepare('SELECT status FROM spend_requests WHERE id = ?').get(requested.request.id).status, 'requested');
    assert.equal(db.prepare('SELECT COUNT(*) AS n FROM spend_envelopes WHERE project_id = ?').get('p').n, 0);
  } finally { db.close(); }
});
