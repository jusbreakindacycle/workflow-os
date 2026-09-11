# Workflow Intermediate Representation (WIR) v0

## Purpose

WIR is the vendor-neutral representation of **business workflow automation inside a Project**.

WIR is not the Project model, not the internal agent work graph, and not the Project Pack.

## Required workflow fields

- `wir_version`
- workflow `id`, `name`, `version`
- `workspace_ref`
- `project_ref`
- `environment`
- `nodes`
- `edges`
- `policy`

## v0 node classes

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

## Operational metadata

Where relevant:

- input/output schema refs;
- integration reference;
- timeout;
- retry/idempotency policy;
- concurrency/rate policy;
- risk/data classification;
- observability tags;
- test fixture refs;
- engine extension object.

## Policy

WIR can declare maximum runtime, timeout/retry ceilings, AI cost/iteration ceilings, approval policy, data classification/retention, and allowed execution target.

Paid AI execution inside a WIR still requires the system Spend Gate unless an exact applicable SpendEnvelope already exists.

## Secrets

Store logical integration references only. Never raw reusable secret values.

## Versioning

Published WorkflowVersions are immutable. Engine-specific deployment objects reference the exact WIR version.

## Validation

A valid WIR must:

1. validate against schema;
2. contain an allowed trigger and terminal path;
3. have no dangling edges;
4. satisfy risk/approval policy;
5. declare safe retry/idempotency for relevant side effects;
6. declare explicit budgets for repeating/AI behavior;
7. remain attributable to Workspace + Project.

## Extensions

Engine-specific configuration belongs under `extensions` and cannot redefine core portable meaning.
