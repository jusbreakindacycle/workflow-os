# ADR-013: Internal AI Workforce Orchestration Stays Behind an Adapter Boundary

**Status:** Proposed

## Context

Foundation v2 defines Workflow OS as the internal operating system for a one-person AI-native software/automation business. It introduces Projects, WorkItems, a Project Command Center, and an internal AI workforce.

Post-merge competitive research found substantial overlap between the proposed internal workforce layer and mature/open-source systems, especially Paperclip. Paperclip already provides AI-agent/company organization, task assignment, heartbeats, runtime adapters, budgets, workspaces/worktrees, reviews, approvals, secrets, audit history, and dashboards.

Building all of those mechanics directly inside Workflow OS before proving the specialized delivery model would create unnecessary scope and could turn Workflow OS into a duplicate agent-company platform.

At the same time, making Paperclip or another workforce manager the canonical source of Project/WorkItem/business state would conflict with existing Workflow OS invariants:

- Workspace/client isolation is a Workflow OS policy boundary;
- Project spans research through maintenance, not only agent work;
- WorkItems can be assigned to humans, workflows, agents, or tools;
- WIR remains canonical for business workflows;
- risk and high-impact authorization remain Workflow OS concerns;
- deployments, incidents, maintenance, evidence, and ROI span multiple providers;
- external systems are replaceable execution implementations.

## Decision

Introduce a provider-neutral **Internal Workforce Adapter** boundary.

Workflow OS remains authoritative for:

- Workspace;
- Project;
- WorkItem meaning/dependencies/acceptance;
- Decisions, Artifacts, Evidence, and Project events;
- WIR;
- policy/risk/authorization;
- deployment/incident/maintenance state;
- portfolio Command Center;
- client-facing AI Employee role semantics.

An Internal Workforce Adapter may implement:

- AI worker provisioning/configuration;
- task/assignment execution;
- heartbeats/wakeups;
- session persistence;
- runtime vendor adapters;
- isolated workspaces/worktrees;
- worker cost/budget enforcement;
- run logs/events;
- worker-level review/approval stages;
- detailed workforce/runtime UI.

External workforce state is normalized back into Workflow OS. Provider `done`/success does not by itself imply canonical WorkItem completion.

Paperclip is the first candidate to test behind this contract, but this ADR does **not** select Paperclip as an accepted dependency.

## Tenant mapping default for Paperclip evaluation

The hands-on spike should test:

```text
Workflow OS Workspace -> Paperclip Company
```

rather than placing unrelated clients into one Paperclip Company.

This is a default hypothesis, not an implementation guarantee, and must pass isolation tests.

## Integration preference

Initial Paperclip evaluation should prefer documented REST/OpenAPI surfaces.

Do not:

- write directly to Paperclip's database;
- fork Paperclip as the first approach;
- make Paperclip Project/Issue IDs canonical Workflow OS IDs;
- rely on alpha plugin surfaces unless needed after REST compatibility is proven.

## Consequences

Positive:

- avoids rebuilding mature agent-company infrastructure prematurely;
- keeps Paperclip/other workforce products replaceable;
- preserves Workflow OS differentiation;
- reduces Phase 1 scope;
- allows direct single-agent adapters as simpler fallback;
- permits future comparison among Paperclip, Agentic Factory-style runtimes, or custom implementations.

Negative:

- adds a mapping/reconciliation boundary;
- external and canonical lifecycle states may differ;
- requires careful duplicate/conflict handling;
- two UIs may exist initially (Workflow OS Command Center plus provider detail UI);
- compatibility tests are required for external workforce-manager upgrades.

## Phase impact

Phase 1 does not implement a full Internal Workforce Adapter or Paperclip dependency.

Phase 1 should continue proving the canonical Project/WorkItem/WIR/evidence/Command Center model independently.

Before implementing a bespoke internal agent-company runtime, run the Paperclip spike defined in `docs/research/paperclip-due-diligence.md`.

## Revisit triggers

Revisit this decision if:

1. a workforce provider cannot preserve required isolation/authorization semantics;
2. adapter reconciliation becomes materially more complex than a small internal implementation;
3. an external provider becomes necessary for canonical semantics rather than execution;
4. Paperclip or alternatives fail the hands-on gates;
5. measured client/project usage demonstrates a simpler architecture.

## Related

- `docs/architecture/internal-workforce-adapter-contract.md`
- `docs/research/paperclip-due-diligence.md`
- `docs/research/build-adopt-integrate-review.md`
- ADR-001 control plane not universal executor
- ADR-003 deterministic-first
- ADR-005 client isolation
- ADR-010 multi-agent deferred
- ADR-011 Project top-level operational unit
- ADR-012 internal-agent collaboration gated
