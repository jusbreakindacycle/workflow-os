# Phase 1 Gate 3 — New Project / Discovery / Delivery Strategy

## Purpose

Gate 3 adds the first operator-facing Project creation flow on top of the Gate 2 canonical persistence layer.

It proves that incomplete human intent can enter Workflow OS as raw request data, remain distinct from discovery answers and accepted Project truth, and become an explicitly accepted Project Brief without requiring an AI provider.

## Implemented flow

```text
+ New Project
  -> choose/create Workspace
  -> client or internal Project
  -> raw request
  -> requested solution (optional, preserved separately)
  -> draft Project/Engagement
  -> structured discovery
  -> explicit answered / I don't know / skipped state
  -> working delivery strategy
  -> operator review
  -> accepted Project Brief v1
```

## Canonical state added

### `project_intakes`

Stores the raw request boundary for one initial Project intake. It is not the accepted Project Brief.

Important fields:

- Workspace / Project attribution;
- input class;
- raw request;
- requested solution, when explicitly supplied;
- intake status;
- accepted timestamp.

### `discovery_responses`

Stores the question and response separately from accepted truth. Each response is one of:

- `answered`;
- `unknown`;
- `skipped`.

`unknown` is not represented as an empty string.

Gate 3 uses a small deterministic question set:

- problem;
- desired outcome;
- primary users/beneficiaries;
- known constraints;
- success/acceptance signal.

The problem and desired outcome must be answered before the initial Project Brief can be accepted. Other unknowns may remain explicit and continue as later work/risk.

### `delivery_strategy_decisions`

Stores a working strategy separately from the requested solution. Gate 3 supports the canonical strategy identifiers already established by Gate 2:

- `process_change`;
- `adopt_existing`;
- `configure`;
- `integrate`;
- `automate`;
- `custom_build`;
- `hybrid`;
- `research_pilot`;
- `defer`.

The UI presents friendlier labels such as “Research or pilot first” and “Decline or defer.”

## Acceptance semantics

Accepting the intake:

1. requires an answered problem;
2. requires an answered desired outcome;
3. requires a selected working delivery strategy;
4. creates accepted `ProjectBrief` version 1;
5. preserves the raw/requested solution separately;
6. includes non-blocking unknowns in `working_scope_json`;
7. moves the Project to lifecycle phase `definition` and operational status `ready`;
8. records material Project events;
9. marks the working strategy accepted.

For client work, this operator action does **not** change Engagement status to `client_accepted`. Internal operator acceptance and external client acceptance remain different facts.

## HTTP/API surface

Gate 3 adds local-only endpoints used by the browser UI:

- `GET /api/workspaces`;
- `POST /api/workspaces`;
- `POST /api/intakes`;
- `GET /api/intakes/:id?workspaceId=...`;
- `PUT /api/intakes/:id/discovery`;
- `PUT /api/intakes/:id/strategy`;
- `POST /api/intakes/:id/accept`.

Request bodies are bounded and JSON-only for this Phase 1 slice.

## UI boundary

The local browser UI now provides the first usable `New Project` flow. It intentionally remains plain HTML/CSS/browser JavaScript.

This is not yet the final Command Center and does not add:

- AI-generated questions;
- research or recommendation engines;
- project list/dashboard polish;
- workflow canvas;
- rich CRM/client management;
- repository creation;
- autonomous execution.

## Verification

Gate 3 tests prove:

- internal Project creation without Client/Engagement;
- client Project creation with draft Client/Engagement context;
- raw request/requested-solution preservation;
- explicit unknown discovery state;
- acceptance blocked when required discovery is unknown;
- requested solution remains separate from delivery strategy;
- accepted Project Brief v1 generation;
- operator acceptance does not fabricate client acceptance;
- local API flow from intake through accepted brief;
- migration count/idempotency and Gate 3 health state.

## Next gate

Gate 4 derives the initial Work graph, readiness, `Needs My Attention`, Activity Feed, and next-ready work from canonical state.
