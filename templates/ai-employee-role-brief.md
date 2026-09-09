# AI Employee Role Brief Template

## Identity

- Proposed role name:
- Workspace/client:
- Human owner:
- Business function:
- Current status: discovery

## Business outcome

What measurable business outcome should improve?

## Why a role is needed

Why is this better represented as a reusable digital role rather than one standalone automation?

## Responsibilities

List outcome-oriented responsibilities.

## Explicit non-responsibilities

What must this role never own or decide?

## People / high-stakes impact gate

- Who can be materially affected by this role?
- Does it affect employment, credit/insurance, health, legal/compliance, physical safety/security, significant finance, education access, government benefits/enforcement, or another high-stakes domain?
- High-stakes domains:
- Special review required?
- Human decision/review that must remain:
- Correction/appeal/escalation path if applicable:

If any high-stakes domain applies, use `docs/ai-employees/high-stakes-role-gate.md`.

## Task inventory

| Task | Frequency | Current actor | Rule-based? | Semantic AI? | Agentic? | Human judgment? | Risk |
|---|---:|---|---:|---:|---:|---:|---|

## Systems and data

| System/source | Purpose | Interface | Data class | Identity owner | Constraints |
|---|---|---|---|---|---|

## Capabilities

### Workflows

### Skills

### Tools

### Knowledge

## Authority

- proposed autonomy class:
- max automatic risk tier:
- actions requiring approval:
- prohibited actions:
- identity mode:
- delegated-user cases:

## Instructions / model policy

- instruction reference/version:
- model policy:
- runtime requirements:
- fallback constraints:

## Context and memory

- role context:
- task context:
- knowledge:
- memory required? why?
- memory write mode:
- retention:
- sensitive data:
- cross-workspace memory: **must remain false unless a future ADR changes policy**

## Delegation

- delegation needed?
- allowed child roles:
- max depth:
- why a normal workflow/subflow is insufficient:

Default is no delegation.

## Escalation

- human target:
- ambiguity triggers:
- safety triggers:
- business-rule triggers:
- timeout behavior:

## Limits

- max task runtime:
- max reasoning iterations:
- max tool calls:
- max cost/task:
- max concurrent tasks:
- max delegation depth:

## Baseline

- manual volume:
- manual minutes:
- human error/rework:
- queue/backlog:
- current business KPI:

## Evaluation plan

Link role-specific evaluation plan.

## Promotion criteria

What evidence is required for:

- Test -> Shadow
- Shadow -> Supervised
- Supervised -> Active

## Non-goals

List work intentionally left with humans or ordinary workflows.
