// @ts-check
import fs from 'node:fs';
import path from 'node:path';
import { openDatabase } from '../src/db/database.js';
import { CanonicalStore } from '../src/domain/canonical-store.js';
import { Phase1ControlPlane } from '../src/domain/phase1-control-plane.js';
import { Phase2AutonomyKernel } from '../src/domain/phase2-autonomy-kernel.js';

const approved = process.env.WORKFLOW_OS_LIVE_APPROVE_SPEND === 'yes';
const maxMinor = integerEnv('WORKFLOW_OS_LIVE_MAX_MINOR', null);
if (!approved) fail('Live execution is disabled. Set WORKFLOW_OS_LIVE_APPROVE_SPEND=yes only after you explicitly approve provider calls.');
if (!Number.isInteger(maxMinor) || maxMinor <= 0) fail('Set WORKFLOW_OS_LIVE_MAX_MINOR to a positive bounded amount in minor currency units before live execution.');

const configured = [];
if (process.env.WORKFLOW_OS_OPENAI_API_KEY && process.env.WORKFLOW_OS_OPENAI_MODEL) configured.push('openai');
if (process.env.WORKFLOW_OS_ANTHROPIC_API_KEY && process.env.WORKFLOW_OS_ANTHROPIC_MODEL) configured.push('anthropic');
if (!configured.length) fail('No live route configured. Provide an API key + model for OpenAI and/or Anthropic through environment variables.');

const dataDir = path.resolve(process.env.WORKFLOW_OS_LIVE_DATA_DIR || '.local/phase2-live');
fs.mkdirSync(dataDir, { recursive: true });
const databasePath = path.join(dataDir, `phase2-live-${new Date().toISOString().replace(/[:.]/g, '-')}.sqlite`);
const { db } = openDatabase({ databasePath, dataDir, migrationsDir: path.resolve('migrations') });
const store = new CanonicalStore(db);
const phase1 = new Phase1ControlPlane(db);
const phase2 = new Phase2AutonomyKernel(db);

