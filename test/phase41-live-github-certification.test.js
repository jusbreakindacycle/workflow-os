import assert from 'node:assert/strict';
import test from 'node:test';
import { assertCertificationBranchSafety, loadPhase41LiveGitHubCertificationConfig } from '../src/domain/phase41-live-github-certification.js';

function env(overrides = {}) {
  return {
    WORKFLOW_OS_ENABLE_LIVE_GITHUB_CERT: '1',
    WORKFLOW_OS_GITHUB_CERT_CONFIRM: 'I_UNDERSTAND_THIS_CREATES_REMOTE_GITHUB_STATE',
    WORKFLOW_OS_GITHUB_CERT_REPOSITORY: 'jusbreakindacycle/workflow-os-github-cert',
    WORKFLOW_OS_GITHUB_CERT_ALLOWLIST: 'jusbreakindacycle/workflow-os-github-cert',
    WORKFLOW_OS_GITHUB_CERT_RUN_ID: 'cert-001',
    WORKFLOW_OS_GITHUB_TOKEN: 'synthetic-test-token',
    ...overrides
  };
}

test('live GitHub certification is disabled by default', () => {
  assert.throws(() => loadPhase41LiveGitHubCertificationConfig({}), /disabled/);
});

test('live GitHub certification requires exact target allowlisting and confirmation', () => {
  assert.throws(() => loadPhase41LiveGitHubCertificationConfig(env({ WORKFLOW_OS_GITHUB_CERT_ALLOWLIST: 'other/repo' })), /not in WORKFLOW_OS_GITHUB_CERT_ALLOWLIST/);
  assert.throws(() => loadPhase41LiveGitHubCertificationConfig(env({ WORKFLOW_OS_GITHUB_CERT_CONFIRM: 'yes' })), /confirmation is missing/);
});

test('workflow-os refuses to certify against itself', () => {
  assert.throws(() => loadPhase41LiveGitHubCertificationConfig(env({
    WORKFLOW_OS_GITHUB_CERT_REPOSITORY: 'jusbreakindacycle/workflow-os',
    WORKFLOW_OS_GITHUB_CERT_ALLOWLIST: 'jusbreakindacycle/workflow-os'
  })), /cannot be used as its own live certification target/);
});

test('live certification derives only bounded non-default branch names', () => {
  const config = loadPhase41LiveGitHubCertificationConfig(env());
  assert.equal(config.successBranch, 'workflow-os-cert/cert-001/delivery');
  assert.equal(config.driftBaseBranch, 'workflow-os-cert/cert-001/drift-base');
  assert.equal(config.staleDeliveryBranch, 'workflow-os-cert/cert-001/stale-delivery');
  assert.equal(assertCertificationBranchSafety({ defaultBranch: 'main', ...config }), true);
});

test('branch safety rejects any certification branch equal to the default branch', () => {
  const config = loadPhase41LiveGitHubCertificationConfig(env());
  assert.throws(() => assertCertificationBranchSafety({ defaultBranch: config.successBranch, ...config }), /must be non-default/);
});
