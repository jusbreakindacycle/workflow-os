import assert from 'node:assert/strict';
import test from 'node:test';
import { validateAssignmentContract, validateContextSlice, validateProjectPack } from '../src/domain/contracts.js';

function validPack() {
  return {
    project_pack_version: '0.1',
    project: {
      workspace_id: 'ws', project_id: 'p', project_brief_version: 1, kind: 'internal_product',
      problem: 'A real problem', desired_outcome: 'A real outcome',
      delivery_strategy: { primary: 'custom_build', decision_ref: 'd1' },
      requirements: [{ id: 'r1', statement: 'Must work' }], non_goals: [], architecture_refs: [],
      work_graph: { graph_version: 1, work_item_refs: ['w1'] },
      policy: { data_classification: 'Internal', paid_execution: 'ask', raw_secrets_allowed: false },
      verification: { minimum_level: 'L2' }, escalation: ['scope_change']
    }
  };
}

function validAssignment() {
  return {
    assignment_version: '0.1',
    assignment: {
      id: 'a', workspace_id: 'ws', project_id: 'p', work_item_id: 'w', work_item_version: 1,
      role: 'mock', objective: 'Do bounded work', project_pack_ref: 'pack', context_slice_ref: 'slice',
      in_scope: ['bounded work'], out_of_scope: ['production'], allowed_capabilities: ['read_context'],
      budgets: { max_iterations: 2, max_minutes: 5, max_incremental_cost: 0, spend_envelope_ref: null },
      evidence_required: ['test'],
      side_effect_policy: { max_risk_tier: 'R0', production_allowed: false, destructive_allowed: false },
      stop_conditions: ['objective_met'], escalation: ['scope_uncertain']
    }
  };
}

test('Project Pack validator rejects malformed strategy, work graph, policy, and requirements', () => {
  for (const mutate of [
    (pack) => { pack.project.delivery_strategy.primary = 'magic_provider'; },
    (pack) => { pack.project.work_graph.work_item_refs = ['w1', 'w1']; },
    (pack) => { pack.project.policy.raw_secrets_allowed = true; },
    (pack) => { pack.project.requirements = [{ id: '', statement: 'bad' }]; }
  ]) {
    const pack = validPack();
    mutate(pack);
    assert.throws(() => validateProjectPack(pack), /contract_invalid/);
  }
});

test('Context Slice rejects reusable secrets and preserves exact work version', () => {
  const slice = {
    context_slice_version: '0.1', id: 's', workspace_id: 'ws', project_id: 'p', work_item_id: 'w',
    work_item_version: 3, project_pack_ref: 'pack', objective: 'Do work', requirements: [], constraints: [],
    authorized_refs: [], data_classification: 'Internal', expires_at: null
  };
  assert.equal(validateContextSlice(slice).work_item_version, 3);
  slice.constraints = ['api_key=supersecretvalue123'];
  assert.throws(() => validateContextSlice(slice), /raw_secret_rejected/);
});

test('Assignment contract validates budgets, evidence, side effects, stop conditions, and escalation', () => {
  assert.equal(validateAssignmentContract(validAssignment()).assignment.id, 'a');
  const paid = validAssignment();
  paid.assignment.budgets.max_incremental_cost = 1;
  paid.assignment.budgets.spend_envelope_ref = null;
  assert.throws(() => validateAssignmentContract(paid), /contract_invalid:assignment\.budgets\.spend_envelope_ref/);

  const unsafe = validAssignment();
  unsafe.assignment.side_effect_policy.max_risk_tier = 'R9';
  assert.throws(() => validateAssignmentContract(unsafe), /contract_invalid/);

  const noStops = validAssignment();
  noStops.assignment.stop_conditions = [null];
  assert.throws(() => validateAssignmentContract(noStops), /contract_invalid/);
});
