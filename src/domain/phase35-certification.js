// @ts-check
import { CanonicalStore } from './canonical-store.js';
import { Phase2AutonomyKernel } from './phase2-autonomy-kernel.js';
import { Phase31Discovery } from './phase31-discovery.js';
import { Phase32Workforce } from './phase32-workforce.js';
import { Phase34Delivery, syntheticLeadGenFiles } from './phase34-delivery.js';

const RAW_REQUEST = "I'm running Facebook/Instagram ads for my business. I need somewhere prospects can see the offer, enter their details, and let us follow up. I was thinking of a simple website with a contact form.";

export class Phase35Certification {
  /** @param {import('node:sqlite').DatabaseSync} db @param {{workspaceRuntime:any}} options */
  constructor(db, { workspaceRuntime }) {
    this.db = db;
    this.store = new CanonicalStore(db);
    this.kernel = new Phase2AutonomyKernel(db);
    this.workspaceRuntime = workspaceRuntime;
    this.planner = new Phase32Workforce(db);
    this.delivery = new Phase34Delivery(db, { workspaceRuntime });
  }

  async run() {
    const workspace = this.store.createWorkspace({ name: 'Phase 3 Golden Path Certification' });
    const intake = this.store.startProjectIntake({
      workspaceId: workspace.id, mode: 'client', title: 'Synthetic advertising lead capture', rawRequest: RAW_REQUEST,
      requestedSolution: 'simple website with a contact form', clientName: 'Synthetic Client'
    });
    this.#configureFixtureReasoning(workspace.id);
    const phase31 = new Phase31Discovery(this.db, { executeRoute: async () => ({
      text: JSON.stringify(certificationAnalysis()),
      externalRef: 'fixture:phase35:discovery',
      usage: { input_tokens: 20, output_tokens: 120, total_tokens: 140 }, actualCostMinor: 0
    }) });
    let discovery = await phase31.analyze({ workspaceId: workspace.id, intakeId: intake.intake.id });
    if (discovery.phase31.questions.length) throw new Error('phase35_certification_unexpected_discovery_questions');
    discovery = phase31.accept({ workspaceId: workspace.id, intakeId: intake.intake.id, expectedProjectVersion: discovery.project.version });
    const projectId = discovery.project.id;
    const plan = this.planner.ensurePlan({ workspaceId: workspace.id, projectId });
    if (discovery.acceptedBrief.delivery_strategy !== 'custom_build') throw new Error('phase35_expected_custom_build_not_selected');

    const byRole = new Map(plan.specs.map((spec) => [spec.logical_role, plan.items.find((item) => item.id === spec.work_item_id)]));
    await this.#completeTextTask(workspace.id, projectId, byRole.get('product_planner'), 'accepted_definition', 'L1', 'Accepted outcome translated into an execution-ready synthetic definition without changing scope.');
    await this.#completeTextTask(workspace.id, projectId, byRole.get('solution_architect'), 'implementation_plan', 'L1', 'Minimal local Node architecture selected; no external service is required.');

    const workspaceItem = requiredItem(byRole, 'execution_operator');
    const workspaceAssignment = this.delivery.createAssignment({ workspaceId: workspace.id, projectId, workItemId: workspaceItem.id });
    const executionWorkspace = this.workspaceRuntime.prepare({ workspaceId: workspace.id, projectId });
    this.delivery.completeAssignment({ workspaceId: workspace.id, projectId, assignmentId: workspaceAssignment.id, evidenceType: 'workspace_identity', evidenceLevel: 'L2', summary: `Governed local workspace prepared as ${executionWorkspace.rootRef}.`, verificationSummary: 'Workspace is isolated, reversible, synthetic-only and loopback-only.' });

    const implementationItem = requiredItem(byRole, 'implementation_worker');
    const implementationAssignment = this.delivery.createAssignment({ workspaceId: workspace.id, projectId, workItemId: implementationItem.id });
    for (const [relativePath, content] of Object.entries(syntheticLeadGenFiles())) this.workspaceRuntime.writeFile({ workspaceId: workspace.id, projectId, relativePath, content });
    const afterBuild = this.workspaceRuntime.get({ workspaceId: workspace.id, projectId });
    this.delivery.completeAssignment({ workspaceId: workspace.id, projectId, assignmentId: implementationAssignment.id, evidenceType: 'implementation_result', evidenceLevel: 'L2', summary: `Synthetic lead-generation artifact created with ${afterBuild.manifest.length} files inside the governed workspace.`, verificationSummary: 'Implementation artifact exists only inside the authorized local workspace.' });

    const testItem = requiredItem(byRole, 'qa_verifier');
    const testAssignment = this.delivery.createAssignment({ workspaceId: workspace.id, projectId, workItemId: testItem.id });
    const checks = this.delivery.runDeterministicChecks({ workspaceId: workspace.id, projectId, workItemId: testItem.id });
    if (!checks.passed) {
      this.delivery.failAssignment({ workspaceId: workspace.id, projectId, assignmentId: testAssignment.id, evidenceType: 'automated_test_result', summary: JSON.stringify(checks), verificationSummary: 'Deterministic checks failed.' });
      this.delivery.recordRepair({ workspaceId: workspace.id, projectId, workItemId: testItem.id, failureClass: 'deterministic_verification_failure', actionSummary: 'Certification stops rather than widening authority.', status: 'escalated' });
      throw new Error('phase35_deterministic_checks_failed');
    }
    this.delivery.completeAssignment({ workspaceId: workspace.id, projectId, assignmentId: testAssignment.id, evidenceType: 'automated_test_result', evidenceLevel: 'L2', summary: `Syntax and automated behavior checks passed. ${checks.tests.stdout.trim()}`, verificationSummary: 'L2 deterministic checks passed from real local command output.' });

    const flowItem = requiredItem(byRole, 'flow_verifier');
    const flowAssignment = this.delivery.createAssignment({ workspaceId: workspace.id, projectId, workItemId: flowItem.id });
    const flow = await this.delivery.runLocalLeadFlow({ workspaceId: workspace.id, projectId, workItemId: flowItem.id });
    if (!flow.passed) {
      this.delivery.failAssignment({ workspaceId: workspace.id, projectId, assignmentId: flowAssignment.id, evidenceType: 'local_flow_result', evidenceLevel: 'L3', summary: JSON.stringify(flow), verificationSummary: 'Actual loopback lead flow failed.' });
      this.delivery.recordRepair({ workspaceId: workspace.id, projectId, workItemId: flowItem.id, failureClass: 'local_flow_failure', actionSummary: 'Certification stops for repair instead of fabricating delivery.', status: 'escalated' });
      throw new Error('phase35_local_flow_failed');
    }
    this.delivery.completeAssignment({ workspaceId: workspace.id, projectId, assignmentId: flowAssignment.id, evidenceType: 'local_flow_result', evidenceLevel: 'L3', summary: JSON.stringify(flow), verificationSummary: 'L3 actual local user flow passed over loopback with invalid-input rejection and successful synthetic lead storage.' });

    const reviewItem = requiredItem(byRole, 'independent_reviewer');
    const reviewAssignment = this.delivery.createAssignment({ workspaceId: workspace.id, projectId, workItemId: reviewItem.id });
    const review = this.delivery.independentReview({ workspaceId: workspace.id, projectId, workItemId: reviewItem.id });
    if (!review.passed) {
      this.delivery.failAssignment({ workspaceId: workspace.id, projectId, assignmentId: reviewAssignment.id, evidenceType: 'independent_verification', evidenceLevel: 'L3', summary: JSON.stringify(review), verificationSummary: 'Independent deterministic reconciler found unmet evidence.' });
      throw new Error(`phase35_independent_review_failed:${review.findings.join(',')}`);
    }
    this.delivery.completeAssignment({ workspaceId: workspace.id, projectId, assignmentId: reviewAssignment.id, evidenceType: 'independent_verification', evidenceLevel: 'L3', summary: JSON.stringify(review), verificationSummary: 'Independent deterministic reconciler falsification checks passed; worker self-report was not trusted.' });

    const deliveryItem = requiredItem(byRole, 'delivery_reconciler');
    const deliveryAssignment = this.delivery.createAssignment({ workspaceId: workspace.id, projectId, workItemId: deliveryItem.id });
    const evidence = this.db.prepare('SELECT id,work_item_id,level,evidence_type,summary,created_at FROM evidence_references WHERE workspace_id=? AND project_id=? ORDER BY created_at,id').all(workspace.id, projectId);
    const verification = this.db.prepare('SELECT id,work_item_id,outcome,level,summary,created_at FROM verification_runs WHERE workspace_id=? AND project_id=? ORDER BY created_at,id').all(workspace.id, projectId);
    const finalWorkspace = this.workspaceRuntime.get({ workspaceId: workspace.id, projectId });
    const record = this.delivery.createDeliveryRecord({ workspaceId: workspace.id, projectId, executionWorkspaceId: finalWorkspace.id, evidenceBundle: {
      projectBriefVersion: discovery.acceptedBrief.version, strategy: discovery.acceptedBrief.delivery_strategy,
      plannerVersion: plan.plannerVersion, workspaceRef: finalWorkspace.id, manifest: finalWorkspace.manifest,
      evidence, verification, independentReview: review
    }, limitations: ['synthetic data only','local loopback only','no Meta API','no real CRM/email/SMS','no production deployment','no shared GitHub mutation'], nextAction: 'Phase 3 certification complete; broader adapters remain future work.' });
    this.delivery.completeAssignment({ workspaceId: workspace.id, projectId, assignmentId: deliveryAssignment.id, evidenceType: 'delivery_record', evidenceLevel: 'L3', summary: `Delivery record ${record.id} reconciles accepted brief, work graph, workspace, L2/L3 evidence and independent review.`, verificationSummary: 'Synthetic delivery evidence bundle is complete and explainable.' });

    this.db.prepare("UPDATE projects SET lifecycle_phase='closed',operational_status='complete',health='healthy',version=version+1,updated_at=? WHERE id=? AND workspace_id=?").run(now(), projectId, workspace.id);
    this.store.recordEvent({ workspaceId: workspace.id, projectId, eventType: 'phase35.certification.passed', actorType: 'system', entityType: 'phase3_delivery_record', entityId: record.id, entityVersion: 1, payload: { deliveryRecordId: record.id, workspaceRef: finalWorkspace.id, strategy: discovery.acceptedBrief.delivery_strategy } });
    const commandCenter = this.delivery.phase1.getProjectCommandCenter({ workspaceId: workspace.id, projectId });
    return { workspaceId: workspace.id, projectId, intakeId: intake.intake.id, acceptedBrief: discovery.acceptedBrief, plan: this.planner.getState({ workspaceId: workspace.id, projectId }), executionWorkspace: finalWorkspace, deliveryRecord: record, commandCenter };
  }

