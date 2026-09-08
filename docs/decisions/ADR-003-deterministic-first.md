# ADR-003: Deterministic-First, Agentic Where Necessary

**Status:** Accepted

## Context

Agents are powerful for ambiguity but introduce nondeterminism, cost, evaluation burden, and side-effect risk. Many business automations have stable rules and do not require autonomous planning.

## Decision

Use deterministic workflow logic whenever valid inputs plus rules can define the action. Use AI for bounded semantic transformations. Use an agent only when contextual reasoning must determine the next action/tool.

## Consequences

- easier testing and debugging
- lower cost and latency
- clearer auditability
- agents remain bounded by tool allowlists, budgets, approval policy, and deterministic workflow structure

## Guardrail

“AI can do it” is not sufficient justification for an agent node.
