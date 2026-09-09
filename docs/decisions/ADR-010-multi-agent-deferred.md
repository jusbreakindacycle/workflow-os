# ADR-010: Multi-Agent Collaboration Is Deferred Until Single-Role Value Is Proven

**Status:** Accepted

## Context

Multi-agent architectures can add:

- delegation loops;
- duplicated cost;
- unclear ownership;
- privilege amplification;
- context leakage;
- difficult debugging.

Many “multi-agent” use cases can be solved more reliably with one AI Employee calling deterministic workflows or narrow tools.

## Decision

Initial Phase 3 AI Employee implementation is **single-role first**.

Default `max_delegation_depth = 0`.

Multi-agent delegation requires a later measured use case and explicit review.

When enabled, delegation:

- creates bounded child tasks;
- cannot increase authority;
- inherits/narrows workspace/data policy;
- shares the parent budget;
- has a hard depth/cycle limit;
- preserves one accountable task owner.

## Consequences

- simpler first implementation;
- clearer evaluation;
- easier cost/security control;
- multi-agent capability remains possible later.

## Revisit trigger

A real workflow shows measurable benefit that cannot reasonably be achieved with a single role plus workflows/tools.
