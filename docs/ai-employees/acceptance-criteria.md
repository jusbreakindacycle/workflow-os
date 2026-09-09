# Phase 3 AI Employee Acceptance Criteria

These criteria define the first governed AI Employee capability. They do not alter Phase 1 MVP.

## A. Role definition and versioning

- [ ] AI Employee Spec validates against the canonical schema.
- [ ] Role Template is client-neutral and contains no client secrets.
- [ ] Role Instance is workspace-scoped and has a human owner.
- [ ] Published RoleVersion is immutable.
- [ ] Material role changes create a new version.
- [ ] Historical tasks reference the exact RoleVersion.

## B. Governance / high-stakes gate

- [ ] Role declares applicable high-stakes domains.
- [ ] Any non-empty high-stakes classification requires special review.
- [ ] Appropriate client/domain/legal/compliance review is recorded where applicable.
- [ ] High-stakes autonomy is capped according to role-specific policy.
- [ ] The system does not infer that a generic technical pass equals regulatory/legal approval.

## C. Task ownership

- [ ] Every role invocation creates/uses a bounded TaskAssignment.
- [ ] Task has deadline/runtime/cost/tool budgets.
- [ ] Task has a terminal state.
- [ ] Agent sessions cannot continue indefinitely after task completion/cancellation.
- [ ] Duplicate triggers do not create unintended duplicate business work.

## D. Capability and authority

- [ ] Role uses allowlisted workflows/skills/tools only.
- [ ] Responsibility does not automatically grant tool permission.
- [ ] Runtime tool calls are authorized outside model reasoning.
- [ ] Prohibited actions cannot execute.
- [ ] R3 actions require bound human approval.
- [ ] Role cannot modify/publish its own authority.
- [ ] Actor/identity chain is auditable.

## E. Workspace/data isolation

- [ ] Role, task, knowledge, memory, tools, and integrations enforce workspace scope.
- [ ] Cross-workspace memory is disabled.
- [ ] No reusable secret appears in role spec, model context, normal logs, or templates.
- [ ] Provider/model use is compatible with declared data policy.

## F. Context and memory

- [ ] Context is assembled explicitly for the task.
- [ ] Memory is disabled by default or uses a declared write mode.
- [ ] Memory writes preserve source/provenance.
- [ ] Untrusted content cannot modify role authority/instructions.
- [ ] Retention/deletion rules are enforceable for persisted memory.

## G. Agent runtime

- [ ] Runtime is behind an adapter/capability manifest.
- [ ] Tool proposals are intercepted by Workflow OS policy.
- [ ] Iteration/tool/time/cost limits are enforced.
- [ ] Instruction and model policy are versioned/referenced.
- [ ] Model/provider changes trigger applicable regression evaluation.
- [ ] Runtime failures normalize into explicit task states.

## H. Human escalation

- [ ] Every deployed role has a human owner/escalation target.
- [ ] Out-of-scope/ambiguous/high-risk work escalates or rejects safely.
- [ ] Human timeout behavior is explicit.
- [ ] Approval binds to exact proposed action/version/context as required.
- [ ] Pause/demotion is operationally available.

## I. Evaluation and promotion

- [ ] Role has functional, authority, adversarial, reliability, and escalation tests.
- [ ] Shadow mode prevents unauthorized material side effects.
- [ ] Promotion decisions are version-specific.
- [ ] No unresolved Critical/High security/authority findings exist before Active.
- [ ] Production incidents add regression coverage where relevant.

## J. Observability and ROI

- [ ] Tasks expose role version, status, tools/workflows, approvals, errors, cost, and outcome metadata.
- [ ] Human correction/escalation/review effort is measurable.
- [ ] Role-specific business outcome is measured against a baseline.
- [ ] Policy violation and unauthorized-action attempts are observable.
- [ ] Human owner can pause the role.

## K. Multi-agent restraint

- [ ] Initial implementation works with max delegation depth 0.
- [ ] No multi-agent capability is required to satisfy first-role acceptance criteria.
- [ ] Any future delegation preserves/narrows authority and has bounded depth/budget.

## Exit

For an ordinary low/medium-risk role, first-role capability is complete when it can move through:

`Test -> Shadow -> Supervised -> Active`

with evidence for the applicable criteria above.

A high-stakes role may intentionally stop at Shadow or Supervised according to its special-review policy.
