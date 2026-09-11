// @ts-check
import crypto from 'node:crypto';

export const DELIVERY_STRATEGIES = Object.freeze([
  'process_change',
  'adopt_existing',
  'configure',
  'integrate',
  'automate',
  'custom_build',
  'hybrid',
  'research_pilot',
  'defer'
]);

export const DISCOVERY_QUESTIONS = Object.freeze([
  { key: 'problem', prompt: 'What problem needs to be solved?' },
  { key: 'desired_outcome', prompt: 'What should be different when this project succeeds?' },
  { key: 'primary_users', prompt: 'Who will use or benefit from the result?' },
  { key: 'constraints', prompt: 'What important limits, rules, deadlines, tools, or constraints do we already know?' },
  { key: 'success', prompt: 'How will we know the result is good enough to accept?' }
]);

const workItemTransitions = new Map([
  ['draft', new Set(['ready', 'canceled', 'stale', 'superseded'])],
  ['ready', new Set(['running', 'blocked', 'needs_attention', 'canceled', 'stale', 'superseded'])],
  ['running', new Set(['waiting_external', 'needs_attention', 'blocked', 'failed', 'canceled', 'stale', 'superseded'])],
  ['waiting_external', new Set(['ready', 'running', 'needs_attention', 'blocked', 'failed', 'canceled', 'stale', 'superseded'])],
  ['needs_attention', new Set(['ready', 'blocked', 'canceled', 'stale', 'superseded'])],
  ['blocked', new Set(['ready', 'failed', 'canceled', 'stale', 'superseded'])],
  ['failed', new Set(['ready', 'canceled', 'stale', 'superseded'])],
  ['complete', new Set(['stale', 'superseded'])],
  ['stale', new Set(['superseded'])],
  ['canceled', new Set()],
  ['superseded', new Set()]
]);

/** Thin domain persistence boundary for Phase 1 canonical semantics. */
export class CanonicalStore {
  /** @param {import('node:sqlite').DatabaseSync} db */
  constructor(db) { this.db = db; }

  createWorkspace({ id = crypto.randomUUID(), name }) {
    assertText(name, 'name');
    const now = isoNow();
    this.db.prepare('INSERT INTO workspaces (id, name, created_at, updated_at) VALUES (?, ?, ?, ?)').run(id, name.trim(), now, now);
    return this.getWorkspace(id);
  }

  listWorkspaces() {
    return this.db.prepare('SELECT * FROM workspaces ORDER BY created_at, id').all();
  }

  getWorkspace(id) {
    const row = this.db.prepare('SELECT * FROM workspaces WHERE id = ?').get(id);
    if (!row) throw new Error(`workspace_not_found:${id}`);
    return row;
  }

  createClient({ id = crypto.randomUUID(), workspaceId, name }) {
    this.#requireWorkspace(workspaceId);
    assertText(name, 'name');
    const now = isoNow();
    this.db.prepare('INSERT INTO clients (id, workspace_id, name, created_at, updated_at) VALUES (?, ?, ?, ?, ?)').run(id, workspaceId, name.trim(), now, now);
    return this.#getScoped('clients', id, workspaceId);
  }

