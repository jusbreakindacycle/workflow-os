# ADR-005: Workspace Isolation Is an MVP Invariant

**Status:** Accepted

## Context

A single freelance operator may manage multiple clients. That is already multi-client from a security and confidentiality standpoint even if the product has only one human account.

## Decision

All client-relevant control-plane data is workspace-scoped from MVP. Workflow definitions use logical integration references and never embed reusable secret values.

## Consequences

- data model and authorization require workspace context from the beginning
- templates require sanitization before cross-workspace reuse
- logs/run metadata must preserve workspace boundaries
- migration to multi-user collaboration later is easier than retrofitting client isolation

## Guardrail

Single-user does not mean single-tenant data semantics.
