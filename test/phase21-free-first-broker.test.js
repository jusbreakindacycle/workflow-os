import assert from 'node:assert/strict';
import test from 'node:test';
import { FreeFirstBroker } from '../src/domain/free-first-broker.js';
import { createPhase2Fixture, acceptedReadyProject } from '../test-support/phase2-fixture.js';

test('free-first policy makes reserved quota verifier-only and keeps worker routing on healthy capacity', () => {
  const previousGroq = process.env.TEST_GROQ_FREE_KEY;
  const previousOpenRouter = process.env.TEST_OPENROUTER_FREE_KEY;
  process.env.TEST_GROQ_FREE_KEY = 'test-groq';
  process.env.TEST_OPENROUTER_FREE_KEY = 'test-openrouter';
  const { db, store, phase1, phase2 } = createPhase2Fixture('workflow-os-free-first-');
  try {
    const { workspace, snapshot, workItem } = acceptedReadyProject({ store, phase1 });
    const broker = new FreeFirstBroker(db);
    const provisioned = broker.provisionFreeRoutes({
      workspaceId: workspace.id,
      antigravity: {
        endpointUrl: 'http://127.0.0.1:9999/v1/responses',
        models: [
          { slug: 'gemini-3.8-flash-medium', label: 'Gemini 3.8 Flash Medium', tier: 'economy' },
          { slug: 'claude-opus-4-6', label: 'Claude Opus 4.6', tier: 'frontier' }
        ]
      },
      groq: { credentialRef: 'TEST_GROQ_FREE_KEY' },
      openrouter: { credentialRef: 'TEST_OPENROUTER_FREE_KEY' }
    });
    assert.equal(provisioned.policy.zero_spend_lock, 1);
    assert.ok(provisioned.routes.every((route) => route.billing_mode === 'zero_incremental'));

    broker.recordAntigravityUsage({
      workspaceId: workspace.id,
      usage: {
        raw: 'synthetic quota report',
        quotas: [
          { label: 'Gemini models', remainingFraction: 0.82 },
          { label: 'Claude and GPT models', remainingFraction: 0.12 }
        ]
      }
    });
    const state = broker.applyPolicy({ workspaceId: workspace.id, taskClass: 'routine' });
    const flashWorker = state.routes.find((route) => route.routeName === 'free-antigravity-gemini-3.8-flash-medium');
    const opusWorker = state.routes.find((route) => route.routeName === 'free-antigravity-claude-opus-4-6');
    const opusVerifier = state.routes.find((route) => route.routeName === 'free-antigravity-claude-opus-4-6-verifier');
    assert.equal(flashWorker.quotaStatus, 'healthy');
    assert.equal(flashWorker.role, 'worker');
    assert.equal(flashWorker.allowed, true);
    assert.equal(opusWorker.quotaStatus, 'reserved');
    assert.equal(opusWorker.role, 'worker');
    assert.equal(opusWorker.allowed, false);
    assert.equal(opusWorker.qualityScore, 0);
    assert.equal(opusVerifier.quotaStatus, 'reserved');
    assert.equal(opusVerifier.role, 'verifier');
    assert.equal(opusVerifier.allowed, true, '10-15% capacity remains available to verification but not ordinary workers');

    const workerSelection = phase2.selectRoute({ workspaceId: workspace.id, projectId: snapshot.project.id, workItemId: workItem.id, purpose: 'worker', requiredCapabilities: ['reasoning'] });
    assert.notEqual(workerSelection.route.route_name, 'free-antigravity-claude-opus-4-6');
    assert.ok(JSON.parse(workerSelection.route.capabilities_json).includes('reasoning'));
  } finally {
    db.close();
    if (previousGroq === undefined) delete process.env.TEST_GROQ_FREE_KEY; else process.env.TEST_GROQ_FREE_KEY = previousGroq;
    if (previousOpenRouter === undefined) delete process.env.TEST_OPENROUTER_FREE_KEY; else process.env.TEST_OPENROUTER_FREE_KEY = previousOpenRouter;
  }
});

