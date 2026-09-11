// @ts-check
import { CanonicalStore, DELIVERY_STRATEGIES, DISCOVERY_QUESTIONS } from '../domain/canonical-store.js';

const maxBodyBytes = 256 * 1024;

/**
 * @param {{request: import('node:http').IncomingMessage, url: URL, db: import('node:sqlite').DatabaseSync}} input
 * @returns {Promise<{status:number, body:unknown}|null>}
 */
export async function handleApi({ request, url, db }) {
  const store = new CanonicalStore(db);

  if (request.method === 'GET' && url.pathname === '/api/workspaces') {
    return {
      status: 200,
      body: {
        workspaces: store.listWorkspaces(),
        discoveryQuestions: DISCOVERY_QUESTIONS,
        deliveryStrategies: DELIVERY_STRATEGIES
      }
    };
  }

  if (request.method === 'POST' && url.pathname === '/api/workspaces') {
    const body = await readJson(request);
    return { status: 201, body: { workspace: store.createWorkspace({ name: requiredString(body, 'name') }) } };
  }

  if (request.method === 'POST' && url.pathname === '/api/intakes') {
    const body = await readJson(request);
    let workspaceId = optionalString(body, 'workspaceId');
    if (!workspaceId) {
      const workspaceName = requiredString(body, 'workspaceName');
      workspaceId = store.createWorkspace({ name: workspaceName }).id;
    }
    const snapshot = store.startProjectIntake({
      workspaceId,
      mode: requiredString(body, 'mode'),
      title: requiredString(body, 'title'),
      rawRequest: requiredString(body, 'rawRequest'),
      requestedSolution: optionalString(body, 'requestedSolution'),
      clientName: optionalString(body, 'clientName'),
      engagementTitle: optionalString(body, 'engagementTitle')
    });
    return { status: 201, body: snapshot };
  }

  const match = url.pathname.match(/^\/api\/intakes\/([^/]+)(?:\/(discovery|strategy|accept))?$/);
  if (!match) return null;
  const intakeId = decodeURIComponent(match[1]);
  const action = match[2] ?? null;

  if (request.method === 'GET' && action === null) {
    const workspaceId = url.searchParams.get('workspaceId');
    if (!workspaceId) throw new TypeError('workspaceId_required');
    return { status: 200, body: store.getIntakeSnapshot({ workspaceId, intakeId }) };
  }

  if (request.method === 'PUT' && action === 'discovery') {
    const body = await readJson(request);
    const workspaceId = requiredString(body, 'workspaceId');
    const responses = body.responses;
    if (!Array.isArray(responses)) throw new TypeError('responses_required');
    return { status: 200, body: store.saveDiscoveryResponses({ workspaceId, intakeId, responses }) };
  }

  if (request.method === 'PUT' && action === 'strategy') {
    const body = await readJson(request);
    return {
      status: 200,
      body: store.setWorkingDeliveryStrategy({
        workspaceId: requiredString(body, 'workspaceId'),
        intakeId,
        strategy: requiredString(body, 'strategy'),
        rationale: optionalString(body, 'rationale')
      })
    };
  }

  if (request.method === 'POST' && action === 'accept') {
    const body = await readJson(request);
    return {
      status: 200,
      body: store.acceptProjectIntake({
        workspaceId: requiredString(body, 'workspaceId'),
        intakeId,
        expectedProjectVersion: requiredInteger(body, 'expectedProjectVersion')
      })
    };
  }

  return { status: 405, body: { error: 'method_not_allowed' } };
}

export function statusForApiError(error) {
  const message = error instanceof Error ? error.message : String(error);
  if (error instanceof TypeError) return 400;
  if (message.startsWith('concurrency_conflict:')) return 409;
  if (message.includes('_not_found') || message.includes('not_found_in_')) return 404;
  if (message.startsWith('discovery_required:') || message === 'delivery_strategy_required' || message === 'intake_already_accepted' || message === 'project_already_has_accepted_brief') return 409;
  return 400;
}

async function readJson(request) {
  let size = 0;
  const chunks = [];
  for await (const chunk of request) {
    size += chunk.length;
    if (size > maxBodyBytes) throw new TypeError('request_body_too_large');
    chunks.push(chunk);
  }
  if (chunks.length === 0) return {};
  try {
    const parsed = JSON.parse(Buffer.concat(chunks).toString('utf8'));
    if (!isRecord(parsed)) throw new TypeError('json_object_required');
    return parsed;
  } catch (error) {
    if (error instanceof TypeError) throw error;
    throw new TypeError('invalid_json');
  }
}

function requiredString(object, key) {
  const value = object[key];
  if (typeof value !== 'string' || value.trim() === '') throw new TypeError(`${key}_required`);
  return value.trim();
}

function optionalString(object, key) {
  const value = object[key];
  return typeof value === 'string' && value.trim() !== '' ? value.trim() : null;
}

function requiredInteger(object, key) {
  const value = object[key];
  if (!Number.isInteger(value)) throw new TypeError(`${key}_integer_required`);
  return value;
}

function isRecord(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
