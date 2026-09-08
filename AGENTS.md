# AGENTS.md

This repository is spec-first. Repository documentation is the system of record.

## Required reading before implementation

1. `docs/product/goal.md`
2. `docs/product/scope-mvp.md`
3. `ARCHITECTURE.md`
4. `docs/decisions/index.md`
5. `docs/testing/acceptance-criteria.md`

## Operating rules

- Do not expand MVP scope without explicit approval.
- Do not implement future-scale infrastructure merely because it appears in the maturity model.
- Prefer deterministic workflow steps. Use AI/agents only where ambiguity or semantic reasoning is required.
- Human approval is a first-class workflow primitive.
- Treat every external side effect as a reliability and authorization concern.
- Client/workspace isolation is mandatory from MVP.
- Workflow definitions must never contain raw secrets.
- Every mutating action must declare an idempotency strategy or explicitly document why it cannot.
- Every loop must have explicit termination/budget constraints.
- Every implementation task must map to acceptance criteria and tests.
- Update affected documentation when a design decision changes.

## Phase 0 restriction

Until Phase 0 is approved and merged, do not add application/runtime code, package-manager scaffolding, production infrastructure, or implementation directories such as `src/`, `apps/`, or `services/`.

## Reviewer roles

When parallel/subagent capability is available, use bounded reviewer roles defined in `docs/agents/reviewer-contracts.md`. Reviewers identify violations; they do not silently change product scope.
