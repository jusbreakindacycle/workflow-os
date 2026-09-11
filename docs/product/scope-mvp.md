# /scope-mvp

## MVP objective

Prove that Workflow OS can take one synthetic/controlled Project from problem intake to a governed deployed workflow outcome while keeping the operator continuously aware of Project state through the Command Center.

The MVP is deliberately a thin slice of the larger solo-AI-business vision. It establishes Project state, work visibility, workflow governance, and evidence without attempting to build an unrestricted autonomous software company.

## In scope

### Operator, workspace, and Project

- one human operator;
- multiple client/workspace records;
- multiple Project records across workspaces;
- Project types sufficient for `client_delivery`, `internal_product`, and `experiment`;
- Project Brief with problem, desired outcome, constraints, success measure, and lifecycle phase;
- logical separation of Project/workflow/execution metadata, templates, and integration references by workspace.

### Project lifecycle and work graph

- canonical Project phase/state;
- bounded WorkItems with type, status, priority, dependencies, assignee kind, evidence references, and blocker reason;
- task readiness derived from dependencies/gates;
- explicit blocked, waiting, failed, approval-required, and complete states;
- activity/event history sufficient to explain Project status;
- no hidden agent conversation may be the only source of Project state.

### Project Command Center

Portfolio view must show, at minimum:

- Project name/type/workspace;
- lifecycle phase;
- health/state;
- currently active work;
- next ready WorkItem;
- blocker/approval indicator;
- latest activity timestamp.

Project detail must show, at minimum:

- problem/outcome/constraints;
- current phase;
- WorkItems/dependencies;
- relevant research/spec/workflow/test/deployment artifacts;
- evidence for completed material work;
- approvals/decisions;
- latest workflow/deployment status where applicable.

The Command Center is a derived read model over canonical state; manual narrative status alone is not sufficient.

### Discovery

- structured Project/process intake;
- Workflow Brief where the Project includes automation;
- feasibility score;
- risk score;
- ROI/time-saved estimate where applicable.

### Workflow model

- WIR v0 as the canonical workflow definition **within a Project**;
- versioned definitions;
- schema validation;
- simple diagram/visualization derived from WIR.

### WIR v0 node types

- manual trigger;
- webhook trigger;
- scheduled trigger;
- action;
- transform;
- condition;
- delay;
- AI transform;
- human approval;
- end.

### Execution

- exactly one primary workflow engine adapter;
- generic HTTP/API action capability;
- engine deployment mapping;
- run initiation and status reconciliation;
- workflow runs attributable to Workspace + Project + workflow version.

### Internal agent foundation

- contracts for bounded internal specialist assignments;
- Project/WorkItem references in agent assignments;
- required output/evidence contract;
- reviewer/subagent use in the development process where supported;
- no requirement for a persistent autonomous agent runtime in MVP.

### Testing and agent verification

- sample fixtures;
- dry-run/mocked side effects where feasible;
- input/schema validation;
- error-path tests;
- idempotency tests for supported mutations;
- AI evaluation examples for AI nodes;
- timeouts;
- bounded retries with exponential backoff and jitter;
- concurrency/rate-limit policy;
- failed-run/dead-letter state;
- manual replay/reconciliation path;
- a documented verification path showing how an engineering agent/human can run, inspect, and prove the thin vertical slice.

### Security and observability

- integration references rather than embedded secret values;
- least privilege and workspace authorization;
- redaction of sensitive execution values;
- inbound webhook authenticity checks where supported;
- input and outbound-request safety controls;
- audit trail for sensitive actions;
- Project/WorkItem/run/node status, timestamps, attempts, error classification, approval state, and cost metadata where applicable.

### Production ownership minimum

For the deployed MVP Project:

- register the deployment/environment reference;
- record who/what owns recovery;
- expose failed/incident state to the operator;
- create a maintenance/recovery WorkItem when the deployed outcome requires intervention;
- retain evidence of recovery/redeployment.

This is not full autonomous production operations.

### Reuse

- save client-neutral workflow templates;
- generated handoff documentation;
- preserve Project lessons/evidence without copying confidential client material.

## Explicitly out of scope

- fully autonomous end-to-end software factory;
- self-organizing permanent agent company;
- unrestricted multi-agent swarms;
- automatic merge/deploy of high-impact changes without policy/approval;
- universal coding-agent runtime;
- autonomous production incident remediation for high-impact systems;
- client AI Employee Role Registry/runtime;
- client AI Employee persistent memory;
- client AI Employee Task Assignment product surface;
- autonomous background client-facing digital roles;
- building a universal workflow execution engine;
- 1,000+ native connectors;
- full drag-and-drop workflow builder;
- custom RPA recorder;
- public marketplace;
- billing/subscriptions;
- multi-user collaboration;
- production Kubernetes;
- sharding/read-replica architecture;
- multi-region failover;
- service discovery;
- mobile application for Workflow OS itself;
- custom LLM training;
- full process-mining platform.

## Future contracts

The broader Project/AI-company operating model is documented now so Phase 1 does not create architectural dead ends.

Client-facing AI Employee specifications remain under `docs/ai-employees/` as later contracts.

Internal AI workforce contracts are defined separately under `docs/agents/internal-ai-workforce.md`.

## Scope-change rule

Anything outside this file is not MVP by default. Scope expansion requires explicit human approval and, when architectural, an ADR.
