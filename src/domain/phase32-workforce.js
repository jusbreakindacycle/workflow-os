// @ts-check
import crypto from 'node:crypto';
import { CanonicalStore } from './canonical-store.js';

const PLANNER_VERSION = 'phase-3.2-v1';

export class Phase32Workforce {
  /** @param {import('node:sqlite').DatabaseSync} db */
  constructor(db) { this.db = db; this.store = new CanonicalStore(db); }

  ensurePlan({ workspaceId, projectId }) {
    const project = this.#project(workspaceId, projectId);
    const brief = this.#brief(project);
    const existingSpecs = this.db.prepare('SELECT * FROM phase3_work_specs WHERE workspace_id=? AND project_id=? ORDER BY created_at,id').all(workspaceId, projectId);
    if (existingSpecs.length) return this.getState({ workspaceId, projectId });

    const existingItems = this.db.prepare('SELECT * FROM work_items WHERE workspace_id=? AND project_id=? ORDER BY created_at,id').all(workspaceId, projectId);
    for (const item of existingItems) {
      const acceptance = json(item.acceptance_json, {});
      if (acceptance.source !== 'phase1_initial_graph') throw new Error(`phase32_existing_nonphase3_work_graph:${item.id}`);
    }
    for (const item of existingItems) {
      if (!['complete','canceled','superseded'].includes(item.status)) this.store.transitionWorkItem({ workspaceId, projectId, workItemId: item.id, expectedVersion: item.version, toStatus: 'superseded', reason: 'replaced_by_phase3_strategy_specific_graph' });
    }

    const scope = json(brief.working_scope_json, {});
    const definitions = planFor(brief.delivery_strategy, brief, scope);
    const created = new Map();
    for (const def of definitions) {
      const item = this.store.createWorkItem({
        workspaceId, projectId, class: def.workClass, title: def.title,
        outcome: def.outcome, status: (def.dependsOn?.length ?? 0) === 0 ? 'ready' : 'draft',
        priority: def.priority, acceptance: {
          source: 'phase3_strategy_work_graph', plannerVersion: PLANNER_VERSION,
          briefVersion: brief.version, strategy: brief.delivery_strategy,
          acceptance: def.acceptance
        }, riskTier: def.riskTier
      });
      created.set(def.key, item);
      this.db.prepare(`INSERT INTO phase3_work_specs
        (id,workspace_id,project_id,work_item_id,brief_version,strategy,logical_role,capability_requirements_json,evidence_required_json,risk_tier,action_class,authority_requirement,verification_level,independent_verification_required,mutable_resources_json,stop_conditions_json,planner_version,created_at)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).run(
          crypto.randomUUID(), workspaceId, projectId, item.id, brief.version, brief.delivery_strategy, def.role,
          JSON.stringify(def.capabilities), JSON.stringify(def.evidence), def.riskTier, def.actionClass,
          def.authority, def.verificationLevel, def.independentVerification ? 1 : 0,
          JSON.stringify(def.mutableResources ?? []), JSON.stringify(def.stopConditions ?? defaultStops(def.riskTier)), PLANNER_VERSION, now()
        );
      for (const capability of def.capabilities) this.db.prepare(`INSERT INTO phase3_workforce_activations
        (id,workspace_id,project_id,work_item_id,logical_role,capability,status,reason,created_at)
        VALUES (?,?,?,?,?,?,'required',?,?)`).run(
          crypto.randomUUID(), workspaceId, projectId, item.id, def.role, capability,
          `WorkItem ${item.id} requires ${capability}; roles activate from work rather than existing permanently.`, now()
        );
    }
    for (const def of definitions) {
      for (const dependencyKey of def.dependsOn ?? []) this.store.addWorkDependency({
        workspaceId, projectId, workItemId: created.get(def.key).id, dependsOnWorkItemId: created.get(dependencyKey).id
      });
    }
    this.store.recordEvent({ workspaceId, projectId, eventType: 'phase32.work_graph.generated', actorType: 'system', entityType: 'project', entityId: projectId, entityVersion: project.version, payload: {
      briefVersion: brief.version, strategy: brief.delivery_strategy, workItemCount: definitions.length,
      capabilities: [...new Set(definitions.flatMap((item) => item.capabilities))], plannerVersion: PLANNER_VERSION
    } });
    return this.getState({ workspaceId, projectId });
  }

  getState({ workspaceId, projectId }) {
    const project = this.#project(workspaceId, projectId);
    const brief = this.#brief(project);
    const items = this.db.prepare("SELECT * FROM work_items WHERE workspace_id=? AND project_id=? AND id IN (SELECT work_item_id FROM phase3_work_specs WHERE workspace_id=? AND project_id=?) ORDER BY priority DESC,created_at,id").all(workspaceId, projectId, workspaceId, projectId);
    const specs = this.db.prepare('SELECT * FROM phase3_work_specs WHERE workspace_id=? AND project_id=? ORDER BY created_at,id').all(workspaceId, projectId).map(parseSpec);
    const deps = this.db.prepare("SELECT * FROM work_dependencies WHERE workspace_id=? AND project_id=? AND work_item_id IN (SELECT work_item_id FROM phase3_work_specs WHERE workspace_id=? AND project_id=?) ORDER BY work_item_id,depends_on_work_item_id").all(workspaceId, projectId, workspaceId, projectId);
    const activations = this.db.prepare('SELECT * FROM phase3_workforce_activations WHERE workspace_id=? AND project_id=? ORDER BY created_at,id').all(workspaceId, projectId);
    return { project, brief, plannerVersion: PLANNER_VERSION, items, specs, dependencies: deps, activations };
  }

  specFor({ workspaceId, projectId, workItemId }) {
    const row = this.db.prepare('SELECT * FROM phase3_work_specs WHERE workspace_id=? AND project_id=? AND work_item_id=?').get(workspaceId, projectId, workItemId);
    if (!row) throw new Error(`phase3_work_spec_not_found:${workItemId}`);
    return parseSpec(row);
  }

  #project(workspaceId, projectId) {
    const row = this.db.prepare('SELECT * FROM projects WHERE id=? AND workspace_id=?').get(projectId, workspaceId);
    if (!row) throw new Error(`project_not_found_in_workspace:${projectId}:${workspaceId}`);
    return row;
  }
  #brief(project) {
    if (!project.current_brief_version) throw new Error(`accepted_project_brief_required:${project.id}`);
    const row = this.db.prepare("SELECT * FROM project_briefs WHERE workspace_id=? AND project_id=? AND version=? AND status='accepted'").get(project.workspace_id, project.id, project.current_brief_version);
    if (!row) throw new Error(`current_project_brief_missing:${project.id}`);
    return row;
  }
}

function planFor(strategy, brief, scope) {
  const success = plain(scope.success) ?? brief.desired_outcome;
  const core = {
    definition: def('definition','specification','product_planner',['requirements'],90,
      'Confirm execution-ready outcome and acceptance', `Turn the accepted brief into an execution-ready definition for: ${brief.desired_outcome}`,
      `Definition preserves accepted problem/outcome and makes acceptance (${success}) testable.`, 'R0','analysis','none_r0','L1',['accepted_definition']),
  };
  const plans = {
    custom_build: [
      core.definition,
      def('architecture','planning','solution_architect',['architecture','planning'],82,'Prepare proportional implementation plan',`Choose the smallest local architecture that can achieve: ${brief.desired_outcome}`,'Architecture is proportional, local-first, and does not invent production/external dependencies.','R0','analysis','none_r0','L1',['implementation_plan'],['definition']),
      def('workspace','execution_setup','execution_operator',['workspace_preparation'],76,'Prepare governed local execution workspace','Create the dedicated synthetic Project workspace under the configured root.','Workspace is isolated, reversible, path-bounded, network-minimal, and contains no real client data.','R1','local_workspace_prepare','bounded_local_workspace_policy','L2',['workspace_identity','workspace_policy'],['architecture'],['workspace']),
      def('implementation','implementation','implementation_worker',['implementation','local_file_mutation'],70,'Implement accepted local outcome',`Create the smallest locally runnable implementation satisfying: ${success}`,'Implementation stays inside the governed workspace and does not contact real external systems.','R1','local_workspace_mutation','bounded_local_workspace_policy','L2',['artifact_manifest','implementation_result'],['workspace'],['workspace']),
      def('deterministic_verify','verification','qa_verifier',['deterministic_verification'],64,'Run deterministic behavior checks','Execute bounded automated tests against the generated project.','Required automated checks pass from observable command output.','R0','local_verification','none_r0','L2',['automated_test_result'],['implementation']),
      def('local_flow','verification','flow_verifier',['local_flow_verification'],60,'Exercise actual local user flow','Start the local application and exercise the accepted synthetic user flow over loopback.','A real loopback flow proves validation, successful submission, receiver/store effect, and observable success state.','R1','loopback_local_flow','bounded_local_workspace_policy','L3',['local_flow_result'],['deterministic_verify']),
      def('independent_review','verification','independent_reviewer',['adversarial_review','verification'],54,'Independently falsify completion','Review exact brief, artifact/evidence, deterministic checks, and local-flow evidence without trusting worker self-report.','Independent review finds no unmet accepted criterion or fabricated evidence.','R0','independent_review','none_r0','L3',['independent_verification'],['local_flow'],[],true),
      def('delivery','delivery','delivery_reconciler',['delivery_reconciliation','documentation'],48,'Reconcile verified delivery evidence','Produce final evidence bundle, limitations, remaining human action, and explainable delivery state.','Delivery record references accepted brief, work graph, workspace, evidence, verification and limitations.','R0','delivery_reconciliation','none_r0','L3',['delivery_record'],['independent_review'])
    ],
    hybrid: [],
    automate: [
      core.definition,
      def('plan','planning','automation_designer',['workflow_design','planning'],80,'Design bounded automation path',`Design the smallest automation that achieves: ${brief.desired_outcome}`,'Plan identifies trigger, inputs, transformations/actions, failure handling and verification without inventing a website.','R0','analysis','none_r0','L1',['automation_plan'],['definition']),
      def('implementation','implementation','automation_implementer',['automation_implementation'],68,'Implement or configure automation','Create the governed automation artifact/configuration required by the accepted strategy.','Implementation stays within authorized local/synthetic boundaries.','R1','local_workspace_mutation','bounded_local_workspace_policy','L2',['automation_artifact'],['plan']),
      def('verify','verification','qa_verifier',['workflow_verification'],58,'Verify automation behavior','Exercise representative synthetic inputs and verify expected outputs/failure handling.','Synthetic workflow behavior meets acceptance.','R0','local_verification','none_r0','L3',['workflow_test_result'],['implementation']),
      def('delivery','delivery','delivery_reconciler',['delivery_reconciliation'],48,'Reconcile automation delivery','Record evidence, limitations and remaining activation/deployment action.','Delivery record is explainable without fabricating external activation.','R0','delivery_reconciliation','none_r0','L3',['delivery_record'],['verify'])
    ],
    configure: [
      core.definition,
      def('configuration','implementation','configuration_specialist',['configuration'],70,'Configure accepted solution','Apply the minimum synthetic/local configuration implied by the accepted brief.','Configuration satisfies accepted fields/rules without custom software work unless separately justified.','R1','local_workspace_mutation','bounded_local_workspace_policy','L2',['configuration_artifact'],['definition']),
      def('verify','verification','qa_verifier',['configuration_verification'],58,'Verify configured behavior','Exercise representative synthetic behavior against acceptance.','Configuration evidence meets accepted success criteria.','R0','local_verification','none_r0','L3',['configuration_test_result'],['configuration']),
      def('delivery','delivery','delivery_reconciler',['delivery_reconciliation'],48,'Reconcile configured delivery','Record evidence, limitations and remaining real-system activation steps.','No repository/deployment work is fabricated.','R0','delivery_reconciliation','none_r0','L3',['delivery_record'],['verify'])
    ],
    adopt_existing: [
      core.definition,
      def('fit','analysis','solution_evaluator',['solution_evaluation'],72,'Validate existing-solution fit','Evaluate whether the accepted existing-solution direction satisfies the outcome and constraints.','Fit decision is tied to accepted criteria and does not create implementation work without need.','R0','analysis','none_r0','L1',['fit_assessment'],['definition']),
      def('handoff','delivery','delivery_reconciler',['handoff_documentation'],50,'Prepare adoption handoff','Document setup, verification needs, limitations and operator actions.','Handoff is explicit about what remains external/manual.','R0','delivery_reconciliation','none_r0','L2',['delivery_record'],['fit'])
    ],
    integrate: [
      core.definition,
      def('plan','planning','integration_architect',['integration_design'],78,'Design bounded integration','Define system boundary, data mapping, error handling and test contract.','Plan names external dependencies without granting credentials or remote authority.','R0','analysis','none_r0','L1',['integration_plan'],['definition']),
      def('implementation','implementation','integration_worker',['integration_implementation'],66,'Implement synthetic/local integration path','Implement a local/synthetic integration seam without real external side effects.','No real endpoint is contacted without separate authority.','R1','local_workspace_mutation','bounded_local_workspace_policy','L2',['integration_artifact'],['plan']),
      def('verify','verification','qa_verifier',['integration_verification'],56,'Verify integration contract','Exercise synthetic requests/responses and failure handling.','Integration contract passes observable tests.','R0','local_verification','none_r0','L3',['integration_test_result'],['implementation']),
      def('delivery','delivery','delivery_reconciler',['delivery_reconciliation'],46,'Reconcile integration delivery','Record evidence and remaining credential/real-endpoint activation steps.','External activation remains explicitly unperformed.','R0','delivery_reconciliation','none_r0','L3',['delivery_record'],['verify'])
    ],
    process_change: [
      core.definition,
      def('design','planning','process_designer',['process_design'],70,'Design process change','Define the smallest process/rule/checklist change that achieves the outcome without software.','Process design has owners/triggers/acceptance but no invented code tasks.','R0','analysis','none_r0','L1',['process_design'],['definition']),
      def('verify','verification','qa_verifier',['process_verification'],56,'Verify process against scenarios','Run synthetic scenarios against the proposed process and acceptance.','Representative scenarios meet acceptance.','R0','local_verification','none_r0','L2',['scenario_results'],['design']),
      def('delivery','delivery','delivery_reconciler',['handoff_documentation'],46,'Prepare process handoff','Produce the final process artifact and limitations.','Delivery contains no fake repository/deployment steps.','R0','delivery_reconciliation','none_r0','L2',['delivery_record'],['verify'])
    ],
    research_pilot: [
      def('question','research','research_planner',['research_planning'],80,'Define pilot question',`Define what evidence is needed before committing to a delivery strategy for: ${brief.desired_outcome}`,'Question is decision-relevant and bounded.','R0','analysis','none_r0','L1',['research_question']),
      def('pilot','research','research_worker',['research','pilot_execution'],65,'Run bounded synthetic/local pilot','Produce decision evidence without production commitments.','Pilot records sources/assumptions/limitations.','R0','analysis','none_r0','L2',['pilot_evidence'],['question']),
      def('decision','decision','decision_reconciler',['decision_support'],50,'Reconcile pilot decision','Recommend continue/change/defer with evidence.','Decision remains proposed until operator acceptance when consequential.','R0','analysis','none_r0','L2',['decision_record'],['pilot'])
    ],
    defer: [
      def('resume','decision','decision_reconciler',['decision_support'],60,'Define resume conditions','Record what evidence/event would justify resuming this Project.','No execution work is created while strategy remains defer.','R0','analysis','none_r0','L1',['resume_conditions'])
    ]
  };
  plans.hybrid = [
    core.definition,
    def('architecture','planning','solution_architect',['architecture','integration_design','planning'],80,'Prepare hybrid delivery plan',`Define which accepted parts require local custom implementation versus integration/configuration for: ${brief.desired_outcome}`,'Plan minimizes custom code and identifies bounded seams.','R0','analysis','none_r0','L1',['hybrid_plan'],['definition']),
    def('workspace','execution_setup','execution_operator',['workspace_preparation'],74,'Prepare governed local execution workspace','Prepare isolated local workspace for the custom portion only.','Workspace authority does not grant remote integration authority.','R1','local_workspace_prepare','bounded_local_workspace_policy','L2',['workspace_identity'],['architecture'],['workspace']),
    def('implementation','implementation','implementation_worker',['implementation','integration_implementation'],66,'Implement bounded hybrid artifact','Implement local custom components and synthetic integration seams.','Implementation remains local/synthetic.','R1','local_workspace_mutation','bounded_local_workspace_policy','L2',['artifact_manifest'],['workspace'],['workspace']),
    def('verify','verification','qa_verifier',['deterministic_verification','integration_verification'],56,'Verify hybrid behavior','Exercise custom and integration seams with synthetic data.','Observable checks satisfy acceptance.','R0','local_verification','none_r0','L3',['hybrid_test_result'],['implementation']),
    def('review','verification','independent_reviewer',['adversarial_review','verification'],50,'Independently review hybrid result','Falsify accepted criteria and authority boundaries.','Independent review passes.','R0','independent_review','none_r0','L3',['independent_verification'],['verify'],[],true),
    def('delivery','delivery','delivery_reconciler',['delivery_reconciliation'],44,'Reconcile hybrid delivery','Record evidence, limitations and remaining real integration actions.','Delivery stays explicit about unperformed external activation.','R0','delivery_reconciliation','none_r0','L3',['delivery_record'],['review'])
  ];
  return plans[strategy] ?? (() => { throw new Error(`phase32_strategy_unsupported:${strategy}`); })();
}

function def(key, workClass, role, capabilities, priority, title, outcome, acceptance, riskTier, actionClass, authority, verificationLevel, evidence, dependsOn = [], mutableResources = [], independentVerification = false) {
  return { key, workClass, role, capabilities, priority, title, outcome, acceptance, riskTier, actionClass, authority, verificationLevel, evidence, dependsOn, mutableResources, independentVerification };
}
function defaultStops(riskTier) { return ['objective_met','scope_uncertain','verification_blocked', ...(riskTier === 'R0' ? [] : ['authority_missing_or_stale','unexpected_side_effect'])]; }
function parseSpec(row) { return { ...row, capabilities: json(row.capability_requirements_json, []), evidenceRequired: json(row.evidence_required_json, []), mutableResources: json(row.mutable_resources_json, []), stopConditions: json(row.stop_conditions_json, []) }; }
function json(value, fallback) { try { return value ? JSON.parse(value) : fallback; } catch { return fallback; } }
function plain(value) { return typeof value === 'string' && value.trim() ? value.trim() : null; }
function now() { return new Date().toISOString(); }
