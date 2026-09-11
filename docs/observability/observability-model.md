# Observability Model

Observability is part of the product experience because one operator must be able to understand and recover many Projects without reconstructing state from chats and provider dashboards.

## Observability layers

### 1. Project / portfolio observability

For every active Project expose enough normalized state to explain:

- Workspace / Project;
- lifecycle phase;
- operational status;
- health + reason;
- active WorkItems;
- active human/agent/tool assignments;
- next ready WorkItem;
- blockers/failures/approvals;
- latest meaningful activity;
- deployed/production state;
- open incidents/maintenance items.

This powers the Project Command Center.

### 2. Workflow/run observability

For every workflow run record:

- workspace/project;
- workflow/version/deployment;
- applicable WorkItem;
- start/end/duration;
- normalized state;
- node states;
- attempts;
- correlation/trace id;
- dependency/adapter;
- normalized error;
- approval state;
- cost metadata when available;
- redacted input/output metadata sufficient for diagnosis.

### 3. Agent-assignment observability

For bounded internal AgentAssignments record/reference:

- Project/WorkItem;
- role/objective;
- start/end/current terminal state;
- environment/repository/worktree where applicable;
- budget/limit status;
- tool/action summary;
- produced artifact/evidence references;
- escalation/blocker/failure reason;
- verifier/reviewer outcome where required.

Do not store private chain-of-thought as observability data.

### 4. Deployment/production observability

For production-capable Projects expose:

- environment/provider/deployment ID;
- exact source/workflow version;
- deployment status;
- health evidence/time;
- open incident count/highest impact;
- rollback/recovery reference;
- current maintenance obligations.

## Initial metrics

### Delivery/Project

- Project cycle time by phase;
- WorkItems ready/running/blocked/failed/complete;
- blocker/approval wait time;
- verification failure/rework rate;
- human coordination interventions where measurable;
- time from idea/intake to first verified deployed slice;
- Project maintenance/incident volume.

### Workflow/runtime

- runs started/completed;
- success rate;
- rejection rate;
- failure rate by workflow/connector;
- retry rate;
- p50/p95/p99 execution duration;
- queue/wait time;
- external API latency;
- AI latency/cost;
- approval wait time;
- failed/dead-letter count;
- manual intervention rate;
- estimated time saved.

### Internal agents

Where useful:

- AgentAssignment success/failure/escalation rate;
- verifier rejection rate;
- average iterations/tool calls/cost/time;
- human interventions needed to provide already-available context or execute verification on the agent's behalf;
- repeated failure categories that should become tests/constraints/skills.

Do not optimize these metrics in isolation; low human intervention with poor outcomes is not success.

## Logs

Use structured fields, not prose-only logs. Separate diagnostic metadata from retained business payloads. Redaction applies before logs become generally visible.

Raw external logs may remain in their provider; Workflow OS can store normalized references/correlation IDs rather than duplicating everything.

## Tracing and correlation

Single-service MVP may begin with correlation IDs and structured events. Correlate meaningful paths across:

`Project -> WorkItem -> AgentAssignment/workflow run -> deployment -> incident`

Adopt OpenTelemetry-compatible distributed tracing when multiple services/execution boundaries make trace correlation materially useful.

## SLI/SLO

SLOs are defined per Project/workflow/business requirement, not as marketing numbers.

Candidate production-critical workflow SLI:

> Percentage of valid triggers that reach a terminal success or intentional business-rejection state within the declared workflow deadline, measured under the agreed third-party dependency policy.

Candidate operator-control SLI:

> Percentage of material failed/blocked/approval-required Project events that become visible in the Command Center within the declared observability delay.

Do not promise four nines without evidence.

## Alerting / operator attention

Create operator-attention items for conditions requiring action, for example:

- repeated workflow failure;
- failed/dead-letter accumulation;
- agent assignment blocked/failed/budget-exhausted;
- dependency authorization failure;
- sustained latency/SLO breach;
- approval deadline risk;
- failed deployment/health check;
- production incident;
- abnormal cost increase;
- maintenance/dependency/security update due.

Avoid alerting on every retry if the system self-recovers.

## Incident linkage

A material incident should link affected Project, environment, deployments, workflows/versions, runs, recent changes, timeline, resolution evidence, and follow-up WorkItems/regression cases.

## Truth rule

The Command Center may summarize state with AI-generated explanations, but underlying status/health must remain traceable to canonical state/events/evidence. An LLM-generated summary is never the sole evidence that a Project is healthy or complete.
