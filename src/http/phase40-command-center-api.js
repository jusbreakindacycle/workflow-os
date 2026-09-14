import { Phase1ControlPlane } from '../domain/phase1-control-plane.js';
import { Phase40ExternalActions } from '../domain/phase40-external-actions.js';

export function handlePhase40CommandCenterApi({ request, url, db }) {
  if (request.method !== 'GET') return null;
  const control = new Phase1ControlPlane(db);
  const actions = new Phase40ExternalActions(db);

  if (url.pathname === '/api/command-center') {
    const workspaceId = requiredQuery(url, 'workspaceId');
    const base = control.getCommandCenter({ workspaceId });
    const externalAttention = [];
    const projects = base.projects.map((project) => {
      const state = actions.getProjectState({ workspaceId, projectId: project.id });
      for (const item of state.needsAttention) externalAttention.push({ ...item, projectId: project.id });
      return { ...project, externalActionCount: state.plans.length, externalAttentionCount: state.needsAttention.length };
    });
    return { status: 200, body: { ...base, projects, needsMyAttention: [...base.needsMyAttention, ...externalAttention] } };
  }

  const match = url.pathname.match(/^\/api\/projects\/([^/]+)\/command-center$/);
  if (match) {
    const workspaceId = requiredQuery(url, 'workspaceId');
    const projectId = decodeURIComponent(match[1]);
    const base = control.getProjectCommandCenter({ workspaceId, projectId });
    const state = actions.getProjectState({ workspaceId, projectId });
    return {
      status: 200,
      body: {
        ...base,
        externalActions: state.plans,
        needsMyAttention: [...base.needsMyAttention, ...state.needsAttention]
      }
    };
  }
  return null;
}

function requiredQuery(url, key) {
  const value = url.searchParams.get(key);
  if (!value) throw new TypeError(`${key}_required`);
  return value;
}
