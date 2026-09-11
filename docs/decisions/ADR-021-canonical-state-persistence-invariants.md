# ADR-021: Canonical State Uses Workspace-Scoped Relationships and Optimistic Versioning

**Status:** Accepted

## Context

Phase 1 Gate 2 introduces the first persisted canonical delivery entities. The main risk is not table choice; it is allowing provider-specific identifiers, cross-workspace references, or stale writes to become authoritative state.

## Decision

For the Phase 1 local control plane:

- canonical IDs are Workflow OS-owned opaque identifiers, not provider-native IDs;
- every client/project-scoped canonical record carries `workspace_id`;
- parent/child relationships use Workspace-aware foreign-key constraints where the database can enforce them;
- `Project` and mutable `WorkItem` state use integer versions and compare-and-set updates;
- accepted Project Brief changes append a new version and create a `ProjectRevision` instead of rewriting the previous accepted brief;
- material Project/WorkItem mutations emit canonical `ProjectEvent` records in the same transaction where practical;
- `WorkItemProposal` stays separate from canonical `WorkItem` until an explicit later acceptance action;
- Assignment/Context snapshots bind to an exact WorkItem version at creation;
- external provider IDs, runtimes, models, and connections remain outside core Project meaning.

The SQL layout may evolve, but these semantic invariants require an explicit superseding ADR to change.

## Why optimistic versioning

The operator, future agents, and future adapters may all observe state at different times. A stale writer must fail rather than silently overwrite a newer accepted state. Gate 2 therefore uses expected-version mutation semantics for the first mutable aggregates instead of last-write-wins behavior.

## Why composite Workspace constraints

Application checks are necessary but insufficient. Where possible, the database also rejects relationships such as a Workspace B Engagement referencing a Workspace A Client or a WorkItem dependency crossing Project/Workspace boundaries.

## Consequences

### Positive

- Workspace isolation is enforced below the UI layer;
- stale agent/provider writes are detectable;
- Project history remains attributable to the version that produced it;
- future provider adapters cannot define canonical identity;
- restart/recovery has explicit persisted truth to reconcile against.

### Cost

- schemas carry repeated `workspace_id`/version fields;
- mutations require more explicit domain methods and tests;
- some polymorphic references such as Approval subjects still require domain-level validation in addition to SQL constraints.

## Deferred

Gate 2 does not implement readiness calculation, approval resolution, spend enforcement, Project Pack compilation, context minimization logic, autonomous Assignment execution, or provider routing. Those remain in their later Phase 1/2 gates.
