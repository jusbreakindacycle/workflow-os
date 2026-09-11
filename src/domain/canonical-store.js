// @ts-check
import crypto from 'node:crypto';

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

/** Thin domain persistence boundary for Gate 2 canonical semantics. */
export class CanonicalStore {
  /** @param {import('node:sqlite').DatabaseSync} db */
  constructor(db) { this.db = db; }

  createWorkspace({ id = crypto.randomUUID(), name }) {
    assertText(name, 'name');
    const now = isoNow();
    this.db.prepare('INSERT INTO workspaces (id, name, created_at, updated_at) VALUES (?, ?, ?, ?)').run(id, name, now, now);
    return this.getWorkspace(id);
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
    this.db.prepare('INSERT INTO clients (id, workspace_id, name, created_at, updated_at) VALUES (?, ?, ?, ?, ?)').run(id, workspaceId, name, now, now);
    return this.#getScoped('clients', id, workspaceId);
  }

  createEngagement({ id = crypto.randomUUID(), workspaceId, clientId = null, title, scopeSummary = null, priceSummary = null, deadlineAt = null, maintenanceSummary = null }) {
    this.#requireWorkspace(workspaceId);
    if (clientId) this.#getScoped('clients', clientId, workspaceId);
    assertText(title, 'title');
    const now = isoNow();
    this.db.prepare(`INSERT INTO engagements
      (id, workspace_id, client_id, title, scope_summary, price_summary, deadline_at, maintenance_summary, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(id, workspaceId, clientId, title, scopeSummary, priceSummary, deadlineAt, maintenanceSummary, now, now);
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
        VALUES (?, ?, ?, ?, ?, ?, ?)`).run(id, workspaceId, engagementId, kind, title, now, now);
      this.recordEvent({ workspaceId, projectId: id, eventType: 'project.created', actorType: 'operator', entityType: 'project', entityId: id, entityVersion: 1 });
      return this.#getScoped('projects', id, workspaceId);
    });
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
    const allowed = new Set(['clients','engagements','projects','work_items','work_item_proposals','decisions','approvals','project_events']);
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
function assertText(value, field) { if (typeof value !== 'string' || value.trim() === '') throw new TypeError(`${field}_required`); }
function assertPositiveInteger(value, field) { if (!Number.isInteger(value) || value < 1) throw new TypeError(`${field}_must_be_positive_integer`); }
function assertDeliveryStrategy(value) {
  const values = ['process_change','adopt_existing','configure','integrate','automate','custom_build','hybrid','research_pilot','defer'];
  if (!values.includes(value)) throw new TypeError(`invalid_delivery_strategy:${value}`);
}
function concurrencyError(entity, id, expected, actual = 'unknown') { return new Error(`concurrency_conflict:${entity}:${id}:expected=${expected}:actual=${actual}`); }
