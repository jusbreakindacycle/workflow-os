# Observability, ROI, and Human Management

## Human owner

Every deployed AI Employee has one accountable human owner.

The owner is responsible for:

- role scope;
- promotion/demotion;
- authority review;
- escalation destination;
- business KPI;
- periodic performance review.

Technical operators may maintain infrastructure, but they do not replace business ownership.

## Task observability

Every task should expose:

- task id;
- workspace;
- role id/version;
- source/trigger;
- current state;
- workflows/tools used;
- reasoning/session metadata appropriate to policy;
- approvals;
- escalation;
- start/end/duration;
- cost;
- result;
- errors/retries/reconciliation;
- final business outcome when measurable.

Do not require hidden chain-of-thought to make an AI Employee auditable. Structured decisions, tool calls, policies, evidence references, and outcomes are sufficient.

## Core metrics

### Quality
- task success rate
- human correction rate
- acceptance/rejection rate
- escalation rate
- reopened/rework rate

### Reliability
- failure rate
- retry rate
- policy-block rate
- duplicate-side-effect count
- p50/p95/p99 task duration
- dependency failure rate

### Safety/governance
- unauthorized-action attempts
- approval bypass attempts
- data-policy violations
- cross-workspace violations
- prompt-injection detections/escalations

### Economics
- model/tool/platform cost per task
- human review minutes
- maintenance/support cost
- estimated time saved
- cost per successful business outcome

### Business KPI
Role-specific.

Examples:

- overdue balance followed up;
- ticket triage cycle time;
- lead response time;
- operations backlog.

## ROI

Compare against a baseline.

Do not call raw “number of AI tasks” ROI.

Useful formula:

`economic_value = time_saved_value + measurable_quality/error_value - AI/tool/platform/maintenance_cost`

When monetary assumptions are weak, report time/quality outcomes separately.

## Human workload

AI Employees should reduce or improve human work, not merely transfer it into invisible approval queues.

Track:

- review minutes;
- escalation volume;
- approval wait time;
- repeated correction categories.

## No creepy human surveillance

Workflow OS AI Employee observability measures the **digital role and business process**.

It is not intended to score human employees through invasive activity monitoring, infer private traits, or create hidden productivity surveillance.

## Periodic review

A role should be reviewed when:

- business rules change;
- integration/model changes;
- repeated escalation category emerges;
- cost drifts;
- quality drifts;
- incident occurs;
- authority needs expansion;
- client changes data/policy requirements.

## Pause button

Human owners/operators must have a clear way to pause new AI Employee tasks without destroying historical evidence.
