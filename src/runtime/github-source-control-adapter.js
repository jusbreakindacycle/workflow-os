// @ts-check
import crypto from 'node:crypto';

export class GitHubSourceControlAdapter {
  constructor({ tokenEnv = 'WORKFLOW_OS_GITHUB_TOKEN', fetchFn = globalThis.fetch, apiBase = 'https://api.github.com' } = {}) {
    this.provider = 'github';
    this.version = 'phase-4.1-github-v1';
    this.tokenEnv = tokenEnv;
    this.fetchFn = fetchFn;
    this.apiBase = apiBase.replace(/\/$/, '');
  }

  health() { return { available: Boolean(process.env[this.tokenEnv]), provider: this.provider, version: this.version, credentialRef: `env:${this.tokenEnv}` }; }
  capabilities() { return ['source_control_read','source_control_branch_write','source_control_commit_write','source_control_pull_request_write','source_control_checks_read']; }

  async inspectRepository({ repository }) {
    const data = await this.#request('GET', `/repos/${repoPath(repository)}`, null, { mutation: false });
    return { provider: this.provider, repository: data.full_name, defaultBranch: data.default_branch, visibility: data.visibility ?? (data.private ? 'private' : 'public'), available: true };
  }

  async resolveRef({ repository, ref }) {
    try {
      const data = await this.#request('GET', `/repos/${repoPath(repository)}/git/ref/heads/${encodeURIComponent(ref)}`, null, { mutation: false });
      return { ref, sha: data.object?.sha ?? null };
    } catch (error) {
      if (error instanceof GitHubAdapterError && error.errorClass === 'repository_or_ref_not_found') return null;
      throw error;
    }
  }

  async executeBundle(plan, files) {
    let mutated = false;
    try {
      const target = plan.target;
      const preconditions = plan.details?.preconditions ?? {};
      const repository = await this.inspectRepository({ repository: target.repository });
      if (repository.defaultBranch === target.deliveryBranch) return failed('source_control_default_branch_write_forbidden');
      const base = await this.resolveRef({ repository: target.repository, ref: target.baseRef });
      if (!base || base.sha !== target.baseCommit) return failed('source_control_base_drift');

      const currentBranch = await this.resolveRef({ repository: target.repository, ref: target.deliveryBranch });
      if (currentBranch) {
        const reconciled = await this.reconcile(plan);
        if (reconciled.classification === 'confirmed') {
          return { outcome: 'succeeded', providerOperationRef: reconciled.observedState.commit, providerResourceRef: reconciled.observedState.pullRequest?.url ?? null, result: { reused: true, observed: reconciled.observedState } };
        }
        return failed('source_control_branch_collision_drift');
      }

      await this.#request('POST', `/repos/${repoPath(target.repository)}/git/refs`, { ref: `refs/heads/${target.deliveryBranch}`, sha: target.baseCommit }, { mutation: true });
      mutated = true;
      const treeEntries = [];
      for (const file of files) {
        const blob = await this.#request('POST', `/repos/${repoPath(target.repository)}/git/blobs`, { content: file.content, encoding: 'utf-8' }, { mutation: true });
        mutated = true;
        treeEntries.push({ path: file.path, mode: '100644', type: 'blob', sha: blob.sha });
      }
      const tree = await this.#request('POST', `/repos/${repoPath(target.repository)}/git/trees`, { tree: treeEntries }, { mutation: true });
      mutated = true;
      const commit = await this.#request('POST', `/repos/${repoPath(target.repository)}/git/commits`, { message: preconditions.commitMessage, tree: tree.sha, parents: [target.baseCommit] }, { mutation: true });
      mutated = true;
      await this.#request('PATCH', `/repos/${repoPath(target.repository)}/git/refs/heads/${encodeURIComponent(target.deliveryBranch)}`, { sha: commit.sha, force: false }, { mutation: true });
      mutated = true;

      let pr = await this.#findPullRequest(plan);
      if (!pr) {
        pr = await this.#request('POST', `/repos/${repoPath(target.repository)}/pulls`, { title: preconditions.prTitle, body: preconditions.prBody, head: target.deliveryBranch, base: target.baseRef }, { mutation: true });
        mutated = true;
      }
      return { outcome: 'succeeded', providerOperationRef: commit.sha, providerResourceRef: pr.html_url ?? String(pr.number), result: { branch: target.deliveryBranch, commit: commit.sha, tree: tree.sha, pullRequest: normalizePr(pr) } };
    } catch (error) {
      if (mutated) throw new GitHubAdapterError('partial_mutation_requires_reconciliation', error instanceof Error ? error.message : String(error), false);
      if (error instanceof GitHubAdapterError && error.effectKnownAbsent) return failed(error.errorClass);
      throw error;
    }
  }

