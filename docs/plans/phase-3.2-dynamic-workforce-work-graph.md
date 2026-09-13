# Phase 3.2 — Dynamic Workforce / Work Graph

## Status

Implemented and CI-verified as part of the Phase 3 end-to-end golden path.

## Objective

Convert one accepted Project Brief and delivery strategy into a case-specific canonical Work Graph without creating permanent AI employees or forcing every Project through a software-development lifecycle.

The governing rule is:

```text
accepted Project Brief
-> selected delivery strategy
-> actual bounded work
-> required capabilities
-> logical role activation
-> WorkItems + dependencies + evidence/authority/verification contracts
```

Work creates the workforce. A role does not create work merely because that role exists.

## Implementation

`src/domain/phase32-workforce.js` implements a deterministic strategy-aware planner identified as `phase-3.2-v1`.

For every generated WorkItem, Phase 3.2 persists a `phase3_work_specs` record containing:

- exact Project Brief version;
- selected delivery strategy;
- logical role;
- required capabilities;
- required evidence;
- risk tier;
- action class;
- authority requirement;
- verification level;
- whether independent verification is required;
- mutable resources;
- stop/escalation conditions;
- planner version.

Required capabilities are also projected into `phase3_workforce_activations`. Activations begin as `required`; later Assignment execution changes them to `active` and successful verified completion changes them to `satisfied`.

## Strategy diversity

The planner has intentionally different graph families for:

- `process_change`;
- `adopt_existing`;
- `configure`;
- `integrate`;
- `automate`;
- `custom_build`;
- `hybrid`;
- `research_pilot`;
- `defer`.

This is an anti-overfitting control. A Project is not converted into frontend/backend/repository/deployment work merely because coding capability exists.

Examples:

- `custom_build` includes execution-ready definition, proportional architecture, governed local workspace preparation, implementation, deterministic verification, actual local flow verification, independent review, and delivery reconciliation;
- `configure` uses configuration and configuration-verification work and does not fabricate software-development roles;
- `automate` produces workflow-design/automation work instead of a website graph;
- `process_change` produces process-design/scenario-verification work with no code tasks;
- `defer` creates only a bounded decision/resume-condition item.

## Phase 1 compatibility

The original Phase 1 initial graph remains available for pre-Phase-3 regression Projects.

Projects accepted through Phase 3.1 use the Phase 3 strategy-specific planner when the existing work-graph initialization route is invoked. The route preserves its public shape while returning Phase 3 planning metadata (`plannerVersion`, specs, activations) for Phase 3 Projects.

This avoids rewriting old test history while making the new product path strategy-specific by default.

## Authority boundary

Phase 3.2 plans authority; it does not grant authority.

A WorkItem may state that `bounded_local_workspace_policy` is required for an R1 local mutation. That requirement is not itself permission to mutate files, execute arbitrary commands, access credentials, push to GitHub, deploy, message a client, or spend money.

## Verification

Automated tests prove at least three materially different strategy shapes:

1. `custom_build` activates implementation, local-flow verification, and independent review requirements;
2. `configure` does not fabricate implementation-worker/solution-architect/local-flow work;
3. `defer` creates no implementation work.

## Exit condition

Phase 3.2 is complete when the accepted Brief can deterministically produce an explainable strategy-specific graph whose WorkItems carry enough capability/evidence/authority/verification metadata for bounded Assignment execution.

The next dependency is Phase 3.3: make R1 local implementation authority real and enforceable outside model reasoning.
