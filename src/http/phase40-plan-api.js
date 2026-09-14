import { Phase40ExternalActions } from '../domain/phase40-external-actions.js';

export async function handlePhase40PlanApi({ request, url, db }) {
  const actions = new Phase40ExternalActions(db);
  let match = url.pathname.match(/^\/api\/phase4\/projects\/([^/]+)\/actions$/);
  if (match && request.method === 'POST') {
    const body = await readJson(request);
    return { status: 201, body: actions.createPlan({ ...body, workspaceId: required(body.workspaceId, 'workspaceId'), projectId: decodeURIComponent(match[1]) }) };
  }
  if (match && request.method === 'GET') {
    return { status: 200, body: actions.getProjectState({ workspaceId: required(url.searchParams.get('workspaceId'), 'workspaceId'), projectId: decodeURIComponent(match[1]) }) };
  }

  match = url.pathname.match(/^\/api\/phase4\/projects\/([^/]+)\/actions\/([^/]+)\/approval$/);
  if (match && request.method === 'POST') {
    const body = await readJson(request);
    return { status: 200, body: actions.requestAuthority({ workspaceId: required(body.workspaceId, 'workspaceId'), projectId: decodeURIComponent(match[1]), planId: decodeURIComponent(match[2]) }) };
  }

  match = url.pathname.match(/^\/api\/phase4\/projects\/([^/]+)\/actions\/([^/]+)\/authority$/);
  if (match && request.method === 'POST') {
    const body = await readJson(request);
    return { status: 200, body: actions.resolveAuthority({ workspaceId: required(body.workspaceId, 'workspaceId'), projectId: decodeURIComponent(match[1]), planId: decodeURIComponent(match[2]), decision: required(body.decision, 'decision'), evidence: Array.isArray(body.evidence) ? body.evidence : [] }) };
  }

  match = url.pathname.match(/^\/api\/phase4\/projects\/([^/]+)\/actions\/([^/]+)\/complete$/);
  if (match && request.method === 'POST') {
    const body = await readJson(request);
    return { status: 200, body: actions.complete({ workspaceId: required(body.workspaceId, 'workspaceId'), projectId: decodeURIComponent(match[1]), planId: decodeURIComponent(match[2]) }) };
  }
  return null;
}

export function statusForPhase40Error(error) {
  const message = error instanceof Error ? error.message : String(error);
  if (message.includes('not_found')) return 404;
  if (message.includes('required') || message.includes('stale') || message.includes('blocked') || message.includes('not_') || message.includes('mismatch')) return 409;
  if (error instanceof TypeError) return 400;
  return 0;
}

async function readJson(request) {
  let body = '';
  for await (const chunk of request) { body += chunk; if (body.length > 1_000_000) throw new Error('request_body_too_large'); }
  if (!body) return {};
  try { return JSON.parse(body); } catch { throw new TypeError('invalid_json'); }
}
function required(value, field) { if (typeof value !== 'string' || !value.trim()) throw new TypeError(`${field}_required`); return value.trim(); }
