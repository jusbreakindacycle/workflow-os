# Phase 1 Gate 2 — Canonical Entities and Invariants

## Purpose

Gate 2 turns the Gate 1 local database into the first canonical control-plane state store. It intentionally does **not** build the New Project UI, work-graph scheduler, Project Pack compiler, Spend Gate, or AI execution yet.

## Persisted canonical foundation

The migration introduces the Phase 1 entities required by the golden path:

- isolation/commercial: `Workspace`, `Client`, `Engagement`;
- delivery: `Project`, `ProjectBrief`, `ProjectRevision`;
- work graph: `WorkItem`, `WorkDependency`, `WorkItemProposal`;
- authority/history: `Decision`, `Approval`, `ArtifactReference`, `EvidenceReference`, `ProjectEvent`;
- execution-policy foundation: `ProjectPackVersion`, `ContextSlice`, `SpendEnvelope`, `CostRecord`, `Assignment`.

Commercial fields remain intentionally shallow. Quote, invoice, payment, and maintenance products are not introduced.

## Enforced invariants

### Workspace isolation

All scoped canonical records carry `workspace_id`. Composite foreign keys reject cross-workspace/cross-project relationships where SQL can express the rule.

### Provider-independent identity

Canonical records use Workflow OS-owned IDs. No OpenAI, Anthropic, Codex, Claude Code, Copilot, Paperclip, Activepieces, GitHub, or other provider identifier is required to create Project state.

### Version-safe mutation

`Project` and `WorkItem` mutations use optimistic expected-version checks. A stale writer receives a concurrency conflict instead of silently overwriting newer truth.

### Project Brief history

Accepted brief changes append a new version. The prior accepted brief is marked superseded and a `ProjectRevision` records before/after linkage and pending impact analysis.

Gate 6 later implements the full stale-impact propagation rules.

### WorkItem authority

The initial domain transition map is deliberately conservative. Generic WorkItem mutation cannot mark work `complete`; later verification/acceptance logic owns that transition.

A `WorkItemProposal` remains a proposal. Creating it does not create or modify a canonical WorkItem.

### Exact execution snapshot

Database triggers reject new `Assignment` or `ContextSlice` rows that claim a WorkItem version different from the current canonical WorkItem version at snapshot creation time.

This does not yet implement Assignment execution; it establishes the version binding Gate 5/8 rely on.

### Events

Project creation, Project Brief acceptance, WorkItem creation, and WorkItem status mutation emit Project events through the canonical domain store.

## Domain boundary

`src/domain/canonical-store.js` is the Gate 2 write boundary for the implemented mutations. Future application/API code should call domain methods rather than treating raw SQL as the business API.

Direct SQL remains appropriate for migrations, tests that prove database constraints, backup/recovery, and later carefully bounded read models.

## Verification

Gate 2 tests prove:

- all required canonical tables exist;
- every scoped canonical table carries `workspace_id`;
- internal Projects work without Client/Engagement;
- Client/Engagement/Project hierarchy works for client delivery;
- cross-workspace references fail in both domain and database paths;
- Project Brief revision is append/version based;
- stale Project and WorkItem writes fail;
- WorkItem dependencies cannot cross Project scope;
- WorkItem Proposal does not silently become canonical work;
- Decision and Approval remain explicit authority records;
- Assignment snapshots reject stale WorkItem versions.

## Deferred to later gates

- Gate 3: New Project intake/discovery/delivery-strategy flow;
- Gate 4: dependency/readiness engine, attention and Activity read models;
- Gate 5: real Project Pack + minimum Context Slice generation;
- Gate 6: complete revision impact propagation;
- Gate 7: repository proposal/approval path;
- Gate 8: mock Assignment execution + verification completion semantics;
- Gate 9: actual Spend Gate enforcement;
- Gate 10: restart/recovery + Command Center completion.

No AI/workflow/workforce provider is introduced by this gate.
