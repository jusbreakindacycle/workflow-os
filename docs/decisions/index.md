# Architecture Decision Index

Foundation v3 consolidates the active working tree. Earlier Foundation v1/v2 ADR text remains in Git history; carried-forward normative invariants are restated in `legacy-foundation-decisions.md` so future workers do not require Git archaeology.

## Active decisions

| ADR | Decision | Status |
|---|---|---|
| [ADR-013](ADR-013-internal-workforce-adapter-boundary.md) | Internal workforce providers stay behind an authority-asymmetric adapter boundary | Accepted |
| [ADR-014](ADR-014-human-governed-autonomous-delivery.md) | Human-governed autonomous delivery; material goal revisions are versioned/impact-propagated | Accepted |
| [ADR-015](ADR-015-client-engagement-project-hierarchy.md) | Separate Workspace isolation, commercial Engagement, and operational Project | Accepted |
| [ADR-016](ADR-016-model-runtime-broker-and-spend-gate.md) | Model/runtime/connection routing is replaceable; metered execution requires explicit prior bounds | Accepted |
| [ADR-017](ADR-017-project-pack-and-instruction-compiler.md) | Project Pack + minimum Context Slice compile into provider projections | Accepted |
| [ADR-018](ADR-018-local-first-command-center.md) | Local-first web Command Center first; desktop shell optional later | Accepted |
| [ADR-019](ADR-019-core-control-plane-before-provider-spikes.md) | Build provider-independent core control plane before provider spikes | Accepted |
| [ADR-020](ADR-020-gate-1-implementation-stack.md) | Gate 1 uses a dependency-light local Node/SQLite/web foundation | Accepted |
| [ADR-021](ADR-021-canonical-state-persistence-invariants.md) | Canonical state uses Workspace-scoped relationships and optimistic versioning | Accepted |
| [ADR-022](ADR-022-phase2-autonomy-kernel-and-live-certification.md) | Phase 2 execution stays behind normalized routes; fixture, live execution, and real portability claims require distinct evidence | Proposed until Phase 2 PR merge |

## Rules

- Accepted ADRs are authoritative until explicitly superseded.
- A provider/tool implementation cannot silently override an ADR.
- If implementation reveals contradiction, propose a new ADR rather than rewriting merged history to fit implementation.
- Git history preserves removed/superseded detail.