try {
  const workspace = store.createWorkspace({ name: 'Phase 2 live certification workspace' });
  let snapshot = store.startProjectIntake({
    workspaceId: workspace.id,
    mode: 'internal',
    title: 'Phase 2 live provider certification',
    rawRequest: 'Produce a concise bounded explanation of why an autonomous worker must not mark its own work complete.',
    requestedSolution: 'Provider-neutral model execution'
  });
  snapshot = store.saveDiscoveryResponses({
    workspaceId: workspace.id,
    intakeId: snapshot.intake.id,
    responses: [
      { questionKey: 'problem', responseState: 'answered', answerText: 'We need evidence that a real provider can execute a canonical WorkItem without prompt copying.' },
      { questionKey: 'desired_outcome', responseState: 'answered', answerText: 'A real route produces bounded evidence and a separate verifier decides acceptance.' },
      { questionKey: 'primary_users', responseState: 'answered', answerText: 'Workflow OS operator' },
      { questionKey: 'constraints', responseState: 'answered', answerText: 'Synthetic data only; no production or destructive side effects.' },
      { questionKey: 'success', responseState: 'answered', answerText: 'The verifier returns an explicit pass/fail decision and Workflow OS preserves canonical authority.' }
    ]
  });
  snapshot = store.setWorkingDeliveryStrategy({ workspaceId: workspace.id, intakeId: snapshot.intake.id, strategy: 'research_pilot', rationale: 'Certify the execution kernel before end-to-end delivery.' });
  snapshot = store.acceptProjectIntake({ workspaceId: workspace.id, intakeId: snapshot.intake.id, expectedProjectVersion: snapshot.project.version });
  const graph = phase1.ensureInitialWorkGraph({ workspaceId: workspace.id, projectId: snapshot.project.id });
  const workItem = graph.nextReady[0];

  const spend = phase1.requestSpend({
    workspaceId: workspace.id,
    projectId: snapshot.project.id,
    workItemId: workItem.id,
    purpose: 'phase2_model_execution',
    currency: process.env.WORKFLOW_OS_LIVE_CURRENCY || 'USD',
    maxAmountMinor: maxMinor
  });
  const approvedSpend = phase1.resolveSpendRequest({
    workspaceId: workspace.id,
    projectId: snapshot.project.id,
    spendRequestId: spend.request.id,
    decision: 'approved',
    evidence: [{ source: 'environment_flag', key: 'WORKFLOW_OS_LIVE_APPROVE_SPEND', value: 'yes' }]
  });

  /** @type {Array<{provider:string, route:any}>} */
  const liveRoutes = [];
  if (configured.includes('openai')) {
    const connection = phase2.createProviderConnection({
      workspaceId: workspace.id,
      providerKey: 'openai',
      connectionType: 'api_key',
      billingMode: 'metered',
      credentialRef: 'WORKFLOW_OS_OPENAI_API_KEY',
      locality: 'remote',
      entitlement: { source: 'operator_environment' }
    });
    const route = phase2.createExecutionRoute({
      workspaceId: workspace.id,
      providerConnectionId: connection.id,
      routeName: 'live-openai',
      modelKey: process.env.WORKFLOW_OS_OPENAI_MODEL,
      runtimeKey: 'direct-http-model',
      adapterKind: 'openai_responses',
      capabilities: ['reasoning', 'verification', 'structured_output'],
      independenceGroup: 'openai-live',
      qualityScore: 90,
      reliabilityScore: 80,
      latencyScore: 70,
      estimatedCostMinor: integerEnv('WORKFLOW_OS_OPENAI_ESTIMATE_MINOR', 10),
      currency: process.env.WORKFLOW_OS_LIVE_CURRENCY || 'USD',
      config: { max_output_tokens: integerEnv('WORKFLOW_OS_OPENAI_MAX_OUTPUT_TOKENS', 800) }
    });
    liveRoutes.push({ provider: 'openai', route });
  }
  if (configured.includes('anthropic')) {
    const connection = phase2.createProviderConnection({
      workspaceId: workspace.id,
      providerKey: 'anthropic',
      connectionType: 'api_key',
      billingMode: 'metered',
      credentialRef: 'WORKFLOW_OS_ANTHROPIC_API_KEY',
      locality: 'remote',
      entitlement: { source: 'operator_environment' }
    });
    const route = phase2.createExecutionRoute({
      workspaceId: workspace.id,
      providerConnectionId: connection.id,
      routeName: 'live-anthropic',
      modelKey: process.env.WORKFLOW_OS_ANTHROPIC_MODEL,
      runtimeKey: 'direct-http-model',
      adapterKind: 'anthropic_messages',
      capabilities: ['reasoning', 'verification', 'structured_output'],
      independenceGroup: 'anthropic-live',
      qualityScore: 85,
      reliabilityScore: 80,
      latencyScore: 70,
      estimatedCostMinor: integerEnv('WORKFLOW_OS_ANTHROPIC_ESTIMATE_MINOR', 10),
      currency: process.env.WORKFLOW_OS_LIVE_CURRENCY || 'USD',
      config: { max_tokens: integerEnv('WORKFLOW_OS_ANTHROPIC_MAX_TOKENS', 800) }
    });
    liveRoutes.push({ provider: 'anthropic', route });
  }

  if (liveRoutes.length === 1) {
    const connection = phase2.createProviderConnection({ workspaceId: workspace.id, providerKey: 'fixture', connectionType: 'local_service', billingMode: 'zero_incremental', locality: 'local' });
    phase2.createExecutionRoute({
      workspaceId: workspace.id, providerConnectionId: connection.id, routeName: 'fixture-verifier-only', runtimeKey: 'fixture-runtime',
      adapterKind: 'fixture', capabilities: ['verification'], independenceGroup: 'fixture-verifier', qualityScore: 1, reliabilityScore: 100, latencyScore: 100,
      estimatedCostMinor: 0, config: { mode: 'verifier' }
    });
  }

  const result = await phase2.runWorkItem({
    workspaceId: workspace.id,
    projectId: snapshot.project.id,
    workItemId: workItem.id,
    maxIterations: 2,
    maxMinutes: 10,
    maxIncrementalCostMinor: maxMinor,
    spendEnvelopeId: approvedSpend.envelope.id,
    spendPurpose: 'phase2_model_execution',
    requireIndependentVerifier: true
  });

  let portability = null;
  if (liveRoutes.length >= 2) {
    const nextGraph = phase1.getWorkGraph({ workspaceId: workspace.id, projectId: snapshot.project.id });
    const candidate = nextGraph.nextReady[0];
    if (candidate) {
      portability = await phase2.runPortabilityDrill({
        workspaceId: workspace.id,
        projectId: snapshot.project.id,
        workItemId: candidate.id,
        primaryRouteId: liveRoutes[0].route.id,
        secondaryRouteId: liveRoutes[1].route.id,
        spendEnvelopeId: approvedSpend.envelope.id,
        spendPurpose: 'phase2_model_execution'
      });
    }
  }

  const certifications = phase2.getAutonomyState({ workspaceId: workspace.id, projectId: snapshot.project.id }).certifications;
  console.log(JSON.stringify({
    databasePath,
    liveProvidersConfigured: configured,
    workItemExecution: result.status,
    portabilityDrill: portability?.certification?.status ?? 'not_run',
    certifications: certifications.map((row) => ({ type: row.certification_type, status: row.status, routeId: row.route_id })),
    note: liveRoutes.length >= 2
      ? 'Two independent real routes were configured; inspect certification evidence before claiming portability.'
      : 'One real route was configured. First real execution can be certified, but live independent verification and provider portability remain unproven.'
  }, null, 2));
} finally {
  db.close();
}

function integerEnv(key, fallback) {
  const raw = process.env[key];
  if (raw === undefined || raw === '') return fallback;
  const value = Number(raw);
  if (!Number.isInteger(value) || value < 0) fail(`${key} must be a non-negative integer.`);
  return value;
}
function fail(message) { console.error(message); process.exit(1); }
