# Spend Gate

## Principle

Workflow OS must never silently spend money on AI/model/runtime execution.

## Default policy

Before a paid Assignment begins, create a `SpendRequest` / Needs My Attention item containing:

- purpose/WorkItem;
- proposed model/runtime/provider;
- reason a free/local/approved zero-cost route is insufficient or inferior for the required threshold;
- estimated cost/range where available;
- requested maximum SpendEnvelope;
- fallback options;
- expiry/conditions.

The operator may approve, reject, or request a different route.

## Envelope semantics

Approval authorizes only the bounded purpose and maximum amount stated.

An approved Assignment may make multiple provider calls within that envelope without asking on every token request. A new Assignment/purpose or any envelope increase requires new approval unless the operator explicitly configured a broader Project envelope later.

Default product setting should remain conservative: `per_paid_assignment` approval.

## Enforcement

Spend policy is enforced outside model reasoning.

If actual/estimated cost reaches the envelope limit:

- stop/finish safe current operation according to provider semantics;
- record cost/evidence;
- request additional approval if needed;
- do not auto-increase.

## Accounting

Normalize cost records by provider/model/runtime with fidelity metadata. Cost may also come from cloud/workflow/API providers, so AI cost is only one component of Project cost.

## Phase 1

Implement records/state/approval behavior using synthetic cost. No real paid API is required.
