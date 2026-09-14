// @ts-check
import crypto from 'node:crypto';
import { CanonicalStore } from './canonical-store.js';
import { Phase1ControlPlane } from './phase1-control-plane.js';
import { canonicalJson, sha256Json } from './contracts.js';

const RISK_TIERS = new Set(['R0', 'R1', 'R2', 'R3']);
const ACTION_CLASSES = new Set(['read_only', 'durable_external_mutation', 'production_or_destructive']);
const AUTHORITY = new Set(['none', 'exact_approval', 'approval_and_spend']);
const RECONCILIATION = new Set(['confirmed', 'not_applied', 'drifted', 'uncertain']);

export class Phase40ExternalActions {
  /** @param {import('node:sqlite').DatabaseSync} db */
  constructor(db) {
    this.db = db;
    this.store = new CanonicalStore(db);
    this.controlPlane = new Phase1ControlPlane(db);
  }

  createPlan({
    workspaceId,
    projectId,
    workItemId = null,
    assignmentId = null,
    adapterClass,
    actionKind,
    target,
    preconditions = {},
    inputRefs = [],
    inputSha256,
    riskTier = 'R2',
    actionClass = 'durable_external_mutation',
    requiredAuthority = 'exact_approval',
    spendEnvelopeId = null,
    verification = {},
    recovery = {},
    expiresAt = null,
    supersedesPlanId = null
  }) {
    const project = this.#project(workspaceId, projectId);
    const workItem = workItemId ? this.#workItem(workspaceId, projectId, workItemId) : null;
    if (!isText(adapterClass) || !isText(actionKind)) throw new TypeError('external_action_kind_required');
    if (!target || typeof target !== 'object' || Array.isArray(target)) throw new TypeError('external_action_target_required');
    if (!isText(inputSha256)) throw new TypeError('external_action_input_sha256_required');
    if (!RISK_TIERS.has(riskTier)) throw new TypeError('external_action_risk_invalid');
    if (!ACTION_CLASSES.has(actionClass)) throw new TypeError('external_action_class_invalid');
    if (!AUTHORITY.has(requiredAuthority)) throw new TypeError('external_action_authority_invalid');
    if (actionClass !== 'read_only' && requiredAuthority === 'none') throw new Error('external_action_mutation_requires_authority');
    if (requiredAuthority !== 'none' && !workItem) throw new Error('external_action_authorized_mutation_requires_work_item');
    if (!Array.isArray(inputRefs)) throw new TypeError('external_action_input_refs_invalid');
    if (assignmentId) this.#assignment(workspaceId, projectId, assignmentId, workItemId);
    if (spendEnvelopeId) this.#spendEnvelope(workspaceId, projectId, spendEnvelopeId, workItemId);

    let supersedes = null;
    if (supersedesPlanId) {
      supersedes = this.#plan(workspaceId, projectId, supersedesPlanId);
      if (['executing', 'reconciling'].includes(supersedes.status)) throw new Error('external_action_cannot_supersede_active_plan');
    }

    const version = supersedes ? Number(supersedes.version) + 1 : 1;
    const content = {
      workspaceId,
      projectId,
      workItemId,
      assignmentId,
      version,
      projectVersion: Number(project.version),
      workItemVersion: workItem ? Number(workItem.version) : null,
      adapterClass: adapterClass.trim(),
      actionKind: actionKind.trim(),
      target,
      preconditions,
      inputRefs,
      inputSha256: inputSha256.trim(),
      riskTier,
      actionClass,
      requiredAuthority,
      spendEnvelopeId,
      verification,
      recovery,
      expiresAt,
      supersedesPlanId
    };
    const planSha256 = sha256Json(content);
    const idempotencyKey = `phase40:${planSha256}`;
    const existing = this.db.prepare('SELECT * FROM external_action_plans WHERE workspace_id=? AND idempotency_key=?').get(workspaceId, idempotencyKey);
    if (existing) return this.getPlan({ workspaceId, projectId, planId: existing.id });

    const id = crypto.randomUUID();
    const now = isoNow();
    this.#transaction(() => {
      if (supersedes && supersedes.status !== 'superseded') {
        this.db.prepare("UPDATE external_action_plans SET status='superseded', updated_at=? WHERE id=? AND workspace_id=? AND project_id=?").run(now, supersedes.id, workspaceId, projectId);
      }
      this.db.prepare(`INSERT INTO external_action_plans
        (id,workspace_id,project_id,work_item_id,version,project_version,work_item_version,adapter_class,action_kind,target_json,input_sha256,plan_sha256,risk_tier,action_class,required_authority,spend_envelope_id,idempotency_key,verification_json,recovery_json,status,expires_at,created_at,updated_at)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,'proposed',?,?,?)`).run(
        id, workspaceId, projectId, workItemId, version, project.version, workItem?.version ?? null,
        adapterClass.trim(), actionKind.trim(), canonicalJson(target), inputSha256.trim(), planSha256,
        riskTier, actionClass, requiredAuthority, spendEnvelopeId, idempotencyKey,
        canonicalJson(verification), canonicalJson(recovery), expiresAt, now, now
      );
      this.db.prepare(`INSERT INTO external_action_plan_details
        (plan_id,workspace_id,project_id,assignment_id,preconditions_json,input_refs_json,supersedes_plan_id)
        VALUES (?,?,?,?,?,?,?)`).run(id, workspaceId, projectId, assignmentId, canonicalJson(preconditions), canonicalJson(inputRefs), supersedesPlanId);
      this.store.recordEvent({ workspaceId, projectId, workItemId, eventType: 'external_action.plan_created', actorType: 'system', entityType: 'external_action_plan', entityId: id, entityVersion: version, payload: { adapterClass, actionKind, planSha256, idempotencyKey } });
    });
    return this.getPlan({ workspaceId, projectId, planId: id });
  }

  requestAuthority({ workspaceId, projectId, planId }) {
    const plan = this.#plan(workspaceId, projectId, planId);
    if (plan.status !== 'proposed') throw new Error(`external_action_plan_not_proposed:${plan.status}`);
    if (plan.required_authority === 'none') {
      if (plan.action_class !== 'read_only') throw new Error('external_action_mutation_requires_authority');
      this.db.prepare("UPDATE external_action_plans SET status='authorized',authorized_at=?,updated_at=? WHERE id=? AND workspace_id=? AND project_id=?").run(isoNow(), isoNow(), planId, workspaceId, projectId);
      return { plan: this.#plan(workspaceId, projectId, planId), approval: null };
    }
    if (!plan.work_item_id) throw new Error('external_action_authority_work_item_required');
    if (plan.approval_id) return { plan: this.getPlan({ workspaceId, projectId, planId }), approval: this.#approval(workspaceId, projectId, plan.approval_id) };

    const approval = this.store.requestApproval({
      workspaceId,
      projectId,
      subjectType: 'work_item',
      subjectId: plan.work_item_id,
      subjectVersion: Number(plan.work_item_version),
      authorityReason: `External action requires exact authority: ${plan.adapter_class}/${plan.action_kind}`,
      bounds: {
        externalActionPlanId: plan.id,
        externalActionPlanVersion: Number(plan.version),
        planSha256: plan.plan_sha256,
        idempotencyKey: plan.idempotency_key,
        adapterClass: plan.adapter_class,
        actionKind: plan.action_kind,
        targetSha256: sha256Json(parseJson(plan.target_json, {})),
        actionClass: plan.action_class,
        riskTier: plan.risk_tier
      }
    });
    this.db.prepare('UPDATE external_action_plans SET approval_id=?,updated_at=? WHERE id=? AND workspace_id=? AND project_id=?').run(approval.id, isoNow(), planId, workspaceId, projectId);
    this.store.recordEvent({ workspaceId, projectId, workItemId: plan.work_item_id, eventType: 'external_action.approval_requested', actorType: 'system', entityType: 'external_action_plan', entityId: planId, entityVersion: plan.version, payload: { approvalId: approval.id } });
    return { plan: this.getPlan({ workspaceId, projectId, planId }), approval };
  }

  resolveAuthority({ workspaceId, projectId, planId, decision, evidence = [] }) {
    const plan = this.#plan(workspaceId, projectId, planId);
    if (!plan.approval_id) throw new Error('external_action_approval_required');
    const approval = this.controlPlane.resolveApproval({ workspaceId, projectId, approvalId: plan.approval_id, decision, evidence });
    const next = decision === 'approved' ? 'authorized' : 'rejected';
    if (decision === 'approved') this.#assertFresh(plan, { requireApproval: true });
    const now = isoNow();
    this.db.prepare('UPDATE external_action_plans SET status=?,authorized_at=CASE WHEN ?="authorized" THEN ? ELSE authorized_at END,updated_at=? WHERE id=? AND workspace_id=? AND project_id=?').run(next, next, now, now, planId, workspaceId, projectId);
    this.store.recordEvent({ workspaceId, projectId, workItemId: plan.work_item_id, eventType: `external_action.${next}`, actorType: 'operator', entityType: 'external_action_plan', entityId: planId, entityVersion: plan.version, payload: { approvalId: approval.id } });
    return { plan: this.getPlan({ workspaceId, projectId, planId }), approval };
  }

  preflight({ workspaceId, projectId, planId }) {
    const plan = this.#plan(workspaceId, projectId, planId);
    const blockers = this.#freshnessBlockers(plan, { requireApproval: plan.required_authority !== 'none' });
    if (plan.status !== 'authorized') blockers.push(`status:${plan.status}`);
    const unresolved = this.db.prepare(`SELECT a.id FROM external_action_attempts a
      WHERE a.plan_id=? AND a.status='uncertain'
      AND NOT EXISTS (SELECT 1 FROM action_reconciliation_records r WHERE r.attempt_id=a.id AND r.classification IN ('confirmed','not_applied','drifted')) LIMIT 1`).get(planId);
    if (unresolved) blockers.push(`unreconciled_uncertain_attempt:${unresolved.id}`);
    return { ok: blockers.length === 0, blockers, plan: this.getPlan({ workspaceId, projectId, planId }) };
  }

  startAttempt({ workspaceId, projectId, planId, adapterProvider, adapterVersion, operationKind, requestDescriptor = {} }) {
    if (![adapterProvider, adapterVersion, operationKind].every(isText)) throw new TypeError('external_action_attempt_identity_required');
    const preflight = this.preflight({ workspaceId, projectId, planId });
    if (!preflight.ok) {
      this.db.prepare("UPDATE external_action_plans SET status='blocked',updated_at=? WHERE id=? AND workspace_id=? AND project_id=? AND status='authorized'").run(isoNow(), planId, workspaceId, projectId);
      throw new Error(`external_action_preflight_blocked:${preflight.blockers.join('|')}`);
    }
    const plan = this.#plan(workspaceId, projectId, planId);
    const attemptNumber = Number(this.db.prepare('SELECT COALESCE(MAX(attempt_number),0)+1 AS n FROM external_action_attempts WHERE plan_id=?').get(planId).n);
    const id = crypto.randomUUID();
    const now = isoNow();
    const requestSha256 = sha256Json({ planSha256: plan.plan_sha256, adapterProvider, adapterVersion, operationKind, requestDescriptor });
    this.#transaction(() => {
      this.db.prepare("UPDATE external_action_plans SET status='executing',updated_at=? WHERE id=? AND workspace_id=? AND project_id=? AND status='authorized'").run(now, planId, workspaceId, projectId);
      this.db.prepare(`INSERT INTO external_action_attempts
        (id,workspace_id,project_id,plan_id,attempt_number,adapter_provider,adapter_version,operation_kind,request_sha256,status,started_at)
        VALUES (?,?,?,?,?,?,?,?,?,'started',?)`).run(id, workspaceId, projectId, planId, attemptNumber, adapterProvider.trim(), adapterVersion.trim(), operationKind.trim(), requestSha256, now);
      this.store.recordEvent({ workspaceId, projectId, workItemId: plan.work_item_id, eventType: 'external_action.attempt_started', actorType: 'tool', actorId: adapterProvider.trim(), entityType: 'external_action_attempt', entityId: id, entityVersion: attemptNumber, payload: { planId, requestSha256 } });
    });
    return this.#attempt(workspaceId, projectId, id);
  }

  finishAttempt({ workspaceId, projectId, attemptId, outcome, result = {}, providerOperationRef = null, providerResourceRef = null, errorClass = null }) {
    if (!['succeeded', 'failed', 'uncertain'].includes(outcome)) throw new TypeError('external_action_attempt_outcome_invalid');
    const attempt = this.#attempt(workspaceId, projectId, attemptId);
    if (attempt.status !== 'started') throw new Error(`external_action_attempt_not_started:${attempt.status}`);
    const plan = this.#plan(workspaceId, projectId, attempt.plan_id);
    if (plan.status !== 'executing') throw new Error(`external_action_plan_not_executing:${plan.status}`);
    const planStatus = outcome === 'succeeded' ? 'reconciling' : outcome === 'uncertain' ? 'uncertain' : 'failed';
    const now = isoNow();
    this.#transaction(() => {
      this.db.prepare(`UPDATE external_action_attempts SET status=?,normalized_result=?,provider_operation_ref=?,provider_resource_ref=?,error_class=?,result_json=?,finished_at=?
        WHERE id=? AND workspace_id=? AND project_id=?`).run(outcome, outcome, providerOperationRef, providerResourceRef, errorClass, canonicalJson(result), now, attemptId, workspaceId, projectId);
      this.db.prepare('UPDATE external_action_plans SET status=?,updated_at=? WHERE id=? AND workspace_id=? AND project_id=?').run(planStatus, now, plan.id, workspaceId, projectId);
      this.store.recordEvent({ workspaceId, projectId, workItemId: plan.work_item_id, eventType: `external_action.attempt_${outcome}`, actorType: 'tool', actorId: attempt.adapter_provider, entityType: 'external_action_attempt', entityId: attemptId, entityVersion: attempt.attempt_number, payload: { planId: plan.id, errorClass } });
    });
    return { attempt: this.#attempt(workspaceId, projectId, attemptId), plan: this.getPlan({ workspaceId, projectId, planId: plan.id }) };
  }

  reconcile({ workspaceId, projectId, attemptId, classification, observedState = {}, summary = null }) {
    if (!RECONCILIATION.has(classification)) throw new TypeError('external_action_reconciliation_invalid');
    const attempt = this.#attempt(workspaceId, projectId, attemptId);
    if (!['succeeded', 'uncertain'].includes(attempt.status)) throw new Error(`external_action_attempt_not_reconcilable:${attempt.status}`);
    const plan = this.#plan(workspaceId, projectId, attempt.plan_id);
    if (!['reconciling', 'uncertain'].includes(plan.status)) throw new Error(`external_action_plan_not_reconciling:${plan.status}`);
    const existing = this.db.prepare('SELECT * FROM action_reconciliation_records WHERE attempt_id=? ORDER BY created_at DESC LIMIT 1').get(attemptId);
    if (existing && existing.classification !== 'uncertain') return { reconciliation: existing, plan: this.getPlan({ workspaceId, projectId, planId: plan.id }) };

    const observedSha256 = sha256Json(observedState);
    const evidenceId = crypto.randomUUID();
    const reconciliationId = crypto.randomUUID();
    const now = isoNow();
    const nextStatus = classification === 'confirmed' ? 'verified' : classification === 'not_applied' ? 'authorized' : classification === 'drifted' ? 'blocked' : 'uncertain';
    this.#transaction(() => {
      this.db.prepare(`INSERT INTO evidence_references
        (id,workspace_id,project_id,work_item_id,level,evidence_type,summary,created_at)
        VALUES (?,?,?,?, 'L3','external_action_reconciliation',?,?)`).run(
          evidenceId, workspaceId, projectId, plan.work_item_id,
          summary ?? canonicalJson({ planId: plan.id, attemptId, classification, observedSha256 }), now
        );
      this.db.prepare(`INSERT INTO action_reconciliation_records
        (id,workspace_id,project_id,plan_id,attempt_id,classification,state_hash,evidence_id,created_at)
        VALUES (?,?,?,?,?,?,?,?,?)`).run(reconciliationId, workspaceId, projectId, plan.id, attemptId, classification, observedSha256, evidenceId, now);
      this.db.prepare('UPDATE external_action_plans SET status=?,updated_at=? WHERE id=? AND workspace_id=? AND project_id=?').run(nextStatus, now, plan.id, workspaceId, projectId);
      this.store.recordEvent({ workspaceId, projectId, workItemId: plan.work_item_id, eventType: `external_action.reconciled_${classification}`, actorType: 'system', entityType: 'external_action_plan', entityId: plan.id, entityVersion: plan.version, payload: { attemptId, evidenceId, observedSha256 } });
    });
    return { reconciliation: this.db.prepare('SELECT * FROM action_reconciliation_records WHERE id=?').get(reconciliationId), plan: this.getPlan({ workspaceId, projectId, planId: plan.id }) };
  }

  complete({ workspaceId, projectId, planId }) {
    const plan = this.#plan(workspaceId, projectId, planId);
    if (plan.status !== 'verified') throw new Error(`external_action_plan_not_verified:${plan.status}`);
    const now = isoNow();
    this.db.prepare("UPDATE external_action_plans SET status='complete',completed_at=?,updated_at=? WHERE id=? AND workspace_id=? AND project_id=?").run(now, now, planId, workspaceId, projectId);
    this.store.recordEvent({ workspaceId, projectId, workItemId: plan.work_item_id, eventType: 'external_action.complete', actorType: 'system', entityType: 'external_action_plan', entityId: planId, entityVersion: plan.version });
    return this.getPlan({ workspaceId, projectId, planId });
  }

  getPlan({ workspaceId, projectId, planId }) {
    const plan = this.#plan(workspaceId, projectId, planId);
    const details = this.db.prepare('SELECT * FROM external_action_plan_details WHERE plan_id=? AND workspace_id=? AND project_id=?').get(planId, workspaceId, projectId) ?? null;
    const attempts = this.db.prepare('SELECT * FROM external_action_attempts WHERE plan_id=? AND workspace_id=? AND project_id=? ORDER BY attempt_number').all(planId, workspaceId, projectId);
    const reconciliations = this.db.prepare('SELECT * FROM action_reconciliation_records WHERE plan_id=? AND workspace_id=? AND project_id=? ORDER BY created_at').all(planId, workspaceId, projectId);
    const approval = plan.approval_id ? this.#approval(workspaceId, projectId, plan.approval_id) : null;
    return {
      ...plan,
      target: parseJson(plan.target_json, {}),
      verification: parseJson(plan.verification_json, {}),
      recovery: parseJson(plan.recovery_json, {}),
      details: details ? { ...details, preconditions: parseJson(details.preconditions_json, {}), inputRefs: parseJson(details.input_refs_json, []) } : null,
      approval,
      attempts,
      reconciliations
    };
  }

  getProjectState({ workspaceId, projectId }) {
    this.#project(workspaceId, projectId);
    const plans = this.db.prepare('SELECT id FROM external_action_plans WHERE workspace_id=? AND project_id=? ORDER BY created_at,id').all(workspaceId, projectId).map((row) => this.getPlan({ workspaceId, projectId, planId: row.id }));
    const attention = plans.filter((plan) => ['blocked', 'failed', 'uncertain'].includes(plan.status) || (plan.status === 'proposed' && plan.required_authority !== 'none')).map((plan) => ({
      type: 'external_action',
      planId: plan.id,
      status: plan.status,
      target: plan.target,
      approvalStatus: plan.approval?.status ?? null,
      reason: plan.status === 'uncertain' ? 'External effect is uncertain; reconcile before retry.' : plan.status === 'blocked' ? 'External action is blocked by preflight/authority state.' : plan.status === 'failed' ? 'External action attempt failed.' : 'Exact external-action approval is required.'
    }));
    return { projectId, plans, needsAttention: attention };
  }

  #freshnessBlockers(plan, { requireApproval }) {
    const blockers = [];
    const project = this.db.prepare('SELECT * FROM projects WHERE id=? AND workspace_id=?').get(plan.project_id, plan.workspace_id);
    if (!project || Number(project.version) !== Number(plan.project_version)) blockers.push('project_version_stale');
    if (plan.work_item_id) {
      const item = this.db.prepare('SELECT * FROM work_items WHERE id=? AND project_id=? AND workspace_id=?').get(plan.work_item_id, plan.project_id, plan.workspace_id);
      if (!item || Number(item.version) !== Number(plan.work_item_version)) blockers.push('work_item_version_stale');
    }
    if (plan.expires_at && Date.parse(plan.expires_at) <= Date.now()) blockers.push('plan_expired');
    if (requireApproval) {
      const approval = plan.approval_id ? this.db.prepare('SELECT * FROM approvals WHERE id=? AND project_id=? AND workspace_id=?').get(plan.approval_id, plan.project_id, plan.workspace_id) : null;
      if (!approval || approval.status !== 'approved') blockers.push('approval_missing_or_not_approved');
      else {
        const bounds = parseJson(approval.bounds_json, {});
        if (bounds.externalActionPlanId !== plan.id || Number(bounds.externalActionPlanVersion) !== Number(plan.version) || bounds.planSha256 !== plan.plan_sha256 || bounds.idempotencyKey !== plan.idempotency_key) blockers.push('approval_bounds_mismatch');
      }
    }
    if (plan.required_authority === 'approval_and_spend') {
      const envelope = plan.spend_envelope_id ? this.db.prepare('SELECT * FROM spend_envelopes WHERE id=? AND project_id=? AND workspace_id=?').get(plan.spend_envelope_id, plan.project_id, plan.workspace_id) : null;
      if (!envelope || envelope.status !== 'approved' || Number(envelope.spent_amount_minor) >= Number(envelope.max_amount_minor)) blockers.push('spend_envelope_unavailable');
    }
    return blockers;
  }

  #assertFresh(plan, options) {
    const blockers = this.#freshnessBlockers(plan, options);
    if (blockers.length) throw new Error(`external_action_authority_stale_or_missing:${blockers.join('|')}`);
  }

  #project(workspaceId, projectId) {
    const row = this.db.prepare('SELECT * FROM projects WHERE id=? AND workspace_id=?').get(projectId, workspaceId);
    if (!row) throw new Error(`project_not_found:${projectId}`);
    return row;
  }
  #workItem(workspaceId, projectId, workItemId) {
    const row = this.db.prepare('SELECT * FROM work_items WHERE id=? AND project_id=? AND workspace_id=?').get(workItemId, projectId, workspaceId);
    if (!row) throw new Error(`work_item_not_found:${workItemId}`);
    return row;
  }
  #assignment(workspaceId, projectId, assignmentId, workItemId) {
    const row = this.db.prepare('SELECT * FROM assignments WHERE id=? AND project_id=? AND workspace_id=?').get(assignmentId, projectId, workspaceId);
    if (!row || (workItemId && row.work_item_id !== workItemId)) throw new Error(`assignment_not_found_or_scope_mismatch:${assignmentId}`);
    return row;
  }
  #spendEnvelope(workspaceId, projectId, spendEnvelopeId, workItemId) {
    const row = this.db.prepare('SELECT * FROM spend_envelopes WHERE id=? AND project_id=? AND workspace_id=?').get(spendEnvelopeId, projectId, workspaceId);
    if (!row || (workItemId && row.work_item_id && row.work_item_id !== workItemId)) throw new Error(`spend_envelope_not_found_or_scope_mismatch:${spendEnvelopeId}`);
    return row;
  }
  #plan(workspaceId, projectId, planId) {
    const row = this.db.prepare('SELECT * FROM external_action_plans WHERE id=? AND project_id=? AND workspace_id=?').get(planId, projectId, workspaceId);
    if (!row) throw new Error(`external_action_plan_not_found:${planId}`);
    return row;
  }
  #attempt(workspaceId, projectId, attemptId) {
    const row = this.db.prepare('SELECT * FROM external_action_attempts WHERE id=? AND project_id=? AND workspace_id=?').get(attemptId, projectId, workspaceId);
    if (!row) throw new Error(`external_action_attempt_not_found:${attemptId}`);
    return row;
  }
  #approval(workspaceId, projectId, approvalId) {
    const row = this.db.prepare('SELECT * FROM approvals WHERE id=? AND project_id=? AND workspace_id=?').get(approvalId, projectId, workspaceId);
    if (!row) throw new Error(`approval_not_found:${approvalId}`);
    return row;
  }
  #transaction(fn) {
    this.db.exec('BEGIN IMMEDIATE');
    try { const value = fn(); this.db.exec('COMMIT'); return value; }
    catch (error) { try { this.db.exec('ROLLBACK'); } catch {} throw error; }
  }
}

function isText(value) { return typeof value === 'string' && value.trim().length > 0; }
function parseJson(value, fallback) { try { return JSON.parse(value ?? ''); } catch { return fallback; } }
function isoNow() { return new Date().toISOString(); }
