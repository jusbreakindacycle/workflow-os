// @ts-check
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { openDatabase } from '../src/db/database.js';
import { CanonicalStore } from '../src/domain/canonical-store.js';
import { Phase1ControlPlane } from '../src/domain/phase1-control-plane.js';
import { Phase2AutonomyKernel } from '../src/domain/phase2-autonomy-kernel.js';
import { FreeFirstBroker } from '../src/domain/free-first-broker.js';
import { discoverAntigravityModels, probeAntigravityUsage, startAntigravityBridge } from '../src/runtime/antigravity-bridge.js';
import { CERTIFICATION_TOOL_FREE_CONSTRAINT, selectBestWorkerRoute } from '../src/runtime/phase21-certification.js';

await main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});

async function main() {
  if (process.env.WORKFLOW_OS_FREE_FIRST_RUN !== 'yes') {
    fail('Free-First live execution is disabled. Set WORKFLOW_OS_FREE_FIRST_RUN=yes only when you intentionally want to consume free provider quota.');
  }

  const settingsPath = path.join(os.homedir(), '.gemini', 'antigravity-cli', 'settings.json');
  const settings = readSettings(settingsPath);
  if (settings.useG1Credits === true) fail(`Refusing zero-spend certification because Antigravity Use G1 Credits is enabled in ${settingsPath}.`);

  const hasGroq = Boolean(process.env.GROQ_API_KEY);
  const groqAcknowledged = process.env.WORKFLOW_OS_GROQ_FREE_PLAN_ACK === 'yes';
  const hasOpenRouter = Boolean(process.env.OPENROUTER_API_KEY);
  if (hasGroq && !groqAcknowledged) console.error('Groq key detected but excluded: set WORKFLOW_OS_GROQ_FREE_PLAN_ACK=yes only if this key belongs to a Groq Free Plan account.');
  if (!hasOpenRouter && !(hasGroq && groqAcknowledged)) {
    fail('Full certification needs an independent zero-cost route. Configure OPENROUTER_API_KEY, or GROQ_API_KEY plus WORKFLOW_OS_GROQ_FREE_PLAN_ACK=yes.');
  }

  let models;
  let quota;
  try {
    models = await discoverAntigravityModels();
    quota = await probeAntigravityUsage();
  } catch (error) {
    fail(`Antigravity CLI is not ready: ${error instanceof Error ? error.message : String(error)}`);
  }
  if (!models.length) fail('Antigravity reported no selectable models.');

  let bridge = null;
  let db = null;
  try {
    bridge = await startAntigravityBridge();
    const dataDir = path.resolve(process.env.WORKFLOW_OS_FREE_FIRST_DATA_DIR || '.local/phase21-free-live');
    fs.mkdirSync(dataDir, { recursive: true });
    const databasePath = path.join(dataDir, `phase21-free-live-${new Date().toISOString().replace(/[:.]/g, '-')}.sqlite`);
    ({ db } = openDatabase({ databasePath, dataDir, migrationsDir: path.resolve('migrations') }));
    const store = new CanonicalStore(db);
    const phase1 = new Phase1ControlPlane(db);
    const phase2 = new Phase2AutonomyKernel(db);
    const free = new FreeFirstBroker(db);

    const workspace = store.createWorkspace({ name: 'Phase 2.1 free-first certification workspace' });
    free.ensurePolicy({ workspaceId: workspace.id });
    const provisioned = free.provisionFreeRoutes({
      workspaceId: workspace.id,
      antigravity: { endpointUrl: bridge.endpointUrl, models },
      groq: hasGroq && groqAcknowledged ? { credentialRef: 'GROQ_API_KEY', model: process.env.WORKFLOW_OS_GROQ_FREE_MODEL || 'openai/gpt-oss-120b', dailyRequestLimit: 1000 } : null,
      openrouter: hasOpenRouter ? { credentialRef: 'OPENROUTER_API_KEY' } : null
    });
    free.recordAntigravityUsage({ workspaceId: workspace.id, usage: quota });

    const primaryProject = createSyntheticProject({ store, phase1, workspaceId: workspace.id, title: 'Free-first live execution certification' });
    const execution = await free.runFreeFirstWorkItem({
      workspaceId: workspace.id,
      projectId: primaryProject.projectId,
      workItemId: primaryProject.workItemId,
      maxIterations: 2,
      maxMinutes: 10
    });
    if (execution.result.status !== 'passed') fail(`Free-First worker/verifier certification did not pass: ${execution.result.status}`);

    const stateAfterExecution = free.getState({ workspaceId: workspace.id });
    const antigravityRoute = selectBestWorkerRoute(stateAfterExecution.routes, 'google-antigravity');
    const independentRoute = selectBestWorkerRoute(stateAfterExecution.routes, hasOpenRouter ? 'openrouter' : 'groq');
    if (!antigravityRoute || !independentRoute) fail('Could not select two independent real worker routes for portability certification.');
    if (antigravityRoute.provider_connection_id === independentRoute.provider_connection_id || antigravityRoute.independence_group === independentRoute.independence_group) {
      fail('Portability certification routes are not independent.');
    }

    const portabilityProject = createSyntheticProject({ store, phase1, workspaceId: workspace.id, title: 'Free-first portability certification' });
    const portability = await phase2.runPortabilityDrill({
      workspaceId: workspace.id,
      projectId: portabilityProject.projectId,
      workItemId: portabilityProject.workItemId,
      primaryRouteId: antigravityRoute.id,
      secondaryRouteId: independentRoute.id,
      spendEnvelopeId: null,
      spendPurpose: 'phase21_free_first_execution'
    });
    if (portability.certification?.status !== 'passed') fail(`Portability drill failed: ${portability.error ?? portability.certification?.status ?? 'unknown'}`);

    const usageSync = free.syncUsageFromAttempts({ workspaceId: workspace.id });
    const autonomy = phase2.getAutonomyState({ workspaceId: workspace.id });
    const costCount = Number(db.prepare('SELECT COUNT(*) AS n FROM cost_records WHERE workspace_id = ?').get(workspace.id).n);
    const spendCount = Number(db.prepare('SELECT COUNT(*) AS n FROM spend_envelopes WHERE workspace_id = ?').get(workspace.id).n);
    if (costCount !== 0 || spendCount !== 0) fail(`Zero-spend invariant violated: costRecords=${costCount}, spendEnvelopes=${spendCount}`);

    console.log(JSON.stringify({
      status: 'passed',
      databasePath,
      zeroSpend: { costRecords: costCount, spendEnvelopes: spendCount, antigravityPaidCreditFallback: false },
      providersConfigured: provisioned.routes.map((route) => route.provider_key).filter((value, index, array) => array.indexOf(value) === index),
      antigravityModelsDiscovered: models.length,
      workItemExecution: execution.result.status,
      portabilityDrill: portability.certification.status,
      usageAttemptsAccounted: usageSync.attemptsAccounted,
      certifications: autonomy.certifications.map((row) => ({ type: row.certification_type, status: row.status, routeId: row.route_id })),
      note: 'Inspect the persisted SQLite evidence before changing repository claims. No secret values are printed or stored.'
    }, null, 2));
  } finally {
    try {
      if (db) db.close();
    } finally {
      if (bridge) await bridge.close();
    }
  }
}

