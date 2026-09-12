// @ts-check
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { openDatabase } from '../src/db/database.js';
import { CanonicalStore } from '../src/domain/canonical-store.js';
import { Phase2AutonomyKernel } from '../src/domain/phase2-autonomy-kernel.js';
import { FreeFirstBroker } from '../src/domain/free-first-broker.js';
import { discoverAntigravityModels, probeAntigravityUsage, startAntigravityBridge } from '../src/runtime/antigravity-bridge.js';
import {
  CERTIFICATION_ARTIFACT_OBJECTIVE,
  CERTIFICATION_EXPECTED_ARTIFACT,
  CERTIFICATION_EXPECTED_ARTIFACT_JSON,
  CERTIFICATION_TOOL_FREE_CONSTRAINT,
  CERTIFICATION_VERIFICATION_ACCEPTANCE,
  parseCertificationArtifact,
  selectBestWorkerRoute
} from '../src/runtime/phase21-certification.js';

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
  const expectedVerifierProvider = hasOpenRouter ? 'openrouter' : 'groq';

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

    const primaryProject = createCertificationProject({ store, workspaceId: workspace.id, title: 'Free-first live execution certification' });
    const execution = await free.runFreeFirstWorkItem({
      workspaceId: workspace.id,
      projectId: primaryProject.projectId,
      workItemId: primaryProject.workItemId,
      maxIterations: 2,
      maxMinutes: 10
    });
    if (execution.result.status !== 'passed') fail(`Free-First worker/verifier certification did not pass: ${execution.result.status}`);

    const primaryEvidence = assertPrimaryCertificationEvidence({
      db,
      workspaceId: workspace.id,
      execution: execution.result,
      expectedVerifierProvider
    });
    assertZeroSpend({ db, workspaceId: workspace.id, stage: 'primary_execution' });

    const stateAfterExecution = free.getState({ workspaceId: workspace.id });
    const antigravityRoute = selectBestWorkerRoute(stateAfterExecution.routes, 'google-antigravity');
    const independentRoute = selectBestWorkerRoute(stateAfterExecution.routes, expectedVerifierProvider);
    if (!antigravityRoute || !independentRoute) fail('Could not select two independent real worker routes for portability certification.');
    if (antigravityRoute.provider_connection_id === independentRoute.provider_connection_id || antigravityRoute.independence_group === independentRoute.independence_group) {
      fail('Portability certification routes are not independent.');
    }

    const portabilityProject = createCertificationProject({ store, workspaceId: workspace.id, title: 'Free-first portability certification' });
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

    const persistedPortability = db.prepare(`SELECT status FROM phase2_certifications
      WHERE id = ? AND workspace_id = ? AND certification_type = 'portability_drill'`).get(portability.certification.id, workspace.id);
    if (persistedPortability?.status !== 'passed') fail('Canonical portability certification record is not passed.');

    const usageSync = free.syncUsageFromAttempts({ workspaceId: workspace.id });
    const autonomy = phase2.getAutonomyState({ workspaceId: workspace.id });
    const zeroSpend = assertZeroSpend({ db, workspaceId: workspace.id, stage: 'final' });

    console.log(JSON.stringify({
      status: 'passed',
      databasePath,
      artifactContract: {
        expected: CERTIFICATION_EXPECTED_ARTIFACT,
        workerArtifactMatched: primaryEvidence.workerArtifactMatched,
        verifierAcceptedArtifact: primaryEvidence.verifierAcceptedArtifact
      },
      canonicalEvidence: {
        workerProvider: primaryEvidence.workerProvider,
        workerAttemptStatus: primaryEvidence.workerAttemptStatus,
        verifierProvider: primaryEvidence.verifierProvider,
        verifierAttemptStatus: primaryEvidence.verifierAttemptStatus,
        independentProviders: primaryEvidence.independentProviders,
        loopOutcome: primaryEvidence.loopOutcome,
        assignmentVerificationStatus: primaryEvidence.assignmentVerificationStatus,
        verificationRunOutcome: primaryEvidence.verificationRunOutcome
      },
      zeroSpend: { ...zeroSpend, antigravityPaidCreditFallback: false },
      providersConfigured: provisioned.routes.map((route) => route.provider_key).filter((value, index, array) => array.indexOf(value) === index),
      antigravityModelsDiscovered: models.length,
      workItemExecution: execution.result.status,
      portabilityDrill: portability.certification.status,
      usageAttemptsAccounted: usageSync.attemptsAccounted,
      certifications: autonomy.certifications.map((row) => ({ type: row.certification_type, status: row.status, routeId: row.route_id })),
      note: 'Certification claims come from persisted Workflow OS execution/verification records. The worker is responsible only for producing the bounded artifact; it does not self-certify.'
    }, null, 2));
  } finally {
    try {
      if (db) db.close();
    } finally {
      if (bridge) await bridge.close();
    }
  }
}