  createEngagement({ id = crypto.randomUUID(), workspaceId, clientId = null, title, scopeSummary = null, priceSummary = null, deadlineAt = null, maintenanceSummary = null }) {
    this.#requireWorkspace(workspaceId);
    if (clientId) this.#getScoped('clients', clientId, workspaceId);
    assertText(title, 'title');
    const now = isoNow();
    this.db.prepare(`INSERT INTO engagements
      (id, workspace_id, client_id, title, scope_summary, price_summary, deadline_at, maintenance_summary, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(id, workspaceId, clientId, title.trim(), scopeSummary, priceSummary, deadlineAt, maintenanceSummary, now, now);
    return this.#getScoped('engagements', id, workspaceId);
  }

  createProject({ id = crypto.randomUUID(), workspaceId, engagementId = null, kind, title }) {
    this.#requireWorkspace(workspaceId);
    if (engagementId) this.#getScoped('engagements', engagementId, workspaceId);
    if (!['client_delivery', 'internal_product', 'experiment'].includes(kind)) throw new TypeError(`invalid_project_kind:${kind}`);
    assertText(title, 'title');
    return this.#transaction(() => {
      const now = isoNow();
      this.db.prepare(`INSERT INTO projects
        (id, workspace_id, engagement_id, kind, title, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)`).run(id, workspaceId, engagementId, kind, title.trim(), now, now);
      this.recordEvent({ workspaceId, projectId: id, eventType: 'project.created', actorType: 'operator', entityType: 'project', entityId: id, entityVersion: 1 });
      return this.#getScoped('projects', id, workspaceId);
    });
  }

  startProjectIntake({ id = crypto.randomUUID(), workspaceId, mode, title, rawRequest, requestedSolution = null, clientName = null, engagementTitle = null }) {
    this.#requireWorkspace(workspaceId);
    if (!['client', 'internal'].includes(mode)) throw new TypeError(`invalid_project_mode:${mode}`);
    assertText(title, 'title');
    assertText(rawRequest, 'rawRequest');
    if (mode === 'client') assertText(clientName, 'clientName');

    const ids = this.#transaction(() => {
      const now = isoNow();
      let clientId = null;
      let engagementId = null;
      if (mode === 'client') {
        clientId = crypto.randomUUID();
        this.db.prepare('INSERT INTO clients (id, workspace_id, name, created_at, updated_at) VALUES (?, ?, ?, ?, ?)')
          .run(clientId, workspaceId, String(clientName).trim(), now, now);
        engagementId = crypto.randomUUID();
        this.db.prepare(`INSERT INTO engagements
          (id, workspace_id, client_id, title, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?)`).run(engagementId, workspaceId, clientId, asNullableText(engagementTitle) ?? title.trim(), now, now);
      }

      const projectId = crypto.randomUUID();
      const kind = mode === 'client' ? 'client_delivery' : 'internal_product';
      this.db.prepare(`INSERT INTO projects
        (id, workspace_id, engagement_id, kind, title, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)`).run(projectId, workspaceId, engagementId, kind, title.trim(), now, now);
      this.recordEvent({ workspaceId, projectId, eventType: 'project.created', actorType: 'operator', entityType: 'project', entityId: projectId, entityVersion: 1 });

      this.db.prepare(`INSERT INTO project_intakes
        (id, workspace_id, project_id, input_class, raw_request, requested_solution, status, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, 'draft', ?, ?)`).run(
          id, workspaceId, projectId, mode === 'client' ? 'client_request' : 'internal_idea', rawRequest.trim(), asNullableText(requestedSolution), now, now
        );
      this.recordEvent({ workspaceId, projectId, eventType: 'project.intake.started', actorType: 'operator', entityType: 'project_intake', entityId: id, entityVersion: 1 });
      return { projectId, clientId, engagementId };
    });

    return this.getIntakeSnapshot({ workspaceId, intakeId: id, ...ids });
  }

  saveDiscoveryResponses({ workspaceId, intakeId, responses }) {
    if (!Array.isArray(responses) || responses.length === 0) throw new TypeError('responses_required');
    const intake = this.#getScoped('project_intakes', intakeId, workspaceId);
    if (intake.status === 'accepted') throw new Error('intake_already_accepted');
    const questionMap = new Map(DISCOVERY_QUESTIONS.map((question) => [question.key, question]));

    this.#transaction(() => {
      const now = isoNow();
      const statement = this.db.prepare(`INSERT INTO discovery_responses
        (id, workspace_id, project_id, intake_id, question_key, prompt, response_state, answer_text, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(intake_id, question_key) DO UPDATE SET
          prompt = excluded.prompt,
          response_state = excluded.response_state,
          answer_text = excluded.answer_text,
          updated_at = excluded.updated_at`);

      for (const response of responses) {
        if (!isRecord(response)) throw new TypeError('discovery_response_must_be_object');
        const questionKey = String(response.questionKey ?? '');
        const question = questionMap.get(questionKey);
        if (!question) throw new TypeError(`unknown_discovery_question:${questionKey}`);
        const responseState = String(response.responseState ?? '');
        if (!['answered', 'unknown', 'skipped'].includes(responseState)) throw new TypeError(`invalid_response_state:${responseState}`);
        let answerText = null;
        if (responseState === 'answered') {
          assertText(response.answerText, `${questionKey}.answerText`);
          answerText = String(response.answerText).trim();
        }
        statement.run(crypto.randomUUID(), workspaceId, intake.project_id, intakeId, questionKey, question.prompt, responseState, answerText, now, now);
      }

      this.db.prepare("UPDATE project_intakes SET status = CASE WHEN status = 'draft' THEN 'discovery' ELSE status END, updated_at = ? WHERE id = ? AND workspace_id = ?")
        .run(now, intakeId, workspaceId);
      this.recordEvent({ workspaceId, projectId: intake.project_id, eventType: 'project.discovery.saved', actorType: 'operator', entityType: 'project_intake', entityId: intakeId, payload: { responseCount: responses.length } });
    });

    return this.getIntakeSnapshot({ workspaceId, intakeId });
  }

  setWorkingDeliveryStrategy({ workspaceId, intakeId, strategy, rationale = null }) {
    assertDeliveryStrategy(strategy);
    const intake = this.#getScoped('project_intakes', intakeId, workspaceId);
    if (intake.status === 'accepted') throw new Error('intake_already_accepted');
    this.#transaction(() => {
      const now = isoNow();
      this.db.prepare("UPDATE delivery_strategy_decisions SET status = 'superseded' WHERE intake_id = ? AND status = 'working'").run(intakeId);
      this.db.prepare(`INSERT INTO delivery_strategy_decisions
        (id, workspace_id, project_id, intake_id, strategy, rationale, status, created_at)
        VALUES (?, ?, ?, ?, ?, ?, 'working', ?)`).run(
          crypto.randomUUID(), workspaceId, intake.project_id, intakeId, strategy, asNullableText(rationale), now
        );
      this.db.prepare("UPDATE project_intakes SET status = 'review', updated_at = ? WHERE id = ? AND workspace_id = ?").run(now, intakeId, workspaceId);
      this.recordEvent({ workspaceId, projectId: intake.project_id, eventType: 'project.delivery_strategy.selected', actorType: 'operator', entityType: 'project_intake', entityId: intakeId, payload: { strategy } });
    });
    return this.getIntakeSnapshot({ workspaceId, intakeId });
  }

  acceptProjectIntake({ workspaceId, intakeId, expectedProjectVersion }) {
    assertPositiveInteger(expectedProjectVersion, 'expectedProjectVersion');
    const intake = this.#getScoped('project_intakes', intakeId, workspaceId);
    if (intake.status === 'accepted') throw new Error('intake_already_accepted');

    this.#transaction(() => {
      const project = this.#getScoped('projects', intake.project_id, workspaceId);
      if (project.version !== expectedProjectVersion) throw concurrencyError('project', project.id, expectedProjectVersion, project.version);
      if (project.current_brief_version !== null) throw new Error('project_already_has_accepted_brief');

      const responses = this.db.prepare('SELECT * FROM discovery_responses WHERE intake_id = ? ORDER BY question_key').all(intakeId);
      const byKey = new Map(responses.map((row) => [row.question_key, row]));
      const problem = requireAnswered(byKey, 'problem');
      const desiredOutcome = requireAnswered(byKey, 'desired_outcome');
      const strategy = this.db.prepare("SELECT * FROM delivery_strategy_decisions WHERE intake_id = ? AND status = 'working'").get(intakeId);
      if (!strategy) throw new Error('delivery_strategy_required');

      const workingScope = {
        primaryUsers: answerValue(byKey.get('primary_users')),
        constraints: answerValue(byKey.get('constraints')),
        success: answerValue(byKey.get('success')),
        unknowns: responses.filter((row) => row.response_state === 'unknown').map((row) => row.question_key)
      };
      const briefId = crypto.randomUUID();
      const now = isoNow();
      this.db.prepare(`INSERT INTO project_briefs
        (id, workspace_id, project_id, version, status, problem, desired_outcome, requested_solution, delivery_strategy, working_scope_json, accepted_at, created_at)
        VALUES (?, ?, ?, 1, 'accepted', ?, ?, ?, ?, ?, ?, ?)`).run(
          briefId, workspaceId, project.id, problem, desiredOutcome, intake.requested_solution, strategy.strategy, toJson(workingScope), now, now
        );
      const result = this.db.prepare(`UPDATE projects
        SET current_brief_version = 1, version = version + 1, lifecycle_phase = 'definition', operational_status = 'ready', updated_at = ?
        WHERE id = ? AND workspace_id = ? AND version = ?`).run(now, project.id, workspaceId, expectedProjectVersion);
      if (Number(result.changes) !== 1) throw concurrencyError('project', project.id, expectedProjectVersion);
      this.db.prepare("UPDATE project_intakes SET status = 'accepted', accepted_at = ?, updated_at = ? WHERE id = ? AND workspace_id = ?").run(now, now, intakeId, workspaceId);
      this.db.prepare("UPDATE delivery_strategy_decisions SET status = 'accepted', accepted_at = ? WHERE id = ? AND status = 'working'").run(now, strategy.id);
      this.recordEvent({ workspaceId, projectId: project.id, eventType: 'project.brief.accepted', actorType: 'operator', entityType: 'project_brief', entityId: briefId, entityVersion: 1, reason: 'initial_intake_accepted' });
      this.recordEvent({ workspaceId, projectId: project.id, eventType: 'project.intake.accepted', actorType: 'operator', entityType: 'project_intake', entityId: intakeId, entityVersion: 1 });
    });

    return this.getIntakeSnapshot({ workspaceId, intakeId });
  }

  getIntakeSnapshot({ workspaceId, intakeId }) {
    const intake = this.#getScoped('project_intakes', intakeId, workspaceId);
    const project = this.#getScoped('projects', intake.project_id, workspaceId);
    const engagement = project.engagement_id ? this.#getScoped('engagements', project.engagement_id, workspaceId) : null;
    const client = engagement?.client_id ? this.#getScoped('clients', engagement.client_id, workspaceId) : null;
    const responses = this.db.prepare('SELECT * FROM discovery_responses WHERE intake_id = ? ORDER BY question_key').all(intakeId);
    const strategy = this.db.prepare("SELECT * FROM delivery_strategy_decisions WHERE intake_id = ? AND status IN ('working','accepted') ORDER BY created_at DESC LIMIT 1").get(intakeId) ?? null;
    const acceptedBrief = project.current_brief_version === null ? null : this.db.prepare('SELECT * FROM project_briefs WHERE project_id = ? AND version = ?').get(project.id, project.current_brief_version);
    return { intake, project, engagement, client, responses, strategy, acceptedBrief };
  }

  appendAcceptedProjectBrief({ id = crypto.randomUUID(), workspaceId, projectId, expectedProjectVersion, problem, desiredOutcome, requestedSolution = null, deliveryStrategy, workingScope = {}, reason = 'accepted_project_brief' }) {
    assertPositiveInteger(expectedProjectVersion, 'expectedProjectVersion');
    assertText(problem, 'problem');
    assertText(desiredOutcome, 'desiredOutcome');
    assertDeliveryStrategy(deliveryStrategy);
    return this.#transaction(() => {
      const project = this.#getScoped('projects', projectId, workspaceId);
      if (project.version !== expectedProjectVersion) throw concurrencyError('project', projectId, expectedProjectVersion, project.version);
      const nextBriefVersion = Number(project.current_brief_version ?? 0) + 1;
      const now = isoNow();
      this.db.prepare(`INSERT INTO project_briefs
        (id, workspace_id, project_id, version, status, problem, desired_outcome, requested_solution, delivery_strategy, working_scope_json, accepted_at, created_at)
        VALUES (?, ?, ?, ?, 'accepted', ?, ?, ?, ?, ?, ?, ?)`).run(
          id, workspaceId, projectId, nextBriefVersion, problem, desiredOutcome, requestedSolution, deliveryStrategy, toJson(workingScope), now, now
        );
      const result = this.db.prepare(`UPDATE projects
        SET current_brief_version = ?, version = version + 1, updated_at = ?
        WHERE id = ? AND workspace_id = ? AND version = ?`).run(nextBriefVersion, now, projectId, workspaceId, expectedProjectVersion);
      if (Number(result.changes) !== 1) throw concurrencyError('project', projectId, expectedProjectVersion);

      if (project.current_brief_version !== null) {
        const previous = this.db.prepare('SELECT id FROM project_briefs WHERE project_id = ? AND workspace_id = ? AND version = ?')
          .get(projectId, workspaceId, project.current_brief_version);
        if (!previous) throw new Error(`project_current_brief_missing:${projectId}:${project.current_brief_version}`);
        this.db.prepare("UPDATE project_briefs SET status = 'superseded' WHERE id = ? AND workspace_id = ? AND project_id = ? AND status = 'accepted'").run(previous.id, workspaceId, projectId);
        const revisionNumber = Number(this.db.prepare('SELECT COALESCE(MAX(revision_number), 0) AS n FROM project_revisions WHERE project_id = ?').get(projectId).n) + 1;
        this.db.prepare(`INSERT INTO project_revisions
          (id, workspace_id, project_id, revision_number, from_brief_id, to_brief_id, reason, impact_status, impact_json, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', '{}', ?)`).run(crypto.randomUUID(), workspaceId, projectId, revisionNumber, previous.id, id, reason, now);
      }

      this.recordEvent({ workspaceId, projectId, eventType: 'project.brief.accepted', actorType: 'operator', entityType: 'project_brief', entityId: id, entityVersion: nextBriefVersion, reason });
      return this.db.prepare('SELECT * FROM project_briefs WHERE id = ? AND workspace_id = ?').get(id, workspaceId);
    });
  }

