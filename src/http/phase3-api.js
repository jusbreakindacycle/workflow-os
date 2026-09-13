import { Phase1ControlPlane } from '../domain/phase1-control-plane.js';
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

  // This route existed before Phase 3. Handle it here end-to-end rather than
  // consuming the request body and falling through to another handler. Projects
  // accepted through Phase 3.1 receive the strategy-specific graph; older
  // regression/compatibility Projects retain the original Phase 1 initializer.
  match = url.pathname.match(/^\/api\/projects\/([^/]+)\/work-graph\/initialize$/);
  if (match && request.method === 'POST') {
    const body = await readJson(request);
    const workspaceId = required(body.workspaceId, 'workspaceId');
    const projectId = decodeURIComponent(match[1]);
    if (isPhase31AcceptedProject(db, workspaceId, projectId)) {
      const state = planner.ensurePlan({ workspaceId, projectId });
      return { status: 200, body: graphShape(state) };
    }
    return { status: 200, body: new Phase1ControlPlane(db).ensureInitialWorkGraph({ workspaceId, projectId }) };
  }
  return null;
}

export function statusForPhase3Error(error) {
  const message = error instanceof Error ? error.message : String(error);
  if (message.includes('not_found')) return 404;
  if (message.includes('required') || message.includes('unsupported') || message.includes('existing_nonphase3')) return 409;
  if (error instanceof TypeError) return 400;
  return 0;
}

function graphShape(state) {
  const complete = new Set(state.items.filter((item) => item.status === 'complete').map((item) => item.id));
  const dependencyMap = new Map();
  for (const dep of state.dependencies) {
    if (!dependencyMap.has(dep.work_item_id)) dependencyMap.set(dep.work_item_id, []);
    dependencyMap.get(dep.work_item_id).push(dep.depends_on_work_item_id);
  }
  const nodes = state.items.map((item) => {
    const dependencyIds = dependencyMap.get(item.id) ?? [];
    const incomplete = dependencyIds.filter((id) => !complete.has(id));
    const readiness = item.status === 'ready' && incomplete.length === 0 ? 'eligible' : 'ineligible';
    return {
      ...item,
      dependency_ids: dependencyIds,
      readiness,
      readiness_reasons: readiness === 'eligible' ? [] : [
        ...(item.status === 'ready' ? [] : [`status:${item.status}`]),
        ...(incomplete.length ? [`dependencies:${incomplete.join(',')}`] : [])
      ]
    };
  });
  return {
    projectId: state.project.id,
    graphVersion: Math.max(1, ...nodes.map((item) => Number(item.version))),
    nodes,
    dependencies: state.dependencies,
    nextReady: nodes.filter((item) => item.readiness === 'eligible'),
    phase3: { plannerVersion: state.plannerVersion, activations: state.activations, specs: state.specs }
  };
}

function isPhase31AcceptedProject(db, workspaceId, projectId) {
  const project = db.prepare('SELECT * FROM projects WHERE id=? AND workspace_id=?').get(projectId, workspaceId);
  if (!project?.current_brief_version) return false;
  const brief = db.prepare("SELECT working_scope_json FROM project_briefs WHERE workspace_id=? AND project_id=? AND version=? AND status='accepted'").get(workspaceId, projectId, project.current_brief_version);
  if (!brief) return false;
  try { return Boolean(JSON.parse(brief.working_scope_json ?? '{}').phase31AnalysisRunId); }
  catch { return false; }
}
async function readJson(request) {
  let body = '';
  for await (const chunk of request) { body += chunk; if (body.length > 1_000_000) throw new Error('request_body_too_large'); }
  if (!body) return {};
  try { return JSON.parse(body); } catch { throw new TypeError('invalid_json'); }
}
function required(value, field) { if (typeof value !== 'string' || !value.trim()) throw new TypeError(`${field}_required`); return value.trim(); }
