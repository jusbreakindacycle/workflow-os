# ADR-013: Internal Workforce Adapter Boundary

**Status:** Accepted

## Context

External workforce managers such as Paperclip may already solve worker lifecycle, heartbeats, sessions, task checkout, runtime adapters, cost tracking, review stages, secrets, and detailed runtime UI. Rebuilding all of those mechanics before proving Workflow OS value is unnecessary.

However an external workforce manager cannot be allowed to become the hidden owner of client/project/business truth.

## Decision

Use a provider-neutral Internal Workforce Adapter.

Workflow OS remains authoritative for Workspace, Client/Engagement context, Project, WorkItem readiness/meaning/acceptance, Project Pack, Decisions, Approvals, policy/risk/spend, deployment/incident/maintenance, and cross-provider evidence.

### D1 — canonical authority

Workflow OS is the sole canonical Project/WorkItem authority.

### D2 — provider-created work

Small in-scope provider-local decomposition may remain provider-local. Material new work becomes a WorkItem Proposal and cannot silently expand scope.

### D3 — tenant + credential isolation

Default Paperclip evaluation mapping is `Workflow OS Workspace -> Paperclip Company`, but provider control credentials must also have an acceptable Workspace-bounded blast radius. Stronger per-Workspace provider isolation is the fallback.

### D4 — asymmetric synchronization

Workflow OS sends assignments/constraints; providers send runtime facts/evidence/proposals. Provider-side UI edits never silently mutate canonical Project state.

### D5 — completion separation

Provider `done` maps to `execution_finished` / evidence available, not canonical WorkItem `complete`.

### D6 — consequential approval

High-impact business/risk/production approval remains authoritative in Workflow OS. Provider review stages may be execution control/evidence.

### D7 — advanced parallelism

Parallel coding/worktrees require separate proof of isolation, dependency finalization, integration ownership, conflict handling, and verification.

### D8 — core independence

The core control plane is proven without requiring Paperclip or another workforce provider.

## Consequences

- avoids an accidental Paperclip clone;
- introduces mapping/reconciliation work;
- preserves provider replacement;
- requires drift/conflict visibility;
- keeps one human authority surface.

## Revisit

Revisit if provider reconciliation becomes more complex than a minimal internal implementation or if real usage proves a simpler ownership model without weakening portability/authority.
