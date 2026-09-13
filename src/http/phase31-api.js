// @ts-check
import { Phase31Discovery } from '../domain/phase31-discovery.js';

const maxBodyBytes = 256 * 1024;

/**
 * @param {{request: import('node:http').IncomingMessage, url: URL, db: import('node:sqlite').DatabaseSync}} input
 * @returns {Promise<{status:number, body:unknown}|null>}
 */
export async function handlePhase31Api({ request, url, db }) {
  const match = url.pathname.match(/^\/api\/phase31\/intakes\/([^/]+)(?:\/(analyze|questions|accept))?$/);
  if (!match) return null;
  const intakeId = decodeURIComponent(match[1]);
  const action = match[2] ?? null;
  const discovery = new Phase31Discovery(db);

  if (request.method === 'GET' && action === null) {
    const workspaceId = url.searchParams.get('workspaceId');
    if (!workspaceId) throw new TypeError('workspaceId_required');
    return { status: 200, body: discovery.getSnapshot({ workspaceId, intakeId }) };
  }
  if (request.method === 'POST' && action === 'analyze') {
    const body = await readJson(request);
    return { status: 200, body: await discovery.analyze({ workspaceId: requiredString(body, 'workspaceId'), intakeId }) };
  }
  if (request.method === 'PUT' && action === 'questions') {
    const body = await readJson(request);
    if (!Array.isArray(body.responses)) throw new TypeError('responses_required');
    return { status: 200, body: discovery.answerQuestions({ workspaceId: requiredString(body, 'workspaceId'), intakeId, responses: body.responses }) };
  }
  if (request.method === 'POST' && action === 'accept') {
    const body = await readJson(request);
    return { status: 200, body: discovery.accept({ workspaceId: requiredString(body, 'workspaceId'), intakeId, expectedProjectVersion: requiredInteger(body, 'expectedProjectVersion'), overrides: isRecord(body.overrides) ? body.overrides : {} }) };
  }
  return { status: 405, body: { error: 'method_not_allowed' } };
}

export function statusForPhase31Error(error) {
  const message = error instanceof Error ? error.message : String(error);
  if (error instanceof TypeError) return 400;
  if (message.includes('_not_found') || message.includes('not_found_in_')) return 404;
  if (message.startsWith('concurrency_conflict:')) return 409;
  if (['intake_already_accepted','phase31_previous_questions_unresolved','phase31_discovery_round_limit_reached','phase31_reanalysis_required_after_questions','phase31_research_required_before_acceptance','phase31_free_first_reasoning_route_unavailable','phase31_successful_analysis_required','phase31_strategy_recommendation_required'].includes(message)) return 409;
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
function requiredInteger(object, key) {
  const value = object[key];
  if (!Number.isInteger(value)) throw new TypeError(`${key}_integer_required`);
  return value;
}
function isRecord(value) { return typeof value === 'object' && value !== null && !Array.isArray(value); }
