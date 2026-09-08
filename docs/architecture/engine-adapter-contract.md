# Execution Engine Adapter Contract

## Purpose

Execution engines are replaceable implementation targets. Workflow OS owns the canonical workflow and normalized lifecycle.

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

These are conceptual contract operations, not Phase 0 implementation code.

## Capability declaration

Every adapter publishes a capability manifest containing:

- supported WIR version(s)
- supported node types
- trigger support
- wait/human-task support
- retry/idempotency behavior
- event/status fidelity
- maximum payload/runtime constraints
- secret/integration handling model
- deployment/versioning semantics
- known unsupported semantics

## No silent degradation

If a workflow uses semantics that the target cannot preserve, deployment validation must fail or require an explicit approved transformation. The adapter must not simply ignore unsupported policy.

## Identifier mapping

Workflow OS identifiers remain canonical. Adapter-specific workflow/deployment/run identifiers are stored as mappings.

## State ownership

The engine may own physical runtime state. Workflow OS owns normalized control-plane state and a run/event ledger sufficient to explain what was requested, which version executed, current/terminal status, and recovery options.

## Failure normalization

Adapter errors must map to common categories such as:

- invalid configuration
- authorization/integration unavailable
- provider rate limit
- transient network/provider failure
- timeout
- business-rule rejection
- unsupported capability
- uncertain side effect
- engine internal failure

Provider-specific details may be attached without replacing the normalized category.

## Initial engine decision

The initial engine remains a **Proposed** ADR until a hands-on spike compares licensing, self-hosting, connector breadth, API surface, execution-history fidelity, deployment control, and adapter complexity.
