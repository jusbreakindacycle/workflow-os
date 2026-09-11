# Phase 1: Core Control Plane

## Objective

Prove the product's canonical semantics and operator UX locally without depending on a real AI/workflow/workforce provider.

## Gate 0 — Foundation v3 accepted

Before coding: README/goal/scope/architecture/ADRs agree; ADR-019 supersedes Activepieces-first order; provider integrations are deferred; Phase 1 acceptance criteria are stable enough to build against.

## Gate 1 — Repository implementation foundation

Choose the simplest local stack consistent with local web UI, local API/domain layer, persistent development database, migrations, schema/type validation, test runner, and documented startup. Framework choice is an implementation ADR only when it creates durable lock-in.

## Gate 2 — Canonical entities and invariants

Implement Workspace, Client, Engagement, Project/ProjectBrief version, ProjectRevision, WorkItem/dependencies, Proposal, Decision, Approval, Artifact/Evidence refs, ProjectEvent, ProjectPackVersion, ContextSlice, SpendEnvelope/CostRecord, and Assignment state sufficient for MVP.

Prove Workspace isolation and version-safe state transitions.

## Gate 3 — New Project flow

```text
+ New Project
  -> internal/client
  -> raw request
  -> draft Project/Engagement
  -> small structured discovery
  -> explicit unknowns
  -> operator accepts problem/outcome/working scope summary
```

No AI required. Client work may record `proposed_to_client`/`client_accepted` separately; operator approval alone must not fabricate client acceptance.

## Gate 4 — Work graph + attention

Create initial synthetic WorkItems, derive readiness, Needs My Attention, Activity Feed, and next-ready work. Prove proposals cannot silently change canonical scope.

## Gate 5 — Project Pack + Context Slice

Generate/validate Project Pack v0.1 from accepted canonical state. Regeneration/version/diff/provenance must be testable. Create an Assignment Context Slice that contains only authorized WorkItem-relevant context.

## Gate 6 — Goal revision / impact propagation

Revise an already accepted synthetic Project goal. Prove a new ProjectBrief/ProjectRevision is created, affected WorkItems/approvals/Pack are marked stale/superseded as applicable, unaffected work remains valid when safe, and the revised Pack is generated only from accepted updated state.

## Gate 7 — Repository creation approval record

Create RepositoryProposal/approval flow in canonical state/UI. Actual GitHub repository creation remains deferred; use a mock adapter/result.

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

Use synthetic metered-route/cost fixtures to prove unapproved paid execution cannot start and envelope limits are enforced.

## Gate 10 — Restart/recovery + Command Center

Restart during a synthetic in-flight Assignment and prove state remains explainable. Complete Command Center/Activity/attention acceptance criteria.

## Exit

Every applicable checkbox in `docs/testing/acceptance-criteria.md` has reproducible evidence.

## Explicit non-goals

No Paperclip, Activepieces, real ProviderConnection/model API, automated coding, automated deployment, payment processor, client portal, or production autonomous loop in Phase 1.