test('free-first execution can complete through two independent zero-cost routes and uses no SpendEnvelope', async () => {
  const { db, store, phase1, phase2 } = createPhase2Fixture('workflow-os-free-run-');
  try {
    const { workspace, snapshot, workItem } = acceptedReadyProject({ store, phase1 });
    const workerConnection = phase2.createProviderConnection({
      workspaceId: workspace.id,
      providerKey: 'free-worker-fixture',
      connectionType: 'local_service',
      billingMode: 'zero_incremental',
      locality: 'local'
    });
    phase2.createExecutionRoute({
      workspaceId: workspace.id,
      providerConnectionId: workerConnection.id,
      routeName: 'free-worker-route',
      runtimeKey: 'fixture-runtime',
      adapterKind: 'fixture',
      capabilities: ['reasoning'],
      independenceGroup: 'free-worker-group',
      qualityScore: 90,
      reliabilityScore: 95,
      latencyScore: 95,
      estimatedCostMinor: 0,
      config: { free_first: true, source: 'phase-2.1-free-first', provider_family: 'test-a', model_tier: 'economy', route_role: 'worker', quota_bucket_key: 'test-a', base_quality_score: 90, mode: 'worker' }
    });
    const verifierConnection = phase2.createProviderConnection({
      workspaceId: workspace.id,
      providerKey: 'free-verifier-fixture',
      connectionType: 'local_service',
      billingMode: 'zero_incremental',
      locality: 'local'
    });
    phase2.createExecutionRoute({
      workspaceId: workspace.id,
      providerConnectionId: verifierConnection.id,
      routeName: 'free-verifier-route',
      runtimeKey: 'fixture-runtime',
      adapterKind: 'fixture',
      capabilities: ['verification'],
      independenceGroup: 'free-verifier-group',
      qualityScore: 70,
      reliabilityScore: 95,
      latencyScore: 95,
      estimatedCostMinor: 0,
      config: { free_first: true, source: 'phase-2.1-free-first', provider_family: 'test-b', model_tier: 'balanced', route_role: 'verifier', quota_bucket_key: 'test-b', base_quality_score: 70, mode: 'verifier' }
    });

    const broker = new FreeFirstBroker(db);
    const result = await broker.runFreeFirstWorkItem({ workspaceId: workspace.id, projectId: snapshot.project.id, workItemId: workItem.id });
    assert.equal(result.zeroSpendLock, true);
    assert.equal(result.result.status, 'passed');
    assert.equal(db.prepare('SELECT COUNT(*) AS n FROM spend_envelopes WHERE project_id = ?').get(snapshot.project.id).n, 0);
    assert.equal(db.prepare('SELECT COUNT(*) AS n FROM cost_records WHERE project_id = ?').get(snapshot.project.id).n, 0);
  } finally {
    db.close();
  }
});

test('free-first mode fails closed when an ungoverned zero-incremental route is present', async () => {
  const { db, store, phase1, phase2 } = createPhase2Fixture('workflow-os-free-guard-');
  try {
    const { workspace, snapshot, workItem } = acceptedReadyProject({ store, phase1 });
    const governed = phase2.createProviderConnection({ workspaceId: workspace.id, providerKey: 'governed', connectionType: 'local_service', billingMode: 'zero_incremental', locality: 'local' });
    phase2.createExecutionRoute({ workspaceId: workspace.id, providerConnectionId: governed.id, routeName: 'governed-worker', runtimeKey: 'fixture', adapterKind: 'fixture', capabilities: ['reasoning'], independenceGroup: 'g1', qualityScore: 90, reliabilityScore: 90, latencyScore: 90, estimatedCostMinor: 0, config: { free_first: true, model_tier: 'economy', route_role: 'worker', base_quality_score: 90, mode: 'worker' } });
    const governedVerifier = phase2.createProviderConnection({ workspaceId: workspace.id, providerKey: 'governed-verifier', connectionType: 'local_service', billingMode: 'zero_incremental', locality: 'local' });
    phase2.createExecutionRoute({ workspaceId: workspace.id, providerConnectionId: governedVerifier.id, routeName: 'governed-verifier', runtimeKey: 'fixture', adapterKind: 'fixture', capabilities: ['verification'], independenceGroup: 'g2', qualityScore: 70, reliabilityScore: 90, latencyScore: 90, estimatedCostMinor: 0, config: { free_first: true, model_tier: 'balanced', route_role: 'verifier', base_quality_score: 70, mode: 'verifier' } });
    const rogue = phase2.createProviderConnection({ workspaceId: workspace.id, providerKey: 'rogue-subscription', connectionType: 'local_service', billingMode: 'included_subscription', locality: 'local' });
    phase2.createExecutionRoute({ workspaceId: workspace.id, providerConnectionId: rogue.id, routeName: 'rogue-route', runtimeKey: 'fixture', adapterKind: 'fixture', capabilities: ['reasoning'], independenceGroup: 'rogue', qualityScore: 100, reliabilityScore: 100, latencyScore: 100, estimatedCostMinor: 0, config: { mode: 'worker' } });

    const broker = new FreeFirstBroker(db);
    await assert.rejects(() => broker.runFreeFirstWorkItem({ workspaceId: workspace.id, projectId: snapshot.project.id, workItemId: workItem.id }), /free_first_non_policy_route_present/);
  } finally {
    db.close();
  }
});
