# Testing Strategy

Testing is part of the delivery contract, not a final cleanup phase.

## Canonical control-plane tests

Prove Workspace isolation, Project/WorkItem state validity, dependency/readiness correctness, Proposal vs accepted-state separation, exact approval/version binding, deterministic Project Pack generation, derived Activity/Attention/Command Center state, restart/recovery, and that provider narrative cannot create canonical completion.

## Project Pack / Assignment contract tests

Prove required schema constraints, no raw reusable secrets, minimum-authorized Context Slice behavior, reproducible provider projections, explicit unsupported capability, budget/stop/escalation enforcement, and Assignment completion separate from WorkItem acceptance.

## Adapter contract tests

Every real provider adapter should prove advertised capabilities, identifier mapping, authentication scope, cancellation/timeout, state/error normalization, idempotency/reconciliation, cost/usage reporting when applicable, version compatibility, and outage recovery.

## AI / agent evaluations

For material model, prompt/compiler, Skill, or routing changes, store representative cases and compare correctness, schema compliance, policy adherence, verification quality, cost/latency, human intervention, and fallback behavior. Do not promote a route/Skill from one impressive demo.

## Real-flow verification

For material delivered behavior, exercise the actual UI/API/CLI/workflow/deployment path when feasible. Dry runs may prove logic/policy but cannot pretend to verify suppressed side effects.

## Security/adversarial tests

Cover prompt/instruction injection, poisoned tool/skill/provider metadata, Workspace/data exfiltration, stale/fake approval, unapproved spend, unsafe retries/uncertain mutations, provider semantic degradation, unbounded loops/delegation, false Command Center status, shared mutable-state collision, and failure with no recovery path when relevant.

## Production readiness

A Project is not production-ready merely because the happy path works. Required failure paths must be explainable, tested, observable, recoverable, attributable to exact versions, and governed by applicable approvals.
