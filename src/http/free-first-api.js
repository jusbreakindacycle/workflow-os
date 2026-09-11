// @ts-check
import { FreeFirstBroker } from '../domain/free-first-broker.js';

const maxBodyBytes = 128 * 1024;

/**
 * Phase 2.1 operational API. Provider account bootstrap remains a local
 * operator concern; these routes expose policy/state and governed execution.
 * @param {{request: import('node:http').IncomingMessage, url: URL, db: import('node:sqlite').DatabaseSync}} input
 * @returns {Promise<{status:number,body:unknown}|null>}
 */
export async function handleFreeFirstApi({ request, url, db }) {
  const broker = new FreeFirstBroker(db);

  if (request.method === 'GET' && url.pathname === '/api/phase21/free-first') {
    return { status: 200, body: broker.getState({ workspaceId: requiredQuery(url, 'workspaceId') }) };
  }

  let match = url.pathname.match(/^\/api\/phase21\/workspaces\/([^/]+)\/(policy|sync-usage|apply-policy)$/);
  if (match) {
    if (request.method !== 'POST') return { status: 405, body: { error: 'method_not_allowed' } };
    const workspaceId = decodeURIComponent(match[1]);
    const action = match[2];
    const body = await readJson(request);
    if (action === 'policy') {
      return {
        status: 200,
        body: { policy: broker.ensurePolicy({
          workspaceId,
          healthyThresholdBp: optionalInteger(body, 'healthyThresholdBp'),
          reserveThresholdBp: optionalInteger(body, 'reserveThresholdBp'),
          verifierReserveBp: optionalInteger(body, 'verifierReserveBp'),
          openrouterDailyRequestLimit: optionalInteger(body, 'openrouterDailyRequestLimit'),
          unknownQuotaBehavior: optionalString(body, 'unknownQuotaBehavior') ?? undefined
        }) }
      };
    }
    if (action === 'sync-usage') return { status: 200, body: broker.syncUsageFromAttempts({ workspaceId }) };
    return { status: 200, body: broker.applyPolicy({ workspaceId, taskClass: optionalString(body, 'taskClass') ?? 'standard' }) };
  }

  match = url.pathname.match(/^\/api\/phase21\/projects\/([^/]+)\/work-items\/([^/]+)\/run$/);
  if (match) {
    if (request.method !== 'POST') return { status: 405, body: { error: 'method_not_allowed' } };
    const body = await readJson(request);
    return {
      status: 200,
      body: await broker.runFreeFirstWorkItem({
        workspaceId: requiredString(body, 'workspaceId'),
        projectId: decodeURIComponent(match[1]),
        workItemId: decodeURIComponent(match[2]),
        taskClass: optionalString(body, 'taskClass'),
        maxIterations: optionalInteger(body, 'maxIterations') ?? 2,
        maxMinutes: optionalInteger(body, 'maxMinutes') ?? 10
      })
    };
  }

  return null;
}

export function statusForFreeFirstError(error) {
  const message = error instanceof Error ? error.message : String(error);
  if (error instanceof TypeError) return 400;
  if (message.includes('_not_found')) return 404;
  if (message.includes('unavailable') || message.includes('exhausted') || message.includes('reserved') || message.includes('required') || message.includes('free_first_')) return 409;
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
  if (!chunks.length) return {};
  try {
    const parsed = JSON.parse(Buffer.concat(chunks).toString('utf8'));
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new TypeError('json_object_required');
    return parsed;
  } catch (error) {
    if (error instanceof TypeError) throw error;
    throw new TypeError('invalid_json');
  }
}

function requiredQuery(url, key) { const value = url.searchParams.get(key); if (!value) throw new TypeError(`${key}_required`); return value; }
function requiredString(object, key) { const value = object[key]; if (typeof value !== 'string' || !value.trim()) throw new TypeError(`${key}_required`); return value.trim(); }
function optionalString(object, key) { const value = object[key]; return typeof value === 'string' && value.trim() ? value.trim() : null; }
function optionalInteger(object, key) { const value = object[key]; if (value === undefined || value === null || value === '') return undefined; if (!Number.isInteger(value)) throw new TypeError(`${key}_integer_required`); return value; }
