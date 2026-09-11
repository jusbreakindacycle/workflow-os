// @ts-check
import { Phase2AutonomyKernel } from '../domain/phase2-autonomy-kernel.js';

const maxBodyBytes = 256 * 1024;

/**
 * @param {{request: import('node:http').IncomingMessage, url: URL, db: import('node:sqlite').DatabaseSync}} input
 * @returns {Promise<{status:number, body:unknown}|null>}
 */
export async function handlePhase2Api({ request, url, db }) {
  const kernel = new Phase2AutonomyKernel(db);

  if (request.method === 'GET' && url.pathname === '/api/phase2/autonomy') {
    return { status: 200, body: kernel.getAutonomyState({ workspaceId: requiredQuery(url, 'workspaceId'), projectId: optionalQuery(url, 'projectId') }) };
  }

  if (request.method === 'POST' && url.pathname === '/api/phase2/capabilities/seed') {
    return { status: 200, body: { capabilities: kernel.seedCapabilityRegistry() } };
  }

  let match = url.pathname.match(/^\/api\/phase2\/workspaces\/([^/]+)\/(skills\/install|provider-connections|routes)$/);
  if (match) {
    const workspaceId = decodeURIComponent(match[1]);
    const action = match[2];
    if (request.method === 'GET' && action === 'provider-connections') return { status: 200, body: { connections: kernel.listProviderConnections({ workspaceId }) } };
    if (request.method === 'GET' && action === 'routes') return { status: 200, body: { routes: kernel.listExecutionRoutes({ workspaceId }) } };
    if (request.method !== 'POST') return { status: 405, body: { error: 'method_not_allowed' } };
    if (action === 'skills/install') return { status: 200, body: { skills: kernel.installBuiltinSkills({ workspaceId }) } };
    const body = await readJson(request);
    if (action === 'provider-connections') {
      return {
        status: 201,
        body: { connection: kernel.createProviderConnection({
          workspaceId,
          providerKey: requiredString(body, 'providerKey'),
          connectionType: requiredString(body, 'connectionType'),
          billingMode: requiredString(body, 'billingMode'),
          credentialRef: optionalString(body, 'credentialRef'),
          endpointUrl: optionalString(body, 'endpointUrl'),
          locality: optionalString(body, 'locality') ?? 'remote',
          allowedDataClasses: stringArrayOrDefault(body.allowedDataClasses, ['Public', 'Internal']),
          entitlement: recordOrEmpty(body.entitlement),
          enabled: optionalBoolean(body, 'enabled') ?? true
        }) }
      };
    }
    if (action === 'routes') {
      return {
        status: 201,
        body: { route: kernel.createExecutionRoute({
          workspaceId,
          providerConnectionId: requiredString(body, 'providerConnectionId'),
          routeName: requiredString(body, 'routeName'),
          modelKey: optionalString(body, 'modelKey'),
          runtimeKey: requiredString(body, 'runtimeKey'),
          adapterKind: requiredString(body, 'adapterKind'),
          capabilities: requiredStringArray(body, 'capabilities'),
          allowedDataClasses: stringArrayOrDefault(body.allowedDataClasses, ['Public', 'Internal']),
          independenceGroup: requiredString(body, 'independenceGroup'),
          qualityScore: optionalInteger(body, 'qualityScore') ?? 50,
          reliabilityScore: optionalInteger(body, 'reliabilityScore') ?? 50,
          latencyScore: optionalInteger(body, 'latencyScore') ?? 50,
          estimatedCostMinor: nullableInteger(body, 'estimatedCostMinor'),
          currency: optionalString(body, 'currency') ?? 'USD',
          config: recordOrEmpty(body.config),
          enabled: optionalBoolean(body, 'enabled') ?? true
        }) }
      };
    }
  }

  match = url.pathname.match(/^\/api\/phase2\/provider-connections\/([^/]+)\/health$/);
  if (match && request.method === 'POST') {
    const body = await readJson(request);
    return { status: 200, body: kernel.refreshProviderConnectionHealth({ workspaceId: requiredString(body, 'workspaceId'), connectionId: decodeURIComponent(match[1]) }) };
  }

  match = url.pathname.match(/^\/api\/phase2\/projects\/([^/]+)\/(bootstrap|work-items\/([^/]+)\/(instructions|run|portability-drill))$/);
  if (match && request.method === 'POST') {
    const projectId = decodeURIComponent(match[1]);
    const workItemId = match[3] ? decodeURIComponent(match[3]) : null;
    const action = match[4] ?? match[2];
    const body = await readJson(request);
    const workspaceId = requiredString(body, 'workspaceId');
    if (action === 'bootstrap') return { status: 201, body: kernel.bootstrapProject({ workspaceId, projectId }) };
    if (!workItemId) throw new TypeError('workItemId_required');
    if (action === 'instructions') {
      return { status: 201, body: kernel.compileInstructions({
        workspaceId, projectId, workItemId,
        contextSliceId: optionalString(body, 'contextSliceId'),
        skillKeys: body.skillKeys === undefined ? ['core.execute_bounded_work'] : requiredStringArray(body, 'skillKeys')
      }) };
    }
    if (action === 'run') {
      return { status: 200, body: await kernel.runWorkItem({
        workspaceId, projectId, workItemId,
        requiredCapabilities: body.requiredCapabilities === undefined ? ['reasoning'] : requiredStringArray(body, 'requiredCapabilities'),
        verifierCapabilities: body.verifierCapabilities === undefined ? ['verification'] : requiredStringArray(body, 'verifierCapabilities'),
        maxIterations: optionalInteger(body, 'maxIterations') ?? 2,
        maxMinutes: optionalInteger(body, 'maxMinutes') ?? 10,
        maxIncrementalCostMinor: optionalInteger(body, 'maxIncrementalCostMinor') ?? 0,
        spendEnvelopeId: optionalString(body, 'spendEnvelopeId'),
        spendPurpose: optionalString(body, 'spendPurpose') ?? 'phase2_model_execution',
        requireIndependentVerifier: optionalBoolean(body, 'requireIndependentVerifier') ?? true
      }) };
    }
    if (action === 'portability-drill') {
      return { status: 200, body: await kernel.runPortabilityDrill({
        workspaceId, projectId, workItemId,
        primaryRouteId: requiredString(body, 'primaryRouteId'),
        secondaryRouteId: requiredString(body, 'secondaryRouteId'),
        spendEnvelopeId: optionalString(body, 'spendEnvelopeId'),
        spendPurpose: optionalString(body, 'spendPurpose') ?? 'phase2_model_execution'
      }) };
    }
  }

  return null;
}

