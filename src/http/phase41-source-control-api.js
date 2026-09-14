import { Phase41SourceControl } from '../domain/phase41-source-control.js';

const MAX_BODY = 256 * 1024;

export async function handlePhase41SourceControlApi({ request, url, db, workspaceRuntime, adapters }) {
  let match = url.pathname.match(/^\/api\/phase41\/projects\/([^/]+)\/source-control\/plan$/);
  if (match && request.method === 'POST') {
    const body = await readJson(request);
    const projectId = decodeURIComponent(match[1]);
    const provider = optional(body.provider, 'github');
    const service = serviceFor(provider, db, workspaceRuntime, adapters);
    return { status: 201, body: service.compilePlan({
      workspaceId: required(body.workspaceId, 'workspaceId'),
      projectId,
      workItemId: required(body.workItemId, 'workItemId'),
      repository: required(body.repository, 'repository'),
      baseRef: optional(body.baseRef, 'main'),
      baseCommit: required(body.baseCommit, 'baseCommit'),
      deliveryBranch: required(body.deliveryBranch, 'deliveryBranch'),
      commitMessage: required(body.commitMessage, 'commitMessage'),
      prTitle: required(body.prTitle, 'prTitle'),
      prBody: required(body.prBody, 'prBody'),
      checksPolicy: { required: body.checksRequired === true }
    }) };
  }

  match = url.pathname.match(/^\/api\/phase41\/source-control\/([^/]+)$/);
  if (match && request.method === 'GET') {
    const workspaceId = required(url.searchParams.get('workspaceId'), 'workspaceId');
    const projectId = required(url.searchParams.get('projectId'), 'projectId');
    const externalActionPlanId = decodeURIComponent(match[1]);
    const service = serviceForPlan(db, workspaceRuntime, adapters, workspaceId, projectId, externalActionPlanId);
    return { status: 200, body: service.get({ workspaceId, projectId, externalActionPlanId }) };
  }

  match = url.pathname.match(/^\/api\/phase41\/source-control\/([^/]+)\/(request-authority|resolve-authority|execute|reconcile)$/);
  if (match && request.method === 'POST') {
    const body = await readJson(request);
    const workspaceId = required(body.workspaceId, 'workspaceId');
    const projectId = required(body.projectId, 'projectId');
    const externalActionPlanId = decodeURIComponent(match[1]);
    const action = match[2];
    const service = serviceForPlan(db, workspaceRuntime, adapters, workspaceId, projectId, externalActionPlanId);
    if (action === 'request-authority') return { status: 201, body: service.requestAuthority({ workspaceId, projectId, externalActionPlanId }) };
    if (action === 'resolve-authority') return { status: 200, body: service.resolveAuthority({ workspaceId, projectId, externalActionPlanId, decision: required(body.decision, 'decision'), evidence: Array.isArray(body.evidence) ? body.evidence : [] }) };
    if (action === 'execute') return { status: 200, body: await service.execute({ workspaceId, projectId, externalActionPlanId }) };
    return { status: 200, body: await service.reconcile({ workspaceId, projectId, externalActionPlanId, attemptId: required(body.attemptId, 'attemptId') }) };
  }
  return null;
}

export function statusForPhase41Error(error) {
  const message = error instanceof Error ? error.message : String(error);
  if (error instanceof TypeError) return 400;
  if (message.includes('not_found')) return 404;
  if (message.includes('required') || message.includes('forbidden') || message.includes('drift') || message.includes('blocked') || message.includes('unavailable') || message.includes('mismatch') || message.includes('uncertain') || message.includes('collision') || message.includes('stale') || message.includes('not_approved')) return 409;
  return 0;
}

function serviceForPlan(db, workspaceRuntime, adapters, workspaceId, projectId, externalActionPlanId) {
  const row = db.prepare('SELECT provider FROM source_control_delivery_plans WHERE workspace_id=? AND project_id=? AND external_action_plan_id=?').get(workspaceId, projectId, externalActionPlanId);
  if (!row) throw new Error(`source_control_delivery_plan_not_found:${externalActionPlanId}`);
  return serviceFor(row.provider, db, workspaceRuntime, adapters);
}
function serviceFor(provider, db, workspaceRuntime, adapters) {
  const adapter = adapters?.[provider];
  if (!adapter || !['github','fixture'].includes(provider)) throw new Error(`source_control_provider_unsupported:${provider}`);
  return new Phase41SourceControl(db, { workspaceRuntime, adapter });
}
async function readJson(request) {
  let size = 0;
  const chunks = [];
  for await (const chunk of request) {
    size += chunk.length;
    if (size > MAX_BODY) throw new TypeError('request_body_too_large');
    chunks.push(chunk);
  }
  if (chunks.length === 0) return {};
  try {
    const value = JSON.parse(Buffer.concat(chunks).toString('utf8'));
    if (!value || typeof value !== 'object' || Array.isArray(value)) throw new TypeError('json_object_required');
    return value;
  } catch (error) {
    if (error instanceof TypeError) throw error;
    throw new TypeError('invalid_json');
  }
}
function required(value, field) { if (typeof value !== 'string' || !value.trim()) throw new TypeError(`${field}_required`); return value.trim(); }
function optional(value, fallback) { return typeof value === 'string' && value.trim() ? value.trim() : fallback; }
