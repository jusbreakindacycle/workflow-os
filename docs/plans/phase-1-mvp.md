# Phase 1 MVP Plan

This is an implementation plan, not authorization to code before Phase 0 is merged.

## Gate 1 — Repository and specification validation

Before implementation:

- read AGENTS and canonical docs
- confirm Phase 0 merged
- map each task to acceptance criteria
- verify no scope change is required

## Gate 2 — Initial execution-engine spike

Evaluate the currently documented Activepieces version against ADR-004:

- current license/use constraints
- local/self-host setup
- programmatic API/SDK
- workflow creation/deployment
- run start/status/history
- integration reference model
- required v0 trigger/node mapping
- failure/status fidelity
- approval feasibility

Output: evidence plus either confirmation of ADR-004 or proposed superseding ADR.

## Gate 3 — Thin vertical slice

Build the smallest end-to-end path:

```text
Workspace
 -> Workflow Brief
 -> WIR validation
 -> one synthetic workflow
 -> adapter deployment
 -> run
 -> normalized status
 -> run view
```

No AI or complex approval until the deterministic slice is reliable.

## Gate 4 — Reliability and policy

Add:

- retry/error classification
- idempotency/reconciliation
- failed-run state
- replay
- risk policy
- human approval

## Gate 5 — AI transform

Add a bounded schema-constrained AI transform with evaluation fixtures, cost/time policy, and no direct authorization bypass.

## Gate 6 — Reuse/ROI/handoff

Add template sanitization, ROI baseline/result recording, and generated handoff documentation.

## Exit

MVP is complete only when every applicable checkbox in `docs/testing/acceptance-criteria.md` has evidence.
