// @ts-check
import crypto from 'node:crypto';
import { canonicalJson, sha256Json } from './contracts.js';
import { Phase40ExternalActions } from './phase40-external-actions.js';

const ALLOWED_OPERATIONS = Object.freeze(['create_delivery_branch','write_verified_snapshot','open_pull_request','read_checks','reconcile']);
const VERIFIED_LEVELS = new Set(['L3','L4','L5']);

export class Phase41SourceControl {
  /** @param {import('node:sqlite').DatabaseSync} db @param {{workspaceRuntime:any,adapter:any}} options */
  constructor(db, { workspaceRuntime, adapter }) {
    if (!workspaceRuntime) throw new TypeError('source_control_workspace_runtime_required');
    if (!adapter) throw new TypeError('source_control_adapter_required');
    this.db = db;
    this.workspaceRuntime = workspaceRuntime;
    this.adapter = adapter;
    this.external = new Phase40ExternalActions(db);
  }

  compilePlan({ workspaceId, projectId, workItemId, repository, baseRef = 'main', baseCommit, deliveryBranch, commitMessage, prTitle, prBody, checksPolicy = { required: false } }) {
    const item = this.#workItem(workspaceId, projectId, workItemId);
    if (![repository, baseRef, baseCommit, deliveryBranch, commitMessage, prTitle, prBody].every(isText)) throw new TypeError('source_control_plan_fields_required');
    if (deliveryBranch === baseRef) throw new Error('source_control_default_or_base_branch_write_forbidden');
    if (!safeBranch(deliveryBranch)) throw new TypeError('source_control_delivery_branch_invalid');
    const workspace = this.workspaceRuntime.get({ workspaceId, projectId });
    if (!['prepared','active'].includes(workspace.status)) throw new Error(`source_control_execution_workspace_unavailable:${workspace.status}`);
    if (!Array.isArray(workspace.manifest) || workspace.manifest.length === 0) throw new Error('source_control_verified_artifact_manifest_required');
    this.#assertVerifiedArtifact(workspaceId, projectId);

    const manifest = normalizeManifest(workspace.manifest);
    const artifactManifestSha256 = sha256Json(manifest);
    const projectedTreeSha256 = sha256Json(manifest.map((entry) => ({ path: entry.path, sha256: entry.sha256, size: entry.size })));
    const target = {
      provider: this.adapter.provider,
      repository: repository.trim(),
      baseRef: baseRef.trim(),
      baseCommit: baseCommit.trim(),
      deliveryBranch: deliveryBranch.trim(),
      prBase: baseRef.trim(),
      prHead: deliveryBranch.trim()
    };
    const preconditions = {
      expectedBaseCommit: baseCommit.trim(),
      artifactManifestSha256,
      projectedTreeSha256,
      commitMessage: commitMessage.trim(),
      prTitle: prTitle.trim(),
      prBody: prBody.trim(),
      allowedOperations: ALLOWED_OPERATIONS,
      checksPolicy,
      workItemVersion: Number(item.version)
    };
    const external = this.external.createPlan({
      workspaceId, projectId, workItemId,
      adapterClass: 'source_control',
      actionKind: 'branch_commit_pull_request_bundle',
      target,
      preconditions,
      inputRefs: [`execution_workspace:${workspace.id}`, `artifact_manifest:${artifactManifestSha256}`],
      inputSha256: projectedTreeSha256,
      riskTier: 'R2',
      actionClass: 'durable_external_mutation',
      requiredAuthority: 'exact_approval',
      verification: { minimum: 'L3', checksPolicy },
      recovery: { kind: 'reconcile_before_retry', maxAttempts: 2 }
    });

    const existing = this.db.prepare('SELECT * FROM source_control_delivery_plans WHERE external_action_plan_id=?').get(external.id);
    if (!existing) {
      const id = crypto.randomUUID();
      const time = now();
      this.db.prepare(`INSERT INTO source_control_delivery_plans
        (id,workspace_id,project_id,work_item_id,external_action_plan_id,provider,repository_ref,base_ref,base_commit,delivery_branch,execution_workspace_id,artifact_manifest_json,artifact_manifest_sha256,projected_tree_sha256,commit_message,pr_title,pr_body,allowed_operations_json,checks_policy_json,status,created_at,updated_at)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,'proposed',?,?)`).run(
          id, workspaceId, projectId, workItemId, external.id, this.adapter.provider, repository.trim(), baseRef.trim(), baseCommit.trim(), deliveryBranch.trim(), workspace.id,
          canonicalJson(manifest), artifactManifestSha256, projectedTreeSha256, commitMessage.trim(), prTitle.trim(), prBody.trim(), canonicalJson(ALLOWED_OPERATIONS), canonicalJson(checksPolicy), time, time
        );
      this.#event(workspaceId, projectId, workItemId, 'phase41.source_control_plan.compiled', id, { externalActionPlanId: external.id, repository: repository.trim(), baseRef: baseRef.trim(), deliveryBranch: deliveryBranch.trim(), artifactManifestSha256, projectedTreeSha256 });
    }
    return this.get({ workspaceId, projectId, externalActionPlanId: external.id });
  }