  async reconcile(plan) {
    const target = plan.target;
    const preconditions = plan.details?.preconditions ?? {};
    const branch = await this.resolveRef({ repository: target.repository, ref: target.deliveryBranch });
    const pr = await this.#findPullRequest(plan);
    if (!branch && !pr) return { classification: 'not_applied', observedState: { provider: this.provider, repository: target.repository, branch: null, pullRequest: null } };
    if (!branch) return { classification: 'drifted', observedState: { provider: this.provider, repository: target.repository, branch: null, pullRequest: pr ? normalizePr(pr) : null } };

    const commit = await this.#request('GET', `/repos/${repoPath(target.repository)}/git/commits/${encodeURIComponent(branch.sha)}`, null, { mutation: false });
    const parentSha = commit.parents?.[0]?.sha ?? null;
    if (parentSha !== target.baseCommit || commit.message !== preconditions.commitMessage) {
      return { classification: 'drifted', observedState: { provider: this.provider, repository: target.repository, deliveryBranch: target.deliveryBranch, commit: branch.sha, parent: parentSha, pullRequest: pr ? normalizePr(pr) : null } };
    }

    const remoteManifest = await this.#readTreeManifest(target.repository, commit.tree?.sha);
    const expectedManifest = normalizeManifest(preconditions.artifactManifest ?? []);
    if (!manifestsEqual(remoteManifest, expectedManifest) || !pr || pr.title !== preconditions.prTitle || (pr.body ?? '') !== preconditions.prBody || pr.base?.ref !== target.baseRef || pr.head?.ref !== target.deliveryBranch) {
      return { classification: 'drifted', observedState: { provider: this.provider, repository: target.repository, deliveryBranch: target.deliveryBranch, commit: branch.sha, remoteManifest, pullRequest: pr ? normalizePr(pr) : null } };
    }
    const checks = await this.getChecks({ repository: target.repository, commitSha: branch.sha });
    const observedState = { provider: this.provider, repository: target.repository, baseRef: target.baseRef, baseCommit: target.baseCommit, deliveryBranch: target.deliveryBranch, commit: branch.sha, tree: commit.tree?.sha ?? null, artifactManifest: remoteManifest, pullRequest: normalizePr(pr), checks };
    if (preconditions.checksPolicy?.required && !checksPass(checks)) return { classification: 'uncertain', providerResourceRef: pr.html_url ?? String(pr.number), observedState: { ...observedState, verificationPending: true } };
    return { classification: 'confirmed', providerResourceRef: pr.html_url ?? String(pr.number), observedState };
  }

  async getChecks({ repository, commitSha }) {
    try {
      const [status, runs] = await Promise.all([
        this.#request('GET', `/repos/${repoPath(repository)}/commits/${encodeURIComponent(commitSha)}/status`, null, { mutation: false }),
        this.#request('GET', `/repos/${repoPath(repository)}/commits/${encodeURIComponent(commitSha)}/check-runs`, null, { mutation: false, accept: 'application/vnd.github+json' })
      ]);
      return { available: true, combinedState: status.state ?? 'unknown', statuses: status.statuses ?? [], checkRuns: runs.check_runs ?? [] };
    } catch (error) {
      if (error instanceof GitHubAdapterError && ['permission_scope_denied','repository_or_ref_not_found'].includes(error.errorClass)) return { available: false, errorClass: error.errorClass, combinedState: 'unknown', statuses: [], checkRuns: [] };
      throw error;
    }
  }

