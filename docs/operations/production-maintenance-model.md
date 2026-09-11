# Production and Maintenance Model

## Purpose

Workflow OS treats deployment as a lifecycle transition, not the end of Project ownership. A solo builder needs one system that remembers what is running, what version is deployed, whether it is healthy, what failed, what needs maintenance, and what evidence proves recovery.

## Core rule

> A Project remains operationally owned until it is explicitly transferred, archived, canceled, or closed.

## Deployment record

A production-capable Project should reference deployment records containing, where applicable:

- Project ID / Workspace ID;
- environment (`dev`, `test`, `staging`, `production`, or provider-specific equivalent);
- provider/runtime;
- deployment identifier;
- source commit/PR/build/workflow version;
- configuration/integration-reference version where relevant;
- deployment status;
- timestamp;
- actor/agent/tool;
- required approval reference;
- verification/health evidence;
- rollback/recovery reference.

Do not put raw reusable secrets in deployment metadata.

## Environment ownership

Each production environment must have explicit answers to:

- who/what is allowed to deploy;
- who/what can roll back;
- which actions require human approval;
- where health/error evidence comes from;
- how configuration/secrets are referenced;
- what backup/recovery evidence exists when required;
- what happens when the deployment tool reports an uncertain outcome.

## Production signals

Workflow OS may ingest/reference signals from deployment providers, CI/CD, workflow engines, observability systems, databases, or scheduled health checks.

Signals may create or update canonical WorkItems/Incidents, but raw telemetry is not itself Project state until normalized/classified.

Useful signal classes include:

- deployment failed;
- health check failed;
- workflow/run failure rate elevated;
- unhandled application errors;
- dependency/security advisory;
- external integration/authentication failure;
- quota/rate/cost threshold;
- scheduled maintenance/update due;
- backup/recovery check failed;
- user/client-reported defect.

## Incident

An Incident is a production-impacting problem requiring explicit tracking.

Minimum conceptual fields:

- Incident ID;
- Project/environment/deployment references;
- severity/impact;
- detection source;
- current state;
- evidence/correlation references;
- suspected/confirmed cause;
- containment/mitigation;
- owner/assignment;
- approvals required;
- recovery evidence;
- follow-up/regression WorkItems.

Suggested states:

- `detected`
- `triaging`
- `mitigating`
- `monitoring_recovery`
- `resolved`
- `postmortem_followup`

## Incident loop

```text
Signal
 -> detect/normalize
 -> classify impact
 -> gather evidence
 -> create Incident + WorkItem(s)
 -> contain/repair within authority
 -> approval if required
 -> verify recovery
 -> monitor
 -> resolve
 -> add regression/guardrail/maintenance follow-up
```

Do not allow an agent to repeatedly mutate production while the outcome of a prior mutation is uncertain. Reconcile first.

## Maintenance WorkItem

Maintenance includes planned or reactive work such as:

- dependency/runtime upgrades;
- certificate/token rotation procedures;
- schema/index maintenance;
- provider/API compatibility changes;
- security patches;
- data retention/cleanup;
- performance/reliability improvements;
- recurring business-rule changes;
- model/prompt/tool re-evaluation;
- observability/backup/recovery checks;
- client-requested changes after deployment.

Maintenance uses the same Project work graph, evidence, risk, approval, verification, and versioning principles as initial delivery.

## Change pipeline

Production changes should conceptually follow:

```text
Issue/request/signal
 -> Maintenance WorkItem
 -> scope/risk
 -> implement/configure
 -> test/evaluate
 -> verify in safe environment where possible
 -> approval when required
 -> deploy
 -> reconcile health/business effect
 -> close or rollback
```

Emergency paths may shorten timing but must not erase attribution, approval requirements, reconciliation, or post-event evidence.

## Agent maintenance behavior

A maintenance/incident agent may:

- collect logs/metrics/health evidence;
- correlate recent changes;
- reproduce a defect in a safe environment;
- propose cause/fix;
- implement a bounded low-risk repair in an authorized environment;
- run regression verification;
- prepare deployment/rollback steps;
- create/update incident and maintenance artifacts.

It may not:

- grant itself broader credentials;
- bypass production approval policy;
- hide a failed/uncertain remediation;
- repeatedly retry destructive actions without reconciliation;
- close an Incident without required recovery evidence.

## Command Center integration

The Project Command Center should expose:

- deployed/not deployed;
- current production version;
- health (`healthy`, `at_risk`, `blocked`, `unknown`);
- open incident count/highest severity;
- active maintenance WorkItem;
- last meaningful deployment/health activity;
- approval needed;
- next maintenance/recovery action.

## Maintenance knowledge loop

Repeated production problems should improve the system:

```text
Incident / correction
 -> root cause
 -> regression case
 -> test/eval/constraint/map/runbook update
 -> new version
 -> verify
 -> reusable sanitized lesson
```

Do not solve recurring failures only by adding prose to a prompt.

## MVP boundary

Phase 1 needs only enough production ownership to register the deployed thin slice, expose failures to the operator, and create a recoverable maintenance path.

Full SRE automation, 24/7 autonomous remediation, multi-region operations, Kubernetes, and advanced observability infrastructure remain evidence-gated future work.
