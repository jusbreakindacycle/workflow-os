import assert from 'node:assert/strict';
import test from 'node:test';
import { createPhase2Fixture, acceptedReadyProject, addFixtureRoute } from '../test-support/phase2-fixture.js';

test('Phase 2 registry separates provider access from canonical Project meaning', () => {
  const { db, store, phase1, phase2 } = createPhase2Fixture();
  try {
    const { workspace, snapshot, workItem } = acceptedReadyProject({ store, phase1 });
    const capabilities = phase2.seedCapabilityRegistry();
    assert.ok(capabilities.some((row) => row.capability_key === 'reasoning'));
    assert.ok(capabilities.some((row) => row.capability_key === 'verification'));

    const { connection, route } = addFixtureRoute({ phase2, workspaceId: workspace.id, name: 'fixture-worker', group: 'fixture-worker' });
    assert.equal(connection.status, 'available');
    assert.equal(route.adapter_kind, 'fixture');

    const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(snapshot.project.id);
    const item = db.prepare('SELECT * FROM work_items WHERE id = ?').get(workItem.id);
    assert.doesNotMatch(JSON.stringify(project), /fixture-worker|provider_key|model_key/);
    assert.doesNotMatch(JSON.stringify(item), /fixture-worker|provider_key|model_key/);
  } finally { db.close(); }
});

test('Broker records an explainable route decision and refuses unknown capabilities', () => {
  const { db, store, phase1, phase2 } = createPhase2Fixture();
  try {
    const { workspace, snapshot, workItem } = acceptedReadyProject({ store, phase1 });
    addFixtureRoute({ phase2, workspaceId: workspace.id, name: 'worker-a', group: 'group-a', quality: 70 });
    addFixtureRoute({ phase2, workspaceId: workspace.id, name: 'worker-b', group: 'group-b', quality: 90 });

    const selected = phase2.selectRoute({
      workspaceId: workspace.id,
      projectId: snapshot.project.id,
      workItemId: workItem.id,
      purpose: 'worker',
      requiredCapabilities: ['reasoning']
    });
    assert.equal(selected.route.route_name, 'worker-b');
    assert.equal(selected.decision.route_id, selected.route.id);
    assert.ok(JSON.parse(selected.decision.candidate_snapshot_json).length >= 2);

    const connection = phase2.listProviderConnections({ workspaceId: workspace.id })[0];
    assert.throws(() => phase2.createExecutionRoute({
      workspaceId: workspace.id,
      providerConnectionId: connection.id,
      routeName: 'bad-capability',
      runtimeKey: 'fixture',
      adapterKind: 'fixture',
      capabilities: ['telepathy'],
      independenceGroup: 'bad'
    }), /unknown_capability:telepathy/);
  } finally { db.close(); }
});

test('Metered route is ineligible without an approved SpendEnvelope and eligible after bounded approval', () => {
  const { db, store, phase1, phase2 } = createPhase2Fixture();
  try {
    const { workspace, snapshot, workItem } = acceptedReadyProject({ store, phase1 });
    const connection = phase2.createProviderConnection({
      workspaceId: workspace.id,
      providerKey: 'fixture',
      connectionType: 'local_service',
      billingMode: 'metered',
      locality: 'local'
    });
    phase2.createExecutionRoute({
      workspaceId: workspace.id,
      providerConnectionId: connection.id,
      routeName: 'metered-fixture',
      runtimeKey: 'fixture',
      adapterKind: 'fixture',
      capabilities: ['reasoning'],
      independenceGroup: 'metered-fixture',
      estimatedCostMinor: 25,
      currency: 'USD'
    });

    assert.throws(() => phase2.selectRoute({
      workspaceId: workspace.id,
      projectId: snapshot.project.id,
      workItemId: workItem.id,
      purpose: 'worker',
      requiredCapabilities: ['reasoning'],
      spendPurpose: 'phase2_model_execution'
    }), /no_eligible_worker_route/);
    assert.ok(phase1.getNeedsAttention({ workspaceId: workspace.id, projectId: snapshot.project.id }).some((row) => row.type === 'decision'));

    const request = phase1.requestSpend({
      workspaceId: workspace.id,
      projectId: snapshot.project.id,
      workItemId: workItem.id,
      purpose: 'phase2_model_execution',
      currency: 'USD',
      maxAmountMinor: 100
    });
    const approved = phase1.resolveSpendRequest({ workspaceId: workspace.id, projectId: snapshot.project.id, spendRequestId: request.request.id, decision: 'approved' });
    const selected = phase2.selectRoute({
      workspaceId: workspace.id,
      projectId: snapshot.project.id,
      workItemId: workItem.id,
      purpose: 'worker',
      requiredCapabilities: ['reasoning'],
      spendEnvelopeId: approved.envelope.id,
      spendPurpose: 'phase2_model_execution'
    });
    assert.equal(selected.route.route_name, 'metered-fixture');
  } finally { db.close(); }
});
