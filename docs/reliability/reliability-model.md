# Reliability Model

## Principle

Autonomy is useful only when failures remain explainable and recoverable.

## Error classes

- validation/configuration — no retry until input/config changes;
- authorization/credential — stop and request resolution;
- rate limit — bounded provider-aware backoff;
- transient network/provider — bounded retry only when side-effect safety is known;
- provider server failure — bounded retry by adapter policy;
- business-rule rejection — no technical retry until business state changes;
- uncertain side effect — reconcile before retry;
- unsupported capability — fail route/validation, do not improvise;
- budget exhausted — stop/escalate;
- verification failed — repair/new WorkItem, not false completion.

## Idempotency modes

- `not_applicable`
- `provider_key`
- `system_key`
- `reconcile_before_retry`
- `non_idempotent_explicit`

Every mutation declares one or explains why automatic retry is disabled.

## Retries

Retries always have max attempts/deadline and backoff/jitter where relevant. Retry does not mean “ask the model forever.”

## Unknown outcomes

If an external operation may have succeeded but acknowledgement failed, do not blindly repeat it. Query/reconcile remote state first.

## Provider outage

Canonical Project state remains readable. Assignments become waiting/unknown/blocked as appropriate. Recovery reconciles before continuing.

## Backpressure

Bound queues/concurrency. Do not spawn unlimited loops/agents because inbound events increased.

## Database correctness

Choose transaction/locking strategy deliberately for competing state transitions. Prefer optimistic version checks for canonical records unless evidence requires stronger locking.

## Recovery test

The operator should be able to answer what happened, what is certain/uncertain, and what action safely restores a known state.
