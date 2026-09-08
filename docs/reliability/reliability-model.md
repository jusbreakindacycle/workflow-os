# Reliability Model

Every external side effect is a distributed-systems problem at small scale too.

## Per-run identity

A normalized run should carry:

- run id
- workflow version
- deployment/environment
- workspace
- correlation id
- attempt number
- deadline
- idempotency context
- cost counters where applicable

## Error classes

### Permanent validation/configuration
No automatic retry until configuration/input changes.

### Authorization/integration unavailable
Stop or pause; require reconnection or policy resolution.

### Provider rate limit
Honor provider retry guidance when available; otherwise bounded backoff with jitter.

### Timeout/network/transient provider failure
Bounded retry if side-effect safety is known.

### Provider server failure
Bounded retry according to connector policy.

### Business-rule rejection
No technical retry unless business state changes.

### Uncertain side effect
Do **not** blindly retry. Reconcile the remote system first.

### Unsupported capability
Deployment validation failure, not runtime improvisation.

## Retry rules

- every retry policy has a maximum attempt count
- retries use deadlines/timeouts
- exponential backoff includes jitter
- a retry is allowed only when the action's idempotency/reconciliation contract makes repetition safe enough
- retry storms must be constrained by concurrency/rate limits

## Idempotency modes

- `not_applicable`
- `provider_key`: provider accepts a stable idempotency key
- `workflow_key`: Workflow OS/adapter deduplicates by stable business key
- `reconcile_before_retry`: query remote state before another mutation
- `non_idempotent_explicit`: no safe idempotency method; automatic mutation retry is disabled unless explicitly approved

## Failed-run / dead-letter state

When retries are exhausted, record:

- normalized error category
- last safe checkpoint
- side effects known to have succeeded
- side effects uncertain
- compensation options
- replay/reconciliation options
- human notes/status

## Compensation / Saga-style recovery

When a workflow changes multiple independent systems, prefer explicit local actions plus compensating actions over pretending an atomic distributed transaction exists.

Compensation must be modeled as a business action and may itself require approval.

## Circuit breaking

Not required as custom MVP infrastructure, but adapters/connectors should support a future circuit-breaker policy for dependencies with repeated failures.

## Backpressure

When inbound work exceeds execution capacity, preserve bounded queues/concurrency rather than spawning unlimited work.

## Database correctness

When implementation begins, choose transaction isolation/locking deliberately for competing updates. Optimistic locking is the default candidate for versioned control-plane records; pessimistic/distributed locking requires evidence that it is necessary.

## Recovery principle

A production workflow is not “reliable” merely because it retries. It is reliable when the operator can determine what happened and safely reach a known business state.
