# Phase 1: Core Control Plane

## Objective

Prove the product's canonical semantics and operator UX locally without depending on a real AI/workflow/workforce provider.

## Gate 0 — Foundation v3 accepted

Before coding:

- README/goal/scope/architecture/ADRs agree;
- ADR-019 supersedes Activepieces-first implementation order;
- provider integrations are explicitly deferred;
- Phase 1 acceptance criteria are stable enough to build against.

## Gate 1 — Repository implementation foundation

Choose the simplest local stack consistent with:

- local web UI;
- local API/domain layer;
- persistent development database;
- schema migrations;
- type/schema validation;
- test runner;
- one-command/documented startup where practical.

Framework choice is an implementation ADR only when it creates durable lock-in.

## Gate 2 — Canonical entities and invariants

Implement Workspace, Client, Engagement, Project, WorkItem/dependencies, Proposal, Decision, Approval, Artifact/Evidence refs, ProjectEvent, ProjectPackVersion, SpendEnvelope/CostRecord, and Assignment state sufficient for the MVP.

Prove Workspace isolation and version-safe state transitions.

## Gate 3 — New Project flow

Build:

```text
+ New Project
  -> internal/client
  -> raw request
  -> draft Project/Engagement
  -> small structured discovery
  -> explicit unknowns
  -> operator accepts problem/outcome/scope summary
```

No AI required. Use deterministic fixtures/rules where needed.

## Gate 4 — Work graph + attention

Generate/create initial synthetic WorkItems, derive readiness, Needs My Attention, Activity Feed, and next-ready work.

Prove proposals cannot silently change canonical scope.

## Gate 5 — Project Pack

Generate and validate Project Pack v0 from canonical accepted state. Regeneration/version/diff/provenance must be testable.

## Gate 6 — Repository creation approval record

Create a RepositoryProposal/approval flow in canonical state and UI. Actual GitHub API repository creation remains deferred; use a mock adapter/result.

## Gate 7 — Mock Assignment / verification

Use a deterministic/mock worker adapter:

```text
WorkItem ready
  -> Assignment created/running
  -> execution_finished
  -> evidence attached
  -> verifier pass/fail
  -> WorkItem complete OR repair/blocked
```

Provider completion must not bypass verification.

## Gate 8 — Spend Gate semantics

Use synthetic paid route/cost fixtures to prove an unapproved paid Assignment cannot start and envelope limits are enforced.

## Gate 9 — Restart/recovery + Command Center

Restart the app during a synthetic in-flight Assignment and prove state remains explainable. Complete all Command Center/Activity/attention acceptance criteria.

## Exit

Every applicable checkbox in `docs/testing/acceptance-criteria.md` has reproducible evidence.

## Explicit non-goals

No Paperclip, Activepieces, real paid model, automated coding, automated deployment, payment processor, client portal, or production autonomous loop in Phase 1.
