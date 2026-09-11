// @ts-check
import { Phase1ControlPlane } from '../domain/phase1-control-plane.js';

const maxBodyBytes = 256 * 1024;

/**
 * @param {{request: import('node:http').IncomingMessage, url: URL, db: import('node:sqlite').DatabaseSync}} input
 * @returns {Promise<{status:number, body:unknown}|null>}
 */
export async function handleControlPlaneApi({ request, url, db }) {
  const control = new Phase1ControlPlane(db);

  if (request.method === 'GET' && url.pathname === '/api/command-center') {
    return { status: 200, body: control.getCommandCenter({ workspaceId: requiredQuery(url, 'workspaceId') }) };
  }

  let match = url.pathname.match(/^\/api\/projects\/([^/]+)\/(command-center|work-graph|work-graph\/initialize|readiness\/refresh|project-pack|context-slices|revisions|repository-proposals|assignments|spend-requests|metered-actions)$/);
  if (match) {
    const projectId = decodeURIComponent(match[1]);
    const action = match[2];
    if (request.method === 'GET' && action === 'command-center') return { status: 200, body: control.getProjectCommandCenter({ workspaceId: requiredQuery(url, 'workspaceId'), projectId }) };
    if (request.method === 'GET' && action === 'work-graph') return { status: 200, body: control.getWorkGraph({ workspaceId: requiredQuery(url, 'workspaceId'), projectId }) };

    if (request.method === 'POST') {
      const body = await readJson(request);
      const workspaceId = requiredString(body, 'workspaceId');
      if (action === 'work-graph/initialize') return { status: 200, body: control.ensureInitialWorkGraph({ workspaceId, projectId }) };
      if (action === 'readiness/refresh') return { status: 200, body: control.refreshDerivedReadiness({ workspaceId, projectId }) };
      if (action === 'project-pack') return { status: 201, body: control.generateProjectPack({ workspaceId, projectId }) };
      if (action === 'context-slices') return { status: 201, body: control.createContextSlice({ workspaceId, projectId, workItemId: requiredString(body, 'workItemId'), purpose: optionalString(body, 'purpose') ?? 'phase1_assignment' }) };
      if (action === 'revisions') return {
        status: 201,
        body: control.reviseProjectGoal({
          workspaceId,
          projectId,
          expectedProjectVersion: requiredInteger(body, 'expectedProjectVersion'),
          problem: requiredString(body, 'problem'),
          desiredOutcome: requiredString(body, 'desiredOutcome'),
          requestedSolution: optionalString(body, 'requestedSolution'),
          deliveryStrategy: requiredString(body, 'deliveryStrategy'),
          workingScope: recordOrEmpty(body.workingScope),
          reason: requiredString(body, 'reason'),
          affectedWorkItemIds: body.affectedWorkItemIds === null || body.affectedWorkItemIds === undefined ? null : stringArray(body.affectedWorkItemIds, 'affectedWorkItemIds')
        })
      };
      if (action === 'repository-proposals') return { status: 201, body: control.proposeRepository({ workspaceId, projectId, reason: requiredString(body, 'reason'), desiredVisibility: optionalString(body, 'desiredVisibility') ?? 'private' }) };
      if (action === 'assignments') return {
        status: 201,
        body: control.createMockAssignment({
          workspaceId,
          projectId,
          workItemId: requiredString(body, 'workItemId'),
          role: optionalString(body, 'role') ?? 'phase1_mock_worker',
          maxIterations: optionalInteger(body, 'maxIterations') ?? 3,
          maxMinutes: optionalInteger(body, 'maxMinutes') ?? 10,
          maxIncrementalCost: optionalInteger(body, 'maxIncrementalCost') ?? 0,
          spendEnvelopeId: optionalString(body, 'spendEnvelopeId')
        })
      };
      if (action === 'spend-requests') return {
        status: 201,
        body: control.requestSpend({
          workspaceId,
          projectId,
          workItemId: optionalString(body, 'workItemId'),
          purpose: requiredString(body, 'purpose'),
          currency: optionalString(body, 'currency') ?? 'USD',
          maxAmountMinor: requiredInteger(body, 'maxAmountMinor')
        })
      };
      if (action === 'metered-actions') return {
        status: 201,
        body: control.executeMeteredAction({
          workspaceId,
          projectId,
          workItemId: optionalString(body, 'workItemId'),
          spendEnvelopeId: optionalString(body, 'spendEnvelopeId'),
          purpose: requiredString(body, 'purpose'),
          estimatedAmountMinor: body.estimatedAmountMinor === null || body.estimatedAmountMinor === undefined ? null : requiredInteger(body, 'estimatedAmountMinor'),
          actualAmountMinor: body.actualAmountMinor === null || body.actualAmountMinor === undefined ? null : requiredInteger(body, 'actualAmountMinor'),
          currency: optionalString(body, 'currency') ?? 'USD'
        })
      };
    }
    return { status: 405, body: { error: 'method_not_allowed' } };
  }

  match = url.pathname.match(/^\/api\/repository-proposals\/([^/]+)\/(request-approval|mock-execute)$/);
  if (match && request.method === 'POST') {
    const body = await readJson(request);
    const workspaceId = requiredString(body, 'workspaceId');
    const projectId = requiredString(body, 'projectId');
    const repositoryProposalId = decodeURIComponent(match[1]);
    if (match[2] === 'request-approval') return { status: 201, body: control.requestRepositoryApproval({ workspaceId, projectId, repositoryProposalId }) };
    return { status: 201, body: control.executeMockRepository({ workspaceId, projectId, repositoryProposalId }) };
  }

  match = url.pathname.match(/^\/api\/approvals\/([^/]+)\/resolve$/);
  if (match && request.method === 'POST') {
    const body = await readJson(request);
    return { status: 200, body: control.resolveApproval({
      workspaceId: requiredString(body, 'workspaceId'),
      projectId: requiredString(body, 'projectId'),
      approvalId: decodeURIComponent(match[1]),
      decision: requiredString(body, 'decision'),
      evidence: Array.isArray(body.evidence) ? body.evidence : []
    }) };
  }

  match = url.pathname.match(/^\/api\/assignments\/([^/]+)\/(start|finish|evidence|verify)$/);
  if (match && request.method === 'POST') {
    const body = await readJson(request);
    const workspaceId = requiredString(body, 'workspaceId');
    const projectId = requiredString(body, 'projectId');
    const assignmentId = decodeURIComponent(match[1]);
    if (match[2] === 'start') return { status: 200, body: control.startAssignment({ workspaceId, projectId, assignmentId }) };
    if (match[2] === 'finish') return { status: 200, body: control.finishAssignmentExecution({ workspaceId, projectId, assignmentId }) };
    if (match[2] === 'evidence') return { status: 201, body: control.addAssignmentEvidence({ workspaceId, projectId, assignmentId, level: optionalString(body, 'level') ?? 'L2', summary: requiredString(body, 'summary'), evidenceType: optionalString(body, 'evidenceType') ?? 'phase1_mock_result' }) };
    return { status: 200, body: control.verifyAssignment({ workspaceId, projectId, assignmentId, outcome: requiredString(body, 'outcome'), level: optionalString(body, 'level') ?? 'L2', summary: requiredString(body, 'summary') }) };
  }

  match = url.pathname.match(/^\/api\/spend-requests\/([^/]+)\/resolve$/);
  if (match && request.method === 'POST') {
    const body = await readJson(request);
    return { status: 200, body: control.resolveSpendRequest({
      workspaceId: requiredString(body, 'workspaceId'),
      projectId: requiredString(body, 'projectId'),
      spendRequestId: decodeURIComponent(match[1]),
      decision: requiredString(body, 'decision'),
      evidence: Array.isArray(body.evidence) ? body.evidence : []
    }) };
  }

  return null;
}

