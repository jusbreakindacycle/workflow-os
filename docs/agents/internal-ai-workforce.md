# Internal AI Workforce

## Purpose

Workflow OS should let one human operate like a small AI-native delivery company without forcing the human to manually copy context, dispatch every prompt, remember every dependency, or ask every agent what happened.

Internal agents are **delivery workers for the operator**. They are distinct from future client-facing AI Employees.

## Core rule

> Workflow OS owns Project and WorkItem state. Internal agents receive bounded assignments and return artifacts/evidence.

No internal agent may make its private context, memory, or self-reported status the source of truth for the Project.

## Assignment contract

An internal AgentAssignment should define:

- Project ID and WorkItem ID;
- role;
- exact objective;
- authoritative input/artifact references;
- in-scope and out-of-scope work;
- allowed tools/capabilities;
- environment/repository/worktree when applicable;
- deadline/time/tool-call/cost/iteration budgets;
- required output artifacts;
- verification/evidence requirements;
- side-effect/approval rules;
- stop conditions;
- escalation target/reason codes.

The agent returns results; Workflow OS or an authorized adapter persists the accepted state transition.

## Initial internal roles

These are capability roles, not unconditional permissions.

### 1. Problem / Intake Analyst

Purpose:

- clarify the user/client problem;
- identify desired outcome, constraints, stakeholders, unknowns, and success measures;
- distinguish symptoms from the actual problem.

Must not invent a solution before enough problem evidence exists.

### 2. Research Analyst

Purpose:

- research domain, competitors, regulations, APIs/tools, feasibility, user evidence, or technical unknowns;
- produce sources, uncertainty, contradictions, and open questions.

Must separate evidence from inference.

### 3. Product / Requirements Analyst

Purpose:

- convert accepted problem evidence into scope, user outcomes, requirements, non-goals, acceptance criteria, and edge cases.

Must not silently expand scope.

### 4. Solution Architect

Purpose:

- select the simplest architecture that satisfies requirements/risk;
- define boundaries, data/integration model, runtime choices, security/reliability concerns, and architectural decisions.

Must respect existing ADRs and avoid speculative scale infrastructure.

### 5. Planner / Orchestrator

Purpose:

- decompose accepted scope into dependency-aware WorkItems;
- identify which work can run sequentially or in parallel;
- assign bounded specialists;
- surface blockers and required approvals.

The orchestrator does not become the canonical state store and does not approve its own high-impact work.

### 6. Implementation Workers

Potential specializations:

- frontend/web;
- backend/control-plane;
- mobile;
- database/data;
- automation/integration;
- execution adapter;
- agent-runtime integration;
- infrastructure/deployment configuration.

Implementation agents must work from exact accepted requirements/architecture and must produce verifiable output, not only code changes.

### 7. Verification / QA Agent

Purpose:

- independently reproduce required behavior;
- run applicable checks and real user flows;
- attempt to falsify completion claims;
- produce evidence and actionable failures.

Prefer a verifier that did not author the implementation for material changes.

### 8. Security / Reliability / AI-Safety Reviewers

Use the specialist reviewer contracts in `docs/agents/reviewer-contracts.md`.

These agents challenge authorization, side effects, failure recovery, agent/tool boundaries, workspace isolation, and unsafe assumptions.

### 9. Adversarial Reviewer

Assumes the solution may be wrong until evidence says otherwise. Attempts to break the accepted slice rather than merely repeat happy-path tests.

### 10. Deployment / Operations Agent

Purpose:

- prepare approved deployment;
- validate environment/configuration prerequisites;
- execute only permitted release actions;
- collect deployment evidence;
- verify health/rollback readiness;
- register deployment state.

Production authorization remains policy-controlled.

### 11. Incident / Maintenance Agent

Purpose:

- triage production signals/incidents;
- gather evidence;
- classify likely cause;
- create/execute bounded repair or maintenance WorkItems;
- verify and document recovery.

High-impact remediation may require human approval.

### 12. Documentation / Handoff Agent

Purpose:

- keep Project/repository/operator/client documentation synchronized with implemented behavior;
- generate handoff and maintenance guidance from canonical artifacts/evidence.

## Role composition

Do not create an agent simply because a human company would have that job title. Create a specialist role only when separation improves context, permissions, verification, or parallelism.

A single capable agent may perform several low-risk sequential WorkItems if that is simpler and still verifiable.

## Orchestration pattern

Preferred conceptual flow:

```text
Human intent
  -> Project state
  -> Work graph
  -> Planner selects ready work
  -> bounded Assignment
  -> specialist executes
  -> verifier/reviewer checks where required
  -> evidence persisted
  -> Project state transition
  -> next-ready work derived
```

The system should avoid chat-driven orchestration such as “Agent A, tell Agent B what happened” when the same handoff can be represented by artifacts and state references.

## Parallelism gate

Parallel agents are useful only when work is genuinely independent.

Before parallel execution, verify:

- dependency graph permits it;
- agents do not mutate the same state unsafely;
- repositories use isolated branches/worktrees where appropriate;
- database/environment collisions are controlled;
- each worker has bounded scope;
- integration ownership is explicit;
- independent verification exists.

If these conditions are absent, run sequentially.

## Agent handoff format

A handoff should contain:

- completed objective;
- artifacts/refs created or changed;
- evidence/checks performed;
- assumptions/known limitations;
- unresolved findings;
- proposed next-ready WorkItem(s);
- any decision/approval required.

Do not rely on hidden reasoning or long conversational transcripts as the handoff contract.

## Failure handling

Agent failure becomes explicit state:

- `blocked` — missing dependency/input/permission;
- `failed` — attempted work did not satisfy the exit condition;
- `needs_approval` — cannot safely continue without human decision;
- `waiting_external` — provider/person/event dependency;
- `budget_exhausted` — cost/time/iteration/tool budget reached.

The agent must stop/escalate rather than loop indefinitely.

## Autonomy ladder for internal agents

Use an evidence-based progression:

1. **Advisory** — proposes plan/output; human executes/accepts.
2. **Supervised execution** — agent acts in sandbox/dev; human reviews material result.
3. **Bounded autonomous task** — agent can complete a narrow WorkItem with machine verification and defined rollback/escalation.
4. **Parallel bounded workers** — independent WorkItems can run concurrently with isolation/integration/verification.

Do not jump from prompt demos to a self-organizing permanent workforce.

## Relationship to client-facing AI Employees

Internal delivery agents build and maintain projects **for the operator**.

Client-facing AI Employees are governed business roles delivered **inside/for a client Project** and follow the separate contracts under `docs/ai-employees/`.

The two concepts may share runtime/tool infrastructure, but they have different authority, lifecycle, evaluation, and product semantics.
