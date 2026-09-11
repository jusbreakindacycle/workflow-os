# Phase 1: Core Control Plane

## Objective

Prove the product's canonical semantics and operator UX locally without depending on a real AI/workflow/workforce provider.

Phase 1 is an **architecture-risk retirement slice**, not permission to build a polished project-management suite. Exit as soon as the golden-path semantics/evidence pass, then move to real provider execution in Phase 2.

## Gate 0 — Foundation v3 accepted

Before coding: README/goal/scope/architecture/ADRs agree; ADR-019 supersedes Activepieces-first order; provider integrations are deferred; Phase 1 acceptance criteria are stable enough to build against.

## Gate 1 — Repository implementation foundation

Choose the simplest local stack consistent with local web UI, local API/domain layer, persistent development database, migrations, schema/type validation, test runner, and documented startup. Framework choice is an implementation ADR only when it creates durable lock-in.

**Selected implementation:** ADR-020 uses Node.js `>=24.15.0`, built-in HTTP + SQLite, a plain local web shell, ordered SQL migrations, runtime shape guards/JSDoc contracts, and `node:test`, with no runtime npm dependencies in Gate 1. Gate 1 is complete only when local/CI verification evidence passes and the implementation is merged.

## Gate 2 — Canonical entities and invariants

Implement Workspace, Client, Engagement, Project/ProjectBrief version, ProjectRevision, WorkItem/dependencies, Proposal, Decision, Approval, Artifact/Evidence refs, ProjectEvent, ProjectPackVersion, ContextSlice, SpendEnvelope/CostRecord, and Assignment state **only to the depth required by the golden path**.

Do not turn quote/payment/maintenance placeholders into separate subsystems in Phase 1.

Prove Workspace scoping and version-safe state transitions.

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

No AI required. Client work may record `proposed_to_client`/`client_accepted` separately; operator approval alone must not fabricate client acceptance.

## Gate 4 — Work graph + attention

Create initial synthetic WorkItems, derive readiness, Needs My Attention, Activity Feed, and next-ready work. Prove proposals cannot silently change canonical scope.

## Gate 5 — Project Pack + Context Slice

Generate/validate Project Pack v0.1 from accepted canonical state. Regeneration/version/diff/provenance must be testable. Create an Assignment Context Slice containing only authorized WorkItem-relevant context.

## Gate 6 — Goal revision / impact propagation

Revise an already accepted synthetic Project goal. Prove new ProjectBrief/ProjectRevision version; affected WorkItems/approvals/Pack become stale/superseded as applicable; unaffected work remains valid when safe; revised Pack is generated only from accepted state.

## Gate 7 — Optional repository approval branch

For a synthetic `custom_build` or repository-requiring strategy, create RepositoryProposal/approval flow in canonical state/UI. Actual source-control API creation remains deferred; use mock adapter/result.

A `process_change`, `adopt_existing`, or other strategy that does not need a repository must be able to continue without inventing one.

## Gate 8 — Mock Assignment / verification

```text
WorkItem ready
  -> Assignment created/running
  -> execution_finished
  -> evidence attached
  -> verifier pass/fail
  -> WorkItem complete OR repair/blocked
```

Provider completion must not bypass verification. Mock worker must not receive unrelated client/commercial context.

## Gate 9 — Spend Gate semantics

Use synthetic metered-route/action fixtures to prove unapproved incremental cost cannot start and envelope limits are enforced.

## Gate 10 — Restart/recovery + Command Center

Restart during synthetic in-flight Assignment and prove state remains explainable. Complete Command Center/Activity/attention criteria.

## Anti-PM-suite stop rule

Do **not** add Gantt charts, generic boards, chatrooms, full CRM/accounting, rich invoicing, multi-user collaboration, workflow canvas, provider dashboards, or UI polish not required to prove the golden path.

## Exit

Every applicable checkbox in `docs/testing/acceptance-criteria.md` has reproducible evidence. Once this passes, the next meaningful task is Phase 2 real execution — not another foundation expansion.

## Explicit non-goals

No Paperclip, Activepieces, real ProviderConnection/model API, automated coding, automated deployment, payment processor, client portal, or production autonomous loop in Phase 1.