export function statusForControlPlaneError(error) {
  const message = error instanceof Error ? error.message : String(error);
  if (error instanceof TypeError) return 400;
  if (message.includes('_not_found') || message.includes('not_found_in_') || message.includes('_missing:')) return 404;
  if (message.includes('stale') || message.includes('not_ready') || message.includes('required') || message.includes('not_approved') || message.includes('not_requested') || message.includes('unavailable') || message.includes('exceeded') || message.includes('conflict')) return 409;
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
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new TypeError('json_object_required');
    return parsed;
  } catch (error) {
    if (error instanceof TypeError) throw error;
    throw new TypeError('invalid_json');
  }
}

function requiredQuery(url, key) {
  const value = url.searchParams.get(key);
  if (!value) throw new TypeError(`${key}_required`);
  return value;
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
function optionalInteger(object, key) {
  const value = object[key];
  if (value === undefined || value === null || value === '') return null;
  if (!Number.isInteger(value)) throw new TypeError(`${key}_integer_required`);
  return value;
}
function recordOrEmpty(value) {
  return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
}
function stringArray(value, key) {
  if (!Array.isArray(value) || value.some((item) => typeof item !== 'string' || item.trim() === '')) throw new TypeError(`${key}_string_array_required`);
  return value.map((item) => item.trim());
}
