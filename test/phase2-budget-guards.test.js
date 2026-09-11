import assert from 'node:assert/strict';
import test from 'node:test';
import { createPhase2Fixture, acceptedReadyProject } from '../test-support/phase2-fixture.js';

test('Assignment incremental-cost budget blocks attempts even when wider SpendEnvelope still has room', async () => {
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
    phase2.createExecutionRoute({
      workspaceId: workspace.id, providerConnectionId: workerConnection.id, routeName: 'budget-worker', runtimeKey: 'fixture', adapterKind: 'fixture',
      capabilities: ['reasoning'], independenceGroup: 'budget-worker-group', estimatedCostMinor: 30, currency: 'USD', config: { mode: 'worker' }
    });
    phase2.createExecutionRoute({
      workspaceId: workspace.id, providerConnectionId: verifierConnection.id, routeName: 'budget-verifier', runtimeKey: 'fixture', adapterKind: 'fixture',
      capabilities: ['verification'], independenceGroup: 'budget-verifier-group', estimatedCostMinor: 30, currency: 'USD', config: { mode: 'verifier' }
    });

    const result = await phase2.runWorkItem({
      workspaceId: workspace.id,
      projectId: snapshot.project.id,
      workItemId: workItem.id,
      maxIterations: 1,
      maxIncrementalCostMinor: 50,
      spendEnvelopeId: approved.envelope.id,
      spendPurpose: 'phase2_model_execution'
    });

    assert.equal(result.status, 'blocked');
    const attempts = db.prepare('SELECT * FROM execution_attempts WHERE assignment_id = ? ORDER BY started_at').all(result.assignment.id);
    assert.equal(attempts.length, 1, 'the verifier call is blocked before external execution because it would exceed the Assignment budget');
    assert.equal(attempts[0].purpose, 'worker');
    const envelope = db.prepare('SELECT * FROM spend_envelopes WHERE id = ?').get(approved.envelope.id);
    assert.equal(envelope.spent_amount_minor, 0, 'fixture reports actual zero cost; the larger envelope remains available');
  } finally { db.close(); }
});
