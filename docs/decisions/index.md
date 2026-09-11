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
| [ADR-007](ADR-007-ai-employee-role-abstraction.md) | AI Employee is a governed role abstraction, not a runtime primitive | Accepted |
| [ADR-008](ADR-008-ai-employee-authority-and-identity.md) | AI Employee authority is capability-scoped and independently enforced | Accepted |
| [ADR-009](ADR-009-ai-employee-memory.md) | AI Employee memory is explicit, typed, and workspace-scoped | Accepted |
| [ADR-010](ADR-010-multi-agent-deferred.md) | Client-facing AI Employee multi-agent collaboration is deferred until single-role value is proven | Accepted |
| [ADR-011](ADR-011-project-top-level-operational-unit.md) | Project is the top-level operational unit; WIR remains canonical within Project | Accepted |
| [ADR-012](ADR-012-internal-agent-collaboration-gated.md) | Internal agent collaboration is work-graph and verification gated | Accepted |
| [ADR-013](ADR-013-internal-workforce-adapter-boundary.md) | Internal AI workforce orchestration stays behind a provider-neutral adapter boundary | Proposed |

## ADR rules

- Accepted ADRs are authoritative until superseded.
- Proposed ADRs are review artifacts and are not authoritative until explicitly accepted.
- A new decision that contradicts an accepted ADR must explicitly supersede it.
- ADRs explain context, decision, consequences, and revisit conditions.
- Implementation convenience alone is not sufficient reason to bypass an ADR.
