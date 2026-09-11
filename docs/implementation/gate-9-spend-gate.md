# Phase 1 Gate 9 — Spend Gate Semantics

## Purpose

Prove that metered/variable-cost execution cannot start silently and that an approval authorizes only a bounded purpose and amount.

## Flow

```text
metered purpose identified
  -> SpendRequest
  -> exact SpendEnvelope ID reserved
  -> Approval requested for that envelope/bounds
  -> operator approves/rejects
  -> approved SpendEnvelope materialized
  -> synthetic metered action may execute inside remaining bounds
  -> CostRecord reconciles spend
```

## Rules

- No SpendEnvelope is created merely because a request exists.
- The Approval must be `approved`, have subject type `spend_envelope`, and bind to the exact envelope ID.
- Currency and purpose must match the approved envelope.
- A WorkItem-scoped envelope cannot be reused for another WorkItem.
- Unknown estimated cost is not interpreted as zero; the metered action is rejected.
- Actual spend is reconciled through `CostRecord`.
- The database trigger rejects a cost that would exceed the remaining approved amount.
- Reaching the maximum marks the envelope exhausted.
- A larger future bound requires a new SpendRequest/Approval; Phase 1 never silently enlarges an existing envelope.

## Scope

This gate is deliberately provider-neutral. The synthetic action represents any future metered resource: model/API usage, SMS, cloud compute, workflow execution, deployment service, or another variable-cost action.

## Evidence

`test/phase1-control-plane.test.js` proves execution without an envelope is blocked, unknown cost is blocked, bounded execution updates spent amount, over-limit execution fails, and expansion creates a separate Approval rather than modifying the previous bound.

## Non-goals

No payment processor, credit-card handling, real model billing API, currency conversion, invoice system, or accounting ledger is implemented.
