# Phase 1 Gate 8 — Mock Assignment, Evidence, and Verification

## Purpose

Prove the authority boundary between execution and canonical completion without connecting a real AI or workforce provider.

## Assignment flow

```text
eligible WorkItem
  -> Context Slice
  -> Assignment created
  -> running
  -> execution_finished
  -> evidence recorded
  -> verification pass/fail
```

The Assignment binds to the exact WorkItem version, Project Pack version, Context Slice, role, objective, budgets, allowed capabilities, evidence contract, side-effect policy, stop conditions, and escalation conditions.

`validateAssignmentContract()` rejects malformed bounded-execution contracts before persistence.

## Completion rule

`execution_finished` is not WorkItem completion. The mock worker cannot set a WorkItem to `complete` merely by reporting success.

A verification pass requires recorded evidence. Only the verification path may transition the matching WorkItem version to `complete`. A verification failure leaves work incomplete as `needs_attention` and records a `verification.fail` event.

After verified completion, `refreshDerivedReadiness()` can make dependency-satisfied downstream work ready.

## Phase 1 worker

The worker is intentionally synthetic (`mock:phase1`). It proves state transitions, context minimization, persistence, and verification authority but performs no real coding, browser work, AI inference, workflow execution, or external side effect.

## Evidence

`test/phase1-control-plane.test.js` proves both pass and fail paths, including that `execution_finished` leaves the WorkItem incomplete and a pass without evidence is rejected. `test/phase1-contracts.test.js` proves malformed budget, side-effect, stop-condition, and spend-envelope requirements are rejected. `test/phase1-api.test.js` exercises the successful path through the local HTTP API.

## Non-goals

No provider routing, model selection, Paperclip, Codex, Claude Code, Activepieces, automatic repair loop, or production action is included.
