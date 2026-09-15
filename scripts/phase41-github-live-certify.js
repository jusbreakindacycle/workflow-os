import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { openDatabase } from '../src/db/database.js';
import { CanonicalStore } from '../src/domain/canonical-store.js';
import { Phase41SourceControl } from '../src/domain/phase41-source-control.js';
import { assertCertificationBranchSafety, loadPhase41LiveGitHubCertificationConfig } from '../src/domain/phase41-live-github-certification.js';
import { GovernedWorkspace } from '../src/runtime/governed-workspace.js';
import { GitHubSourceControlAdapter } from '../src/runtime/github-source-control-adapter.js';

const config = loadPhase41LiveGitHubCertificationConfig(process.env);
const dataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'workflow-os-phase41-github-live-'));
const { db, migrations } = openDatabase({ databasePath: path.join(dataDir, 'cert.sqlite'), dataDir, migrationsDir: path.resolve('migrations') });

try {
  const adapter = new GitHubSourceControlAdapter();
  const repository = await adapter.inspectRepository({ repository: config.repository });
  assertCertificationBranchSafety({ defaultBranch: repository.defaultBranch, ...config });
  const defaultRef = await adapter.resolveRef({ repository: config.repository, ref: repository.defaultBranch });
  if (!defaultRef?.sha) throw new Error('live_github_cert_default_branch_unresolved');

  for (const branch of [config.successBranch, config.driftBaseBranch, config.staleDeliveryBranch]) {
    if (await adapter.resolveRef({ repository: config.repository, ref: branch })) {
      throw new Error(`live_github_cert_remote_state_not_clean:${branch}`);
    }
  }

  const store = new CanonicalStore(db);
  const workspace = store.createWorkspace({ name: `Phase 4.1 GitHub Live Certification ${config.runId}` });
  const project = store.createProject({ workspaceId: workspace.id, kind: 'internal_product', title: `GitHub live certification ${config.runId}` });
  const successItem = store.createWorkItem({ workspaceId: workspace.id, projectId: project.id, class: 'delivery', title: 'Certify real GitHub source-control delivery', outcome: 'Create and reconcile one exact non-default branch, commit and pull request', status: 'ready', riskTier: 'R2' });
  const staleItem = store.createWorkItem({ workspaceId: workspace.id, projectId: project.id, class: 'verification', title: 'Prove real GitHub stale-base rejection', outcome: 'Block a plan after its non-default base branch changes', status: 'ready', riskTier: 'R2' });

  const runtime = new GovernedWorkspace(db, { rootDir: path.join(dataDir, 'execution-workspaces') });
  runtime.prepare({ workspaceId: workspace.id, projectId: project.id });
  runtime.writeFile({ workspaceId: workspace.id, projectId: project.id, relativePath: 'certification/result.txt', content: `workflow-os phase 4.1 live github certification\nrun=${config.runId}\n` });
  runtime.writeFile({ workspaceId: workspace.id, projectId: project.id, relativePath: 'certification/manifest.json', content: `${JSON.stringify({ phase: '4.1', runId: config.runId, synthetic: true }, null, 2)}\n` });
  db.prepare(`INSERT INTO evidence_references
    (id,workspace_id,project_id,work_item_id,level,evidence_type,summary,created_at)
    VALUES (?,?,?,?, 'L3','independent_verification','Synthetic live-certification artifact independently verified before external delivery.',?)`).run(crypto.randomUUID(), workspace.id, project.id, successItem.id, new Date().toISOString());

  const source = new Phase41SourceControl(db, { workspaceRuntime: runtime, adapter });

  // Case 1: real branch + commit + PR + reconciliation.
  const successPlan = approve(source, workspace.id, project.id, source.compilePlan({
    workspaceId: workspace.id,
    projectId: project.id,
    workItemId: successItem.id,
    repository: config.repository,
    baseRef: repository.defaultBranch,
    baseCommit: defaultRef.sha,
    deliveryBranch: config.successBranch,
    commitMessage: `cert: phase 4.1 live github ${config.runId}`,
    prTitle: `Phase 4.1 controlled certification ${config.runId}`,
    prBody: `Synthetic Workflow OS Phase 4.1 live certification. Run: ${config.runId}. Do not merge; this PR exists only as certification evidence.`,
    checksPolicy: { required: false }
  }), `live-github-cert-success:${config.runId}`);

  const first = await source.execute({ workspaceId: workspace.id, projectId: project.id, externalActionPlanId: successPlan.external_action_plan_id });
  if (first.status !== 'complete') throw new Error(`live_github_cert_success_not_complete:${first.status}`);
  if (first.externalAction.attempts.length !== 1) throw new Error('live_github_cert_success_attempt_count_invalid');
  if (first.externalAction.reconciliations.at(-1)?.classification !== 'confirmed') throw new Error('live_github_cert_success_not_confirmed');

  // Case 2: idempotent re-entry must create no second attempt/effect.
  const second = await source.execute({ workspaceId: workspace.id, projectId: project.id, externalActionPlanId: successPlan.external_action_plan_id });
  if (second.status !== 'complete') throw new Error(`live_github_cert_idempotent_not_complete:${second.status}`);
  if (second.externalAction.attempts.length !== 1) throw new Error('live_github_cert_idempotent_created_duplicate_attempt');
  const confirmed = await adapter.reconcile(second.externalAction);
  if (confirmed.classification !== 'confirmed') throw new Error(`live_github_cert_idempotent_remote_not_confirmed:${confirmed.classification}`);

  // Case 3 setup: create a dedicated non-default base branch, approve against its exact SHA,
  // then advance only that disposable base branch before execution.
  await createRef(config.repository, config.driftBaseBranch, defaultRef.sha);
  const driftBaseInitial = await adapter.resolveRef({ repository: config.repository, ref: config.driftBaseBranch });
  if (!driftBaseInitial?.sha) throw new Error('live_github_cert_drift_base_creation_failed');

  const stalePlan = approve(source, workspace.id, project.id, source.compilePlan({
    workspaceId: workspace.id,
    projectId: project.id,
    workItemId: staleItem.id,
    repository: config.repository,
    baseRef: config.driftBaseBranch,
    baseCommit: driftBaseInitial.sha,
    deliveryBranch: config.staleDeliveryBranch,
    commitMessage: `cert: stale base should never apply ${config.runId}`,
    prTitle: `THIS SHOULD NOT OPEN ${config.runId}`,
    prBody: 'This pull request must never be created because the approved base becomes stale before execution.',
    checksPolicy: { required: false }
  }), `live-github-cert-stale:${config.runId}`);

  const driftBaseAdvanced = await advanceNonDefaultBranch(config.repository, config.driftBaseBranch, driftBaseInitial.sha, config.runId);
  if (driftBaseAdvanced === driftBaseInitial.sha) throw new Error('live_github_cert_drift_setup_did_not_advance_base');

  let staleBlocked = false;
  try {
    await source.execute({ workspaceId: workspace.id, projectId: project.id, externalActionPlanId: stalePlan.external_action_plan_id });
  } catch (error) {
    if (!String(error instanceof Error ? error.message : error).includes('source_control_base_drift')) throw error;
    staleBlocked = true;
  }
  if (!staleBlocked) throw new Error('live_github_cert_stale_base_was_not_blocked');
  const staleState = source.get({ workspaceId: workspace.id, projectId: project.id, externalActionPlanId: stalePlan.external_action_plan_id });
  if (staleState.status !== 'blocked') throw new Error(`live_github_cert_stale_plan_status_invalid:${staleState.status}`);
  if (staleState.externalAction.attempts.length !== 0) throw new Error('live_github_cert_stale_plan_reached_provider_attempt');
  if (await adapter.resolveRef({ repository: config.repository, ref: config.staleDeliveryBranch })) throw new Error('live_github_cert_stale_delivery_branch_was_created');
  const staleObserved = await adapter.reconcile(staleState.externalAction);
  if (staleObserved.classification !== 'not_applied') throw new Error(`live_github_cert_stale_effect_not_cleanly_absent:${staleObserved.classification}`);

  console.log(JSON.stringify({
    phase: 'phase-4.1-github-live',
    passed: true,
    migrations,
    provider: 'github',
    realExternalSideEffects: true,
    repository: config.repository,
    defaultBranch: repository.defaultBranch,
    runId: config.runId,
    cases: {
      successfulDelivery: {
        passed: true,
        deliveryBranch: config.successBranch,
        attemptCount: second.externalAction.attempts.length,
        reconciliation: confirmed.classification,
        pullRequest: confirmed.observedState?.pullRequest?.url ?? second.externalAction.mappings?.[0]?.resource_ref ?? null
      },
      idempotentReentry: {
        passed: true,
        duplicateAttemptCreated: false,
        attemptCountAfterReentry: second.externalAction.attempts.length
      },
      staleBaseRejection: {
        passed: true,
        driftBaseBranch: config.driftBaseBranch,
        approvedBaseCommit: driftBaseInitial.sha,
        observedBaseCommitAfterDrift: driftBaseAdvanced,
        staleDeliveryBranch: config.staleDeliveryBranch,
        planStatus: staleState.status,
        providerAttemptCount: staleState.externalAction.attempts.length,
        remoteEffect: staleObserved.classification
      }
    },
    mergeAuthority: false,
    defaultBranchMutationByHarness: false,
    cleanupRequired: [config.successBranch, config.driftBaseBranch],
    note: 'The certification intentionally leaves its non-default branches and PR for operator review/cleanup. It never merges or deletes them.'
  }, null, 2));
} finally {
  db.close();
  fs.rmSync(dataDir, { recursive: true, force: true });
}

