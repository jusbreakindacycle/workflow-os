# Spend Gate

## Principle

Workflow OS must never silently create new metered/variable external cost.

This applies not only to AI/model/runtime calls but, as those capabilities are introduced, to metered APIs, SMS/email services, workflow runs, cloud/deployment operations, storage/compute, and other actions that can create incremental charges.

## Default policy

Before a metered Assignment/action begins without existing authorization, create a `SpendRequest` / Needs My Attention item containing purpose/WorkItem, proposed provider/route/action, reason a zero-incremental option is insufficient, estimated range where available, maximum SpendEnvelope, fallback options, and expiry/conditions.

The operator may approve, reject, or request another route.

## Envelope semantics

Approval authorizes only the bounded purpose and maximum amount stated. An approved Assignment may make multiple provider calls within that envelope without asking on every token/request. A new purpose or envelope increase requires new approval unless the operator explicitly configured a broader bounded envelope.

Default remains conservative: `per_metered_assignment_or_action`.

An already-paid fixed subscription may be treated as `zero_incremental` for eligible use only when the configured ProviderConnection says no new per-use charge is incurred; this does not authorize new purchases/upgrades.

## Enforcement

Spend policy is enforced outside model reasoning. At/near the envelope limit, stop/finish the safe current operation according to provider semantics, record cost/evidence, and request more approval if required. Never auto-increase.

## Accounting

Normalize cost by provider/model/runtime/service with fidelity metadata. Unknown cost is not assumed zero.

## Phase 1

Implement records/state/approval behavior using synthetic cost. No real paid API is required.
