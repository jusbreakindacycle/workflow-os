import assert from 'node:assert/strict';
import test from 'node:test';
import { GitHubAdapterError, GitHubSourceControlAdapter } from '../src/runtime/github-source-control-adapter.js';

function plan() {
  return {
    target: {
      repository: 'owner/repo',
      baseRef: 'main',
      baseCommit: 'base-0001',
      deliveryBranch: 'workflow-os/delivery-1'
    },
    details: {
      preconditions: {
        commitMessage: 'feat: exact synthetic delivery',
        prTitle: 'Exact synthetic delivery',
        prBody: 'Approved body',
        artifactManifest: [{ path: 'index.html', size: 3, sha256: 'x'.repeat(64) }],
        checksPolicy: { required: false }
      }
    }
  };
}

function jsonResponse(status, value, headers = {}) {
  return new Response(JSON.stringify(value), { status, headers: { 'content-type': 'application/json', ...headers } });
}

test('GitHub adapter fails closed when credential binding is unavailable', async () => {
  const key = 'WORKFLOW_OS_TEST_GITHUB_TOKEN_MISSING';
  const previous = process.env[key];
  delete process.env[key];
  try {
    const adapter = new GitHubSourceControlAdapter({ tokenEnv: key, fetchFn: async () => { throw new Error('fetch should not run'); } });
    assert.equal(adapter.health().available, false);
    await assert.rejects(
      () => adapter.inspectRepository({ repository: 'owner/repo' }),
      (error) => error instanceof GitHubAdapterError && error.errorClass === 'authentication_unavailable' && error.effectKnownAbsent === true
    );
  } finally {
    if (previous === undefined) delete process.env[key];
    else process.env[key] = previous;
  }
});

test('GitHub adapter normalizes rate limit separately from permission denial', async () => {
  const key = 'WORKFLOW_OS_TEST_GITHUB_TOKEN_RATE';
  const previous = process.env[key];
  process.env[key] = 'synthetic-token';
  try {
    const adapter = new GitHubSourceControlAdapter({
      tokenEnv: key,
      fetchFn: async () => jsonResponse(403, { message: 'API rate limit exceeded' }, { 'x-ratelimit-remaining': '0' })
    });
    await assert.rejects(
      () => adapter.inspectRepository({ repository: 'owner/repo' }),
      (error) => error instanceof GitHubAdapterError && error.errorClass === 'provider_rate_or_quota_limit'
    );
  } finally {
    if (previous === undefined) delete process.env[key];
    else process.env[key] = previous;
  }
});

test('GitHub partial mutation becomes reconciliation-required uncertainty instead of clean failure', async () => {
  const key = 'WORKFLOW_OS_TEST_GITHUB_TOKEN_PARTIAL';
  const previous = process.env[key];
  process.env[key] = 'synthetic-token';
  const calls = [];
  try {
    const adapter = new GitHubSourceControlAdapter({
      tokenEnv: key,
      fetchFn: async (url, options = {}) => {
        const parsed = new URL(url);
        const method = options.method ?? 'GET';
        calls.push({ method, path: parsed.pathname });
        if (method === 'GET' && parsed.pathname === '/repos/owner/repo') {
          return jsonResponse(200, { full_name: 'owner/repo', default_branch: 'main', visibility: 'private' });
        }
        if (method === 'GET' && parsed.pathname === '/repos/owner/repo/git/ref/heads/main') {
          return jsonResponse(200, { object: { sha: 'base-0001' } });
        }
        if (method === 'GET' && parsed.pathname === '/repos/owner/repo/git/ref/heads/workflow-os%2Fdelivery-1') {
          return jsonResponse(404, { message: 'Not Found' });
        }
        if (method === 'POST' && parsed.pathname === '/repos/owner/repo/git/refs') {
          return jsonResponse(201, { ref: 'refs/heads/workflow-os/delivery-1', object: { sha: 'base-0001' } });
        }
        if (method === 'POST' && parsed.pathname === '/repos/owner/repo/git/blobs') {
          return jsonResponse(500, { message: 'synthetic provider outage after branch creation' });
        }
        return jsonResponse(500, { message: `unexpected ${method} ${parsed.pathname}` });
      }
    });

    await assert.rejects(
      () => adapter.executeBundle(plan(), [{ path: 'index.html', content: 'abc', sha256: 'x'.repeat(64), size: 3 }]),
      (error) => error instanceof GitHubAdapterError && error.errorClass === 'partial_mutation_requires_reconciliation' && error.effectKnownAbsent === false
    );
    assert.ok(calls.some((call) => call.method === 'POST' && call.path === '/repos/owner/repo/git/refs'));
    assert.ok(calls.some((call) => call.method === 'POST' && call.path === '/repos/owner/repo/git/blobs'));
  } finally {
    if (previous === undefined) delete process.env[key];
    else process.env[key] = previous;
  }
});

test('GitHub pre-mutation validation failure remains a known clean failure', async () => {
  const key = 'WORKFLOW_OS_TEST_GITHUB_TOKEN_VALIDATION';
  const previous = process.env[key];
  process.env[key] = 'synthetic-token';
  try {
    const adapter = new GitHubSourceControlAdapter({
      tokenEnv: key,
      fetchFn: async (url, options = {}) => {
        const parsed = new URL(url);
        const method = options.method ?? 'GET';
        if (method === 'GET' && parsed.pathname === '/repos/owner/repo') return jsonResponse(200, { full_name: 'owner/repo', default_branch: 'main' });
        if (method === 'GET' && parsed.pathname === '/repos/owner/repo/git/ref/heads/main') return jsonResponse(200, { object: { sha: 'different-base' } });
        return jsonResponse(500, { message: 'unexpected call' });
      }
    });
    const result = await adapter.executeBundle(plan(), []);
    assert.equal(result.outcome, 'failed');
    assert.equal(result.errorClass, 'source_control_base_drift');
  } finally {
    if (previous === undefined) delete process.env[key];
    else process.env[key] = previous;
  }
});
