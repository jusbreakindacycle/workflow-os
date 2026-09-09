# Phase 1 MVP Plan

Phase 0 is merged. Phase 1 implementation may begin only after the Gate 2 desk-research decision is merged and the active task is mapped to the repository contract.

## Gate 1 — Repository and specification validation

**Status: COMPLETE**

Before every implementation task:

- read `AGENTS.md` and canonical docs;
- map work to acceptance criteria;
- verify no hidden scope change;
- identify relevant ADRs and failure/security implications.

## Gate 2A — Execution-engine due diligence

**Status: COMPLETE — CONDITIONAL PASS**

Activepieces remains the initial engine target.

Canonical evidence:

- `docs/research/activepieces-gate-2.md`
- `docs/architecture/activepieces-adapter-profile.md`
- `docs/decisions/ADR-004-initial-execution-engine.md`

Key conditions:

- verify supported control transport on the exact deployment;
- do not use undocumented APIs/direct database writes;
- keep real client workloads behind an engine-level isolation boundary;
- preserve Workflow OS idempotency/reconciliation and approval semantics.

## Gate 2B — First hands-on Activepieces adapter spike

**This is the first coding task.**

Do not begin with the product UI.

The spike must establish, with executable evidence:

1. the exact Activepieces deployment/version and plan/edition;
2. whether official REST API-key access is actually available;
3. if REST is unavailable/unacceptable, whether official MCP can support the required adapter subset;
4. flow create/edit/validate/publish/activation;
5. supported trigger mapping;
6. run initiation and run/status/version retrieval;
7. connection-reference handling;
8. failure/retry/replay behavior;
9. wait/resume and approval transport feasibility;
10. unsupported capabilities.

### Gate 2B output

Produce:

- adapter capability manifest;
- transport decision: REST, MCP, or FAIL;
- synthetic test flow;
- recorded request/response fixtures with sensitive values removed;
- run-status mapping evidence;
- list of unsupported/deferred WIR semantics;
- confirmation of ADR-004 or a proposed superseding ADR.

No broad application feature work should be built around Activepieces until this spike passes.

## Gate 3 — Thin deterministic vertical slice

After Gate 2B passes, build:

```text
Workspace
 -> Workflow Brief
 -> WIR validation
 -> one synthetic deterministic workflow
 -> adapter deployment
 -> run
 -> normalized status
 -> run view
```

No general agent workflow and no complex AI/human-approval UI before this deterministic slice is reliable.

## Gate 4 — Reliability and policy

Add:

- retry/error classification;
- idempotency/reconciliation;
- failed-run state;
- safe replay/recovery;
- risk policy;
- bound human approval.

## Gate 5 — AI transform

Add one bounded schema-constrained AI transform with evaluation fixtures, timeout/cost policy, and no authorization bypass.

## Gate 6 — Reuse / ROI / handoff

Add:

- template sanitization;
- baseline and post-automation ROI/time tracking;
- generated handoff documentation.

## Client Production Gate

Before the first real client workload:

- repository/private-data handling is appropriate;
- Workflow OS workspace isolation is tested;
- Activepieces instance/project isolation is explicitly mapped;
- plan/license assumptions are re-verified;
- backups/encryption-critical secrets are recoverable;
- sandbox/network mode is reviewed;
- production monitoring/recovery ownership is defined.

A synthetic MVP passing does **not** automatically authorize real multi-client production.

## Exit

MVP is complete only when every applicable checkbox in `docs/testing/acceptance-criteria.md` has evidence.
