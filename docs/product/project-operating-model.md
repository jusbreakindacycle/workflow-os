# Project Operating Model

## Purpose

Project is the canonical operational container for the full delivery lifecycle. It exists because a client engagement or product idea is larger than any one workflow, repository, agent session, deployment, or AI Employee role.

## Core relationship

```text
Workspace
  -> Project
      -> WorkItems
      -> Decisions
      -> Artifacts
      -> Evidence
      -> Workflow(s) / WIR versions
      -> Repositories / environments / deployments
      -> AgentAssignments
      -> Approvals
      -> Incidents / maintenance
      -> future AI Employee roles
```

Workspace remains the authorization/data-isolation boundary. Project is the unit the operator thinks about and manages.

## Project kinds

Initial kinds:

- `client_delivery` — work performed for a client/business;
- `internal_product` — the operator's own product/SaaS/system;
- `experiment` — bounded research/prototype work that has not yet earned production status.

Additional kinds require a real use case; avoid taxonomy growth for its own sake.

## Required Project fields

A Project should eventually have canonical fields equivalent to:

- stable Project ID;
- Workspace ID;
- name;
- kind;
- problem statement;
- desired outcome;
- constraints/assumptions;
- success measures;
- lifecycle phase;
- operational status;
- health;
- human owner;
- risk summary;
- created/updated timestamps;
- related repositories/environments/deployments;
- current next-ready WorkItem(s);
- blocker/approval state.

Do not encode secrets or confidential payloads directly in general Project metadata.

## Lifecycle phase

Phase answers: **what kind of delivery work is this Project primarily doing now?**

Initial canonical phases:

1. `intake`
2. `research`
3. `definition`
4. `architecture`
5. `planning`
6. `build`
7. `verification`
8. `review`
9. `deployment`
10. `production`
11. `maintenance`
12. `paused`
13. `closed`

Phase is not a percentage-complete field. Projects can revisit an earlier phase when evidence requires it.

## Operational status

Status answers: **what is preventing or allowing work right now?**

Suggested initial states:

- `not_started`
- `ready`
- `running`
- `waiting_external`
- `needs_approval`
- `blocked`
- `failed`
- `complete`
- `canceled`

Project status should be derived from the highest-priority unresolved condition in canonical WorkItems/approvals/incidents rather than free-form agent narration.

## Health

Use a small explainable set such as:

- `healthy`
- `at_risk`
- `blocked`
- `unknown`

Health must include reasons/evidence. Do not invent arbitrary progress percentages or “AI confidence” health scores.

## WorkItem

A WorkItem is the bounded unit of planned or reactive work.

Minimum conceptual fields:

- WorkItem ID;
- Project ID;
- class/type;
- title/outcome;
- status;
- priority;
- dependencies;
- assignee kind and assignment reference;
- input/context references;
- acceptance/exit condition;
- required evidence;
- risk/approval requirement where applicable;
- blocker/failure reason;
- timestamps.

Typical classes:

- intake;
- research;
- decision;
- specification;
- architecture;
- implementation;
- workflow design;
- verification;
- security/reliability review;
- approval;
- deployment;
- incident;
- maintenance;
- documentation/handoff.

## Dependency and readiness semantics

A WorkItem is `ready` only when:

- required predecessors are satisfied;
- required artifacts/inputs exist;
- policy permits execution;
- required prior approval exists;
- the assignee has the necessary allowed capability/environment.

The system may recommend a next action, but it must not bypass dependencies or invent completion.

Parallel WorkItems are allowed only when their dependencies and mutable resources do not create unsafe conflicts. Parallel coding work should prefer isolated worktrees/branches/environments when supported.

## Assignment model

A WorkItem can be assigned to:

- the human operator;
- a bounded internal AI agent;
- a deterministic workflow;
- an external execution/coding/deployment tool;
- a future client-facing AI Employee task where semantically appropriate.

Assignment is not ownership of canonical state. The assignee returns evidence/results; Workflow OS validates/persists state transitions.

## Artifact model

Artifacts are outputs required to continue or prove work, for example:

- research memo;
- product brief;
- requirement/specification;
- architecture/ADR;
- design asset;
- source repository/commit/PR;
- workflow definition/version;
- test/evaluation report;
- deployment record;
- handoff document;
- incident report.

Artifacts should be version/reference based where possible rather than copied into uncontrolled chat context.

## Evidence model

Completion evidence may include:

- schema/type/lint result;
- automated tests;
- evaluation result;
- executed user-flow evidence;
- read-after-write reconciliation;
- deployment health check;
- independent review;
- human approval;
- external provider confirmation.

The evidence standard rises with risk/consequence.

## Decision model

Material ambiguity should become an explicit Decision record rather than remain buried in agent conversation.

Decision should capture:

- question;
- options considered;
- chosen decision;
- reason/evidence;
- who/what proposed it;
- human approval if required;
- affected Project/WorkItems/artifacts;
- timestamp/version.

Architectural decisions continue to use ADRs in the repository when they affect Workflow OS itself.

## Project event history

State transitions should create auditable events sufficient to explain:

- what changed;
- from/to state;
- actor/assignee/tool;
- evidence/reference;
- reason/error;
- correlation to workflow run, agent assignment, PR, deployment, or incident.

The Command Center consumes this state/event model.

## Phase gates

Moving phases is evidence-driven. Examples:

- `research -> definition`: enough evidence to state the target problem/outcome and material unknowns;
- `definition -> architecture`: accepted scope/requirements/non-goals;
- `architecture -> build`: architecture/risk decisions and work graph are sufficient to implement the approved slice;
- `build -> verification`: candidate implementation/workflow exists;
- `verification -> deployment`: required tests/evaluations/reviews pass and approvals exist;
- `deployment -> production`: deployment is registered and health/recovery ownership is known;
- `production -> maintenance`: incident, change, dependency, or planned maintenance work exists.

A Project may move backward when new evidence invalidates an earlier assumption.

## Project closure

Closing a Project requires an explicit outcome, not disappearance from the dashboard.

Close with one of:

- delivered/accepted;
- experiment concluded;
- canceled/not viable;
- superseded;
- archived after support/maintenance transfer.

Retain the reusable lessons, evidence, decisions, and sanitized templates allowed by policy.
