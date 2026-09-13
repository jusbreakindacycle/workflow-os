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

## External-effect rule

A provider adapter being technically capable of a mutation does not authorize that mutation.

Durable shared/external effects must consume the governed boundary in `external-action-contract.md`: exact canonical plan, applicable authority/spend, deterministic preflight, use-time freshness, bounded adapter attempt, read-after-write reconciliation, and verification evidence.

Read-only observation may use the lighter applicable R0 policy. Consequential mutation must not be invoked directly from model/runtime intent.

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

Repository/branch/commit/pull-request/status operations. The first governed implementation follows `source-control-adapter-contract.md` and deliberately excludes merge/force-push/settings/secrets/releases from the certified Phase 4.1 write path.

### Deployment Adapter

Deploy/release/rollback/health references.

### Observability Adapter

Normalized alerts/health/evidence links.

## Capability manifests

Never infer capability merely from provider name. Route only against declared/tested capability manifests for the configured provider version.

Capability is not authority: eligibility means an adapter can perform an operation if the current canonical plan/policy permits it.

## Failure behavior

Unknown/unsupported semantics fail closed. Provider outage creates waiting/blocked/unknown execution state, not false Project completion.

For consequential mutations, transport failure must distinguish known no-effect from uncertain outcome. Uncertain state requires reconciliation before retry.

## Canonical boundary

Provider-native object IDs/statuses are mappings/evidence. They never replace Workspace/Project/WorkItem/Approval/ProjectPack IDs or semantics.