  async #completeTextTask(workspaceId, projectId, item, evidenceType, level, summary) {
    if (!item) throw new Error(`phase35_required_work_item_missing:${evidenceType}`);
    const assignment = this.delivery.createAssignment({ workspaceId, projectId, workItemId: item.id });
    return this.delivery.completeAssignment({ workspaceId, projectId, assignmentId: assignment.id, evidenceType, evidenceLevel: level, summary, verificationSummary: `${evidenceType} accepted from deterministic Phase 3 certification evidence.` });
  }

  #configureFixtureReasoning(workspaceId) {
    const connection = this.kernel.createProviderConnection({ workspaceId, providerKey: 'fixture', connectionType: 'local_service', billingMode: 'zero_incremental', locality: 'local', allowedDataClasses: ['Public','Internal'], entitlement: { source: 'phase35_ci_fixture' } });
    this.kernel.createExecutionRoute({ workspaceId, providerConnectionId: connection.id, routeName: 'phase35-free-discovery-fixture', runtimeKey: 'phase35-fixture', adapterKind: 'fixture', capabilities: ['reasoning','structured_output'], allowedDataClasses: ['Public','Internal'], independenceGroup: 'phase35-fixture-worker', qualityScore: 90, reliabilityScore: 100, latencyScore: 100, estimatedCostMinor: 0, config: { free_first: true, route_role: 'worker', provider_family: 'fixture', model_tier: 'balanced', quota_bucket_key: 'phase35:fixture', base_quality_score: 90, discovered_active: true, daily_request_limit: 1000 } });
  }
}

