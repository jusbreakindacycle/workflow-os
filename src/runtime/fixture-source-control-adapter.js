// @ts-check
import crypto from 'node:crypto';
import { canonicalJson } from '../domain/contracts.js';

export class FixtureSourceControlAdapter {
  constructor({ behavior = 'success', defaultBranch = 'main', baseCommit = 'fixture-base-0001' } = {}) {
    this.provider = 'fixture';
    this.version = 'phase-4.1-fixture-v1';
    this.behavior = behavior;
    this.defaultBranch = defaultBranch;
    this.baseCommit = baseCommit;
    this.repositories = new Map();
  }

  health() { return { available: true, provider: this.provider, version: this.version }; }
  capabilities() {
    return ['source_control_read','source_control_branch_write','source_control_commit_write','source_control_pull_request_write','source_control_checks_read'];
  }

  inspectRepository({ repository }) {
    const repo = this.#repo(repository);
    return { provider: this.provider, repository, defaultBranch: repo.defaultBranch, visibility: 'private', available: true };
  }

  resolveRef({ repository, ref }) {
    const repo = this.#repo(repository);
    const sha = repo.refs.get(ref);
    if (!sha) return null;
    return { ref, sha };
  }

  executeBundle(plan, files) {
    const target = plan.target;
    const preconditions = plan.details?.preconditions ?? {};
    const repo = this.#repo(target.repository);
    if (target.deliveryBranch === repo.defaultBranch) return failure('source_control_default_branch_write_forbidden');
    if (repo.refs.get(target.baseRef) !== target.baseCommit) return failure('source_control_base_drift');

    const existingBranch = repo.refs.get(target.deliveryBranch);
    const intendedCommit = commitIdentity({ base: target.baseCommit, tree: preconditions.projectedTreeSha256, message: preconditions.commitMessage });
    if (existingBranch && existingBranch !== intendedCommit) return failure('source_control_branch_collision_drift');

    const apply = () => {
      repo.refs.set(target.deliveryBranch, intendedCommit);
      repo.commits.set(intendedCommit, {
        sha: intendedCommit,
        base: target.baseCommit,
        treeSha256: preconditions.projectedTreeSha256,
        files: structuredClone(files),
        message: preconditions.commitMessage
      });
      const existingPr = [...repo.pullRequests.values()].find((pr) => pr.base === target.baseRef && pr.head === target.deliveryBranch && pr.title === preconditions.prTitle && pr.body === preconditions.prBody);
      const pr = existingPr ?? {
        id: `fixture-pr-${repo.pullRequests.size + 1}`,
        number: repo.pullRequests.size + 1,
        base: target.baseRef,
        head: target.deliveryBranch,
        title: preconditions.prTitle,
        body: preconditions.prBody,
        state: 'open',
        url: `fixture://${target.repository}/pull/${repo.pullRequests.size + 1}`
      };
      repo.pullRequests.set(pr.id, pr);
      return pr;
    };

    if (this.behavior === 'branch_drift') {
      repo.refs.set(target.deliveryBranch, 'unexpected-remote-commit');
      return failure('source_control_branch_collision_drift');
    }
    if (this.behavior === 'uncertain_not_applied') return { outcome: 'uncertain', errorClass: 'transport_uncertain', result: { applied: false } };
    const pr = apply();
    if (this.behavior === 'uncertain_applied') return { outcome: 'uncertain', errorClass: 'transport_uncertain', providerResourceRef: pr.url, result: { applied: true } };
    return { outcome: 'succeeded', providerOperationRef: intendedCommit, providerResourceRef: pr.url, result: { branch: target.deliveryBranch, commit: intendedCommit, pullRequest: pr } };
  }

  reconcile(plan) {
    const target = plan.target;
    const preconditions = plan.details?.preconditions ?? {};
    const repo = this.#repo(target.repository);
    const intendedCommit = commitIdentity({ base: target.baseCommit, tree: preconditions.projectedTreeSha256, message: preconditions.commitMessage });
    const branchCommit = repo.refs.get(target.deliveryBranch) ?? null;
    const pr = [...repo.pullRequests.values()].find((item) => item.base === target.baseRef && item.head === target.deliveryBranch) ?? null;
    if (!branchCommit && !pr) return { classification: 'not_applied', observedState: { repository: target.repository, branch: null, pullRequest: null } };
    if (branchCommit !== intendedCommit || !pr || pr.title !== preconditions.prTitle || pr.body !== preconditions.prBody) {
      return { classification: 'drifted', observedState: { repository: target.repository, branch: target.deliveryBranch, commit: branchCommit, pullRequest: pr } };
    }
    return {
      classification: 'confirmed',
      observedState: {
        provider: this.provider,
        repository: target.repository,
        defaultBranch: repo.defaultBranch,
        baseRef: target.baseRef,
        baseCommit: target.baseCommit,
        deliveryBranch: target.deliveryBranch,
        commit: intendedCommit,
        treeSha256: preconditions.projectedTreeSha256,
        artifactManifest: preconditions.artifactManifest ?? [],
        pullRequest: pr,
        checks: [{ name: 'fixture-ci', status: 'completed', conclusion: 'success' }]
      },
      providerResourceRef: pr.url
    };
  }

  #repo(name) {
    if (!this.repositories.has(name)) {
      this.repositories.set(name, {
        defaultBranch: this.defaultBranch,
        refs: new Map([[this.defaultBranch, this.baseCommit]]),
        commits: new Map(),
        pullRequests: new Map()
      });
    }
    return this.repositories.get(name);
  }
}

function commitIdentity(value) {
  return `fixture-${crypto.createHash('sha256').update(canonicalJson(value)).digest('hex').slice(0, 40)}`;
}
function failure(errorClass) { return { outcome: 'failed', errorClass, result: { errorClass } }; }
