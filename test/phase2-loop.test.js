import assert from 'node:assert/strict';
import test from 'node:test';
import { createPhase2Fixture, acceptedReadyProject, addFixtureRoute } from '../test-support/phase2-fixture.js';

test('bounded worker + independent verifier completes canonical work only after verification', async () => {
  const { db, store, phase1, phase2 } = createPhase2Fixture();
  try {
    const { workspace, snapshot, workItem } = acceptedReadyProject({ store, phase1 });
    addFixtureRoute({ phase2, workspaceId: workspace.id, name: 'worker', group: 'worker-group', mode: 'worker', capabilities: ['reasoning'] });
    addFixtureRoute({ phase2, workspaceId: workspace.id, name: 'verifier', group: 'verifier-group', mode: 'verifier', capabilities: ['verification'] });

    const result = await phase2.runWorkItem({
      workspaceId: workspace.id,
      projectId: snapshot.project.id,
      workItemId: workItem.id,
      maxIterations: 2
    });
    assert.equal(result.status, 'passed');
    assert.equal(result.verification.verification.outcome, 'pass');
    assert.equal(result.verification.workItem.status, 'complete');
    assert.equal(result.verification.assignment.verification_status, 'passed');
    const attempts = db.prepare('SELECT purpose, status FROM execution_attempts WHERE assignment_id = ? ORDER BY started_at').all(result.verification.assignment.id);
    assert.deepEqual(attempts.map((row) => row.purpose), ['worker', 'verifier']);
    assert.ok(attempts.every((row) => row.status === 'succeeded'));
  } finally { db.close(); }
});

test('missing independent verifier blocks execution and becomes Needs My Attention', async () => {
  const { db, store, phase1, phase2 } = createPhase2Fixture();
  try {
    const { workspace, snapshot, workItem } = acceptedReadyProject({ store, phase1 });
    addFixtureRoute({ phase2, workspaceId: workspace.id, name: 'worker-only', group: 'only-group', mode: 'worker', capabilities: ['reasoning'] });
    const result = await phase2.runWorkItem({ workspaceId: workspace.id, projectId: snapshot.project.id, workItemId: workItem.id });
    assert.equal(result.status, 'blocked');
    assert.equal(result.reason, 'independent_verifier_unavailable');
    assert.equal(result.assignment.status, 'blocked');
    const attention = phase1.getNeedsAttention({ workspaceId: workspace.id, projectId: snapshot.project.id });
    assert.ok(attention.some((row) => row.type === 'decision'));
    assert.ok(attention.some((row) => row.type === 'assignment'));
    assert.equal(db.prepare('SELECT status FROM work_items WHERE id = ?').get(workItem.id).status, 'ready');
  } finally { db.close(); }
});

test('worker route failure falls back through the broker without changing canonical objective', async () => {
  const { db, store, phase1, phase2 } = createPhase2Fixture();
  try {
    const { workspace, snapshot, workItem } = acceptedReadyProject({ store, phase1 });
    addFixtureRoute({ phase2, workspaceId: workspace.id, name: 'failing-worker', group: 'fail-group', mode: 'worker', quality: 99, capabilities: ['reasoning'], config: { always_fail: true } });
    addFixtureRoute({ phase2, workspaceId: workspace.id, name: 'fallback-worker', group: 'fallback-group', mode: 'worker', quality: 70, capabilities: ['reasoning'] });
    addFixtureRoute({ phase2, workspaceId: workspace.id, name: 'verifier', group: 'verifier-group', mode: 'verifier', capabilities: ['verification'] });

    const result = await phase2.runWorkItem({ workspaceId: workspace.id, projectId: snapshot.project.id, workItemId: workItem.id, maxIterations: 2 });
    assert.equal(result.status, 'passed');
    const attempts = db.prepare("SELECT route_id, status FROM execution_attempts WHERE assignment_id = ? AND purpose = 'worker' ORDER BY started_at").all(result.verification.assignment.id);
    assert.equal(attempts.length, 2);
    assert.equal(attempts[0].status, 'failed');
    assert.equal(attempts[1].status, 'succeeded');
    const item = db.prepare('SELECT * FROM work_items WHERE id = ?').get(workItem.id);
    assert.equal(item.outcome, workItem.outcome);
  } finally { db.close(); }
});

test('bounded verification retries exhaust instead of looping forever', async () => {
  const { db, store, phase1, phase2 } = createPhase2Fixture();
  try {
    const { workspace, snapshot, workItem } = acceptedReadyProject({ store, phase1 });
    addFixtureRoute({ phase2, workspaceId: workspace.id, name: 'worker', group: 'worker-group', mode: 'worker', capabilities: ['reasoning'] });
    addFixtureRoute({ phase2, workspaceId: workspace.id, name: 'rejecting-verifier', group: 'verifier-group', mode: 'verifier', capabilities: ['verification'], config: { always_reject: true, reject_summary: 'Acceptance evidence is insufficient.' } });
    const result = await phase2.runWorkItem({ workspaceId: workspace.id, projectId: snapshot.project.id, workItemId: workItem.id, maxIterations: 2 });
    assert.equal(result.status, 'exhausted');
    assert.equal(result.loop.current_iteration, 2);
    assert.equal(result.loop.stop_reason, 'iteration_budget_exhausted');
    assert.equal(result.verification.workItem.status, 'needs_attention');
    assert.equal(result.verification.assignment.verification_status, 'failed');
  } finally { db.close(); }
});
