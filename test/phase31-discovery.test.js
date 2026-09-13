import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { openDatabase } from '../src/db/database.js';
import { CanonicalStore } from '../src/domain/canonical-store.js';
import { Phase2AutonomyKernel } from '../src/domain/phase2-autonomy-kernel.js';
import { Phase31Discovery } from '../src/domain/phase31-discovery.js';

const migrationsDir = path.resolve('migrations');

function createHarness(outputs) {
  const dataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'workflow-os-phase31-'));
  const databasePath = path.join(dataDir, 'test.sqlite');
  const opened = openDatabase({ databasePath, dataDir, migrationsDir });
  const store = new CanonicalStore(opened.db);
  const phase2 = new Phase2AutonomyKernel(opened.db);
  const workspace = store.createWorkspace({ name: 'Phase 3.1 Test' });
  const connection = phase2.createProviderConnection({ workspaceId: workspace.id, providerKey: 'fixture', connectionType: 'local_service', billingMode: 'zero_incremental', locality: 'local', entitlement: { test: true } });
  phase2.createExecutionRoute({
    workspaceId: workspace.id,
    providerConnectionId: connection.id,
    routeName: 'phase31-fixture-worker',
    runtimeKey: 'fixture-runtime',
    adapterKind: 'fixture',
    capabilities: ['reasoning', 'structured_output'],
    allowedDataClasses: ['Public', 'Internal'],
    independenceGroup: 'fixture-phase31',
    qualityScore: 90,
    reliabilityScore: 90,
    latencyScore: 90,
    estimatedCostMinor: 0,
    config: { free_first: true, route_role: 'worker', provider_family: 'fixture', model_tier: 'balanced', quota_bucket_key: 'fixture:phase31', base_quality_score: 90, discovered_active: true, daily_request_limit: 1000 }
  });
  let call = 0;
  const prompts = [];
  const executeRoute = async ({ prompt }) => {
    prompts.push(prompt);
    const value = outputs[Math.min(call, outputs.length - 1)];
    call += 1;
    if (value instanceof Error) throw value;
    return { text: typeof value === 'string' ? value : JSON.stringify(value), usage: { total_tokens: 10 }, actualCostMinor: 0, externalRef: `fixture-phase31-${call}` };
  };
  return { ...opened, store, workspace, prompts, discovery: new Phase31Discovery(opened.db, { executeRoute }) };
}

function analysis({ questions = [], researchRequired = false, strategy = 'custom_build', problem = 'Prospects need a clear place to understand the offer and submit interest.', primaryUsers = null } = {}) {
  return {
    findings: [
      { type: 'client_stated', statement: 'The client plans to run Facebook/Instagram ads.', source_ref: 'raw_request', evidence_refs: ['raw_request'] },
      { type: 'challenge', statement: 'A custom build should be chosen only if a simpler hosted/configured form is insufficient.', source_ref: 'model_analysis', evidence_refs: ['raw_request', 'requested_solution'] }
    ],
    questions,
    research: researchRequired
      ? { required: true, rationale: 'A material external platform constraint must be verified.', topics: ['external platform form constraints'] }
      : { required: false, rationale: 'No external factual dependency is needed for the local synthetic certification case.', topics: [] },
    strategy: {
      strategy,
      rationale: strategy === 'custom_build' ? 'The accepted local certification outcome requires a controlled, testable lead experience.' : 'The outcome can be met by configuring an existing tool.',
      alternatives: [{ strategy: strategy === 'custom_build' ? 'configure' : 'custom_build', reason: 'Considered but not preferred for the current constraints.' }],
      evidence_refs: ['raw_request', 'requested_solution']
    },
    brief: {
      problem,
      desired_outcome: 'Prospects can submit synthetic lead details and receive an observable success state.',
      primary_users: primaryUsers,
      constraints: 'Local synthetic flow only; no real client data or external messaging.',
      success: 'A synthetic lead submission validates, reaches a local receiver, and shows success.',
      non_goals: ['production deployment', 'real ad spend', 'real CRM delivery']
    }
  };
}

test('adaptive discovery asks only material questions, preserves unknowns, re-analyzes, and accepts evidence-backed strategy', async () => {
  const first = analysis({ questions: [{ key: 'primary_user', prompt: 'Who is the primary prospect for this offer?', materiality_reason: 'The answer changes offer content and acceptance criteria.', impact_areas: ['problem_outcome', 'acceptance'] }] });
  const second = analysis({ questions: [], primaryUsers: null });
  const { db, store, workspace, prompts, discovery } = createHarness([first, second]);
  try {
    const intake = store.startProjectIntake({ workspaceId: workspace.id, mode: 'client', title: 'Synthetic lead-gen', rawRequest: "I'm running Facebook/Instagram ads. I need somewhere prospects can see the offer and leave their details.", requestedSolution: 'Simple website with a contact form', clientName: 'Synthetic Client' });
    let snapshot = await discovery.analyze({ workspaceId: workspace.id, intakeId: intake.intake.id });
    assert.equal(snapshot.phase31.latestRun.round_number, 1);
    assert.equal(snapshot.phase31.questions.length, 1);
    assert.deepEqual(snapshot.phase31.questions[0].impactAreas, ['problem_outcome', 'acceptance']);
    assert.equal(snapshot.phase31.strategyRecommendation.strategy, 'custom_build');
    assert.equal(snapshot.phase31.strategyRecommendation.status, 'proposed');
    assert.equal(snapshot.intake.requested_solution, 'Simple website with a contact form');
    assert.throws(() => discovery.accept({ workspaceId: workspace.id, intakeId: intake.intake.id, expectedProjectVersion: intake.project.version }), /phase31_reanalysis_required_after_questions/);
    snapshot = discovery.answerQuestions({ workspaceId: workspace.id, intakeId: intake.intake.id, responses: [{ questionKey: 'primary_user', responseState: 'unknown' }] });
    assert.equal(snapshot.phase31.questions[0].status, 'unknown');
    snapshot = await discovery.analyze({ workspaceId: workspace.id, intakeId: intake.intake.id });
    assert.equal(snapshot.phase31.latestRun.round_number, 2);
    assert.equal(snapshot.phase31.questions.length, 0);
    assert.match(prompts[1], /operator does not know|"status":"unknown"/);
    snapshot = discovery.accept({ workspaceId: workspace.id, intakeId: intake.intake.id, expectedProjectVersion: intake.project.version });
    assert.equal(snapshot.intake.status, 'accepted');
    assert.equal(snapshot.acceptedBrief.delivery_strategy, 'custom_build');
    assert.equal(snapshot.acceptedBrief.requested_solution, 'Simple website with a contact form');
    const scope = JSON.parse(snapshot.acceptedBrief.working_scope_json);
    assert.deepEqual(scope.nonGoals, ['production deployment', 'real ad spend', 'real CRM delivery']);
    assert.ok(scope.phase31AnalysisRunId);
    assert.equal(snapshot.phase31.strategyRecommendation.status, 'accepted');
  } finally { db.close(); }
});

