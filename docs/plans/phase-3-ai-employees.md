# Phase 3 — Governed AI Employees

This plan defines future implementation work. It does **not** expand Phase 1 MVP.

## Entry criteria

Phase 3 begins only after:

- core Workflow OS workflow lifecycle is stable;
- one execution adapter works;
- workflow version/run attribution works;
- tool contracts exist;
- risk/approval enforcement exists;
- workspace isolation is tested;
- observability/recovery works;
- bounded AI transforms have evaluation support.

## Gate 3.0 — Role governance classification

Before building a role, classify:

- business outcome;
- affected people/processes;
- high-stakes domain applicability;
- special-review requirement;
- human owner;
- whether a plain workflow is sufficient.

High-stakes roles follow `docs/ai-employees/high-stakes-role-gate.md`.

## Gate 3.1 — Role registry

Implement:

- AI Employee Spec validation;
- Role Template;
- Role Instance;
- immutable Role Version;
- human owner binding;
- lifecycle states;
- governance classification.

No agent runtime yet.

## Gate 3.2 — Task assignments

Implement bounded Task Assignment state independent of any LLM session.

Prove:

- deadline;
- budget;
- role-version attribution;
- terminal state;
- escalation;
- cancellation/pause;
- duplicate-trigger handling.

## Gate 3.3 — Capability/authority

Bind roles to:

- workflows;
- skills;
- tools;
- knowledge;
- identity mode;
- autonomy class;
- risk ceiling.

Prove unauthorized tool calls fail outside model reasoning.

## Gate 3.4 — Context and memory

Start with:

- task context;
- approved knowledge;
- memory disabled by default.

Then add one explicit memory mode with:

- workspace scoping;
- schema;
- provenance;
- retention;
- poisoning tests.

## Gate 3.5 — Single-role agent session

Add dynamic reasoning only for one bounded use case.

Required:

- Agent Runtime Adapter;
- tool allowlist/interception;
- iteration/tool/cost/runtime limits;
- stop/escalation conditions;
- structured result;
- no hidden process state;
- versioned instruction/model policy.

## Gate 3.6 — Evaluation lifecycle

Implement:

- test suite;
- adversarial suite;
- shadow mode;
- supervised mode;
- promotion/demotion evidence;
- regression on prompt/model/tool/knowledge/authority changes.

## Gate 3.7 — Role observability and ROI

Add:

- task success;
- correction/escalation;
- policy violations;
- costs;
- review time;
- business outcome metrics;
- pause/demotion controls.

## Gate 3.8 — Reusable Role Templates

Sanitize a successful role into client-neutral reusable IP.

## Explicitly deferred

Until a new gate/ADR:

- unrestricted autonomy;
- self-created persistent roles;
- self-authority expansion;
- multi-agent delegation depth > 0;
- agent-to-agent social/chat simulation;
- human employee surveillance/scoring;
- public AI Employee marketplace;
- legal/HR claims that an AI system is a human employee replacement.

## Phase 3 exit criteria

A single AI Employee role can:

1. pass governance/high-stakes classification;
2. receive a bounded real-shaped task;
3. use approved workflows/tools;
4. respect identity/authority;
5. operate within budgets;
6. escalate correctly;
7. survive tool/model failures safely;
8. produce observable, attributable outcomes;
9. pass adversarial/regression evaluations;
10. move through shadow/supervised/active lifecycle where allowed;
11. show measurable business value.

A high-stakes role may intentionally remain capped at Shadow or Supervised if client/domain policy requires it.