function createCertificationProject({ store, workspaceId, title }) {
  let snapshot = store.startProjectIntake({
    workspaceId,
    mode: 'internal',
    title,
    rawRequest: `Produce the bounded certification artifact ${CERTIFICATION_EXPECTED_ARTIFACT_JSON}. The worker produces only the artifact; Workflow OS performs and records independent verification afterward.`,
    requestedSolution: 'Provider-neutral free-model text-only certification artifact'
  });
  snapshot = store.saveDiscoveryResponses({
    workspaceId,
    intakeId: snapshot.intake.id,
    responses: [
      { questionKey: 'problem', responseState: 'answered', answerText: 'We need live evidence that a free worker can produce one deterministic text-only artifact while Workflow OS, not the worker, owns verification and certification truth.' },
      { questionKey: 'desired_outcome', responseState: 'answered', answerText: `The worker returns exactly ${CERTIFICATION_EXPECTED_ARTIFACT_JSON}. The candidate output itself is the observable artifact; Workflow OS separately records independent verification.` },
      { questionKey: 'primary_users', responseState: 'answered', answerText: 'Workflow OS operator' },
      { questionKey: 'constraints', responseState: 'answered', answerText: `${CERTIFICATION_TOOL_FREE_CONSTRAINT} ${CERTIFICATION_VERIFICATION_ACCEPTANCE}` },
      { questionKey: 'success', responseState: 'answered', answerText: `The worker artifact exactly matches ${CERTIFICATION_EXPECTED_ARTIFACT_JSON}; an independent verifier accepts that artifact; canonical records show both successful attempts, passed verification, independent provider groups, zero SpendEnvelope/CostRecord, and a passed portability drill.` }
    ]
  });
  snapshot = store.setWorkingDeliveryStrategy({ workspaceId, intakeId: snapshot.intake.id, strategy: 'research_pilot', rationale: 'Certify provider execution semantics with a deterministic text-only artifact before broader delivery.' });
  snapshot = store.acceptProjectIntake({ workspaceId, intakeId: snapshot.intake.id, expectedProjectVersion: snapshot.project.version });

  const workItem = store.createWorkItem({
    workspaceId,
    projectId: snapshot.project.id,
    class: 'certification',
    title: 'Produce deterministic free-first certification artifact',
    outcome: CERTIFICATION_ARTIFACT_OBJECTIVE,
    status: 'ready',
    priority: 100,
    acceptance: {
      source: 'phase21_live_certification',
      artifact: CERTIFICATION_EXPECTED_ARTIFACT,
      evidencePolicy: 'candidate_output_is_observable_text_artifact; workflow_os_proves_independent_verification'
    },
    riskTier: 'R0'
  });

  return { projectId: snapshot.project.id, workItemId: workItem.id };
}

