# Execution Engine Routing Policy

## Purpose

Workflow OS can eventually support multiple execution classes, but engine choice is a deliberate deployment decision, not an arbitrary runtime AI decision.

## Routing inputs

Evaluate:

- WIR capabilities required
- long-running/wait-state semantics
- human-task requirements
- API vs browser/desktop interface
- client ecosystem (for example Microsoft-heavy)
- data locality/security constraints
- self-hosting requirement
- licensing/commercial constraints
- execution-history/status fidelity
- idempotency/retry semantics
- connector coverage
- latency/volume
- operational burden
- cost
- client ownership/handoff model

## Selection hierarchy

1. Preserve required workflow semantics.
2. Satisfy security/client constraints.
3. Prefer the simplest operationally sufficient engine.
4. Prefer stable supported interfaces over brittle UI automation.
5. Optimize connector convenience/cost only after correctness and governance.

## Unsupported semantics

If no configured adapter can preserve the workflow's required semantics, mark the workflow **not deployable**. Do not silently weaken approvals, retries, wait states, or version guarantees.

## RPA routing

Use browser/desktop automation only when a stable supported API/connector is unavailable or unsuitable and the target permits automation. RPA steps receive stronger brittleness/verification monitoring.

## Agent routing

An agent runtime is not chosen merely because the workflow contains AI. A bounded `ai_transform` can execute within an ordinary workflow. Agent runtime is justified only when dynamic next-action selection/stateful reasoning is necessary.

## MVP

Phase 1 has one primary engine target per ADR-004. This routing policy defines future compatibility without adding multi-engine implementation to MVP.
