// @ts-check
import crypto from 'node:crypto';
import { CanonicalStore } from './canonical-store.js';
import {
  assertNoRawSecrets,
  canonicalJson,
  sha256Json,
  validateAssignmentContract,
  validateContextSlice,
  validateProjectPack
} from './contracts.js';

const REPOSITORY_STRATEGIES = new Set(['custom_build', 'hybrid']);
const ASSIGNMENT_ACTIVE = new Set(['created', 'running', 'execution_finished']);

export class Phase1ControlPlane {
  /** @param {import('node:sqlite').DatabaseSync} db */
  constructor(db) {
    this.db = db;
    this.store = new CanonicalStore(db);
  }

  ensureInitialWorkGraph({ workspaceId, projectId }) {
    const project = this.#project(workspaceId, projectId);
    const brief = this.#currentBrief(project);
    const existing = this.db.prepare('SELECT * FROM work_items WHERE workspace_id = ? AND project_id = ? ORDER BY created_at, id').all(workspaceId, projectId);
    if (existing.length > 0) return this.getWorkGraph({ workspaceId, projectId });

    const definitions = brief.delivery_strategy === 'defer'
      ? [
          { key: 'review', class: 'decision', title: 'Review defer conditions', outcome: 'Define the evidence or condition that would justify resuming the project.' }
        ]
      : [
          { key: 'definition', class: 'specification', title: 'Confirm accepted outcome and constraints', outcome: 'Translate the accepted brief into an execution-ready definition without changing scope.' },
          { key: 'plan', class: 'planning', title: 'Prepare delivery plan', outcome: `Plan the ${brief.delivery_strategy} strategy with bounded steps and dependencies.` },
          { key: 'verify', class: 'verification', title: 'Prepare verification path', outcome: 'Define evidence that will prove the planned result meets the accepted outcome.' }
        ];

    const created = new Map();
    for (const [index, item] of definitions.entries()) {
      const row = this.store.createWorkItem({
        workspaceId,
        projectId,
        class: item.class,
        title: item.title,
        outcome: item.outcome,
        status: index === 0 ? 'ready' : 'draft',
        priority: 70 - (index * 10),
        acceptance: { source: 'phase1_initial_graph', briefVersion: brief.version },
        riskTier: 'R0'
      });
      created.set(item.key, row);
    }

    if (created.has('plan')) this.store.addWorkDependency({ workspaceId, projectId, workItemId: created.get('plan').id, dependsOnWorkItemId: created.get('definition').id });
    if (created.has('verify')) this.store.addWorkDependency({ workspaceId, projectId, workItemId: created.get('verify').id, dependsOnWorkItemId: created.get('plan').id });

    this.store.recordEvent({
      workspaceId,
      projectId,
      eventType: 'project.work_graph.initialized',
      actorType: 'system',
      entityType: 'project',
      entityId: projectId,
      entityVersion: project.version,
      payload: { workItemCount: definitions.length, briefVersion: brief.version }
    });
    return this.getWorkGraph({ workspaceId, projectId });
  }

  getWorkGraph({ workspaceId, projectId }) {
    this.#project(workspaceId, projectId);
    const items = this.db.prepare('SELECT * FROM work_items WHERE workspace_id = ? AND project_id = ? ORDER BY priority DESC, created_at, id').all(workspaceId, projectId);
    const dependencies = this.db.prepare('SELECT * FROM work_dependencies WHERE workspace_id = ? AND project_id = ? ORDER BY work_item_id, depends_on_work_item_id').all(workspaceId, projectId);
    const byId = new Map(items.map((item) => [item.id, item]));
    const depsByItem = new Map();
    for (const dep of dependencies) {
      if (!depsByItem.has(dep.work_item_id)) depsByItem.set(dep.work_item_id, []);
      depsByItem.get(dep.work_item_id).push(dep.depends_on_work_item_id);
    }
    const activeAssignments = new Set(
      this.db.prepare("SELECT work_item_id FROM assignments WHERE workspace_id = ? AND project_id = ? AND status IN ('created','running','execution_finished')")
        .all(workspaceId, projectId).map((row) => row.work_item_id)
    );
    const openApprovalSubjects = new Set(
      this.db.prepare("SELECT subject_id FROM approvals WHERE workspace_id = ? AND project_id = ? AND status = 'requested'")
        .all(workspaceId, projectId).map((row) => row.subject_id)
    );

    const nodes = items.map((item) => {
      const depIds = depsByItem.get(item.id) ?? [];
      const incompleteDependencies = depIds.filter((id) => byId.get(id)?.status !== 'complete');
      const reasons = [];
      if (item.status !== 'ready') reasons.push(`status:${item.status}`);
      if (incompleteDependencies.length > 0) reasons.push(`dependencies:${incompleteDependencies.join(',')}`);
      if (activeAssignments.has(item.id)) reasons.push('active_assignment');
      if (openApprovalSubjects.has(item.id)) reasons.push('approval_pending');
      return {
        ...item,
        dependency_ids: depIds,
        readiness: reasons.length === 0 ? 'eligible' : 'ineligible',
        readiness_reasons: reasons
      };
    });

    return {
      projectId,
      graphVersion: Math.max(1, ...items.map((item) => Number(item.version))),
      nodes,
      dependencies,
      nextReady: nodes.filter((node) => node.readiness === 'eligible')
    };
  }

