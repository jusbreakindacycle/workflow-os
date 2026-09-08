# Workflow Intermediate Representation (WIR) v0

## Purpose

WIR is Workflow OS's canonical, vendor-neutral workflow representation. It captures portable business-process intent plus operational policy while allowing engine-specific extensions.

WIR is not intended to reproduce every feature of every automation platform. v0 targets the MVP subset.

## Required workflow fields

- `wir_version`
- `workflow.id`
- `workflow.name`
- `workflow.workspace_ref`
- `workflow.version`
- `workflow.environment`
- `nodes`
- `edges`
- `policy`

## Node types in v0

- `trigger.manual`
- `trigger.webhook`
- `trigger.schedule`
- `action`
- `transform`
- `condition`
- `delay`
- `ai_transform`
- `human_approval`
- `end`

## Common operational metadata

Where applicable:

- input/output schema references
- integration reference
- timeout
- retry policy
- idempotency strategy
- rate-limit/concurrency policy
- risk tier
- data classification
- observability tags
- test fixture references
- engine extension object

## Workflow policy

Must support maximum runtime, default timeout, retry ceiling, AI cost/iteration ceilings when applicable, approval policy, data-retention classification, and allowed execution target.

## Sensitive values

WIR stores logical references to integration configuration. It never stores raw secret values.

## Versioning

- `wir_version` versions the representation.
- `workflow.version` versions a business workflow.
- published workflow versions are immutable.
- breaking WIR schema changes require a WIR major-version change.

## Validation

A WIR document must:

1. validate against the JSON Schema;
2. use allowed node types;
3. contain at least one trigger and a terminal path;
4. contain no dangling edges;
5. satisfy risk/approval policy;
6. declare retry/idempotency behavior for relevant side effects;
7. declare explicit budgets when a future node can repeat dynamically.

## Engine extensions

Engine-specific fields live under `extensions` and must not redefine portable core semantics.
