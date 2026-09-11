# Phase 1 MVP Plan

The original Phase 0 is merged. Foundation v2 aligns the product with the broader solo-AI-business delivery vision before broad application implementation.

The Phase 1 objective is still deliberately narrow: prove one controlled Project can move from problem intake through a governed deployed workflow outcome while remaining visible through the Project Command Center.

## Gate 0 — Foundation v2 alignment

**Status: IN REVIEW until the Foundation v2 PR is merged.**

Before broad application implementation:

- read `docs/plans/foundation-v2.md`;
- accept Project as the top-level operational unit;
- keep WIR canonical only for workflow definitions within a Project;
- use the Project Command Center contract for operator visibility;
- distinguish internal delivery agents from future client-facing AI Employees;
- preserve all existing reliability/security/approval constraints.

The isolated Activepieces hands-on spike may proceed because it is an execution-engine evidence task, not broad product implementation.

## Gate 1 — Repository and specification validation

**Status: COMPLETE, subject to Foundation v2 merge.**

Before every implementation task:

- read `AGENTS.md` and canonical docs;
- map work to acceptance criteria;
- verify no hidden scope change;
- identify relevant ADRs and failure/security implications;
- identify the exact Project/WorkItem/acceptance evidence affected once Project runtime state exists.

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

**This remains the first coding task.**

Do not begin with the full product UI or autonomous agents.

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

## Gate 3 — Project control-plane skeleton

After Gate 2B passes, implement the smallest canonical Project layer required by Phase 1:

```text
Workspace
 -> Project
 -> Project Brief
 -> WorkItem(s) + dependencies/status
 -> Event/activity state
 -> derived Command Center portfolio/project view
```

Requirements:

- Project belongs to exactly one Workspace;
- WorkItem readiness/blocking is explainable;
- the Command Center shows phase, status/health, active work, next ready work, and operator-attention items;
- agent narrative is not the state store;
- no arbitrary progress percentage is required.

## Gate 4 — Thin Project-to-workflow vertical slice

Build:

```text
Workspace
 -> Project
 -> Project Brief
 -> Workflow Brief WorkItem
 -> WIR validation
 -> one synthetic deterministic workflow
 -> adapter deployment
 -> run
 -> normalized status/evidence
 -> Project Command Center update
 -> deployment/environment record
```

No general autonomous agent workflow and no complex AI/human-approval UI before this deterministic slice is reliable.

## Gate 5 — Reliability, risk, and human approval

Add:

- retry/error classification;
- idempotency/reconciliation;
- failed-run state;
- safe replay/recovery;
- risk policy;
- bound human approval;
- Project/WorkItem state transitions that surface failures/approvals in the Command Center.

## Gate 6 — AI transform

Add one bounded schema-constrained AI transform with evaluation fixtures, timeout/cost policy, and no authorization bypass.

This is not a persistent internal agent runtime.

## Gate 7 — Agent-operability proof

For the thin vertical slice, prove that an authorized engineering agent/human can reproducibly:

- bootstrap/start the required services;
- locate the relevant feature/path;
- run automated checks;
- exercise the real relevant user/API/workflow path;
- inspect failures;
- capture completion evidence;
- stop/escalate if verification cannot be completed.

Store the minimum project/repository map and verification instructions needed to avoid repeated human babysitting.

## Gate 8 — Reuse / ROI / handoff

Add:

- template sanitization;
- baseline and post-automation ROI/time tracking;
- generated handoff documentation;
- Project-level reusable lessons/artifact references.

## Gate 9 — Minimal production ownership

For the deployed synthetic/controlled Project:

- register deployment/environment/version;
- expose deployment failure/health to the operator;
- define recovery ownership;
- support a failed/maintenance WorkItem;
- record recovery/redeployment evidence.

This is not 24/7 autonomous remediation.

## Client Production Gate

Before the first real client workload:

- repository/private-data handling is appropriate;
- Workflow OS workspace isolation is tested;
- Project-to-workflow-to-deployment attribution is tested;
- Activepieces instance/project isolation is explicitly mapped;
- plan/license assumptions are re-verified;
- backups/encryption-critical secrets are recoverable;
- sandbox/network mode is reviewed;
- production monitoring/recovery/maintenance ownership is defined;
- operator approval points are explicit.

A synthetic MVP passing does **not** automatically authorize real multi-client production or autonomous production changes.

## Exit

MVP is complete only when every applicable checkbox in `docs/testing/acceptance-criteria.md` has evidence.