  async #findPullRequest(plan) {
    const target = plan.target;
    const [owner] = target.repository.split('/');
    const query = new URLSearchParams({ state: 'open', head: `${owner}:${target.deliveryBranch}`, base: target.baseRef, per_page: '20' });
    const pulls = await this.#request('GET', `/repos/${repoPath(target.repository)}/pulls?${query}`, null, { mutation: false });
    return Array.isArray(pulls) ? pulls.find((pr) => pr.head?.ref === target.deliveryBranch && pr.base?.ref === target.baseRef) ?? null : null;
  }

  async #readTreeManifest(repository, treeSha) {
    if (!treeSha) return [];
    const tree = await this.#request('GET', `/repos/${repoPath(repository)}/git/trees/${encodeURIComponent(treeSha)}?recursive=1`, null, { mutation: false });
    const blobs = (tree.tree ?? []).filter((entry) => entry.type === 'blob').sort((a,b) => String(a.path).localeCompare(String(b.path)));
    const manifest = [];
    for (const entry of blobs) {
      const blob = await this.#request('GET', `/repos/${repoPath(repository)}/git/blobs/${encodeURIComponent(entry.sha)}`, null, { mutation: false });
      const bytes = Buffer.from(String(blob.content ?? '').replace(/\n/g, ''), blob.encoding === 'base64' ? 'base64' : 'utf8');
      manifest.push({ path: entry.path, size: bytes.length, sha256: crypto.createHash('sha256').update(bytes).digest('hex') });
    }
    return normalizeManifest(manifest);
  }

  async #request(method, path, body, { mutation, accept = 'application/vnd.github+json' }) {
    const token = process.env[this.tokenEnv];
    if (!token) throw new GitHubAdapterError('authentication_unavailable', 'GitHub credential binding is unavailable.', true);
    let response;
    try {
      response = await this.fetchFn(`${this.apiBase}${path}`, { method, headers: { Accept: accept, Authorization: `Bearer ${token}`, 'X-GitHub-Api-Version': '2022-11-28', ...(body ? { 'content-type': 'application/json' } : {}) }, body: body ? JSON.stringify(body) : undefined });
    } catch (error) {
      throw new GitHubAdapterError('transport_uncertain', error instanceof Error ? error.message : String(error), !mutation);
    }
    const text = await response.text();
    const data = text ? safeJson(text) : {};
    if (response.ok) return data;
    const errorClass = classify(response.status, response.headers);
    const effectKnownAbsent = !mutation || response.status < 500;
    throw new GitHubAdapterError(errorClass, data?.message ?? `GitHub request failed: ${response.status}`, effectKnownAbsent);
  }
}

export class GitHubAdapterError extends Error {
  constructor(errorClass, message, effectKnownAbsent = false) {
    super(`${errorClass}:${message}`);
    this.name = 'GitHubAdapterError';
    this.errorClass = errorClass;
    this.effectKnownAbsent = effectKnownAbsent;
  }
}

function classify(status, headers) {
  if (status === 401) return 'authentication_unavailable';
  if (status === 403 && headers?.get?.('x-ratelimit-remaining') === '0') return 'provider_rate_or_quota_limit';
  if (status === 403) return 'permission_scope_denied';
  if (status === 404) return 'repository_or_ref_not_found';
  if (status === 409) return 'provider_conflict';
  if (status === 422) return 'provider_validation_failure';
  if (status >= 500) return 'provider_outage';
  return `provider_http_${status}`;
}
function checksPass(checks) {
  if (!checks?.available) return false;
  const runs = checks.checkRuns ?? [];
  const statuses = checks.statuses ?? [];
  if (runs.length === 0 && statuses.length === 0) return false;
  const runPass = runs.every((run) => run.status === 'completed' && ['success','neutral','skipped'].includes(run.conclusion));
  const statusPass = statuses.every((status) => status.state === 'success');
  return runPass && statusPass && checks.combinedState === 'success';
}
function repoPath(repository) {
  if (typeof repository !== 'string' || !/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(repository)) throw new TypeError('source_control_repository_ref_invalid');
  return repository.split('/').map(encodeURIComponent).join('/');
}
function normalizePr(pr) { return { id: pr.id ?? null, number: pr.number ?? null, state: pr.state ?? null, title: pr.title ?? '', body: pr.body ?? '', url: pr.html_url ?? null, base: pr.base?.ref ?? null, head: pr.head?.ref ?? null }; }
function normalizeManifest(value) { return (Array.isArray(value) ? value : []).map((entry) => ({ path: String(entry.path), size: Number(entry.size), sha256: String(entry.sha256) })).sort((a,b) => a.path.localeCompare(b.path)); }
function manifestsEqual(a,b) { return JSON.stringify(normalizeManifest(a)) === JSON.stringify(normalizeManifest(b)); }
function safeJson(text) { try { return JSON.parse(text); } catch { return { message: text }; } }
function failed(errorClass) { return { outcome: 'failed', errorClass, result: { errorClass } }; }
