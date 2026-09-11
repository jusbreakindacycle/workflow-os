import assert from 'node:assert/strict';
import test from 'node:test';
import { createPhase2Fixture, acceptedReadyProject } from '../test-support/phase2-fixture.js';

test('Assignment incremental-cost budget blocks a new attempt even when the wider SpendEnvelope has room', () => {
  const { db, store, phase1, phase2 } = createPhase2Fixture();
  try {
    const { workspace, snapshot, workItem } = acceptedReadyProject({ store, phase1 });
    const spend = phase1.requestSpend({
      workspaceId: workspace.id,
      projectId: snapshot.project.id,
      workItemId: workItem.id,
      purpose: 'phase2_model_execution',
      currency: 'USD',
      maxAmountMinor: 100
    });
    const approved = phase1.resolveSpendRequest({ workspaceId: workspace.id, projectId: snapshot.project.id, spendRequestId: spend.request.id, decision: 'approved' });

    const workerConnection = phase2.createProviderConnection({ workspaceId: workspace.id, providerKey: 'fixture', connectionType: 'local_service', billingMode: 'metered', locality: 'local' });
    const verifierConnection = phase2.createProviderConnection({ workspaceId: workspace.id, providerKey: 'fixture', connectionType: 'local_service', billingMode: 'metered', locality: 'local' });
    const workerRoute = phase2.createExecutionRoute({
      workspaceId: workspace.id, providerConnectionId: workerConnection.id, routeName: 'budget-worker', runtimeKey: 'fixture', adapterKind: 'fixture',
      capabilities: ['reasoning'], independenceGroup: 'budget-worker-group', estimatedCostMinor: 30, currency: 'USD', config: { mode: 'worker' }
    });
    phase2.createExecutionRoute({
      workspaceId: workspace.id, providerConnectionId: verifierConnection.id, routeName: 'budget-verifier', runtimeKey: 'fixture', adapterKind: 'fixture',
      capabilities: ['verification'], independenceGroup: 'budget-verifier-group', estimatedCostMinor: 30, currency: 'USD', config: { mode: 'verifier' }
    });

    const created = phase2.createRoutedAssignment({
      workspaceId: workspace.id,
      projectId: snapshot.project.id,
      workItemId: workItem.id,
      maxIterations: 1,
      maxIncrementalCostMinor: 50,
      spendEnvelopeId: approved.envelope.id,
      spendPurpose: 'phase2_model_execution'
    });

    db.prepare(`INSERT INTO execution_attempts
      (id, workspace_id, project_id, work_item_id, assignment_id, route_decision_id, route_id, purpose, iteration, status,
       input_sha256, output_sha256, output_text, usage_json, estimated_cost_minor, actual_cost_minor, started_at, finished_at)
      VALUES ('worker-attempt', ?, ?, ?, ?, ?, ?, 'worker', 1, 'succeeded', 'input', 'output', 'evidence', '{}', 30, 30, ?, ?)`)
      .run(workspace.id, snapshot.project.id, workItem.id, created.assignment.id, created.routeDecision.id, workerRoute.id, new Date().toISOString(), new Date().toISOString());

    const verifier = phase2.selectRoute({
      workspaceId: workspace.id,
      projectId: snapshot.project.id,
      workItemId: workItem.id,
      purpose: 'verifier',
      requiredCapabilities: ['verification'],
      assignmentId: created.assignment.id,
      excludeIndependenceGroups: [workerRoute.independence_group],
      spendEnvelopeId: approved.envelope.id,
      spendPurpose: 'phase2_model_execution'
    });

    assert.throws(() => db.prepare(`INSERT INTO execution_attempts
      (id, workspace_id, project_id, work_item_id, assignment_id, route_decision_id, route_id, purpose, iteration, status,
       input_sha256, usage_json, estimated_cost_minor, started_at)
      VALUES ('verifier-attempt', ?, ?, ?, ?, ?, ?, 'verifier', 1, 'running', 'verify-input', '{}', 30, ?)`)
      .run(workspace.id, snapshot.project.id, workItem.id, created.assignment.id, verifier.decision.id, verifier.route.id, new Date().toISOString()),
      /assignment_incremental_cost_budget_exceeded/);

    const attempts = db.prepare('SELECT * FROM execution_attempts WHERE assignment_id = ?').all(created.assignment.id);
    assert.equal(attempts.length, 1);
    assert.equal(attempts[0].actual_cost_minor, 30);
    const envelope = db.prepare('SELECT * FROM spend_envelopes WHERE id = ?').get(approved.envelope.id);
    assert.equal(envelope.max_amount_minor, 100);
  } finally { db.close(); }
});