  createWorkItem({ id = crypto.randomUUID(), workspaceId, projectId, class: workClass, title, outcome, status = 'draft', priority = 50, acceptance = {}, riskTier = 'R0' }) {
    this.#getScoped('projects', projectId, workspaceId);
    assertText(workClass, 'class');
    assertText(title, 'title');
    assertText(outcome, 'outcome');
    return this.#transaction(() => {
      const now = isoNow();
      this.db.prepare(`INSERT INTO work_items
        (id, workspace_id, project_id, class, title, outcome, status, priority, acceptance_json, risk_tier, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(id, workspaceId, projectId, workClass, title, outcome, status, priority, toJson(acceptance), riskTier, now, now);
      this.recordEvent({ workspaceId, projectId, workItemId: id, eventType: 'work_item.created', actorType: 'system', entityType: 'work_item', entityId: id, entityVersion: 1 });
      return this.#getScoped('work_items', id, workspaceId);
    });
  }

  addWorkDependency({ workspaceId, projectId, workItemId, dependsOnWorkItemId }) {
    this.#getWorkItem(workItemId, workspaceId, projectId);
    this.#getWorkItem(dependsOnWorkItemId, workspaceId, projectId);
    if (workItemId === dependsOnWorkItemId) throw new Error('self_dependency_not_allowed');
    this.db.prepare(`INSERT INTO work_dependencies
      (workspace_id, project_id, work_item_id, depends_on_work_item_id, created_at)
      VALUES (?, ?, ?, ?, ?)`).run(workspaceId, projectId, workItemId, dependsOnWorkItemId, isoNow());
  }

  transitionWorkItem({ workspaceId, projectId, workItemId, expectedVersion, toStatus, reason = null }) {
    assertPositiveInteger(expectedVersion, 'expectedVersion');
    return this.#transaction(() => {
      const current = this.#getWorkItem(workItemId, workspaceId, projectId);
      if (current.version !== expectedVersion) throw concurrencyError('work_item', workItemId, expectedVersion, current.version);
      const allowed = workItemTransitions.get(current.status);
      if (!allowed?.has(toStatus)) throw new Error(`invalid_work_item_transition:${current.status}->${toStatus}`);
      const now = isoNow();
      const staleReason = ['stale', 'superseded'].includes(toStatus) ? reason : null;
      const result = this.db.prepare(`UPDATE work_items
        SET status = ?, version = version + 1, stale_reason = ?, updated_at = ?
        WHERE id = ? AND workspace_id = ? AND project_id = ? AND version = ?`).run(
          toStatus, staleReason, now, workItemId, workspaceId, projectId, expectedVersion
        );
      if (Number(result.changes) !== 1) throw concurrencyError('work_item', workItemId, expectedVersion);
      const updated = this.#getWorkItem(workItemId, workspaceId, projectId);
      this.recordEvent({ workspaceId, projectId, workItemId, eventType: 'work_item.status_changed', actorType: 'system', entityType: 'work_item', entityId: workItemId, entityVersion: updated.version, reason, payload: { from: current.status, to: toStatus } });
      return updated;
    });
  }

  createWorkItemProposal({ id = crypto.randomUUID(), workspaceId, projectId, sourceWorkItemId = null, title, outcome, proposedClass, impact = {} }) {
    this.#getScoped('projects', projectId, workspaceId);
    if (sourceWorkItemId) this.#getWorkItem(sourceWorkItemId, workspaceId, projectId);
    const now = isoNow();
    this.db.prepare(`INSERT INTO work_item_proposals
      (id, workspace_id, project_id, source_work_item_id, title, outcome, proposed_class, impact_json, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(id, workspaceId, projectId, sourceWorkItemId, title, outcome, proposedClass, toJson(impact), now);
    return this.#getScoped('work_item_proposals', id, workspaceId);
  }

  createDecision({ id = crypto.randomUUID(), workspaceId, projectId, question, recommendation = null }) {
    this.#getScoped('projects', projectId, workspaceId);
    assertText(question, 'question');
    this.db.prepare(`INSERT INTO decisions
      (id, workspace_id, project_id, question, recommendation_json, created_at)
      VALUES (?, ?, ?, ?, ?, ?)`).run(id, workspaceId, projectId, question, recommendation === null ? null : toJson(recommendation), isoNow());
    return this.#getScoped('decisions', id, workspaceId);
  }

  requestApproval({ id = crypto.randomUUID(), workspaceId, projectId, subjectType, subjectId, subjectVersion, authorityReason, bounds = {}, evidence = [] }) {
    this.#getScoped('projects', projectId, workspaceId);
    assertPositiveInteger(subjectVersion, 'subjectVersion');
    this.db.prepare(`INSERT INTO approvals
      (id, workspace_id, project_id, subject_type, subject_id, subject_version, authority_reason, bounds_json, evidence_json, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(id, workspaceId, projectId, subjectType, subjectId, subjectVersion, authorityReason, toJson(bounds), toJson(evidence), isoNow());
    return this.#getScoped('approvals', id, workspaceId);
  }

  recordEvent({ id = crypto.randomUUID(), workspaceId, projectId, workItemId = null, eventType, actorType, actorId = null, entityType, entityId, entityVersion = null, reason = null, payload = {}, sensitivity = 'internal', idempotencyKey = null }) {
    this.#getScoped('projects', projectId, workspaceId);
    if (workItemId) this.#getWorkItem(workItemId, workspaceId, projectId);
    this.db.prepare(`INSERT INTO project_events
      (id, workspace_id, project_id, work_item_id, event_type, actor_type, actor_id, entity_type, entity_id, entity_version, reason, payload_json, sensitivity, idempotency_key, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(
        id, workspaceId, projectId, workItemId, eventType, actorType, actorId, entityType, entityId, entityVersion, reason, toJson(payload), sensitivity, idempotencyKey, isoNow()
      );
    return this.#getScoped('project_events', id, workspaceId);
  }

  #requireWorkspace(workspaceId) { this.getWorkspace(workspaceId); }

  #getScoped(table, id, workspaceId) {
    const allowed = new Set(['clients','engagements','projects','work_items','work_item_proposals','decisions','approvals','project_events','project_intakes']);
    if (!allowed.has(table)) throw new Error(`unsupported_scoped_table:${table}`);
    const row = this.db.prepare(`SELECT * FROM ${table} WHERE id = ? AND workspace_id = ?`).get(id, workspaceId);
    if (!row) throw new Error(`${table}_not_found_in_workspace:${id}:${workspaceId}`);
    return row;
  }

  #getWorkItem(id, workspaceId, projectId) {
    const row = this.db.prepare('SELECT * FROM work_items WHERE id = ? AND workspace_id = ? AND project_id = ?').get(id, workspaceId, projectId);
    if (!row) throw new Error(`work_item_not_found_in_project:${id}:${projectId}:${workspaceId}`);
    return row;
  }

  #transaction(fn) {
    this.db.exec('BEGIN IMMEDIATE');
    try { const value = fn(); this.db.exec('COMMIT'); return value; }
    catch (error) { this.db.exec('ROLLBACK'); throw error; }
  }
}

function isoNow() { return new Date().toISOString(); }
function toJson(value) { return JSON.stringify(value); }
function isRecord(value) { return typeof value === 'object' && value !== null && !Array.isArray(value); }
function assertText(value, field) { if (typeof value !== 'string' || value.trim() === '') throw new TypeError(`${field}_required`); }
function asNullableText(value) { return typeof value === 'string' && value.trim() !== '' ? value.trim() : null; }
function assertPositiveInteger(value, field) { if (!Number.isInteger(value) || value < 1) throw new TypeError(`${field}_must_be_positive_integer`); }
function assertDeliveryStrategy(value) {
  if (!DELIVERY_STRATEGIES.includes(value)) throw new TypeError(`invalid_delivery_strategy:${value}`);
}
function requireAnswered(byKey, key) {
  const response = byKey.get(key);
  if (!response || response.response_state !== 'answered') throw new Error(`discovery_required:${key}`);
  return response.answer_text;
}
function answerValue(response) {
  if (!response) return null;
  if (response.response_state === 'answered') return response.answer_text;
  return { state: response.response_state };
}
function concurrencyError(entity, id, expected, actual = 'unknown') { return new Error(`concurrency_conflict:${entity}:${id}:expected=${expected}:actual=${actual}`); }
