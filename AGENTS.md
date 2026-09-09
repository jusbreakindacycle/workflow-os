# AGENTS.md

This repository is spec-first. Repository documentation is the system of record.

## Required reading before implementation

1. `docs/product/goal.md`
2. `docs/product/scope-mvp.md`
3. `ARCHITECTURE.md`
4. `docs/decisions/index.md`
5. `docs/testing/acceptance-criteria.md`
6. The active phase plan and task-specific contracts.

## Operating rules

- Do not expand MVP scope without explicit approval.
- Do not implement a future-phase capability merely because its specification exists.
- Do not implement future-scale infrastructure merely because it appears in the maturity model.
- Prefer deterministic workflow steps. Use AI/agents only where ambiguity or semantic reasoning is required.
- Human approval is a first-class workflow primitive.
- Treat every external side effect as a reliability and authorization concern.
- Client/workspace isolation is mandatory from MVP.
- Workflow/role definitions must never contain raw reusable secrets.
- Every mutating action must declare an idempotency strategy or explicitly document why it cannot.
- Every loop must have explicit termination/budget constraints.
- Every implementation task must map to acceptance criteria and tests.
- Update affected documentation when a design decision changes.

## Phase discipline

### Phase 1

Current implementation work is governed by `docs/plans/phase-1-mvp.md`.

AI Employee specifications under `docs/ai-employees/` are **future Phase 3 contracts**. Their existence does not authorize implementing:

- Role Registry;
- AI Employee runtime;
- persistent memory;
- autonomous role execution;
- multi-agent delegation.

Phase 1 may build foundations that Phase 3 later relies on—tool contracts, workflow state, approvals, workspace isolation, observability—but must not turn them into hidden Phase 3 feature work.

### Phase 3

When explicitly activated, read `docs/plans/phase-3-ai-employees.md` and `docs/ai-employees/acceptance-criteria.md`.

AI Employee means a governed role abstraction, not an unrestricted long-running agent.

## Reviewer roles

When parallel/subagent capability is available, use bounded reviewer roles defined in `docs/agents/reviewer-contracts.md`. Reviewers identify violations; they do not silently change product scope.
