# Architecture Decision Records

ADRs capture decisions that must remain understandable after chat context is gone.

| ADR | Decision | Status |
|---|---|---|
| [ADR-001](ADR-001-control-plane-not-engine.md) | Build a control plane, not a universal executor | Accepted |
| [ADR-002](ADR-002-wir-canonical-model.md) | WIR is the canonical workflow representation | Accepted |
| [ADR-003](ADR-003-deterministic-first.md) | Deterministic-first, agentic where necessary | Accepted |
| [ADR-004](ADR-004-initial-execution-engine.md) | Activepieces is the initial MVP execution target | Accepted — Conditional Pass |
| [ADR-005](ADR-005-client-isolation.md) | Workspace isolation and indirect integration references from MVP | Accepted |
| [ADR-006](ADR-006-evidence-driven-scale.md) | Scale infrastructure requires measured triggers | Accepted |

## ADR rules

- Accepted ADRs are authoritative until superseded.
- A new decision that contradicts an accepted ADR must explicitly supersede it.
- ADRs explain context, decision, consequences, and revisit conditions.
- Implementation convenience alone is not sufficient reason to bypass an ADR.
