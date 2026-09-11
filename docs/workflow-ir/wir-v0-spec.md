# Workflow Intermediate Representation (WIR) v0

## Purpose

WIR is the vendor-neutral canonical representation of **business workflow automation inside a Project**.

It is not the Project model, not the internal agent WorkItem graph, and not the Project Pack.

## Document shape

Required top-level fields:

- `wir_version`
- `workflow`
- `nodes`
- `edges`
- `policy`

The `workflow` object includes `id`, `name`, `workspace_ref`, `project_ref`, `version`, and `environment`.

## v0.1 node types

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

- tool/integration refs;
- input/output schema refs in config/extensions;
- timeout;
- retry policy;
- idempotency/reconciliation mode;
- concurrency/rate policy;
- risk tier;
- data classification;
- observability/test refs;
- engine extension object.

## Policy

WIR policy can declare maximum runtime, default timeout, data classification, AI cost/iteration ceilings, approval policy, and allowed execution constraints.

`max_ai_cost_usd` is an execution ceiling, not permission to spend. Paid execution still requires an applicable operator-approved SpendEnvelope.

## Sensitive values

WIR stores logical integration references, never reusable raw secret values.

## Versioning

- `wir_version` versions the representation (`0.1` for this schema).
- `workflow.version` versions the business workflow.
- published WorkflowVersions are immutable.
- deployment/provider mappings reference the exact WIR version.

## Validation

A WIR document must:

1. validate against the JSON Schema;
2. use allowed node types;
3. contain a trigger and reachable terminal path (semantic validation beyond JSON Schema);
4. contain no dangling edge refs;
5. satisfy risk/approval policy;
6. declare retry/idempotency behavior for relevant actions;
7. declare explicit budgets for AI/repeating behavior;
8. remain attributable to Workspace + Project.

## Extensions

Engine-specific fields live under `extensions` and cannot redefine portable core semantics.
