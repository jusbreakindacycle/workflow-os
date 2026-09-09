# ADR-009: AI Employee Memory Is Explicit, Typed, and Workspace-Scoped

**Status:** Accepted

## Context

Long-lived conversational memory can accumulate irrelevant, sensitive, stale, malicious, or cross-client information.

A digital role often needs continuity, but “remember everything” is not a safe architecture.

## Decision

Memory is optional and typed.

Supported conceptual classes:

- working memory;
- episodic memory;
- profile/state memory;
- proposed learned heuristics.

Every role declares a memory write mode and retention policy.

Cross-workspace memory is forbidden by default.

Learned heuristics do not become production policy without review, evaluation, and a new version.

## Consequences

- context assembly is deliberate;
- memory can be reviewed/deleted;
- prompt-injection persistence is reduced;
- some convenience of unconstrained chat history is intentionally sacrificed.

## Guardrail

Untrusted task content cannot directly modify role instructions, authority, or persistent policy memory.