function createSyntheticProject({ store, phase1, workspaceId, title }) {
  let snapshot = store.startProjectIntake({
    workspaceId,
    mode: 'internal',
    title,
    rawRequest: 'Without using tools, commands, files, or network access, produce a concise bounded explanation of why autonomous execution must preserve independent verification and human authority.',
    requestedSolution: 'Provider-neutral free model text-only execution'
  });
  snapshot = store.saveDiscoveryResponses({
    workspaceId,
    intakeId: snapshot.intake.id,
    responses: [
      { questionKey: 'problem', responseState: 'answered', answerText: 'We need live evidence that free routes can execute canonical work without paid fallback or provider-owned truth.' },
      { questionKey: 'desired_outcome', responseState: 'answered', answerText: 'A real free route produces bounded text-only evidence, an independent real route verifies it, and Workflow OS preserves authority.' },
      { questionKey: 'primary_users', responseState: 'answered', answerText: 'Workflow OS operator' },
      { questionKey: 'constraints', responseState: 'answered', answerText: CERTIFICATION_TOOL_FREE_CONSTRAINT },
      { questionKey: 'success', responseState: 'answered', answerText: 'Text-only execution and independent verification pass while cost records and spend envelopes remain zero.' }
    ]
  });
  snapshot = store.setWorkingDeliveryStrategy({ workspaceId, intakeId: snapshot.intake.id, strategy: 'research_pilot', rationale: 'Certify free-first execution before broader delivery.' });
  snapshot = store.acceptProjectIntake({ workspaceId, intakeId: snapshot.intake.id, expectedProjectVersion: snapshot.project.version });
  const graph = phase1.ensureInitialWorkGraph({ workspaceId, projectId: snapshot.project.id });
  if (!graph.nextReady[0]) throw new Error('synthetic_project_has_no_ready_work');
  return { projectId: snapshot.project.id, workItemId: graph.nextReady[0].id };
}

function readSettings(filePath) {
  if (!fs.existsSync(filePath)) return {};
  try {
    const parsed = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) fail(`Invalid Antigravity settings JSON: ${filePath}`);
    return parsed;
  } catch (error) {
    if (error instanceof CertificationFailure) throw error;
    fail(`Cannot read Antigravity settings: ${error instanceof Error ? error.message : String(error)}`);
  }
}

class CertificationFailure extends Error {
  constructor(message) {
    super(message);
    this.name = 'CertificationFailure';
  }
}

function fail(message) {
  throw new CertificationFailure(message);
}
