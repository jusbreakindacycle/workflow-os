# Activepieces Adapter Profile

**Decision source:** ADR-004  
**Due diligence:** `docs/research/activepieces-gate-2.md`  
**Status:** Conditional Phase 1 target

## Purpose

This profile records Activepieces-specific facts without contaminating the vendor-neutral engine-adapter contract.

## Canonical ownership

Workflow OS remains authoritative for:

- WIR;
- workflow/version identity;
- workspace policy;
- risk classification;
- approvals;
- adapter capability policy;
- normalized run ledger;
- ROI/template metadata.

Activepieces owns physical flow execution and its engine-specific runtime state.

## Identity mapping

Minimum mapping:

```text
WorkflowOS.workspace_id
  -> Activepieces instance + project reference

WorkflowOS.workflow_version_id
  -> Activepieces flow_id + published flow_version_id

WorkflowOS.deployment_id
  -> Activepieces flow/project/environment mapping

WorkflowOS.run_id
  -> Activepieces flow_run_id
```

The mapping must preserve exact Activepieces `flowVersionId` for every normalized run.

## Supported control transports

### REST

Preferred when official API access is available for the selected deployment.

Authentication: supported API key/Bearer mechanism only.

### MCP

Permitted for the Phase 1 Community/self-host research path.

Authentication: official MCP OAuth flow only.

### Forbidden

- undocumented/private endpoints;
- direct writes to Activepieces PostgreSQL;
- scraping the UI as a control API;
- patching Activepieces internals merely to bypass a product/license boundary.

## Workspace isolation modes

### Synthetic MVP

One Workflow OS test workspace may map to one Activepieces project.

### Shared real-client engine

Every Workflow OS client workspace requires its own Activepieces project/tenant-equivalent boundary and policy review.

### Separate-instance mode

A Workflow OS client workspace may map to a dedicated Activepieces instance when project-level isolation is unavailable or commercially unsuitable.

The adapter's deployment record must include `instance_ref` and `project_ref`; project id alone is not globally sufficient.

## Capability status

### Supported/strong fit

- webhook trigger
- scheduled trigger
- piece/API actions
- routers/conditions
- durable delay/wait
- flow draft/publish version model
- detailed run status/history
- retry/replay visibility
- integration/connection references

### Verify in first spike

- exact manual trigger mapping
- supported deterministic transform lowering
- cancel-run support
- programmatic start strategy
- official REST API access for selected account/deployment
- MCP viability for noninteractive automation lifecycle
- human-approval wait/resume mapping
- AI transform lowering without depending on enterprise Agent features

## Reliability lowering

### Retry

Do not blindly inherit an engine retry setting.

For each WIR action, the adapter must reconcile:

- Workflow OS retry policy;
- provider/piece retry behavior;
- Activepieces run retry/replay behavior.

### Idempotency

The adapter must preserve WIR idempotency metadata in Workflow OS even when Activepieces has no native equivalent.

For an uncertain mutation:

1. stop automatic duplicate mutation;
2. use connector-specific reconciliation;
3. continue/retry only after the business state is known.

### Replay

Activepieces may replay an interrupted in-flight step. Treat engine execution as at-least-once at that boundary.

## Approval lowering

An Activepieces wait/approval mechanism may hold execution, but a valid Workflow OS approval token/state must be checked before the protected R3 action executes.

Material changes to target/parameters/workflow version invalidate the approval.

## Run normalization

Map engine states into Workflow OS states without losing the raw engine status.

Example:

| Activepieces | Workflow OS |
|---|---|
| QUEUED | queued |
| RUNNING | running |
| PAUSED | waiting |
| SUCCEEDED | succeeded |
| CANCELED | cancelled |
| FAILED | failed |
| INTERNAL_ERROR | failed |
| MEMORY_LIMIT_EXCEEDED | failed |
| TIMEOUT | failed |
| LOG_SIZE_EXCEEDED | failed |
| QUOTA_EXCEEDED | failed/waiting according to recoverability policy |

Store the raw Activepieces status alongside the normalized status.

## Secrets/connections

Workflow OS stores logical integration references.

The adapter resolves those references to Activepieces connection identifiers scoped to the mapped instance/project.

It must never copy reusable secret material into WIR, logs, prompts, or deployment metadata.

## Network and sandboxing

Before a real client deployment, record:

- Activepieces execution/sandbox mode;
- network mode/egress policy;
- public webhook exposure;
- TLS/reverse-proxy setup;
- backup of database and encryption-critical instance secrets.

## Plan/license prerequisite field

Each deployment profile must record the Activepieces edition/plan assumption that enables the adapter capabilities it uses.

This is operational metadata, not a permanent product assumption. Pricing/features must be re-verified before production.