function approve(source, workspaceId, projectId, compiled, evidence) {
  const requested = source.requestAuthority({ workspaceId, projectId, externalActionPlanId: compiled.external_action_plan_id });
  if (requested.approval?.status !== 'requested') throw new Error('live_github_cert_approval_not_requested');
  const resolved = source.resolveAuthority({ workspaceId, projectId, externalActionPlanId: compiled.external_action_plan_id, decision: 'approved', evidence: [evidence] });
  if (resolved.plan.status !== 'authorized') throw new Error(`live_github_cert_approval_not_authorized:${resolved.plan.status}`);
  return resolved.sourceControl;
}

async function createRef(repository, branch, sha) {
  await githubRequest(repository, 'POST', '/git/refs', { ref: `refs/heads/${branch}`, sha });
}

async function advanceNonDefaultBranch(repository, branch, parentSha, runId) {
  const parent = await githubRequest(repository, 'GET', `/git/commits/${encodeURIComponent(parentSha)}`);
  const blob = await githubRequest(repository, 'POST', '/git/blobs', { content: `deliberate harmless drift for ${runId}\n`, encoding: 'utf-8' });
  const tree = await githubRequest(repository, 'POST', '/git/trees', {
    base_tree: parent.tree.sha,
    tree: [{ path: `certification/drift-${runId}.txt`, mode: '100644', type: 'blob', sha: blob.sha }]
  });
  const commit = await githubRequest(repository, 'POST', '/git/commits', {
    message: `test: create deliberate certification base drift ${runId}`,
    tree: tree.sha,
    parents: [parentSha]
  });
  await githubRequest(repository, 'PATCH', `/git/refs/heads/${encodeURIComponent(branch)}`, { sha: commit.sha, force: false });
  return commit.sha;
}

async function githubRequest(repository, method, suffix, body = null) {
  const token = process.env.WORKFLOW_OS_GITHUB_TOKEN;
  const response = await fetch(`https://api.github.com/repos/${repository}${suffix}`, {
    method,
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token}`,
      'X-GitHub-Api-Version': '2022-11-28',
      ...(body ? { 'content-type': 'application/json' } : {})
    },
    body: body ? JSON.stringify(body) : undefined
  });
  const text = await response.text();
  const data = text ? JSON.parse(text) : {};
  if (!response.ok) throw new Error(`live_github_cert_setup_http_${response.status}:${data?.message ?? text}`);
  return data;
}