export function statusForPhase2Error(error) {
  const message = error instanceof Error ? error.message : String(error);
  if (error instanceof TypeError) return 400;
  if (message.includes('_not_found') || message.includes('not_found_in_') || message.includes('_missing:')) return 404;
  if (message.includes('required') || message.includes('unavailable') || message.includes('not_ready') || message.includes('stale') || message.includes('exceeded') || message.includes('mismatch') || message.includes('no_eligible') || message.includes('blocked')) return 409;
  if (message.startsWith('provider_http_error:')) return 502;
  if (message === 'provider_timeout') return 504;
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
function optionalQuery(url, key) { const value = url.searchParams.get(key); return value && value.trim() ? value.trim() : null; }
function requiredString(object, key) { const value = object[key]; if (typeof value !== 'string' || !value.trim()) throw new TypeError(`${key}_required`); return value.trim(); }
function optionalString(object, key) { const value = object[key]; return typeof value === 'string' && value.trim() ? value.trim() : null; }
function optionalInteger(object, key) { const value = object[key]; if (value === undefined || value === null || value === '') return null; if (!Number.isInteger(value)) throw new TypeError(`${key}_integer_required`); return value; }
function nullableInteger(object, key) { return optionalInteger(object, key); }
function optionalBoolean(object, key) { const value = object[key]; if (value === undefined || value === null) return null; if (typeof value !== 'boolean') throw new TypeError(`${key}_boolean_required`); return value; }
function requiredStringArray(object, key) { const value = object[key]; if (!Array.isArray(value) || !value.length || value.some((item) => typeof item !== 'string' || !item.trim())) throw new TypeError(`${key}_string_array_required`); return value.map((item) => item.trim()); }
function stringArrayOrDefault(value, fallback) { if (value === undefined) return fallback; if (!Array.isArray(value) || !value.length || value.some((item) => typeof item !== 'string' || !item.trim())) throw new TypeError('string_array_required'); return value.map((item) => item.trim()); }
function recordOrEmpty(value) { return value && typeof value === 'object' && !Array.isArray(value) ? value : {}; }