test('strategy is not hard-coded to custom_build', async () => {
  const { db, store, workspace, discovery } = createHarness([analysis({ questions: [], strategy: 'configure', problem: 'The client only needs a hosted form destination.' })]);
  try {
    const intake = store.startProjectIntake({ workspaceId: workspace.id, mode: 'internal', title: 'Hosted form', rawRequest: 'I need a simple place to collect signups.', requestedSolution: 'Maybe build a website' });
    let snapshot = await discovery.analyze({ workspaceId: workspace.id, intakeId: intake.intake.id });
    assert.equal(snapshot.phase31.strategyRecommendation.strategy, 'configure');
    snapshot = discovery.accept({ workspaceId: workspace.id, intakeId: intake.intake.id, expectedProjectVersion: intake.project.version });
    assert.equal(snapshot.acceptedBrief.delivery_strategy, 'configure');
  } finally { db.close(); }
});

test('operator may revise the recommended strategy before canonical acceptance', async () => {
  const { db, store, workspace, discovery } = createHarness([analysis({ questions: [], strategy: 'custom_build' })]);
  try {
    const intake = store.startProjectIntake({ workspaceId: workspace.id, mode: 'internal', title: 'Strategy revision', rawRequest: 'I need a place to collect signups.', requestedSolution: 'Build a website' });
    let snapshot = await discovery.analyze({ workspaceId: workspace.id, intakeId: intake.intake.id });
    assert.equal(snapshot.phase31.strategyRecommendation.strategy, 'custom_build');
    snapshot = discovery.accept({ workspaceId: workspace.id, intakeId: intake.intake.id, expectedProjectVersion: intake.project.version, overrides: { strategy: 'configure', strategyRationale: 'Operator chose an existing hosted form after reviewing the recommendation.' } });
    assert.equal(snapshot.acceptedBrief.delivery_strategy, 'configure');
    assert.equal(snapshot.phase31.strategyRecommendation.status, 'rejected');
    const decision = db.prepare("SELECT * FROM delivery_strategy_decisions WHERE intake_id = ? AND status = 'accepted'").get(intake.intake.id);
    assert.equal(decision.strategy, 'configure');
    assert.match(decision.rationale, /Operator chose/);
  } finally { db.close(); }
});

test('material research requirement blocks acceptance instead of fabricating research', async () => {
  const { db, store, workspace, discovery } = createHarness([analysis({ questions: [], researchRequired: true })]);
  try {
    const intake = store.startProjectIntake({ workspaceId: workspace.id, mode: 'internal', title: 'Research blocker', rawRequest: 'Choose an approach that depends on an external platform constraint.', requestedSolution: 'Use the external platform form' });
    const snapshot = await discovery.analyze({ workspaceId: workspace.id, intakeId: intake.intake.id });
    assert.equal(snapshot.phase31.researchDecision.research_required, 1);
    assert.throws(() => discovery.accept({ workspaceId: workspace.id, intakeId: intake.intake.id, expectedProjectVersion: intake.project.version }), /phase31_research_required_before_acceptance/);
    assert.equal(store.getIntakeSnapshot({ workspaceId: workspace.id, intakeId: intake.intake.id }).acceptedBrief, null);
  } finally { db.close(); }
});

test('invalid model output fails closed and records the failed analysis run', async () => {
  const invalid = analysis({ questions: [{ key: 'noise', prompt: 'What is your favorite color?', materiality_reason: 'Just curious.', impact_areas: ['not_material'] }] });
  const { db, store, workspace, discovery } = createHarness([invalid]);
  try {
    const intake = store.startProjectIntake({ workspaceId: workspace.id, mode: 'internal', title: 'Invalid analysis', rawRequest: 'Help me collect leads.', requestedSolution: 'Build a website' });
    await assert.rejects(() => discovery.analyze({ workspaceId: workspace.id, intakeId: intake.intake.id }), /phase31_invalid_impact_areas/);
    const run = db.prepare('SELECT * FROM phase31_discovery_runs WHERE intake_id = ?').get(intake.intake.id);
    assert.equal(run.status, 'failed');
    assert.match(run.error_text, /phase31_invalid_impact_areas/);
  } finally { db.close(); }
});
