# Testing Strategy

Testing is part of workflow design, not a final implementation phase.

## Specification tests

Before execution:

- WIR schema validity
- graph integrity
- supported node/capability checks
- integration references resolve
- required timeout/retry metadata present
- risk tier/approval policy consistent
- no sensitive literal values in WIR
- loop budgets present when applicable

## Deterministic workflow tests

- happy-path fixture
- required-input validation
- boundary conditions
- condition/routing branches
- transformation correctness
- connector contract/mocking
- idempotency behavior
- retryable vs non-retryable errors
- timeout path
- rate-limit path
- uncertain-side-effect reconciliation path
- approval/rejection path

## Dry-run policy

Dry run should suppress or sandbox external mutations when possible while still validating inputs, transformations, policy, routing, and connector contracts.

A “dry run” must never claim to verify a third-party side effect that was intentionally not executed.

## AI-node evaluations

AI steps need examples with expected structural/semantic behavior. Track:

- schema validity
- task quality rubric
- false positive/negative categories where applicable
- unsafe/unsupported outputs
- cost/latency
- fallback behavior

Model changes or prompt changes require re-evaluation against the stored set.

## Adapter contract tests

Every execution adapter must prove:

- capability declaration accuracy
- deployment semantics
- identifier mapping
- run state normalization
- failure normalization
- activation/deactivation behavior
- status reconciliation
- cancellation behavior if advertised

## Adversarial review

Before major implementation merges, a reviewer should attempt to identify:

- hidden scope expansion
- unsafe retries
- missing idempotency
- approval bypass
- workspace isolation failure
- unsupported engine semantic degradation
- unbounded agent behavior
- false observability claims
- failure states with no recovery
- premature scale infrastructure

## Production-readiness principle

A workflow is not production-ready because the happy path works. It is production-ready when expected failure paths are understood, tested, observable, and recoverable.