  refreshDerivedReadiness({ workspaceId, projectId }) {
    const graph = this.getWorkGraph({ workspaceId, projectId });
    const complete = new Set(graph.nodes.filter((node) => node.status === 'complete').map((node) => node.id));
    let changed = 0;
    for (const node of graph.nodes) {
      if (node.status !== 'draft') continue;
      if (node.dependency_ids.every((id) => complete.has(id))) {
        const now = isoNow();
        const result = this.db.prepare("UPDATE work_items SET status = 'ready', version = version + 1, updated_at = ? WHERE id = ? AND workspace_id = ? AND project_id = ? AND status = 'draft'")
          .run(now, node.id, workspaceId, projectId);
        changed += Number(result.changes);
        if (Number(result.changes) === 1) this.store.recordEvent({ workspaceId, projectId, workItemId: node.id, eventType: 'work_item.ready', actorType: 'system', entityType: 'work_item', entityId: node.id, reason: 'dependencies_complete' });
      }
    }
    return { changed, graph: this.getWorkGraph({ workspaceId, projectId }) };
  }

  getNeedsAttention({ workspaceId, projectId = null }) {
    this.store.getWorkspace(workspaceId);
    const params = projectId ? [workspaceId, projectId] : [workspaceId];
    const scope = projectId ? 'workspace_id = ? AND project_id = ?' : 'workspace_id = ?';
    const rows = [];

    const collect = (type, sql, title) => {
      for (const row of this.db.prepare(sql).all(...params)) rows.push({ type, title: title(row), projectId: row.project_id, entityId: row.id, createdAt: row.created_at ?? null, detail: row });
    };
    collect('decision', `SELECT * FROM decisions WHERE ${scope} AND status = 'open'`, (row) => row.question);
    collect('approval', `SELECT * FROM approvals WHERE ${scope} AND status = 'requested'`, (row) => `Approval required: ${row.authority_reason}`);
    collect('work_item_proposal', `SELECT * FROM work_item_proposals WHERE ${scope} AND status = 'proposed'`, (row) => `Proposed work: ${row.title}`);
    collect('work_item', `SELECT * FROM work_items WHERE ${scope} AND status IN ('needs_attention','blocked','failed','stale')`, (row) => `${row.title}: ${row.status}`);
    collect('revision', `SELECT * FROM project_revisions WHERE ${scope} AND impact_status = 'pending'`, (row) => `Goal revision impact requires assessment`);
    collect('repository_proposal', `SELECT * FROM repository_proposals WHERE ${scope} AND status = 'proposed'`, () => 'Repository creation requires approval');
    collect('spend_request', `SELECT * FROM spend_requests WHERE ${scope} AND status = 'requested'`, (row) => `Spend approval required: ${row.purpose}`);
    collect('assignment', `SELECT * FROM assignments WHERE ${scope} AND status IN ('blocked','failed')`, (row) => `Assignment ${row.status}`);

    return rows.sort((a, b) => String(a.createdAt ?? '').localeCompare(String(b.createdAt ?? '')));
  }

  getActivityFeed({ workspaceId, projectId = null, limit = 100 }) {
    this.store.getWorkspace(workspaceId);
    const safeLimit = Math.max(1, Math.min(500, Number(limit) || 100));
    if (projectId) {
      this.#project(workspaceId, projectId);
      return this.db.prepare('SELECT * FROM project_events WHERE workspace_id = ? AND project_id = ? ORDER BY created_at DESC, id DESC LIMIT ?').all(workspaceId, projectId, safeLimit);
    }
    return this.db.prepare('SELECT * FROM project_events WHERE workspace_id = ? ORDER BY created_at DESC, id DESC LIMIT ?').all(workspaceId, safeLimit);
  }