function assertPrimaryCertificationEvidence({ db, workspaceId, execution, expectedVerifierProvider }) {
  const workerAttemptId = execution?.workerAttempt?.id;
  const verifierAttemptId = execution?.verifierAttempt?.id;
  if (!workerAttemptId || !verifierAttemptId) fail('Passed certification result is missing worker/verifier attempt references.');

  const attempts = db.prepare(`SELECT a.id, a.assignment_id, a.purpose, a.status, a.output_text,
      r.independence_group, c.provider_key
    FROM execution_attempts a
    JOIN execution_routes r ON r.id = a.route_id AND r.workspace_id = a.workspace_id
    JOIN provider_connections c ON c.id = r.provider_connection_id AND c.workspace_id = r.workspace_id
    WHERE a.workspace_id = ? AND a.id IN (?, ?)`)
    .all(workspaceId, workerAttemptId, verifierAttemptId);
  const byId = new Map(attempts.map((row) => [row.id, row]));
  const worker = byId.get(workerAttemptId);
  const verifier = byId.get(verifierAttemptId);
  if (!worker || !verifier) fail('Canonical execution attempts for the passed certification are missing.');
  if (worker.purpose !== 'worker' || worker.status !== 'succeeded') fail('Canonical worker attempt is not a succeeded worker execution.');
  if (verifier.purpose !== 'verifier' || verifier.status !== 'succeeded') fail('Canonical verifier attempt is not a succeeded verifier execution.');
  if (worker.provider_key !== 'google-antigravity') fail(`Certification worker must be google-antigravity, got ${worker.provider_key}.`);
  if (verifier.provider_key !== expectedVerifierProvider) fail(`Certification verifier must be ${expectedVerifierProvider}, got ${verifier.provider_key}.`);
  if (worker.independence_group === verifier.independence_group) fail('Canonical worker and verifier attempts share an independence group.');

  const artifact = parseCertificationArtifact(worker.output_text);
  if (!artifact) fail('Worker output did not exactly match the deterministic certification artifact contract.');
  const verifierVerdict = parseVerifierVerdict(verifier.output_text);
  if (verifierVerdict?.outcome !== 'pass') fail('Canonical verifier output did not accept the certification artifact.');

  const loopIteration = db.prepare(`SELECT outcome FROM loop_iterations
    WHERE workspace_id = ? AND worker_attempt_id = ? AND verifier_attempt_id = ?
    ORDER BY created_at DESC LIMIT 1`).get(workspaceId, workerAttemptId, verifierAttemptId);
  if (loopIteration?.outcome !== 'pass') fail('Canonical loop iteration did not persist a pass outcome for the accepted artifact.');

  const assignment = db.prepare('SELECT verification_status FROM assignments WHERE id = ? AND workspace_id = ?').get(worker.assignment_id, workspaceId);
  if (assignment?.verification_status !== 'passed') fail('Canonical assignment verification_status is not passed.');
  const verificationRun = db.prepare(`SELECT outcome FROM verification_runs
    WHERE workspace_id = ? AND assignment_id = ? ORDER BY created_at DESC LIMIT 1`).get(workspaceId, worker.assignment_id);
  if (verificationRun?.outcome !== 'pass') fail('Canonical verification run is not passed.');

  return {
    workerArtifactMatched: true,
    verifierAcceptedArtifact: true,
    workerProvider: worker.provider_key,
    workerAttemptStatus: worker.status,
    verifierProvider: verifier.provider_key,
    verifierAttemptStatus: verifier.status,
    independentProviders: true,
    loopOutcome: loopIteration.outcome,
    assignmentVerificationStatus: assignment.verification_status,
    verificationRunOutcome: verificationRun.outcome
  };
}

function assertZeroSpend({ db, workspaceId, stage }) {
  const costRecords = Number(db.prepare('SELECT COUNT(*) AS n FROM cost_records WHERE workspace_id = ?').get(workspaceId).n);
  const spendEnvelopes = Number(db.prepare('SELECT COUNT(*) AS n FROM spend_envelopes WHERE workspace_id = ?').get(workspaceId).n);
  if (costRecords !== 0 || spendEnvelopes !== 0) fail(`Zero-spend invariant violated at ${stage}: costRecords=${costRecords}, spendEnvelopes=${spendEnvelopes}`);
  return { costRecords, spendEnvelopes };
}

function parseVerifierVerdict(text) {
  if (typeof text !== 'string' || !text.trim()) return null;
  try {
    const value = JSON.parse(text.trim());
    if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
    return value;
  } catch { return null; }
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

await main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
