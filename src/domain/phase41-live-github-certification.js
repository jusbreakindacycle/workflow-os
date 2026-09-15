// @ts-check

const ENABLE_FLAG = 'WORKFLOW_OS_ENABLE_LIVE_GITHUB_CERT';
const CONFIRMATION = 'I_UNDERSTAND_THIS_CREATES_REMOTE_GITHUB_STATE';

export function loadPhase41LiveGitHubCertificationConfig(env = process.env) {
  if (env[ENABLE_FLAG] !== '1') throw new Error('Live GitHub certification is disabled. Set WORKFLOW_OS_ENABLE_LIVE_GITHUB_CERT=1 only for an explicitly authorized disposable repository.');
  if (env.WORKFLOW_OS_GITHUB_CERT_CONFIRM !== CONFIRMATION) throw new Error('Live GitHub certification confirmation is missing.');
  const repository = required(env.WORKFLOW_OS_GITHUB_CERT_REPOSITORY, 'WORKFLOW_OS_GITHUB_CERT_REPOSITORY');
  if (!/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(repository)) throw new Error('Live GitHub certification repository must be owner/name.');
  if (repository.toLowerCase() === 'jusbreakindacycle/workflow-os') throw new Error('workflow-os repository cannot be used as its own live certification target.');

  const allowlist = new Set(String(env.WORKFLOW_OS_GITHUB_CERT_ALLOWLIST ?? '').split(',').map((value) => value.trim()).filter(Boolean));
  if (!allowlist.has(repository)) throw new Error('Live GitHub certification target is not in WORKFLOW_OS_GITHUB_CERT_ALLOWLIST.');
  if (!env.WORKFLOW_OS_GITHUB_TOKEN) throw new Error('GitHub credential binding is unavailable. Set WORKFLOW_OS_GITHUB_TOKEN locally; never commit it.');

  const runId = required(env.WORKFLOW_OS_GITHUB_CERT_RUN_ID, 'WORKFLOW_OS_GITHUB_CERT_RUN_ID').toLowerCase();
  if (!/^[a-z0-9][a-z0-9._-]{2,40}$/.test(runId)) throw new Error('WORKFLOW_OS_GITHUB_CERT_RUN_ID must be 3-41 lowercase letters/numbers/dot/underscore/hyphen.');

  const prefix = `workflow-os-cert/${runId}`;
  return Object.freeze({
    repository,
    runId,
    successBranch: `${prefix}/delivery`,
    driftBaseBranch: `${prefix}/drift-base`,
    staleDeliveryBranch: `${prefix}/stale-delivery`,
    confirmation: CONFIRMATION
  });
}

export function assertCertificationBranchSafety({ defaultBranch, ...config }) {
  for (const branch of [config.successBranch, config.driftBaseBranch, config.staleDeliveryBranch]) {
    if (!branch || branch === defaultBranch) throw new Error('Live GitHub certification branch must be non-default.');
    if (!branch.startsWith(`workflow-os-cert/${config.runId}/`)) throw new Error('Live GitHub certification branch escaped the approved prefix.');
  }
  return true;
}

export const LIVE_GITHUB_CERT_CONFIRMATION = CONFIRMATION;

function required(value, name) {
  if (typeof value !== 'string' || value.trim().length === 0) throw new Error(`${name} is required.`);
  return value.trim();
}
