# Phase 1 MVP Acceptance Criteria

These criteria define “MVP complete.” Future-scale features do not substitute for missing MVP behavior.

## A. Discovery and modeling

- [ ] Operator can create a workspace and a Workflow Brief using synthetic/demo data.
- [ ] Brief captures objective, trigger, inputs, outputs, systems, rules, exceptions, approvals, volume, SLA/deadline, and success metric.
- [ ] Feasibility and risk assessments produce explainable scores/notes.
- [ ] A WIR v0 definition can be created and validates against the canonical schema.
- [ ] Invalid graphs/policies are rejected before deployment.

## B. Versioning

- [ ] Draft workflow can become an immutable published version.
- [ ] A changed workflow creates a new version.
- [ ] Historical runs always reference the exact version that ran.

## C. Execution adapter

- [ ] One primary adapter passes the adapter contract tests.
- [ ] Unsupported WIR capabilities fail validation rather than silently degrading.
- [ ] Deployment/run identifiers are mapped to canonical Workflow OS identifiers.
- [ ] Run state is normalized into the Workflow OS lifecycle.

## D. Reliability

- [ ] Relevant actions declare timeout, retry, and idempotency/reconciliation behavior.
- [ ] Transient failure can retry with bounded backoff.
- [ ] Permanent/business-rule errors are not blindly retried.
- [ ] Uncertain side effects trigger reconciliation rather than duplicate mutation.
- [ ] Exhausted runs become visible failed/dead-letter states.
- [ ] Operator has a safe replay/recovery path.

## E. Human approval and risk

- [ ] R3 actions cannot execute without human approval.
- [ ] Approval/rejection is recorded with run and workflow version.
- [ ] Execution adapter cannot silently bypass Workflow OS approval requirements.

## F. Security/isolation

- [ ] Workspace authorization is enforced at the server/data boundary.
- [ ] WIR contains integration references, not secret values.
- [ ] Sensitive values are redacted from normal logs/views.
- [ ] Generic inbound/outbound integration surfaces apply declared safety controls.
- [ ] Sensitive external actions are auditable.

## G. AI transform

- [ ] AI transform emits schema-constrained output or explicit failure.
- [ ] AI behavior has a stored evaluation set.
- [ ] AI call obeys workflow timeout/cost policy.
- [ ] AI output cannot itself bypass authorization/approval policy.

## H. Observability

- [ ] Operator can see run and node status, duration, attempts, normalized errors, and approvals.
- [ ] Runs have correlation/trace identifiers.
- [ ] Core success/failure/retry/latency metrics are available.
- [ ] A failed run explains recovery options.

## I. Reuse and ROI

- [ ] A successful workflow can be converted into a sanitized client-neutral template.
- [ ] Workflow OS can record baseline and post-automation time/quality metrics.
- [ ] Handoff documentation can be generated from the canonical workflow metadata.

## J. Scope integrity

- [ ] No required MVP criterion remains incomplete.
- [ ] No out-of-scope scale feature is treated as a substitute for required functionality.
- [ ] Architectural deviations have approved ADRs.
