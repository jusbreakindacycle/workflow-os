# ADR-012: Internal Agent Collaboration Is Work-Graph and Verification Gated

**Status:** Accepted

## Context

Workflow OS is intended to let one human operate an AI-native delivery business. This requires internal specialist agents for research, architecture, engineering, verification, deployment, and maintenance.

External agent-engineering practice shows that parallel subagents can increase throughput, but parallelism also increases integration conflicts, duplicated work, hidden context, cost, and false-success risk when tasks are not truly independent or when verification is weak.

ADR-010 already defers multi-agent delegation for **client-facing AI Employees** until single-role value is proven. Internal delivery agents are a different concern, but they need similarly explicit control.

## Decision

Internal agents are orchestrated through canonical Project/WorkItem state rather than direct free-form agent-to-agent ownership transfer.

Phase 1 does not implement a persistent self-organizing internal agent fleet.

Bounded internal reviewer/subagent use is allowed in development environments. Later internal parallel workers may be enabled only when:

- the Project work graph shows independent ready WorkItems;
- mutable resources can be isolated or safely coordinated;
- each worker has explicit scope, tools, budgets, stop conditions, and evidence requirements;
- branches/worktrees/environments are isolated where appropriate;
- integration ownership is explicit;
- a verification path exists;
- high-impact actions remain policy/approval controlled.

Workflow OS remains authoritative for WorkItem and Project state. Agents may propose transitions and produce evidence; they do not become the source of truth by messaging one another.

## Consequences

Positive:

- supports the long-term AI-company vision without making “more agents” the architecture goal;
- permits safe use of specialist/reviewer subagents before a productized multi-agent runtime exists;
- improves attribution, replayability, and debugging;
- makes parallelism a dependency optimization rather than a substitute for planning;
- fits isolated worktree/cloud-agent patterns when those become useful.

Costs:

- Project/WorkItem/Assignment contracts must be defined before broad autonomous orchestration;
- some work remains sequential even if multiple agents are technically available;
- integration/verification may limit theoretical throughput.

## Relationship to ADR-010

ADR-010 continues to govern client-facing AI Employee delegation and remains unchanged.

This ADR governs Workflow OS's **internal delivery workforce**.

## Revisit trigger

Revisit when production evidence shows a stable category of internal work where dynamic agent-to-agent delegation creates measurable benefit beyond Project-work-graph orchestration without weakening authority, observability, cost control, or verification.
