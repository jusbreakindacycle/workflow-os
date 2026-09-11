# Agent Operability and Verification

## Purpose

Workflow OS should be buildable and maintainable by AI engineering agents without turning the human operator into the agent's eyes, terminal, test runner, and manual verifier.

A capable coding agent is not trustworthy merely because it can generate code. The environment must let it understand the project, execute the real system, observe outcomes, verify behavior, and produce evidence.

## Core principle

> Prefer a verifiable agent environment over a longer prompt.

When a requirement can be enforced mechanically, prefer:

- schema validation;
- type systems;
- architecture boundaries;
- lint/static checks;
- tests/evaluations;
- CI gates;
- policy checks;
- deployment/health checks;

over repeatedly asking an agent to remember prose.

## Minimum agent-operability capabilities

For a repository/project that is ready for serious agent implementation, an unfamiliar authorized engineering agent should be able to determine:

1. what the Project/active WorkItem is trying to achieve;
2. which repository/docs/contracts are authoritative;
3. how to install/bootstrap dependencies;
4. how to start the required local/dev services;
5. how to know the system is ready;
6. how to navigate to or invoke the relevant feature/API/workflow;
7. how to inspect logs/state/errors;
8. how to run relevant automated checks;
9. how to exercise the real user/business path when applicable;
10. how to capture evidence;
11. how to clean up test state;
12. how to stop/escalate when verification is impossible.

If a human must repeatedly perform these basic operations for the agent, the harness is incomplete.

## Project/repository map

Maintain concise discoverable guidance for:

- important directories/modules;
- feature-to-code locations;
- major runtime boundaries;
- commands;
- test/eval locations;
- deployment/config entry points;
- architecture restrictions;
- common failure/diagnostic paths.

Do not duplicate the entire codebase in documentation. Map the paths and contracts that reduce rediscovery.

## Feature / capability map

For material user-facing features or operator flows, keep enough structured knowledge to answer:

- feature/capability name;
- how to reach/invoke it;
- prerequisites/test data;
- expected observable outcome;
- relevant code/modules/workflows;
- important selectors/routes/API endpoints if stable and appropriate;
- cleanup/reset steps;
- known gotchas;
- required verification evidence.

A feature map is agent navigation knowledge, not the business source of truth.

## Verification contract

A material WorkItem should define its proof before or during implementation:

- required action/input;
- expected result;
- side effect(s);
- observable evidence;
- failure signals;
- cleanup/recovery;
- risk-dependent independent review.

Do not accept “implemented”, “looks correct”, or a tool success message as sufficient evidence for material behavior.

## Verification ladder

Use the minimum level appropriate to consequence, with higher levels including lower-level evidence where relevant.

### Level 0 — Agent assertion

“Done” / “should work.”

Not completion evidence.

### Level 1 — Static validity

Examples:

- schema validation;
- formatting/lint;
- type checking;
- policy/static architecture checks.

### Level 2 — Automated behavioral checks

Examples:

- unit tests;
- integration tests;
- adapter/contract tests;
- AI eval fixtures.

### Level 3 — Real flow execution

The running product/workflow is exercised through the actual relevant interface: UI, API, workflow trigger, CLI, or equivalent.

### Level 4 — Side-effect / business-result reconciliation

Examples:

- read-after-write;
- provider confirmation;
- database/business-key reconciliation;
- downstream event;
- deployment health;
- human/business acceptance where necessary.

### Level 5 — Independent challenge

A verifier/reviewer not responsible for the implementation attempts to falsify the completion claim using requirements and observable behavior.

The required level is determined by risk, not by how confident the implementing agent sounds.

## Engineering loop

Use bounded evidence-driven iteration:

```text
Goal / WorkItem exit condition
 -> Inspect current state
 -> Make smallest justified change
 -> Run required checks
 -> Exercise real behavior when applicable
 -> Gather evidence
 -> Pass? complete
 -> Fail? classify/root-cause
 -> change/test/constraint/knowledge update
 -> repeat within budget
 -> escalate if stop condition reached
```

A loop must have max iterations/time/cost/tool calls and an escalation path.

## Failure -> guardrail rule

Repeated agent failure should not automatically produce a longer prompt.

Classify the failure and improve the correct layer:

- missing test -> add regression test;
- ambiguous architecture -> improve boundary/ADR/map;
- invalid state repeatedly produced -> add schema/type/static rule;
- agent cannot navigate feature -> improve feature map/skill;
- unreliable manual verification -> automate verification harness;
- tool misuse -> narrow tool contract/permission;
- stale assumptions -> update canonical docs/fixtures;
- model/prompt behavior -> add eval case and compare variants.

Production incidents should normally create a sanitized regression/verification case where appropriate.

## Independent verifier

For material changes, separate implementation from verification when practical.

Verifier inputs should include:

- WorkItem outcome/acceptance criteria;
- relevant authoritative artifacts;
- candidate change/build/deployment;
- allowed verification tools.

It does **not** need the implementing agent's private reasoning. This reduces confirmation bias and keeps handoffs artifact-based.

## Agent/skill/model evaluation

When comparing prompts, skills, agents, or models:

- use equivalent tasks and environments;
- keep the candidate unaware of irrelevant grading hints when practical;
- store expected rubric/evidence separately;
- compare correctness, verification quality, safety, cost, latency, and human intervention;
- re-run stored cases after material prompt/model/tool changes.

Do not promote a variant based on one impressive demo.

## Parallel engineering workers

Parallelism is an optimization after verification exists.

Use isolated branches/worktrees/environments where supported. Avoid parallel workers that modify the same mutable resources without an explicit coordination strategy.

Preferred structure:

```text
Planner / Work graph
  -> independent Worker A
  -> independent Worker B
  -> independent Worker C
  -> integration
  -> independent verification
  -> CI/policy gates
```

## Evidence artifact

An engineering AgentAssignment should finish with a compact evidence bundle referencing, as applicable:

- files/commits/PRs changed;
- tests/evals executed and result;
- real-flow verification result;
- screenshots/recordings/log/correlation references where useful;
- side-effect reconciliation;
- reviewer findings;
- unresolved limitations;
- rollback/recovery notes;
- exact Project/WorkItem/version.

## Human intervention metric

Track when useful:

- number of times the human had to run commands for the agent;
- provide already-available context manually;
- inspect UI/logs on the agent's behalf;
- tell the agent what failed;
- reconcile conflicting agents;
- manually reconstruct project state.

The long-term goal is to reduce these coordination interventions without removing human judgment from consequential decisions.

## MVP requirement

Phase 1 does not need a universal autonomous coding-agent runtime. It must, however, document and prove a reproducible verification path for the first thin vertical slice so future coding agents can operate against a stable harness rather than chat-only instructions.
