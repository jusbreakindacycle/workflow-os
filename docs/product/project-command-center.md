# Project Command Center

## Purpose

The Project Command Center is the operator's single operational view across every Project. Its job is to remove manual coordination work: the operator should not need to open multiple chats, repositories, task lists, CI pages, deployment dashboards, and agent sessions just to learn what is happening.

The Command Center is a **read model over canonical state and evidence**. It is not a manually maintained project-management board and it must not treat an agent's narrative claim as authoritative status.

## Core questions

At any moment the operator should be able to answer:

1. What Projects exist and which are active?
2. What phase/status/health is each Project in?
3. What is running right now?
4. What is the next ready WorkItem?
5. What is blocked, failed, waiting, or overdue?
6. What needs my approval or decision?
7. Which agent/human/tool owns each active assignment?
8. What evidence proves completed material work?
9. What was deployed and where?
10. Which production Project has an incident or maintenance obligation?

## Portfolio view

Every active Project card/row should expose at least:

- Project name;
- Project kind;
- Workspace/client label safe for the operator view;
- lifecycle phase;
- operational status;
- health plus concise reason;
- active WorkItem(s);
- current assignee/agent/tool when applicable;
- next ready WorkItem;
- blocker/approval indicator;
- latest activity time;
- production indicator when deployed.

Do not show a fake percentage unless progress has a meaningful denominator. Prefer explainable state such as `verification: 7/9 required checks passed`.

## Operator attention queue

A dedicated **Needs My Attention** view should prioritize items such as:

- approval required;
- business/product decision required;
- security/risk acceptance;
- blocked agent requiring missing input;
- failed verification;
- failed deployment;
- production incident;
- budget/cost threshold;
- external dependency timeout;
- scope-change request.

Each item must say:

- why attention is required;
- Project/WorkItem involved;
- consequence of waiting;
- evidence/context needed to decide;
- available safe actions.

## Project detail view

### A. Project header

- problem statement;
- desired outcome;
- constraints;
- success measures;
- owner;
- current phase/status/health;
- risk summary;
- key repository/environment/deployment references.

### B. Lifecycle lane

Show the current and historical movement through:

`Intake -> Research -> Definition -> Architecture -> Planning -> Build -> Verification -> Review -> Deployment -> Production/Maintenance`

A phase can be revisited; do not imply a strictly irreversible waterfall.

### C. Work graph

Show WorkItems and dependencies with states such as:

- ready;
- running;
- waiting;
- approval-required;
- blocked;
- failed;
- complete.

The graph is the source for `next task`, not a separate hand-maintained to-do list.

### D. Current work

For active AgentAssignments/workflows/tools show:

- assignment objective;
- bounded scope;
- assignee/role;
- start time;
- budget/deadline where applicable;
- current observable status;
- latest evidence/checkpoint;
- stop/escalation condition.

Do not expose private chain-of-thought. Store useful artifacts, decisions, evidence, summaries, and tool/run state instead.

### E. Artifacts and decisions

Group project outputs such as:

- research;
- briefs/specs;
- architecture/ADRs;
- designs;
- repositories/PRs;
- WIR/workflow versions;
- test/evaluation reports;
- deployment records;
- handoff docs;
- maintenance/incident reports.

### F. Verification

Show the required evidence and current result:

- static/schema/type/lint;
- unit/integration/contract tests;
- AI evaluations;
- real user-flow verification where applicable;
- side-effect reconciliation;
- specialist reviews;
- independent verifier;
- human acceptance/approval.

A failed verifier should visibly reopen/block the applicable WorkItem.

### G. Production and maintenance

When deployed, show:

- environment/deployment;
- version/commit/workflow version;
- deployment health;
- latest successful health evidence;
- open incidents;
- maintenance WorkItems;
- rollback/recovery capability;
- last/next planned maintenance where applicable.

## Status derivation

### Phase

Derived from accepted phase transition records and gates.

### Project status

Suggested precedence for attention:

1. `failed`
2. `blocked`
3. `needs_approval`
4. `waiting_external`
5. `running`
6. `ready`
7. `complete`

This precedence is a display policy, not a substitute for the underlying WorkItem states.

### Health

Health is computed from explainable signals, for example:

- unresolved high-severity failure/incident -> `blocked` or `at_risk`;
- critical dependency late/failed -> `at_risk`;
- required evidence missing after claimed completion -> `at_risk`;
- no known blocking condition and required checks current -> `healthy`;
- insufficient telemetry/state -> `unknown`.

Never use LLM confidence alone as Project health.

## Next-task semantics

`Next task` should mean the highest-priority WorkItem that is actually eligible to start after considering:

- dependency completion;
- phase gates;
- policy/risk;
- human approvals;
- resource/environment conflicts;
- required artifacts;
- assignee capability.

AI may rank or explain eligible tasks, but it cannot declare an ineligible task ready.

## Activity timeline

The operator should have a chronological timeline linking meaningful events such as:

- WorkItem created/started/completed/failed;
- agent assignment started/stopped/escalated;
- research/spec version created;
- PR/commit/test evidence added;
- approval requested/decided;
- deployment started/completed/rolled back;
- incident opened/resolved;
- Project phase changed.

Avoid flooding the timeline with low-value raw logs; retain links/correlation IDs to detailed logs.

## Search/filter requirements

Useful portfolio filters include:

- Workspace/client;
- Project kind;
- phase;
- status/health;
- needs approval;
- blocked/failed;
- in production;
- maintenance due/open incident;
- active agent/assignee.

## MVP boundary

Phase 1 needs a useful operator view, not a polished enterprise PM suite. It may begin as a simple web dashboard/table + Project detail page backed by canonical state.

MVP does not require:

- drag-and-drop project planning;
- Gantt charts;
- chat-centered management;
- arbitrary manual percentage completion;
- multi-user collaboration;
- autonomous reprioritization that can override human policy.

## Success test

The Command Center succeeds when the operator can leave Workflow OS for a period, return, and understand every active Project's current state and required next attention **without reconstructing the story from agent chats or asking each agent what happened**.
