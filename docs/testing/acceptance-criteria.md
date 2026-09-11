# Phase 1 MVP Acceptance Criteria

These criteria define “MVP complete.” Future-scale or future-autonomy features do not substitute for missing MVP behavior.

## A. Project and discovery

- [ ] Operator can create a Workspace and a Project using synthetic/demo data.
- [ ] Project captures kind, problem, desired outcome, constraints, success measure, owner, lifecycle phase, and operational status.
- [ ] Operator can create bounded WorkItems with explicit status, priority, dependencies, exit condition, and evidence requirement.
- [ ] WorkItem readiness/blocking is derived from dependencies/gates rather than only free-form notes.
- [ ] Project event/activity history can explain the current status.
- [ ] Operator can create a Workflow Brief for an automation WorkItem.
- [ ] Workflow Brief captures objective, trigger, inputs, outputs, systems, rules, exceptions, approvals, volume, SLA/deadline, and success metric.
- [ ] Feasibility and risk assessments produce explainable scores/notes.
- [ ] A WIR v0 definition can be created inside a Project and validates against the canonical schema.
- [ ] Invalid graphs/policies are rejected before deployment.

## B. Project Command Center

- [ ] Portfolio view lists active Projects with Workspace, kind, lifecycle phase, operational status, health/reason, latest activity, active work, next ready WorkItem, and blocker/approval indicator.
- [ ] Project detail shows problem/outcome/constraints, WorkItems/dependencies, relevant artifacts, approvals/decisions, evidence, and workflow/deployment state.
- [ ] A dedicated operator-attention view can surface at least approval-required, blocked, failed, and production/maintenance attention states.
- [ ] `Next task` is selected only from WorkItems whose dependencies/gates permit execution.
- [ ] Project/WorkItem completion does not rely solely on an agent narrative claim.
- [ ] Command Center state is derived from canonical state/events/evidence rather than a manually maintained duplicate status field.

## C. Versioning and attribution

- [ ] Draft workflow can become an immutable published version.
- [ ] A changed workflow creates a new version.
- [ ] Historical runs always reference the exact workflow version that ran.
- [ ] Workflow runs are attributable to Workspace + Project + workflow version.
- [ ] Material Project artifacts/evidence can be attributed to the applicable Project/WorkItem.

## D. Execution adapter

- [ ] One primary adapter passes the adapter contract tests.
- [ ] Unsupported WIR capabilities fail validation rather than silently degrading.
- [ ] Deployment/run identifiers are mapped to canonical Workflow OS identifiers.
- [ ] Run state is normalized into the Workflow OS lifecycle.

## E. Reliability

- [ ] Relevant actions declare timeout, retry, and idempotency/reconciliation behavior.
- [ ] Transient failure can retry with bounded backoff.
- [ ] Permanent/business-rule errors are not blindly retried.
- [ ] Uncertain side effects trigger reconciliation rather than duplicate mutation.
- [ ] Exhausted runs become visible failed/dead-letter states.
- [ ] Operator has a safe replay/recovery path.
- [ ] Relevant workflow/deployment failures surface to the Project/WorkItem state and Command Center.

## F. Human approval and risk

- [ ] R3 actions cannot execute without human approval.
- [ ] Approval/rejection is recorded with Project, WorkItem/run, and exact workflow/version where applicable.
- [ ] Execution adapter cannot silently bypass Workflow OS approval requirements.
- [ ] Operator-attention view explains why approval is required and the consequence/context needed to decide.

## G. Security/isolation

- [ ] Workspace authorization is enforced at the server/data boundary.
- [ ] Project/WIR definitions contain integration references, not secret values.
- [ ] Sensitive values are redacted from normal logs/views.
- [ ] Generic inbound/outbound integration surfaces apply declared safety controls.
- [ ] Sensitive external actions are auditable.
- [ ] Project-to-workflow/deployment references cannot cross Workspace boundaries without explicit authorized design.

## H. AI transform

- [ ] AI transform emits schema-constrained output or explicit failure.
- [ ] AI behavior has a stored evaluation set.
- [ ] AI call obeys workflow timeout/cost policy.
- [ ] AI output cannot itself bypass authorization/approval policy.

## I. Agent operability and verification

- [ ] Repository documents the commands/steps needed to bootstrap and run the Phase 1 vertical slice.
- [ ] An authorized engineering agent/human can locate and exercise the relevant feature/API/workflow path without relying on hidden chat context.
- [ ] Applicable static/schema/type/lint and automated tests can be run reproducibly.
- [ ] The real relevant user/API/workflow path can be executed for verification where feasible.
- [ ] Material side effects are reconciled/confirmed when the test is intended to prove them.
- [ ] Completion evidence is stored/referenced for the Project/WorkItem.
- [ ] At least one material change is independently reviewed or verified rather than accepted only from the implementing agent's assertion.

## J. Observability

- [ ] Operator can see Project/WorkItem state plus run/node status, duration, attempts, normalized errors, and approvals where applicable.
- [ ] Runs have correlation/trace identifiers.
- [ ] Core success/failure/retry/latency metrics are available for the thin slice.
- [ ] A failed run explains recovery options.
- [ ] Project health/status reason can be explained from observable state/evidence.

## K. Production and maintenance minimum

- [ ] Deployed MVP Project has an environment/deployment record referencing the exact source/workflow version.
- [ ] Deployment success/failure/health evidence is visible from the Project detail.
- [ ] Recovery ownership and rollback/replay path are documented where applicable.
- [ ] A production/deployment failure can create or map to an Incident or maintenance WorkItem.
- [ ] Recovery/redeployment can be verified and recorded before the related incident/maintenance item is closed.

## L. Reuse and ROI

- [ ] A successful workflow can be converted into a sanitized client-neutral template.
- [ ] Workflow OS can record baseline and post-automation time/quality metrics.
- [ ] Handoff documentation can be generated from canonical Project/workflow metadata.
- [ ] Reusable lessons/artifacts do not copy confidential client material into shared templates.

## M. Scope integrity

- [ ] No required MVP criterion remains incomplete.
- [ ] No out-of-scope autonomous-agent or scale feature is treated as a substitute for required functionality.
- [ ] Architectural deviations have approved ADRs.
- [ ] Phase 1 does not implement a persistent self-organizing internal agent fleet or client-facing AI Employee runtime.
