# Provider Adapter Contract

## Purpose

Keep external providers replaceable while giving Workflow OS a consistent way to inspect capabilities, execute bounded work, normalize evidence, and recover from provider failure.

## Common adapter requirements

Every adapter class should expose equivalents of:

- identity/provider/version;
- `health()`;
- `capabilities()`;
- authentication/credential scope metadata;
- operation methods specific to the class;
- cancellation/timeout semantics;
- normalized status/events/errors;
- cost/usage metadata when relevant;
- idempotency/reconciliation behavior;
- supported provider/API version bounds;
- known unsupported semantics.

## Adapter classes

### Model Adapter

Structured inference/tool-capability invocation and usage/cost reporting.

### Runtime Adapter

Executes AgentAssignments in an environment with files/tools/terminal/browser/etc.

### Internal Workforce Adapter

Coordinates multiple internal workers/session lifecycle/heartbeats/task execution for a Project while Workflow OS keeps canonical authority.

### Workflow Engine Adapter

Deploys/executes WIR-compatible business workflows.

### Source Control Adapter

Repository/branch/PR/status operations.

### Deployment Adapter

Deploy/release/rollback/health references.

### Observability Adapter

Normalized alerts/health/evidence links.

## Capability manifests

Never infer capability merely from provider name. Route only against declared/tested capability manifests for the configured provider version.

## Failure behavior

Unknown/unsupported semantics fail closed. Provider outage creates waiting/blocked/unknown execution state, not false Project completion.

## Canonical boundary

Provider-native object IDs/statuses are mappings/evidence. They never replace Workspace/Project/WorkItem/Approval/ProjectPack IDs or semantics.
