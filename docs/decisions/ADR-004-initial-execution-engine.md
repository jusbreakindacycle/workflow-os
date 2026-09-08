# ADR-004: Activepieces Is the Initial MVP Execution Target

**Status:** Accepted for Phase 1; may be superseded after an implementation spike

## Context

The MVP requires one engine, not a universal executor. The first engine should support self-hosted experimentation, extensibility, common integrations, AI/tool-oriented automation, and an architecture suitable for a personal control-plane adapter.

n8n remains attractive for personal automation, but its licensing model must be re-checked before any future business model involving centrally hosted/managed client workflows. Pipedream, Make, Zapier, Power Automate, Camunda, Temporal, and UiPath remain future adapter candidates for different execution classes.

## Decision

Use **Activepieces** as the first Phase 1 execution-engine target.

The first implementation task involving the engine must begin with a narrow adapter spike that verifies:

- current license relevant to intended use
- self-hosting path
- API/SDK surface for workflow creation/deployment/run inspection
- execution-history/status fidelity
- integration/credential handling
- webhook/schedule/manual trigger mapping
- human-approval feasibility
- error/retry behavior
- ability to preserve required WIR semantics

If a blocking gap is proven, stop implementation and propose a superseding ADR rather than working around the architecture invisibly.

## Consequences

The control plane and WIR remain engine-neutral even though Phase 1 has one concrete adapter.
