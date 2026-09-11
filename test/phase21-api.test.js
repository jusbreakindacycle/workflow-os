import assert from 'node:assert/strict';
import { Readable } from 'node:stream';
import test from 'node:test';
import { handleFreeFirstApi } from '../src/http/free-first-api.js';
import { createPhase2Fixture, acceptedReadyProject } from '../test-support/phase2-fixture.js';

test('Phase 2.1 API exposes policy/state without exposing provider secrets', async () => {
  const { db, store } = createPhase2Fixture('workflow-os-phase21-api-');
  try {
    const workspace = store.createWorkspace({ name: 'Phase 2.1 API workspace' });
    const policyResponse = await handleFreeFirstApi({
      request: jsonRequest('POST', { healthyThresholdBp: 5000, reserveThresholdBp: 2000, verifierReserveBp: 1000 }),
      url: new URL(`/api/phase21/workspaces/${workspace.id}/policy`, 'http://local.workflow-os'),
      db
    });
    assert.equal(policyResponse.status, 200);
    assert.equal(policyResponse.body.policy.zero_spend_lock, 1);
    assert.equal(policyResponse.body.policy.healthy_threshold_bp, 5000);

    const stateResponse = await handleFreeFirstApi({
      request: jsonRequest('GET'),
      url: new URL(`/api/phase21/free-first?workspaceId=${workspace.id}`, 'http://local.workflow-os'),
      db
    });
    assert.equal(stateResponse.status, 200);
    assert.equal(stateResponse.body.policy.zero_spend_lock, 1);
    assert.deepEqual(stateResponse.body.routes, []);
    assert.doesNotMatch(JSON.stringify(stateResponse.body), /api[_-]?key|bearer\s+[a-z0-9]/i);
  } finally { db.close(); }
});

test('Phase 2.1 API executes a ready WorkItem through governed independent free routes', async () => {
  const { db, store, phase1, phase2 } = createPhase2Fixture('workflow-os-phase21-run-api-');
  try {
    const { workspace, snapshot, workItem } = acceptedReadyProject({ store, phase1 });
    const workerConnection = phase2.createProviderConnection({ workspaceId: workspace.id, providerKey: 'api-free-worker', connectionType: 'local_service', billingMode: 'zero_incremental', locality: 'local' });
    phase2.createExecutionRoute({ workspaceId: workspace.id, providerConnectionId: workerConnection.id, routeName: 'api-free-worker', runtimeKey: 'fixture', adapterKind: 'fixture', capabilities: ['reasoning'], independenceGroup: 'api-worker', qualityScore: 90, reliabilityScore: 90, latencyScore: 90, estimatedCostMinor: 0, config: { free_first: true, model_tier: 'economy', base_quality_score: 90, mode: 'worker' } });
    const verifierConnection = phase2.createProviderConnection({ workspaceId: workspace.id, providerKey: 'api-free-verifier', connectionType: 'local_service', billingMode: 'zero_incremental', locality: 'local' });
    phase2.createExecutionRoute({ workspaceId: workspace.id, providerConnectionId: verifierConnection.id, routeName: 'api-free-verifier', runtimeKey: 'fixture', adapterKind: 'fixture', capabilities: ['verification'], independenceGroup: 'api-verifier', qualityScore: 80, reliabilityScore: 90, latencyScore: 90, estimatedCostMinor: 0, config: { free_first: true, model_tier: 'balanced', base_quality_score: 80, mode: 'verifier' } });

    const response = await handleFreeFirstApi({
      request: jsonRequest('POST', { workspaceId: workspace.id, maxIterations: 2, maxMinutes: 5 }),
      url: new URL(`/api/phase21/projects/${snapshot.project.id}/work-items/${workItem.id}/run`, 'http://local.workflow-os'),
      db
    });
    assert.equal(response.status, 200);
    assert.equal(response.body.mode, 'free_first');
    assert.equal(response.body.zeroSpendLock, true);
    assert.equal(response.body.result.status, 'passed');
  } finally { db.close(); }
});

function jsonRequest(method, body = null) {
  const stream = Readable.from(body === null ? [] : [Buffer.from(JSON.stringify(body))]);
  stream.method = method;
  return stream;
}
