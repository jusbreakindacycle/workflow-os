import assert from 'node:assert/strict';
import test from 'node:test';
import { createPhase2Fixture, acceptedReadyProject, addFixtureRoute } from '../test-support/phase2-fixture.js';

test('two independently configured routes can execute the same canonical assignment projection', async () => {
  const { db, store, phase1, phase2 } = createPhase2Fixture();
  try {
    const { workspace, snapshot, workItem } = acceptedReadyProject({ store, phase1 });
    const first = addFixtureRoute({ phase2, workspaceId: workspace.id, name: 'portable-a', group: 'portable-group-a', capabilities: ['reasoning'] });
    const second = addFixtureRoute({ phase2, workspaceId: workspace.id, name: 'portable-b', group: 'portable-group-b', capabilities: ['reasoning'] });
    const result = await phase2.runPortabilityDrill({
      workspaceId: workspace.id,
      projectId: snapshot.project.id,
      workItemId: workItem.id,
      primaryRouteId: first.route.id,
      secondaryRouteId: second.route.id
    });
    assert.equal(result.certification.status, 'passed');
    assert.equal(result.certification.certification_type, 'portability_drill');
    assert.equal(result.primaryAttempt.input_sha256, result.secondaryAttempt.input_sha256);
    const item = db.prepare('SELECT * FROM work_items WHERE id = ?').get(workItem.id);
    assert.equal(item.status, 'ready', 'portability drill must not complete canonical work');
    const evidence = JSON.parse(result.certification.evidence_json);
    assert.equal(evidence.projectMeaningChanged, false);
  } finally { db.close(); }
});

test('portability drill rejects routes that share the same connection or independence group', async () => {
  const { db, store, phase1, phase2 } = createPhase2Fixture();
  try {
    const { workspace, snapshot, workItem } = acceptedReadyProject({ store, phase1 });
    const connection = phase2.createProviderConnection({
      workspaceId: workspace.id,
      providerKey: 'fixture',
      connectionType: 'local_service',
      billingMode: 'zero_incremental',
      locality: 'local'
    });
    const a = phase2.createExecutionRoute({
      workspaceId: workspace.id, providerConnectionId: connection.id, routeName: 'same-connection-a', runtimeKey: 'fixture',
      adapterKind: 'fixture', capabilities: ['reasoning'], independenceGroup: 'g-a', estimatedCostMinor: 0
    });
    const b = phase2.createExecutionRoute({
      workspaceId: workspace.id, providerConnectionId: connection.id, routeName: 'same-connection-b', runtimeKey: 'fixture',
      adapterKind: 'fixture', capabilities: ['reasoning'], independenceGroup: 'g-b', estimatedCostMinor: 0
    });
    await assert.rejects(() => phase2.runPortabilityDrill({
      workspaceId: workspace.id, projectId: snapshot.project.id, workItemId: workItem.id,
      primaryRouteId: a.id, secondaryRouteId: b.id
    }), /portability_requires_distinct_connections/);
  } finally { db.close(); }
});
