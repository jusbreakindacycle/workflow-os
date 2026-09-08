# ADR-004: Activepieces Is the Initial MVP Execution Target

**Status:** Accepted — Conditional Pass for Phase 1

## Context

The MVP requires one execution target, not a universal executor. Activepieces was selected provisionally in Phase 0 because it combines an open-source automation core, self-hosting, flow/version semantics, broad integrations, durable execution, and an adapter-friendly control surface.

Gate 2 due diligence was then performed against current official documentation and source code.

See `docs/research/activepieces-gate-2.md`.

## Decision

Keep **Activepieces** as the first Phase 1 execution-engine target.

This is a **conditional pass**, not a blanket dependency on every Activepieces feature or plan.

### Control transport

Preferred:

1. official REST API when supported API access is available for the exact account/deployment;
2. built-in MCP as a supported Community/research fallback to evaluate before considering an engine replacement.

Forbidden:

- undocumented/private endpoints;
- direct Activepieces database mutation;
- UI scraping as the production control API;
- modifying Activepieces internals to bypass a product/license boundary.

### API-access gate

Current Activepieces pricing and API documentation are not perfectly aligned:

- the pricing table lists API access on current cloud plans;
- the same pricing page says self-hosted Community Edition excludes API access;
- the API overview still describes API keys as a Platform/Enterprise capability.

The first hands-on Phase 1 spike must verify actual API-key availability for the selected development deployment before the adapter commits to REST.

### Client-isolation gate

The synthetic MVP may use one Activepieces project.

Before any real client workloads share one Activepieces instance, every Workflow OS client workspace must map to an engine-level isolation boundary such as a separate Activepieces Project on a plan that supports it.

If that is commercially or technically unsuitable, use a dedicated Activepieces instance per client or propose a superseding execution-engine/deployment ADR.

One shared unpartitioned Activepieces project is **not** an acceptable multi-client boundary.

### Reliability boundary

Activepieces durable replay does not remove Workflow OS idempotency/reconciliation requirements. An interrupted in-flight step can execute again.

### Approval boundary

Activepieces may provide pause/wait mechanics, but Workflow OS owns R3 authorization and exact approval binding. Engine behavior must not weaken `docs/domain/human-approval-semantics.md`.

### Enterprise-feature boundary

The Phase 1 synthetic MVP must not require paid governance features such as separate Projects, enterprise Flow Approvals, audit logs, secret managers, Git Sync, dedicated workers, or enterprise-only agent capabilities.

## Required hands-on spike

The first implementation involving Activepieces must verify:

- exact deployment/version used;
- license/plan assumption;
- official control transport and authentication;
- flow create/edit/validate/publish/enable/disable;
- webhook, schedule, and manual/test trigger mapping;
- deterministic action/transform/condition/delay lowering;
- run start/list/get and exact version attribution;
- failure/status fidelity;
- cancel support or explicit lack thereof;
- connection-reference handling without secret exposure;
- wait/resume/human-approval mapping;
- AI-transform path without making MVP depend on general agent features;
- adapter behavior after worker interruption/replay;
- network/sandbox configuration relevant to the chosen deployment.

If a required WIR semantic cannot be preserved, stop and propose a superseding ADR rather than hiding the gap.

## Consequences

### Positive

- Activepieces remains a strong first target without making Workflow OS Activepieces-specific.
- The project can start with one synthetic workspace and postpone paid multi-project requirements.
- REST and MCP can be evaluated behind the same engine-neutral adapter contract.
- Current durable execution/version/run semantics fit the Workflow OS model well.

### Constraints

- Real multi-client production has an engine-isolation gate.
- Community self-host cannot be assumed to expose the official REST API.
- Pricing/plan behavior must be re-verified before client production.
- Activepieces replay is treated as at-least-once at the interrupted action boundary.

## Revisit triggers

Supersede this ADR if:

- supported REST/MCP control surfaces cannot preserve required WIR v0 semantics;
- engine isolation is commercially impractical for the intended client model;
- run/version/failure fidelity is insufficient;
- connection/secret handling violates Workflow OS boundaries;
- a materially simpler execution target satisfies the same requirements.