  requestAuthority({ workspaceId, projectId, externalActionPlanId }) {
    const result = this.external.requestAuthority({ workspaceId, projectId, planId: externalActionPlanId });
    this.#syncStatus(workspaceId, projectId, externalActionPlanId, result.plan.status);
    return { ...result, sourceControl: this.get({ workspaceId, projectId, externalActionPlanId }) };
  }

  resolveAuthority({ workspaceId, projectId, externalActionPlanId, decision, evidence = [] }) {
    const result = this.external.resolveAuthority({ workspaceId, projectId, planId: externalActionPlanId, decision, evidence });
    this.#syncStatus(workspaceId, projectId, externalActionPlanId, result.plan.status);
    return { ...result, sourceControl: this.get({ workspaceId, projectId, externalActionPlanId }) };
  }

  async execute({ workspaceId, projectId, externalActionPlanId }) {
    const delivery = this.#delivery(workspaceId, projectId, externalActionPlanId);
    const external = this.external.getPlan({ workspaceId, projectId, planId: externalActionPlanId });
    this.#assertCurrentArtifact(delivery);
    this.#assertRemotePreconditions(external);
    const preflight = this.external.preflight({ workspaceId, projectId, planId: externalActionPlanId });
    if (!preflight.ok) throw new Error(`source_control_external_preflight_blocked:${preflight.blockers.join('|')}`);

    const files = this.#readManifestFiles(workspaceId, projectId, parseJson(delivery.artifact_manifest_json, []));
    const attempt = this.external.startAttempt({
      workspaceId, projectId, planId: externalActionPlanId,
      adapterProvider: this.adapter.provider,
      adapterVersion: this.adapter.version,
      operationKind: 'branch_commit_pull_request_bundle',
      requestDescriptor: { repository: delivery.repository_ref, baseCommit: delivery.base_commit, deliveryBranch: delivery.delivery_branch, treeSha256: delivery.projected_tree_sha256 }
    });
    this.#syncStatus(workspaceId, projectId, externalActionPlanId, 'executing');

    let effect;
    try {
      effect = await this.adapter.executeBundle(external, files);
    } catch (error) {
      effect = { outcome: 'uncertain', errorClass: 'transport_uncertain', result: { message: error instanceof Error ? error.message : String(error) } };
    }
    const finished = this.external.finishAttempt({
      workspaceId, projectId, attemptId: attempt.id, outcome: effect.outcome,
      result: effect.result ?? {}, providerOperationRef: effect.providerOperationRef ?? null,
      providerResourceRef: effect.providerResourceRef ?? null, errorClass: effect.errorClass ?? null
    });
    this.#syncStatus(workspaceId, projectId, externalActionPlanId, finished.plan.status);
    if (effect.outcome === 'failed') return this.get({ workspaceId, projectId, externalActionPlanId });
    return this.reconcile({ workspaceId, projectId, externalActionPlanId, attemptId: attempt.id });
  }

  async reconcile({ workspaceId, projectId, externalActionPlanId, attemptId }) {
    const external = this.external.getPlan({ workspaceId, projectId, planId: externalActionPlanId });
    const observed = await this.adapter.reconcile(external);
    const reconciled = this.external.reconcile({
      workspaceId, projectId, attemptId,
      classification: observed.classification,
      observedState: observed.observedState ?? {},
      summary: canonicalJson({ sourceControl: true, classification: observed.classification, repository: external.target.repository, observed: observed.observedState ?? {} })
    });
    this.#syncStatus(workspaceId, projectId, externalActionPlanId, reconciled.plan.status);
    if (observed.classification === 'confirmed') {
      const completed = this.external.complete({ workspaceId, projectId, planId: externalActionPlanId });
      this.#syncStatus(workspaceId, projectId, externalActionPlanId, completed.status);
    }
    return this.get({ workspaceId, projectId, externalActionPlanId });
  }

  get({ workspaceId, projectId, externalActionPlanId }) {
    const delivery = this.#delivery(workspaceId, projectId, externalActionPlanId);
    const external = this.external.getPlan({ workspaceId, projectId, planId: externalActionPlanId });
    if (delivery.status !== external.status) this.#syncStatus(workspaceId, projectId, externalActionPlanId, external.status);
    return {
      ...delivery,
      status: external.status,
      artifactManifest: parseJson(delivery.artifact_manifest_json, []),
      allowedOperations: parseJson(delivery.allowed_operations_json, []),
      checksPolicy: parseJson(delivery.checks_policy_json, {}),
      externalAction: external
    };
  }

