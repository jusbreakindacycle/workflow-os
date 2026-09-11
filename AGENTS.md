# AGENTS.md

This repository is spec-first. Repository documentation is the system of record.

## Required reading before implementation

1. `docs/product/goal.md`
2. `docs/product/project-operating-model.md`
3. `docs/product/project-command-center.md`
4. `docs/product/scope-mvp.md`
5. `ARCHITECTURE.md`
6. `docs/decisions/index.md`
7. `docs/testing/acceptance-criteria.md`
8. `docs/plans/foundation-v2.md`
9. the active phase plan and task-specific contracts.

## Operating rules

- Do not expand MVP scope without explicit approval.
- Do not implement a future-phase capability merely because its specification exists.
- Do not implement future-scale infrastructure merely because it appears in the maturity model.
- Treat `Project` as the top-level operational unit; WIR remains canonical for workflow definitions within a Project.
- Workflow OS owns Project, WorkItem, approval, evidence, deployment, incident, and maintenance state. Agents do not keep authoritative process state in hidden context or memory.
- The Project Command Center is a derived read model over canonical state/events; do not create manually maintained status that can drift from reality.
- Prefer deterministic workflow steps. Use AI/agents only where ambiguity, semantic reasoning, or dynamic tool selection adds value.
- Internal AI agents receive bounded assignments with explicit inputs, outputs, permissions, budgets, verification, and escalation.
- Parallel agent work is allowed only when dependencies permit isolation and the merge/verification path is explicit.
- Human approval is a first-class workflow primitive.
- Treat every external side effect as a reliability and authorization concern.
- Client/workspace isolation is mandatory from MVP.
- Workflow/role/project definitions must never contain raw reusable secrets.
- Every mutating action must declare an idempotency strategy or explicitly document why it cannot.
- Every loop must have explicit termination/budget constraints.
- Every implementation task must map to acceptance criteria and tests.
- Agent claims are not completion evidence. Material work requires machine-checkable or independently reviewable evidence appropriate to risk.
- Update affected documentation when a design decision changes.

## Foundation v2 discipline

Foundation v2 broadens the North Star from an automation-only control plane to a solo AI business delivery operating system. It does **not** authorize building an unrestricted autonomous software company in Phase 1.

Phase 1 must establish the smallest Project + Command Center + workflow vertical slice while preserving the existing Activepieces adapter evidence gate.

## Phase 1

Current implementation work is governed by `docs/plans/phase-1-mvp.md`.

AI Employee specifications under `docs/ai-employees/` are **future Phase 3 client-facing contracts**. Their existence does not authorize implementing:

- client AI Employee Role Registry;
- client AI Employee persistent memory;
- autonomous client-facing role execution;
- unrestricted multi-agent delegation.

Internal engineering/delivery agents are a different concern. Phase 1 may define their contracts and use bounded reviewer/subagent execution in development environments, but must not add a self-organizing autonomous agent fleet to the product.

### Phase 3

When explicitly activated, read `docs/plans/phase-3-ai-employees.md` and `docs/ai-employees/acceptance-criteria.md`.

AI Employee means a governed client-facing role abstraction, not an unrestricted long-running agent.

## Reviewer roles

When parallel/subagent capability is available, use bounded reviewer roles defined in `docs/agents/reviewer-contracts.md` and internal delivery roles defined in `docs/agents/internal-ai-workforce.md`.

Reviewers identify violations; they do not silently change product scope or approve their own high-impact actions.
