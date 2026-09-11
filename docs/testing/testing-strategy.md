# Testing Strategy

Testing is part of Project/workflow design, not a final implementation phase.

## Project/control-plane specification tests

Before execution/assignment:

- Project/WorkItem schema validity;
- WorkItem dependency graph integrity;
- no impossible/cyclic readiness state where prohibited;
- Project/WorkItem Workspace ownership consistency;
- required exit/evidence/approval metadata present;
- Command Center derivation rules do not depend on manually duplicated status;
- external references resolve where required.

## Workflow specification tests

Before workflow execution:

- WIR schema validity;
- graph integrity;
- supported node/capability checks;
- Project/Workspace attribution;
- integration references resolve;
- required timeout/retry metadata present;
- risk tier/approval policy consistent;
- no sensitive literal values in WIR;
- loop budgets present when applicable.

## Deterministic workflow tests

- happy-path fixture;
- required-input validation;
- boundary conditions;
- condition/routing branches;
- transformation correctness;
- connector contract/mocking;
- idempotency behavior;
- retryable vs non-retryable errors;
- timeout path;
- rate-limit path;
- uncertain-side-effect reconciliation path;
- approval/rejection path.

## Dry-run policy

Dry run should suppress or sandbox external mutations when possible while still validating inputs, transformations, policy, routing, and connector contracts.

A “dry run” must never claim to verify a third-party side effect that was intentionally not executed.

## AI-node evaluations

AI steps need examples with expected structural/semantic behavior. Track:

- schema validity;
- task quality rubric;
- false positive/negative categories where applicable;
- unsafe/unsupported outputs;
- cost/latency;
- fallback behavior.

Model changes or prompt changes require re-evaluation against the stored set.

## Internal-agent assignment tests/evaluations

For agent-assisted delivery, test the assignment/harness rather than only the generated artifact:

- Project/WorkItem scope is explicit;
- authoritative inputs are discoverable;
- tools/permissions are limited to the assignment;
- budget/stop/escalation works;
- agent cannot silently write authoritative Project completion without evidence;
- failure/blocker/approval states persist correctly;
- output artifacts/evidence are attributable;
- repeated prompt/model/tool changes are evaluated against stored cases when material.

See `docs/engineering/agent-operability-and-verification.md`.

## Real-flow verification

For material delivered behavior, execute the actual relevant interface where feasible:

- UI/user journey;
- API/CLI;
- workflow trigger;
- deployment/health path;
- provider side-effect reconciliation.

The required verification depth rises with risk. An implementation agent's assertion is not evidence.

## Independent verification

For material changes, use an independent verifier/reviewer where practical. The verifier receives requirements/accepted artifacts and observable candidate behavior, not the author's private reasoning.

A verification failure should reopen/block the applicable WorkItem until resolved or explicitly accepted by authorized human decision.

## Adapter contract tests

Every execution adapter must prove:

- capability declaration accuracy;
- deployment semantics;
- identifier mapping;
- Project/workflow/run attribution;
- run state normalization;
- failure normalization;
- activation/deactivation behavior;
- status reconciliation;
- cancellation behavior if advertised.

## Command Center tests

Prove that derived operator state is correct for scenarios such as:

- ready Project/WorkItem;
- active assignment/run;
- dependency-blocked task;
- approval-required task;
- failed verification;
- failed workflow/deployment;
- recovered/replayed workflow;
- production incident/maintenance item;
- Project completion/closure.

Do not test only presentation; verify the underlying state/event derivation.

## Production/maintenance tests

As applicable:

- exact deployment version attribution;
- health evidence;
- rollback/recovery path;
- incident creation/linkage;
- uncertain deployment/mutation reconciliation;
- maintenance WorkItem lifecycle;
- regression case after resolved material incident.

## Adversarial review

Before major implementation merges, a reviewer should attempt to identify:

- hidden scope expansion;
- corrupted Project/WorkItem dependency state;
- false Command Center status;
- unsafe retries;
- missing idempotency;
- approval bypass;
- Workspace isolation failure;
- unsupported engine semantic degradation;
- unbounded agent behavior;
- agent claim accepted without evidence;
- false observability claims;
- failure states with no recovery;
- unsafe parallel agents/shared mutable state;
- premature scale infrastructure.

## Production-readiness principle

A Project/workflow is not production-ready because the happy path works. It is production-ready when expected failure paths are understood, tested, observable, recoverable, attributable to exact versions, and governed by the required approvals.