  #assertRemotePreconditions(external) {
    const repository = this.adapter.inspectRepository({ repository: external.target.repository });
    if (!repository?.available) throw new Error('source_control_repository_unavailable');
    if (repository.defaultBranch === external.target.deliveryBranch) throw new Error('source_control_default_branch_write_forbidden');
    const base = this.adapter.resolveRef({ repository: external.target.repository, ref: external.target.baseRef });
    if (!base || base.sha !== external.target.baseCommit) throw new Error('source_control_base_drift');
  }

  #assertCurrentArtifact(delivery) {
    const workspace = this.workspaceRuntime.get({ workspaceId: delivery.workspace_id, projectId: delivery.project_id });
    const current = normalizeManifest(workspace.manifest);
    if (sha256Json(current) !== delivery.artifact_manifest_sha256) throw new Error('source_control_artifact_manifest_drift');
    if (sha256Json(current.map((entry) => ({ path: entry.path, sha256: entry.sha256, size: entry.size }))) !== delivery.projected_tree_sha256) throw new Error('source_control_projected_tree_drift');
  }

  #readManifestFiles(workspaceId, projectId, manifest) {
    return manifest.map((entry) => {
      const content = this.workspaceRuntime.readFile({ workspaceId, projectId, relativePath: entry.path });
      const bytes = Buffer.from(content, 'utf8');
      const hash = crypto.createHash('sha256').update(bytes).digest('hex');
      if (hash !== entry.sha256 || bytes.length !== Number(entry.size)) throw new Error(`source_control_artifact_file_drift:${entry.path}`);
      if (content.includes('\u0000')) throw new Error(`source_control_binary_artifact_not_supported:${entry.path}`);
      return { path: entry.path, content, sha256: hash, size: bytes.length };
    });
  }

  #assertVerifiedArtifact(workspaceId, projectId) {
    const evidence = this.db.prepare("SELECT level FROM evidence_references WHERE workspace_id=? AND project_id=? AND evidence_type='independent_verification' ORDER BY created_at DESC LIMIT 1").get(workspaceId, projectId);
    if (!evidence || !VERIFIED_LEVELS.has(evidence.level)) throw new Error('source_control_independent_L3_verification_required');
  }

  #delivery(workspaceId, projectId, externalActionPlanId) {
    const row = this.db.prepare('SELECT * FROM source_control_delivery_plans WHERE workspace_id=? AND project_id=? AND external_action_plan_id=?').get(workspaceId, projectId, externalActionPlanId);
    if (!row) throw new Error(`source_control_delivery_plan_not_found:${externalActionPlanId}`);
    return row;
  }
  #workItem(workspaceId, projectId, workItemId) {
    const row = this.db.prepare('SELECT * FROM work_items WHERE workspace_id=? AND project_id=? AND id=?').get(workspaceId, projectId, workItemId);
    if (!row) throw new Error(`source_control_work_item_not_found:${workItemId}`);
    return row;
  }
  #syncStatus(workspaceId, projectId, externalActionPlanId, status) {
    this.db.prepare('UPDATE source_control_delivery_plans SET status=?,updated_at=? WHERE workspace_id=? AND project_id=? AND external_action_plan_id=?').run(status, now(), workspaceId, projectId, externalActionPlanId);
  }
  #event(workspaceId, projectId, workItemId, eventType, entityId, payload) {
    this.db.prepare(`INSERT INTO project_events
      (id,workspace_id,project_id,work_item_id,event_type,actor_type,entity_type,entity_id,payload_json,sensitivity,created_at)
      VALUES (?,?,?,?,?,'system','source_control_delivery_plan',?,?,'internal',?)`).run(crypto.randomUUID(), workspaceId, projectId, workItemId, eventType, entityId, canonicalJson(payload), now());
  }
}

function normalizeManifest(value) {
  if (!Array.isArray(value)) throw new TypeError('source_control_manifest_invalid');
  return value.map((entry) => ({ path: String(entry.path), size: Number(entry.size), sha256: String(entry.sha256) })).sort((a,b) => a.path.localeCompare(b.path));
}
function safeBranch(value) { return typeof value === 'string' && /^[A-Za-z0-9._/-]+$/.test(value) && !value.includes('..') && !value.startsWith('/') && !value.endsWith('/') && !value.includes('//'); }
function isText(value) { return typeof value === 'string' && value.trim().length > 0; }
function parseJson(value, fallback) { try { return JSON.parse(value ?? ''); } catch { return fallback; } }
function now() { return new Date().toISOString(); }
