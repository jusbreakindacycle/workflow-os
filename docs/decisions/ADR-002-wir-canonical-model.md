# ADR-002: WIR Is the Canonical Workflow Model

**Status:** Accepted

## Context

If the execution engine's proprietary representation becomes the source of truth, business logic, tests, risk policy, and portability are locked to that engine.

## Decision

Workflow Intermediate Representation (WIR) is the canonical portable model. Engine-specific workflow definitions are derived deployment artifacts/mappings.

## Consequences

- Workflow OS can validate and reason about workflows before deployment.
- Tests, diagrams, handoff documents, and templates can derive from one model.
- Not every engine feature will be portable; adapters must declare capability gaps.
- WIR must remain intentionally smaller than the union of every vendor feature.

## Revisit

Only if maintaining a portable model becomes demonstrably more costly than its reuse/governance value.