export function certificationAnalysis() {
  return {
    findings: [
      { type: 'client_stated', statement: 'The client wants prospects from Facebook/Instagram ads to see an offer, submit details, and enable follow-up.', source_ref: 'raw_request', evidence_refs: ['raw_request'] },
      { type: 'challenge', statement: 'A website is a requested solution, not the business outcome; a simpler hosted form could be an alternative, but the controlled certification requires a locally verifiable artifact and no external service dependency.', source_ref: 'requested_solution', evidence_refs: ['raw_request','requested_solution'] }
    ],
    questions: [],
    research: { required: false, rationale: 'The synthetic certification has no material external factual dependency; real ad, CRM, compliance, pricing, and production decisions are explicit non-goals.', topics: [] },
    strategy: { strategy: 'custom_build', rationale: 'For this synthetic certification, a very small local custom artifact is the least-dependent way to prove the accepted lead-capture outcome and real local flow without external side effects.', alternatives: [{ strategy: 'configure', reason: 'A hosted form would be simpler for a real client when an external service is acceptable, but external configuration is intentionally outside this local certification.' }], evidence_refs: ['raw_request','requested_solution'] },
    brief: { problem: 'Ad-driven prospects need a simple way to understand a synthetic offer and provide contact details for follow-up.', desired_outcome: 'A locally runnable synthetic lead-capture experience accepts valid prospect details, rejects obvious invalid input, stores the synthetic submission locally, and shows success.', primary_users: 'Synthetic advertising prospects', constraints: 'Local-only, synthetic data, no production deployment, no Meta/CRM/email/SMS integration, no paid services.', success: 'Offer is visible; invalid input is rejected; valid synthetic lead reaches the local receiver/store; success is observable; deterministic tests and independent verification pass.', non_goals: ['real ad integration','real customer data','real CRM/email/SMS','production deployment','shared GitHub mutation'] }
  };
}

function requiredItem(byRole, role) { const item = byRole.get(role); if (!item) throw new Error(`phase35_required_role_missing:${role}`); return item; }
function now() { return new Date().toISOString(); }