  generateProjectPack({ workspaceId, projectId }) {
    const project = this.#project(workspaceId, projectId);
    const brief = this.#currentBrief(project);
    const graph = this.getWorkGraph({ workspaceId, projectId });
    const strategyDecision = this.db.prepare("SELECT id FROM delivery_strategy_decisions WHERE workspace_id = ? AND project_id = ? AND status = 'accepted' ORDER BY accepted_at DESC LIMIT 1").get(workspaceId, projectId);
    const scope = parseJson(brief.working_scope_json, {});
    const requirements = [
      { id: 'REQ-OUTCOME', statement: brief.desired_outcome, acceptance_ref: 'project_brief.desired_outcome' }
    ];
    if (typeof scope.success === 'string' && scope.success.trim()) requirements.push({ id: 'REQ-ACCEPT', statement: scope.success.trim(), acceptance_ref: 'project_brief.working_scope.success' });

    const pack = {
      project_pack_version: '0.1',
      project: {
        workspace_id: workspaceId,
        project_id: projectId,
        project_brief_version: brief.version,
        kind: project.kind,
        problem: brief.problem,
        desired_outcome: brief.desired_outcome,
        delivery_strategy: {
          primary: brief.delivery_strategy,
          decision_ref: strategyDecision?.id ?? `project_brief:${brief.id}`
        },
        engagement_ref: project.engagement_id ?? null,
        requirements,
        non_goals: Array.isArray(scope.nonGoals) ? scope.nonGoals.filter(isNonEmptyString) : [],
        architecture_refs: [],
        work_graph: {
          graph_version: graph.graphVersion,
          work_item_refs: graph.nodes.map((node) => node.id)
        },
        policy: {
          data_classification: 'Internal',
          paid_execution: 'ask',
          raw_secrets_allowed: false
        },
        verification: { minimum_level: 'L2' },
        escalation: ['material_scope_change', 'paid_execution', 'production_or_destructive_side_effect', 'verification_failure']
      }
    };

    validateProjectPack(pack);
    const contentJson = canonicalJson(pack);
    const contentSha256 = sha256Json(pack);
    const current = this.db.prepare("SELECT * FROM project_pack_versions WHERE workspace_id = ? AND project_id = ? AND status = 'current'").get(workspaceId, projectId);
    if (current?.content_sha256 === contentSha256 && current?.brief_version === brief.version) return this.#packRecord(current);

    return this.#transaction(() => {
      if (current) this.db.prepare("UPDATE project_pack_versions SET status = 'superseded' WHERE id = ? AND workspace_id = ?").run(current.id, workspaceId);
      const version = Number(this.db.prepare('SELECT COALESCE(MAX(version), 0) AS value FROM project_pack_versions WHERE project_id = ?').get(projectId).value) + 1;
      const id = crypto.randomUUID();
      const provenance = {
        generator: 'phase1-deterministic-project-pack-v0.1',
        projectVersion: project.version,
        projectBriefId: brief.id,
        projectBriefVersion: brief.version,
        workItems: graph.nodes.map((node) => ({ id: node.id, version: node.version }))
      };
      this.db.prepare(`INSERT INTO project_pack_versions
        (id, workspace_id, project_id, brief_version, version, status, content_sha256, provenance_json, created_at, content_json)
        VALUES (?, ?, ?, ?, ?, 'current', ?, ?, ?, ?)`).run(
          id, workspaceId, projectId, brief.version, version, contentSha256, canonicalJson(provenance), isoNow(), contentJson
        );
      this.store.recordEvent({ workspaceId, projectId, eventType: 'project.pack.generated', actorType: 'system', entityType: 'project_pack', entityId: id, entityVersion: version, payload: { briefVersion: brief.version, contentSha256 } });
      return this.#packRecord(this.#scoped('project_pack_versions', id, workspaceId));
    });
  }

  createContextSlice({ workspaceId, projectId, workItemId, purpose = 'phase1_mock_assignment' }) {
    const project = this.#project(workspaceId, projectId);
    const brief = this.#currentBrief(project);
    const workItem = this.#workItem(workspaceId, projectId, workItemId);
    const pack = this.generateProjectPack({ workspaceId, projectId });
    const scope = parseJson(brief.working_scope_json, {});
    const sliceId = crypto.randomUUID();
    const context = {
      context_slice_version: '0.1',
      id: sliceId,
      workspace_id: workspaceId,
      project_id: projectId,
      work_item_id: workItemId,
      work_item_version: workItem.version,
      project_pack_ref: pack.id,
      objective: workItem.outcome,
      requirements: [brief.desired_outcome],
      constraints: typeof scope.constraints === 'string' && scope.constraints.trim() ? [scope.constraints.trim()] : [],
      authorized_refs: [],
      data_classification: 'Internal',
      expires_at: null
    };
    validateContextSlice(context);
    const contentSha256 = sha256Json(context);
    this.db.prepare(`INSERT INTO context_slices
      (id, workspace_id, project_id, project_pack_version_id, work_item_id, work_item_version, version, purpose, context_json, content_sha256, created_at)
      VALUES (?, ?, ?, ?, ?, ?, 1, ?, ?, ?, ?)`).run(
        sliceId, workspaceId, projectId, pack.id, workItemId, workItem.version, purpose, canonicalJson(context), contentSha256, isoNow()
      );
    this.store.recordEvent({ workspaceId, projectId, workItemId, eventType: 'assignment.context_slice.created', actorType: 'system', entityType: 'context_slice', entityId: sliceId, entityVersion: 1, payload: { purpose, projectPackId: pack.id } });
    return { ...this.#scoped('context_slices', sliceId, workspaceId), content: context };
  }

  reviseProjectGoal({ workspaceId, projectId, expectedProjectVersion, problem, desiredOutcome, requestedSolution = null, deliveryStrategy, workingScope = {}, reason, affectedWorkItemIds = null }) {
    const before = this.#project(workspaceId, projectId);
    const items = this.db.prepare('SELECT * FROM work_items WHERE workspace_id = ? AND project_id = ? ORDER BY created_at').all(workspaceId, projectId);
    const affected = affectedWorkItemIds === null
      ? items.filter((item) => !['canceled', 'superseded'].includes(item.status)).map((item) => item.id)
      : [...new Set(affectedWorkItemIds)];
    for (const id of affected) this.#workItem(workspaceId, projectId, id);
    const unaffected = items.filter((item) => !affected.includes(item.id)).map((item) => item.id);

    const newBrief = this.store.appendAcceptedProjectBrief({
      workspaceId,
      projectId,
      expectedProjectVersion,
      problem,
      desiredOutcome,
      requestedSolution,
      deliveryStrategy,
      workingScope,
      reason
    });

    this.#transaction(() => {
      const now = isoNow();
      for (const id of affected) {
        this.db.prepare(`UPDATE work_items
          SET status = CASE WHEN status IN ('canceled','superseded') THEN status ELSE 'stale' END,
              stale_reason = ?,
              version = CASE WHEN status IN ('canceled','superseded') THEN version ELSE version + 1 END,
              updated_at = ?
          WHERE id = ? AND workspace_id = ? AND project_id = ?`).run(`goal_revision:${newBrief.version}`, now, id, workspaceId, projectId);
        this.db.prepare("UPDATE assignments SET status = 'superseded', finished_at = COALESCE(finished_at, ?) WHERE workspace_id = ? AND project_id = ? AND work_item_id = ? AND status IN ('created','running')")
          .run(now, workspaceId, projectId, id);
        this.db.prepare("UPDATE approvals SET status = 'superseded', resolved_at = ? WHERE workspace_id = ? AND project_id = ? AND subject_id = ? AND status IN ('requested','approved')")
          .run(now, workspaceId, projectId, id);
      }
      this.db.prepare("UPDATE project_pack_versions SET status = 'stale' WHERE workspace_id = ? AND project_id = ? AND status = 'current'").run(workspaceId, projectId);
      const revision = this.db.prepare('SELECT * FROM project_revisions WHERE workspace_id = ? AND project_id = ? AND to_brief_id = ? ORDER BY revision_number DESC LIMIT 1').get(workspaceId, projectId, newBrief.id);
      if (!revision) throw new Error('revision_record_missing');
      const impact = { affectedWorkItemIds: affected, unaffectedWorkItemIds: unaffected, previousProjectVersion: before.version, newBriefVersion: newBrief.version };
      this.db.prepare("UPDATE project_revisions SET impact_status = 'applied', impact_json = ? WHERE id = ? AND workspace_id = ?").run(canonicalJson(impact), revision.id, workspaceId);
      this.store.recordEvent({ workspaceId, projectId, eventType: 'project.revision.impact_applied', actorType: 'system', entityType: 'project_revision', entityId: revision.id, entityVersion: revision.revision_number, reason, payload: impact });
    });
    return {
      project: this.#project(workspaceId, projectId),
      brief: newBrief,
      impact: { affectedWorkItemIds: affected, unaffectedWorkItemIds: unaffected }
    };
  }

  proposeRepository({ workspaceId, projectId, reason, desiredVisibility = 'private' }) {
    const project = this.#project(workspaceId, projectId);
    const brief = this.#currentBrief(project);
    if (!REPOSITORY_STRATEGIES.has(brief.delivery_strategy)) throw new Error(`repository_not_required_for_strategy:${brief.delivery_strategy}`);
    if (!['private', 'public'].includes(desiredVisibility)) throw new TypeError('invalid_repository_visibility');
    assertText(reason, 'reason');
    const id = crypto.randomUUID();
    this.db.prepare(`INSERT INTO repository_proposals
      (id, workspace_id, project_id, brief_version, reason, desired_visibility, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)`).run(id, workspaceId, projectId, brief.version, reason.trim(), desiredVisibility, isoNow());
    this.store.recordEvent({ workspaceId, projectId, eventType: 'repository.proposed', actorType: 'system', entityType: 'repository_proposal', entityId: id, entityVersion: 1, reason });
    return this.#scoped('repository_proposals', id, workspaceId);
  }

  requestRepositoryApproval({ workspaceId, projectId, repositoryProposalId }) {
    const proposal = this.#scopedProject('repository_proposals', repositoryProposalId, workspaceId, projectId);
    if (proposal.status !== 'proposed') throw new Error(`repository_proposal_not_proposed:${proposal.status}`);
    if (proposal.approval_id) return this.#scopedProject('approvals', proposal.approval_id, workspaceId, projectId);
    const approval = this.store.requestApproval({
      workspaceId,
      projectId,
      subjectType: 'repository_proposal',
      subjectId: repositoryProposalId,
      subjectVersion: proposal.brief_version,
      authorityReason: 'Repository creation may create an external durable resource.',
      bounds: { desiredVisibility: proposal.desired_visibility, mockOnly: true }
    });
    this.db.prepare('UPDATE repository_proposals SET approval_id = ? WHERE id = ? AND workspace_id = ?').run(approval.id, repositoryProposalId, workspaceId);
    return approval;
  }

  resolveApproval({ workspaceId, projectId, approvalId, decision, evidence = [] }) {
    if (!['approved', 'rejected'].includes(decision)) throw new TypeError('approval_decision_invalid');
    const approval = this.#scopedProject('approvals', approvalId, workspaceId, projectId);
    if (approval.status !== 'requested') throw new Error(`approval_not_requested:${approval.status}`);
    const now = isoNow();
    this.db.prepare('UPDATE approvals SET status = ?, evidence_json = ?, resolved_at = ? WHERE id = ? AND workspace_id = ? AND project_id = ? AND status = ?')
      .run(decision, canonicalJson(evidence), now, approvalId, workspaceId, projectId, 'requested');
    if (approval.subject_type === 'repository_proposal') {
      this.db.prepare('UPDATE repository_proposals SET status = ?, resolved_at = ? WHERE id = ? AND workspace_id = ? AND project_id = ?')
        .run(decision === 'approved' ? 'approved' : 'rejected', now, approval.subject_id, workspaceId, projectId);
    }
    this.store.recordEvent({ workspaceId, projectId, eventType: `approval.${decision}`, actorType: 'operator', entityType: 'approval', entityId: approvalId, entityVersion: approval.subject_version, payload: { subjectType: approval.subject_type, subjectId: approval.subject_id } });
    return this.#scopedProject('approvals', approvalId, workspaceId, projectId);
  }

  executeMockRepository({ workspaceId, projectId, repositoryProposalId }) {
    const proposal = this.#scopedProject('repository_proposals', repositoryProposalId, workspaceId, projectId);
    if (proposal.status !== 'approved') throw new Error(`repository_proposal_not_approved:${proposal.status}`);
    const approval = proposal.approval_id ? this.#scopedProject('approvals', proposal.approval_id, workspaceId, projectId) : null;
    if (!approval || approval.status !== 'approved') throw new Error('repository_approval_required');
    const existing = this.db.prepare('SELECT * FROM repository_mock_results WHERE repository_proposal_id = ?').get(repositoryProposalId);
    if (existing) return existing;
    const result = {
      id: crypto.randomUUID(),
      workspaceId,
      projectId,
      proposalId: repositoryProposalId,
      repositoryRef: `mock://repository/${projectId}/${repositoryProposalId}`,
      visibility: proposal.desired_visibility,
      created: true
    };
    const now = isoNow();
    this.#transaction(() => {
      this.db.prepare(`INSERT INTO repository_mock_results
        (id, workspace_id, project_id, repository_proposal_id, repository_ref, result_json, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)`).run(result.id, workspaceId, projectId, repositoryProposalId, result.repositoryRef, canonicalJson(result), now);
      this.db.prepare("UPDATE repository_proposals SET status = 'executed', resolved_at = ? WHERE id = ? AND workspace_id = ?").run(now, repositoryProposalId, workspaceId);
      this.store.recordEvent({ workspaceId, projectId, eventType: 'repository.mock_created', actorType: 'system', entityType: 'repository_proposal', entityId: repositoryProposalId, entityVersion: proposal.brief_version, payload: { repositoryRef: result.repositoryRef } });
    });
    return this.db.prepare('SELECT * FROM repository_mock_results WHERE id = ?').get(result.id);
  }

  createMockAssignment({ workspaceId, projectId, workItemId, role = 'phase1_mock_worker', maxIterations = 3, maxMinutes = 10, maxIncrementalCost = 0, spendEnvelopeId = null }) {
    const workItem = this.#workItem(workspaceId, projectId, workItemId);
    const graph = this.getWorkGraph({ workspaceId, projectId });
    const node = graph.nodes.find((item) => item.id === workItemId);
    if (!node || node.readiness !== 'eligible') throw new Error(`work_item_not_ready:${(node?.readiness_reasons ?? []).join('|')}`);
    if (maxIncrementalCost > 0) this.#assertSpendEnvelope(workspaceId, projectId, workItemId, spendEnvelopeId, maxIncrementalCost);
    const contextSlice = this.createContextSlice({ workspaceId, projectId, workItemId, purpose: 'phase1_mock_assignment' });
    const pack = this.#scopedProject('project_pack_versions', contextSlice.project_pack_version_id, workspaceId, projectId);
    const id = crypto.randomUUID();
    const contract = {
      assignment_version: '0.1',
      assignment: {
        id,
        workspace_id: workspaceId,
        project_id: projectId,
        work_item_id: workItemId,
        work_item_version: workItem.version,
        role,
        objective: workItem.outcome,
        project_pack_ref: pack.id,
        context_slice_ref: contextSlice.id,
        inputs: [],
        in_scope: [workItem.title],
        out_of_scope: ['commercial commitments', 'production deployment', 'destructive actions'],
        allowed_capabilities: ['read_context', 'produce_evidence'],
        budgets: {
          max_iterations: maxIterations,
          max_minutes: maxMinutes,
          max_incremental_cost: maxIncrementalCost / 100,
          spend_envelope_ref: spendEnvelopeId
        },
        evidence_required: ['phase1_mock_result'],
        side_effect_policy: { max_risk_tier: 'R0', production_allowed: false, destructive_allowed: false },
        stop_conditions: ['objective_met', 'budget_exhausted', 'scope_uncertain', 'verification_blocked'],
        escalation: ['material_scope_change', 'paid_execution_without_envelope', 'unexpected_side_effect']
      }
    };
    validateAssignmentContract(contract);
    this.db.prepare(`INSERT INTO assignments
      (id, workspace_id, project_id, work_item_id, work_item_version, context_slice_id, assignee_kind, assignee_ref, status,
       budget_json, side_effect_policy_json, stop_conditions_json, created_at, project_pack_version_id, role, objective, evidence_required_json, escalation_json)
      VALUES (?, ?, ?, ?, ?, ?, 'tool', 'mock:phase1', 'created', ?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(
        id, workspaceId, projectId, workItemId, workItem.version, contextSlice.id,
        canonicalJson(contract.assignment.budgets), canonicalJson(contract.assignment.side_effect_policy), canonicalJson(contract.assignment.stop_conditions),
        isoNow(), pack.id, role, workItem.outcome, canonicalJson(contract.assignment.evidence_required), canonicalJson(contract.assignment.escalation)
      );
    this.store.recordEvent({ workspaceId, projectId, workItemId, eventType: 'assignment.created', actorType: 'system', entityType: 'assignment', entityId: id, entityVersion: 1, payload: { role, contextSliceId: contextSlice.id } });
    return { row: this.#scopedProject('assignments', id, workspaceId, projectId), contract };
  }

  startAssignment({ workspaceId, projectId, assignmentId }) {
    const assignment = this.#scopedProject('assignments', assignmentId, workspaceId, projectId);
    if (assignment.status !== 'created') throw new Error(`assignment_not_created:${assignment.status}`);
    const workItem = this.#workItem(workspaceId, projectId, assignment.work_item_id);
    if (workItem.version !== assignment.work_item_version) throw new Error('assignment_work_item_stale');
    this.db.prepare("UPDATE assignments SET status = 'running', started_at = ? WHERE id = ? AND workspace_id = ? AND project_id = ?").run(isoNow(), assignmentId, workspaceId, projectId);
    this.store.recordEvent({ workspaceId, projectId, workItemId: assignment.work_item_id, eventType: 'assignment.running', actorType: 'system', entityType: 'assignment', entityId: assignmentId, entityVersion: 1 });
    return this.#scopedProject('assignments', assignmentId, workspaceId, projectId);
  }

  finishAssignmentExecution({ workspaceId, projectId, assignmentId }) {
    const assignment = this.#scopedProject('assignments', assignmentId, workspaceId, projectId);
    if (assignment.status !== 'running') throw new Error(`assignment_not_running:${assignment.status}`);
    const workItem = this.#workItem(workspaceId, projectId, assignment.work_item_id);
    if (workItem.version !== assignment.work_item_version) throw new Error('assignment_work_item_stale');
    this.db.prepare("UPDATE assignments SET status = 'execution_finished', finished_at = ? WHERE id = ? AND workspace_id = ? AND project_id = ?").run(isoNow(), assignmentId, workspaceId, projectId);
    this.store.recordEvent({ workspaceId, projectId, workItemId: assignment.work_item_id, eventType: 'assignment.execution_finished', actorType: 'tool', actorId: 'mock:phase1', entityType: 'assignment', entityId: assignmentId, entityVersion: 1 });
    return this.#scopedProject('assignments', assignmentId, workspaceId, projectId);
  }

  addAssignmentEvidence({ workspaceId, projectId, assignmentId, level = 'L2', summary, evidenceType = 'phase1_mock_result' }) {
    const assignment = this.#scopedProject('assignments', assignmentId, workspaceId, projectId);
    if (assignment.status !== 'execution_finished') throw new Error(`assignment_execution_not_finished:${assignment.status}`);
    assertText(summary, 'summary');
    const id = crypto.randomUUID();
    this.db.prepare(`INSERT INTO evidence_references
      (id, workspace_id, project_id, work_item_id, level, evidence_type, summary, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`).run(id, workspaceId, projectId, assignment.work_item_id, level, evidenceType, summary.trim(), isoNow());
    this.store.recordEvent({ workspaceId, projectId, workItemId: assignment.work_item_id, eventType: 'assignment.evidence.recorded', actorType: 'tool', actorId: 'mock:phase1', entityType: 'evidence', entityId: id, payload: { assignmentId, level } });
    return this.#scopedProject('evidence_references', id, workspaceId, projectId);
  }

  verifyAssignment({ workspaceId, projectId, assignmentId, outcome, level = 'L2', summary }) {
    if (!['pass', 'fail'].includes(outcome)) throw new TypeError('verification_outcome_invalid');
    assertText(summary, 'summary');
    const assignment = this.#scopedProject('assignments', assignmentId, workspaceId, projectId);
    if (assignment.status !== 'execution_finished') throw new Error(`assignment_execution_not_finished:${assignment.status}`);
    const workItem = this.#workItem(workspaceId, projectId, assignment.work_item_id);
    if (workItem.version !== assignment.work_item_version) throw new Error('assignment_work_item_stale');
    const evidence = this.db.prepare('SELECT * FROM evidence_references WHERE workspace_id = ? AND project_id = ? AND work_item_id = ? ORDER BY created_at').all(workspaceId, projectId, workItem.id);
    if (outcome === 'pass' && evidence.length === 0) throw new Error('verification_evidence_required');

    return this.#transaction(() => {
      const runId = crypto.randomUUID();
      this.db.prepare(`INSERT INTO verification_runs
        (id, workspace_id, project_id, assignment_id, work_item_id, work_item_version, outcome, level, summary, evidence_json, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(
          runId, workspaceId, projectId, assignmentId, workItem.id, workItem.version, outcome, level, summary.trim(), canonicalJson(evidence.map((row) => row.id)), isoNow()
        );
      const now = isoNow();
      if (outcome === 'pass') {
        const result = this.db.prepare("UPDATE work_items SET status = 'complete', version = version + 1, updated_at = ? WHERE id = ? AND workspace_id = ? AND project_id = ? AND version = ? AND status = 'ready'")
          .run(now, workItem.id, workspaceId, projectId, workItem.version);
        if (Number(result.changes) !== 1) throw new Error('verified_completion_state_conflict');
        this.db.prepare("UPDATE assignments SET verification_status = 'passed' WHERE id = ? AND workspace_id = ?").run(assignmentId, workspaceId);
      } else {
        this.db.prepare("UPDATE work_items SET status = 'needs_attention', version = version + 1, updated_at = ? WHERE id = ? AND workspace_id = ? AND project_id = ? AND version = ?")
          .run(now, workItem.id, workspaceId, projectId, workItem.version);
        this.db.prepare("UPDATE assignments SET verification_status = 'failed' WHERE id = ? AND workspace_id = ?").run(assignmentId, workspaceId);
      }
      this.store.recordEvent({ workspaceId, projectId, workItemId: workItem.id, eventType: `verification.${outcome}`, actorType: 'system', entityType: 'verification_run', entityId: runId, entityVersion: 1, reason: summary, payload: { assignmentId, level, evidenceCount: evidence.length } });
      return {
        verification: this.#scopedProject('verification_runs', runId, workspaceId, projectId),
        workItem: this.#workItem(workspaceId, projectId, workItem.id),
        assignment: this.#scopedProject('assignments', assignmentId, workspaceId, projectId)
      };
    });
  }

  requestSpend({ workspaceId, projectId, workItemId = null, purpose, currency = 'USD', maxAmountMinor }) {
    this.#project(workspaceId, projectId);
    if (workItemId) this.#workItem(workspaceId, projectId, workItemId);
    assertText(purpose, 'purpose');
    assertText(currency, 'currency');
    assertNonNegativeInteger(maxAmountMinor, 'maxAmountMinor');
    const requestId = crypto.randomUUID();
    const envelopeId = crypto.randomUUID();
    const approval = this.store.requestApproval({
      workspaceId,
      projectId,
      subjectType: 'spend_envelope',
      subjectId: envelopeId,
      subjectVersion: 1,
      authorityReason: 'Incremental metered execution requires explicit prior bounds.',
      bounds: { requestId, purpose, currency, maxAmountMinor }
    });
    this.db.prepare(`INSERT INTO spend_requests
      (id, workspace_id, project_id, work_item_id, purpose, currency, max_amount_minor, approval_id, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(requestId, workspaceId, projectId, workItemId, purpose.trim(), currency.trim(), maxAmountMinor, approval.id, isoNow());
    this.store.recordEvent({ workspaceId, projectId, workItemId, eventType: 'spend.requested', actorType: 'system', entityType: 'spend_request', entityId: requestId, entityVersion: 1, payload: { envelopeId, maxAmountMinor, currency } });
    return { request: this.#scopedProject('spend_requests', requestId, workspaceId, projectId), approval, envelopeId };
  }

  resolveSpendRequest({ workspaceId, projectId, spendRequestId, decision, evidence = [] }) {
    if (!['approved', 'rejected'].includes(decision)) throw new TypeError('spend_decision_invalid');
    const request = this.#scopedProject('spend_requests', spendRequestId, workspaceId, projectId);
    if (request.status !== 'requested') throw new Error(`spend_request_not_requested:${request.status}`);
    const approval = this.resolveApproval({ workspaceId, projectId, approvalId: request.approval_id, decision, evidence });
    const bounds = parseJson(approval.bounds_json, {});
    const now = isoNow();
    if (decision === 'rejected') {
      this.db.prepare("UPDATE spend_requests SET status = 'rejected', resolved_at = ? WHERE id = ? AND workspace_id = ?").run(now, spendRequestId, workspaceId);
      return { request: this.#scopedProject('spend_requests', spendRequestId, workspaceId, projectId), approval, envelope: null };
    }
    const envelopeId = approval.subject_id;
    this.#transaction(() => {
      this.db.prepare(`INSERT INTO spend_envelopes
        (id, workspace_id, project_id, work_item_id, approval_id, purpose, currency, max_amount_minor, spent_amount_minor, status, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, 'approved', ?)`).run(
          envelopeId, workspaceId, projectId, request.work_item_id, approval.id, request.purpose, request.currency, request.max_amount_minor, now
        );
      this.db.prepare("UPDATE spend_requests SET status = 'approved', resolved_at = ? WHERE id = ? AND workspace_id = ?").run(now, spendRequestId, workspaceId);
      this.store.recordEvent({ workspaceId, projectId, workItemId: request.work_item_id, eventType: 'spend.envelope.approved', actorType: 'operator', entityType: 'spend_envelope', entityId: envelopeId, entityVersion: 1, payload: bounds });
    });
    return { request: this.#scopedProject('spend_requests', spendRequestId, workspaceId, projectId), approval, envelope: this.#scopedProject('spend_envelopes', envelopeId, workspaceId, projectId) };
  }

  executeMeteredAction({ workspaceId, projectId, workItemId = null, spendEnvelopeId = null, purpose, estimatedAmountMinor, actualAmountMinor = null, currency = 'USD' }) {
    this.#project(workspaceId, projectId);
    if (workItemId) this.#workItem(workspaceId, projectId, workItemId);
    assertText(purpose, 'purpose');
    if (estimatedAmountMinor === null || estimatedAmountMinor === undefined) throw new Error('cost_estimate_required');
    assertNonNegativeInteger(estimatedAmountMinor, 'estimatedAmountMinor');
    const actual = actualAmountMinor === null ? estimatedAmountMinor : actualAmountMinor;
    assertNonNegativeInteger(actual, 'actualAmountMinor');
    if (!spendEnvelopeId) throw new Error('spend_envelope_required');
    const envelope = this.#assertSpendEnvelope(workspaceId, projectId, workItemId, spendEnvelopeId, Math.max(estimatedAmountMinor, actual));
    if (envelope.currency !== currency) throw new Error('spend_currency_mismatch');
    if (envelope.purpose !== purpose) throw new Error('spend_purpose_mismatch');

    return this.#transaction(() => {
      const actionId = crypto.randomUUID();
      const now = isoNow();
      this.db.prepare(`INSERT INTO metered_actions
        (id, workspace_id, project_id, work_item_id, spend_envelope_id, purpose, estimated_amount_minor, actual_amount_minor, currency, status, created_at, executed_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'executed', ?, ?)`).run(
          actionId, workspaceId, projectId, workItemId, spendEnvelopeId, purpose, estimatedAmountMinor, actual, currency, now, now
        );
      const costId = crypto.randomUUID();
      this.db.prepare(`INSERT INTO cost_records
        (id, workspace_id, project_id, spend_envelope_id, amount_minor, currency, external_ref, incurred_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`).run(costId, workspaceId, projectId, spendEnvelopeId, actual, currency, `synthetic:${actionId}`, now);
      this.store.recordEvent({ workspaceId, projectId, workItemId, eventType: 'spend.metered_action.executed', actorType: 'tool', actorId: 'synthetic:phase1', entityType: 'metered_action', entityId: actionId, entityVersion: 1, payload: { estimatedAmountMinor, actualAmountMinor: actual, currency, envelopeId: spendEnvelopeId } });
      return {
        action: this.#scopedProject('metered_actions', actionId, workspaceId, projectId),
        cost: this.#scopedProject('cost_records', costId, workspaceId, projectId),
        envelope: this.#scopedProject('spend_envelopes', spendEnvelopeId, workspaceId, projectId)
      };
    });
  }

  getProjectCommandCenter({ workspaceId, projectId }) {
    const project = this.#project(workspaceId, projectId);
    const brief = project.current_brief_version ? this.#currentBrief(project) : null;
    const graph = this.getWorkGraph({ workspaceId, projectId });
    const attention = this.getNeedsAttention({ workspaceId, projectId });
    const activity = this.getActivityFeed({ workspaceId, projectId, limit: 100 });
    const activeAssignments = this.db.prepare("SELECT * FROM assignments WHERE workspace_id = ? AND project_id = ? AND status IN ('created','running','execution_finished') ORDER BY created_at").all(workspaceId, projectId)
      .map((row) => ({ ...row, recovery_state: row.status === 'running' ? 'in_flight_requires_reconciliation_after_restart' : 'persisted' }));
    const repositoryProposals = this.db.prepare('SELECT * FROM repository_proposals WHERE workspace_id = ? AND project_id = ? ORDER BY created_at').all(workspaceId, projectId);
    const packs = this.db.prepare('SELECT id, brief_version, version, status, content_sha256, created_at FROM project_pack_versions WHERE workspace_id = ? AND project_id = ? ORDER BY version').all(workspaceId, projectId);
    const spend = this.db.prepare('SELECT * FROM spend_envelopes WHERE workspace_id = ? AND project_id = ? ORDER BY created_at').all(workspaceId, projectId);
    const health = deriveHealth(project, attention);
    return {
      project: { ...project, derived_health: health },
      brief,
      workGraph: graph,
      nextReady: graph.nextReady,
      needsMyAttention: attention,
      activityFeed: activity,
      activeAssignments,
      repositoryProposals,
      projectPacks: packs,
      spendEnvelopes: spend
    };
  }

  getCommandCenter({ workspaceId }) {
    this.store.getWorkspace(workspaceId);
    const projects = this.db.prepare('SELECT * FROM projects WHERE workspace_id = ? ORDER BY updated_at DESC, id').all(workspaceId);
    return {
      workspace: this.store.getWorkspace(workspaceId),
      projects: projects.map((project) => {
        const attention = this.getNeedsAttention({ workspaceId, projectId: project.id });
        const graph = this.getWorkGraph({ workspaceId, projectId: project.id });
        return {
          id: project.id,
          title: project.title,
          kind: project.kind,
          phase: project.lifecycle_phase,
          status: project.operational_status,
          health: deriveHealth(project, attention),
          attentionCount: attention.length,
          nextReadyCount: graph.nextReady.length,
          currentBriefVersion: project.current_brief_version
        };
      }),
      needsMyAttention: this.getNeedsAttention({ workspaceId }),
      activityFeed: this.getActivityFeed({ workspaceId, limit: 100 })
    };
  }

  #assertSpendEnvelope(workspaceId, projectId, workItemId, spendEnvelopeId, requiredMinor) {
    if (!spendEnvelopeId) throw new Error('spend_envelope_required');
    const envelope = this.#scopedProject('spend_envelopes', spendEnvelopeId, workspaceId, projectId);
    if (envelope.status !== 'approved') throw new Error(`spend_envelope_unavailable:${envelope.status}`);
    if (workItemId && envelope.work_item_id && envelope.work_item_id !== workItemId) throw new Error('spend_envelope_work_item_mismatch');
    if ((envelope.max_amount_minor - envelope.spent_amount_minor) < requiredMinor) throw new Error('spend_envelope_exceeded');
    return envelope;
  }

  #packRecord(row) {
    return { ...row, content: row.content_json ? parseJson(row.content_json, null) : null, provenance: parseJson(row.provenance_json, {}) };
  }

  #project(workspaceId, projectId) { return this.#scoped('projects', projectId, workspaceId); }
  #workItem(workspaceId, projectId, workItemId) { return this.#scopedProject('work_items', workItemId, workspaceId, projectId); }
  #currentBrief(project) {
    if (!project.current_brief_version) throw new Error(`accepted_project_brief_required:${project.id}`);
    const row = this.db.prepare('SELECT * FROM project_briefs WHERE project_id = ? AND workspace_id = ? AND version = ? AND status = ?').get(project.id, project.workspace_id, project.current_brief_version, 'accepted');
    if (!row) throw new Error(`current_project_brief_missing:${project.id}:${project.current_brief_version}`);
    return row;
  }
  #scoped(table, id, workspaceId) {
    const allowed = new Set(['projects','project_pack_versions','context_slices','repository_proposals','approvals','assignments','evidence_references','verification_runs','spend_requests','spend_envelopes','cost_records','metered_actions']);
    if (!allowed.has(table)) throw new Error(`unsupported_phase1_table:${table}`);
    const row = this.db.prepare(`SELECT * FROM ${table} WHERE id = ? AND workspace_id = ?`).get(id, workspaceId);
    if (!row) throw new Error(`${table}_not_found_in_workspace:${id}:${workspaceId}`);
    return row;
  }
  #scopedProject(table, id, workspaceId, projectId) {
    const row = this.#scoped(table, id, workspaceId);
    if (row.project_id !== projectId) throw new Error(`${table}_not_found_in_project:${id}:${projectId}`);
    return row;
  }
  #transaction(fn) {
    this.db.exec('BEGIN IMMEDIATE');
    try { const result = fn(); this.db.exec('COMMIT'); return result; }
    catch (error) { this.db.exec('ROLLBACK'); throw error; }
  }
}

function deriveHealth(project, attention) {
  if (project.operational_status === 'failed' || project.operational_status === 'blocked' || attention.some((item) => item.type === 'work_item' && ['blocked','failed'].includes(item.detail.status))) return 'blocked';
  if (attention.length > 0) return 'at_risk';
  if (project.current_brief_version) return 'healthy';
  return 'unknown';
}
function isoNow() { return new Date().toISOString(); }
function parseJson(text, fallback) { try { return text ? JSON.parse(text) : fallback; } catch { return fallback; } }
function isNonEmptyString(value) { return typeof value === 'string' && value.trim() !== ''; }
function assertText(value, field) { if (!isNonEmptyString(value)) throw new TypeError(`${field}_required`); }
function assertNonNegativeInteger(value, field) { if (!Number.isInteger(value) || value < 0) throw new TypeError(`${field}_must_be_non_negative_integer`); }
