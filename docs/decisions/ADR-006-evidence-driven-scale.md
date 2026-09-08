# ADR-006: Scale Infrastructure Requires Evidence

**Status:** Accepted

## Context

The production-engineering checklist includes important technologies and distributed-systems concepts, but implementing all of them before real load would increase complexity, cost, and failure modes.

## Decision

Use `docs/scale/scale-trigger-matrix.md` as the maturity gate. Technologies such as Kubernetes, sharding, read replicas, service discovery, multi-region deployment, advanced load balancing, and chaos engineering require measured triggers and an ADR.

## Consequences

- MVP focuses on correctness, security, reliability, and observability
- scale knowledge remains documented
- architecture can evolve from evidence rather than imitation

## Guardrail

Projected “millions of users” is not a measured trigger.
