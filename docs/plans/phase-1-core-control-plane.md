# Phase 1: Core Control Plane

## Objective

Prove the product's canonical semantics and operator UX locally without depending on a real AI/workflow/workforce provider.

Phase 1 is an **architecture-risk retirement slice**, not permission to build a polished project-management suite. Exit as soon as the golden-path semantics/evidence pass, then move to real provider execution in Phase 2.

## Implementation status

| Gate | Status | Primary evidence |
|---|---|---|
| 0 — Foundation v3 | Merged | Foundation v3 + PR #7 adversarial review |
| 1 — Repository foundation | Merged | ADR-020, local-development runbook, CI/startup/migration/backup tests |
| 2 — Canonical entities | Merged | ADR-021, canonical schema/store tests |
| 3 — New Project / discovery | Implemented + green in current PR | Gate 3 intake/API tests |
| 4 — Work graph / attention | Implemented + green in current PR | Gate 4 control-plane test |
| 5 — Project Pack / Context Slice | Implemented + green in current PR | deterministic contract/context tests |
| 6 — Goal revision / impact | Implemented + green in current PR | selective invalidation test |
| 7 — Repository approval | Implemented + green in current PR | strategy + approval + mock-only test |
| 8 — Assignment / verification | Implemented + green in current PR | pass/fail evidence-verification tests + HTTP golden path |
| 9 — Spend Gate | Implemented + green in current PR | approval/envelope/limit tests |
| 10 — Recovery / Command Center | Implemented + green in current PR | restart and Command Center tests |

Phase 1 becomes formally exited when the current PR is green and merged. The canonical evidence record is `docs/reviews/phase-1-completion-report.md`.

## Gate 0 — Foundation v3 accepted

README/goal/scope/architecture/ADRs agree; ADR-019 supersedes the old Activepieces-first order; provider integrations are deferred; Phase 1 acceptance criteria define the local proof.

## Gate 1 — Repository implementation foundation

ADR-020 selects Node.js `>=24.15.0`, built-in HTTP + SQLite, a plain local web shell, ordered SQL migrations, runtime shape guards/JSDoc contracts, and `node:test`, with no runtime npm dependencies.

The application starts locally, owns a persistent SQLite database, applies checksum-protected migrations, exposes a local API/UI, and has a documented backup path.

## Gate 2 — Canonical entities and invariants

Workspace, Client, Engagement, Project/ProjectBrief version, ProjectRevision, WorkItem/dependencies, Proposal, Decision, Approval, Artifact/Evidence refs, ProjectEvent, ProjectPackVersion, ContextSlice, SpendEnvelope/CostRecord, and Assignment foundations are persisted only to the depth needed by the golden path.

Workspace isolation and optimistic versioning are enforced in both domain behavior and database relationships where representable.

## Gate 3 — New Project / discovery / delivery strategy

```text
+ New Project
  -> internal/client
  -> raw request
  -> draft Project/Engagement
  -> small structured discovery
  -> explicit unknowns
  -> preserve requested solution
  -> choose working delivery strategy
  -> operator accepts problem/outcome/working scope/strategy summary
```

No AI is required. Client work keeps operator approval separate from actual client acceptance.

## Gate 4 — Work graph + attention

Accepted Projects can create a small synthetic Work graph. Readiness is derived from canonical status, dependencies, active Assignments, and pending approval. Needs My Attention and Activity Feed are read models over source records/events. WorkItem Proposals never silently become canonical work.

## Gate 5 — Project Pack + Context Slice

Project Pack v0.1 is generated deterministically from accepted canonical state, validated, hashed, versioned, and stored with provenance. Context Slice binds one exact WorkItem version to minimum-authorized execution context. Raw reusable secrets are rejected.

## Gate 6 — Goal revision / impact propagation

A material revision appends a new accepted ProjectBrief/ProjectRevision. Explicitly affected WorkItems/approvals/Assignments/Pack state become stale/superseded while unaffected work remains valid when its basis did not change.

## Gate 7 — Optional repository approval branch

`custom_build` and `hybrid` Projects may create RepositoryProposal + Approval state. Non-repository strategies continue without inventing one. Phase 1 uses only `mock://repository/...` results; no source-control provider API is called.

## Gate 8 — Mock Assignment / verification

```text
WorkItem ready
  -> Assignment created/running
  -> execution_finished
  -> evidence attached
  -> verifier pass/fail
  -> WorkItem complete OR needs_attention
```

Execution finish does not complete the WorkItem. A pass requires evidence and completion authority stays in verification. A failed verification leaves work incomplete and visible to the operator.

## Gate 9 — Spend Gate semantics

Synthetic metered execution requires an approved bounded SpendEnvelope. Unknown cost is not silently treated as zero; purpose/currency/WorkItem/balance are enforced; cost records reconcile spend; expansion requires a new Approval.

## Gate 10 — Restart/recovery + Command Center

A persisted in-flight Assignment remains explainable after SQLite reopen and is not falsely completed. The Command Center derives portfolio phase/status/health, next-ready work, Needs My Attention, Activity Feed, Assignment recovery state, Pack versions, repository proposals, and spend state from canonical records.

## Anti-PM-suite stop rule

Do **not** add Gantt charts, generic boards, chatrooms, full CRM/accounting, rich invoicing, multi-user collaboration, workflow canvas, provider dashboards, or UI polish not required to prove the golden path.

This stop rule now applies immediately after merge of the completed Phase 1 PR. Do not reopen Phase 1 for generic product polish unless implementation exposes a real correctness defect.

## Exit

Every Phase 1 acceptance criterion has reproducible implementation/test evidence mapped in `docs/reviews/phase-1-completion-report.md`. Once the current PR is green and merged, proceed to Phase 2 real execution rather than another foundation expansion.

## Explicit non-goals

No Paperclip, Activepieces, real ProviderConnection/model API, automated coding, automated deployment, payment processor, client portal, or production autonomous loop is part of Phase 1.
