// @ts-check
import crypto from 'node:crypto';

const DELIVERY_STRATEGIES = new Set([
  'process_change', 'adopt_existing', 'configure', 'integrate', 'automate',
  'custom_build', 'hybrid', 'research_pilot', 'defer'
]);
const DATA_CLASSES = new Set(['Public', 'Internal', 'Confidential', 'Restricted']);
const EVIDENCE_LEVELS = new Set(['L1', 'L2', 'L3', 'L4', 'L5']);
const RISK_TIERS = new Set(['R0', 'R1', 'R2', 'R3']);

export function canonicalJson(value) {
  return JSON.stringify(sortValue(value));
}

export function sha256Json(value) {
  return crypto.createHash('sha256').update(canonicalJson(value)).digest('hex');
}

export function assertNoRawSecrets(value) {
  const hits = [];
  visit(value, '$', (path, text) => {
    const patterns = [
      /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/i,
      /\bAKIA[0-9A-Z]{16}\b/,
      /\bsk-[A-Za-z0-9_-]{16,}\b/,
      /\b(?:api[_-]?key|password|secret|access[_-]?token|refresh[_-]?token)\s*[:=]\s*[^\s,;]{6,}/i
    ];
    if (patterns.some((pattern) => pattern.test(text))) hits.push(path);
  });
  if (hits.length > 0) throw new Error(`raw_secret_rejected:${hits.join(',')}`);
}

export function validateProjectPack(value) {
  const root = object(value, 'project_pack');
  if (root.project_pack_version !== '0.1') fail('project_pack_version');
  const project = object(root.project, 'project_pack.project');
  text(project.workspace_id, 'project.workspace_id');
  text(project.project_id, 'project.project_id');
  integer(project.project_brief_version, 'project.project_brief_version', 1);
  if (!['client_delivery', 'internal_product', 'experiment'].includes(String(project.kind))) fail('project.kind');
  text(project.problem, 'project.problem');
  text(project.desired_outcome, 'project.desired_outcome');

  const strategy = object(project.delivery_strategy, 'project.delivery_strategy');
  if (!DELIVERY_STRATEGIES.has(String(strategy.primary))) fail('project.delivery_strategy.primary');
  text(strategy.decision_ref, 'project.delivery_strategy.decision_ref');

  if (!Array.isArray(project.requirements)) fail('project.requirements');
  for (const [index, requirement] of project.requirements.entries()) {
    const row = object(requirement, `project.requirements.${index}`);
    text(row.id, `project.requirements.${index}.id`);
    text(row.statement, `project.requirements.${index}.statement`);
  }
  stringArray(project.non_goals, 'project.non_goals');

  const graph = object(project.work_graph, 'project.work_graph');
  integer(graph.graph_version, 'project.work_graph.graph_version', 1);
  uniqueStringArray(graph.work_item_refs, 'project.work_graph.work_item_refs');

  const policy = object(project.policy, 'project.policy');
  if (!DATA_CLASSES.has(String(policy.data_classification))) fail('project.policy.data_classification');
  if (!['ask', 'preapproved_with_envelope', 'forbidden'].includes(String(policy.paid_execution))) fail('project.policy.paid_execution');
  if (policy.raw_secrets_allowed !== false) fail('project.policy.raw_secrets_allowed');

  const verification = object(project.verification, 'project.verification');
  if (!EVIDENCE_LEVELS.has(String(verification.minimum_level))) fail('project.verification.minimum_level');
  uniqueStringArray(project.escalation, 'project.escalation');
  assertNoRawSecrets(value);
  return value;
}

export function validateContextSlice(value) {
  const slice = object(value, 'context_slice');
  if (slice.context_slice_version !== '0.1') fail('context_slice_version');
  for (const key of ['id', 'workspace_id', 'project_id', 'work_item_id', 'project_pack_ref', 'objective']) text(slice[key], `context_slice.${key}`);
  integer(slice.work_item_version, 'context_slice.work_item_version', 1);
  if (!DATA_CLASSES.has(String(slice.data_classification))) fail('context_slice.data_classification');
  uniqueStringArray(slice.authorized_refs, 'context_slice.authorized_refs');
  if (slice.requirements !== undefined) stringArray(slice.requirements, 'context_slice.requirements');
  if (slice.constraints !== undefined) stringArray(slice.constraints, 'context_slice.constraints');
  assertNoRawSecrets(value);
  return value;
}

export function validateAssignmentContract(value) {
  const root = object(value, 'assignment_contract');
  if (root.assignment_version !== '0.1') fail('assignment_version');
  const assignment = object(root.assignment, 'assignment');
  for (const key of ['id', 'workspace_id', 'project_id', 'work_item_id', 'role', 'objective', 'project_pack_ref', 'context_slice_ref']) text(assignment[key], `assignment.${key}`);
  integer(assignment.work_item_version, 'assignment.work_item_version', 1);
  stringArray(assignment.in_scope, 'assignment.in_scope');
  stringArray(assignment.out_of_scope, 'assignment.out_of_scope');
  uniqueStringArray(assignment.allowed_capabilities, 'assignment.allowed_capabilities');
  stringArray(assignment.evidence_required, 'assignment.evidence_required');
  stringArray(assignment.stop_conditions, 'assignment.stop_conditions');
  stringArray(assignment.escalation, 'assignment.escalation');

  const budgets = object(assignment.budgets, 'assignment.budgets');
  integer(budgets.max_iterations, 'assignment.budgets.max_iterations', 1);
  integer(budgets.max_minutes, 'assignment.budgets.max_minutes', 1);
  if (typeof budgets.max_incremental_cost !== 'number' || budgets.max_incremental_cost < 0 || !Number.isFinite(budgets.max_incremental_cost)) fail('assignment.budgets.max_incremental_cost');
  if (budgets.max_incremental_cost > 0) text(budgets.spend_envelope_ref, 'assignment.budgets.spend_envelope_ref');

  const sideEffects = object(assignment.side_effect_policy, 'assignment.side_effect_policy');
  if (!RISK_TIERS.has(String(sideEffects.max_risk_tier))) fail('assignment.side_effect_policy.max_risk_tier');
  if (typeof sideEffects.production_allowed !== 'boolean' || typeof sideEffects.destructive_allowed !== 'boolean') fail('assignment.side_effect_policy');
  assertNoRawSecrets(value);
  return value;
}

function sortValue(value) {
  if (Array.isArray(value)) return value.map(sortValue);
  if (value && typeof value === 'object') {
    const result = {};
    for (const key of Object.keys(value).sort()) result[key] = sortValue(value[key]);
    return result;
  }
  return value;
}

function visit(value, path, onText) {
  if (typeof value === 'string') { onText(path, value); return; }
  if (Array.isArray(value)) { value.forEach((item, index) => visit(item, `${path}[${index}]`, onText)); return; }
  if (value && typeof value === 'object') for (const [key, item] of Object.entries(value)) visit(item, `${path}.${key}`, onText);
}

function object(value, field) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) fail(field);
  return /** @type {Record<string, any>} */ (value);
}
function text(value, field) { if (typeof value !== 'string' || value.trim() === '') fail(field); }
function integer(value, field, minimum) { if (!Number.isInteger(value) || value < minimum) fail(field); }
function stringArray(value, field) {
  if (!Array.isArray(value) || value.some((item) => typeof item !== 'string' || item.trim() === '')) fail(field);
}
function uniqueStringArray(value, field) {
  stringArray(value, field);
  if (new Set(value).size !== value.length) fail(field);
}
function fail(field) { throw new TypeError(`contract_invalid:${field}`); }
