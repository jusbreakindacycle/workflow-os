# Execution Engine Adapter Contract

## Purpose

Execution engines are replaceable implementation targets. Workflow OS owns canonical Project/workflow intent and normalized control-plane lifecycle.

An adapter must translate the supported WIR subset into engine-specific operations without silently changing business semantics.

## Required capabilities

An MVP adapter must expose logical operations equivalent to:

- `validateCapability(wir)`
- `planDeployment(wir, environment)`
- `deploy(workflowVersion, environment)`
- `activate(deployment)`
- `deactivate(deployment)`
- `startRun(deployment, normalizedInput)` when the engine supports programmatic starts
- `getRun(runRef)`
- `cancelRun(runRef)` when supported
- `normalizeRunEvents(runRef)`
- `reconcile(runRef)`
- `health()`

These are conceptual contract operations. A specific engine may expose them through REST, MCP, SDK, webhooks, or another supported control transport.

Project identity does not need to be passed to the execution engine if the engine has no Project concept, but Workflow OS must preserve Workspace + Project + workflow/deployment attribution around every adapter operation.

## Capability declaration

Every adapter publishes a capability manifest containing:

- supported WIR version(s);
- supported node types;
- trigger support;
- wait/human-task support;
- retry/idempotency behavior;
- event/status fidelity;
- maximum payload/runtime constraints;
- secret/integration handling model;
- deployment/versioning semantics;
- known unsupported semantics.

## Control-plane transport declaration

Every adapter profile must additionally declare:

- supported control transport(s), for example REST, SDK, or MCP;
- authentication method and credential lifecycle;
- whether authorization is interactive or suitable for unattended service operation;
- official support status of the transport;
- edition/plan/license prerequisites;
- rate/quota limits relevant to the control plane;
- webhook/callback requirements;
- transport-specific failure modes.

Workflow OS must not silently rely on undocumented/private endpoints or direct engine-database mutation.

## Workspace isolation mapping

Every deployment must document how a Workflow OS Workspace maps to an execution-engine isolation boundary.

Examples:

- engine project/tenant;
- dedicated engine instance;
- another explicitly supported tenant boundary.

The adapter manifest must state:

- isolation primitive;
- identifiers required to scope every operation;
- whether the isolation capability is plan/edition dependent;
- whether connections/secrets are isolated by the same boundary.

If the engine cannot provide an acceptable boundary for the intended deployment, deployment validation fails.

Project is **not** a substitute for Workspace isolation. Multiple Projects may intentionally share one authorized Workspace/engine boundary while retaining distinct Workflow OS Project attribution.

## No silent degradation

If a workflow uses semantics that the target cannot preserve, deployment validation must fail or require an explicit approved transformation. The adapter must not ignore unsupported policy.

## Identifier mapping

Workflow OS identifiers remain canonical.

Adapter mappings must retain enough context to resolve:

- `workspace_id`;
- `project_id`;
- `workflow_id` / immutable `workflow_version`;
- Workflow OS `deployment_id`;
- adapter-specific tenant/project/flow/deployment identifiers;
- Workflow OS `run_id` and adapter run/execution identifier.

An adapter-specific “project” or “workspace” term must not be confused with Workflow OS `Project` semantics.

## State ownership

The engine may own physical runtime state. Workflow OS owns normalized control-plane state and a run/event ledger sufficient to explain:

- which Workspace/Project requested the work;
- what was requested;
- which immutable workflow version executed;
- which engine/deployment handled it;
- current/terminal status;
- side effects known/uncertain;
- applicable WorkItem/approval/evidence references;
- recovery options.

Engine status can update the applicable Project/WorkItem through normalized events, but the engine itself is not the source of Project lifecycle truth.

## Failure normalization

Adapter errors must map to common categories such as:

- invalid configuration;
- authorization/integration unavailable;
- provider rate limit/quota;
- transient network/provider failure;
- timeout;
- business-rule rejection;
- unsupported capability;
- uncertain side effect;
- engine internal failure.

Provider-specific details may be attached without replacing the normalized category.

## Runtime guarantee declaration

The adapter profile must describe relevant delivery/execution guarantees:

- at-most-once, at-least-once, or other documented behavior at side-effect boundaries;
- replay/checkpoint behavior;
- duplicate trigger/callback behavior;
- retry behavior performed by the engine itself.

Workflow OS retry/idempotency policy remains authoritative even when the engine has its own retry/replay mechanism.

## Initial engine decision

ADR-004 currently selects Activepieces with a **Conditional Pass**. Its adapter-specific constraints live in `docs/architecture/activepieces-adapter-profile.md`.

A hands-on capability spike is still required before broad application implementation.
