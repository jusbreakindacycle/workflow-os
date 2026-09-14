import { Phase40ExternalActions } from '../domain/phase40-external-actions.js';

export async function handlePhase40AttemptApi({ request, url, db }) {
  const actions = new Phase40ExternalActions(db);
  let match = url.pathname.match(/^\/api\/phase4\/projects\/([^/]+)\/actions\/([^/]+)\/preflight$/);
  if (match && request.method === 'POST') {
    const body = await readJson(request);
    return { status: 200, body: actions.preflight({ workspaceId: required(body.workspaceId, 'workspaceId'), projectId: decodeURIComponent(match[1]), planId: decodeURIComponent(match[2]) }) };
  }

  match = url.pathname.match(/^\/api\/phase4\/projects\/([^/]+)\/actions\/([^/]+)\/attempts$/);
  if (match && request.method === 'POST') {
    const body = await readJson(request);
    return { status: 201, body: actions.startAttempt({ workspaceId: required(body.workspaceId, 'workspaceId'), projectId: decodeURIComponent(match[1]), planId: decodeURIComponent(match[2]), adapterProvider: required(body.adapterProvider, 'adapterProvider'), adapterVersion: required(body.adapterVersion, 'adapterVersion'), operationKind: required(body.operationKind, 'operationKind'), requestDescriptor: body.requestDescriptor ?? {} }) };
  }

  match = url.pathname.match(/^\/api\/phase4\/projects\/([^/]+)\/actions\/([^/]+)\/attempts\/([^/]+)\/finish$/);
  if (match && request.method === 'POST') {
    const body = await readJson(request);
    return { status: 200, body: actions.finishAttempt({ workspaceId: required(body.workspaceId, 'workspaceId'), projectId: decodeURIComponent(match[1]), attemptId: decodeURIComponent(match[3]), outcome: required(body.outcome, 'outcome'), result: body.result ?? {}, providerOperationRef: body.providerOperationRef ?? null, providerResourceRef: body.providerResourceRef ?? null, errorClass: body.errorClass ?? null }) };
  }

  match = url.pathname.match(/^\/api\/phase4\/projects\/([^/]+)\/actions\/([^/]+)\/attempts\/([^/]+)\/reconcile$/);
  if (match && request.method === 'POST') {
    const body = await readJson(request);
    return { status: 200, body: actions.reconcile({ workspaceId: required(body.workspaceId, 'workspaceId'), projectId: decodeURIComponent(match[1]), attemptId: decodeURIComponent(match[3]), classification: required(body.classification, 'classification'), observedState: body.observedState ?? {}, summary: body.summary ?? null }) };
  }
  return null;
}

async function readJson(request) {
  let body = '';
  for await (const chunk of request) { body += chunk; if (body.length > 1_000_000) throw new Error('request_body_too_large'); }
  if (!body) return {};
  try { return JSON.parse(body); } catch { throw new TypeError('invalid_json'); }
}
function required(value, field) { if (typeof value !== 'string' || !value.trim()) throw new TypeError(`${field}_required`); return value.trim(); }
