import { Phase32Workforce } from '../domain/phase32-workforce.js';

export async function handlePhase3Api({ request, url, db }) {
  const planner = new Phase32Workforce(db);
  let match = url.pathname.match(/^\/api\/phase3\/projects\/([^/]+)\/plan$/);
  if (match && request.method === 'POST') {
    const body = await readJson(request);
    return { status: 200, body: planner.ensurePlan({ workspaceId: required(body.workspaceId, 'workspaceId'), projectId: decodeURIComponent(match[1]) }) };
  }
  match = url.pathname.match(/^\/api\/phase3\/projects\/([^/]+)\/state$/);
  if (match && request.method === 'GET') {
    return { status: 200, body: planner.getState({ workspaceId: required(url.searchParams.get('workspaceId'), 'workspaceId'), projectId: decodeURIComponent(match[1]) }) };
  }
  return null;
}

export function statusForPhase3Error(error) {
  const message = error instanceof Error ? error.message : String(error);
  if (message.includes('not_found')) return 404;
  if (message.includes('required') || message.includes('unsupported') || message.includes('existing_nonphase3')) return 409;
  if (error instanceof TypeError) return 400;
  return 500;
}

async function readJson(request) {
  let body = '';
  for await (const chunk of request) { body += chunk; if (body.length > 1_000_000) throw new Error('request_body_too_large'); }
  if (!body) return {};
  try { return JSON.parse(body); } catch { throw new TypeError('invalid_json'); }
}
function required(value, field) { if (typeof value !== 'string' || !value.trim()) throw new TypeError(`${field}_required`); return value.trim(); }
