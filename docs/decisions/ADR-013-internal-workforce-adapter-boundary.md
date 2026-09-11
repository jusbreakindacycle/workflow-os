# ADR-013: Internal AI Workforce Orchestration Stays Behind an Adapter Boundary

**Status:** Accepted

**Accepted:** 2026-09-12

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

Workflow OS remains the sole canonical authority for:

- Workspace/client identity and isolation intent;
- Project lifecycle and Project status;
- WorkItem meaning, dependencies, readiness, priority, acceptance, and canonical completion;
- Decisions, Artifacts, Evidence, and Project events;
- WIR;
- policy, risk, budgets, and business authorization;
- consequential human approval;
- deployment, incident, maintenance, and recovery state;
- portfolio Command Center state;
- client-facing AI Employee role semantics.

An Internal Workforce Adapter may implement:

- AI worker provisioning/configuration;
- bounded assignment execution;
- provider-native task decomposition;
- heartbeats/wakeups;
- session persistence;
- runtime vendor adapters;
- isolated workspaces/worktrees when supported and proven;
- worker-level cost/budget enforcement;
- run logs/events;
- worker-level review stages;
- detailed workforce/runtime UI.

The provider is therefore an **execution subsystem and projection**, not a peer source of truth.

## Approved authority rules

The following rules are part of this decision.

### D1 — canonical authority

Workflow OS remains the sole canonical Project/WorkItem authority.

Provider objects are execution records, projections, or provider-local coordination objects. Provider state never silently overwrites canonical Workflow OS state.

### D2 — provider-created work

Provider/agent-created child tasks do not automatically become canonical WorkItems.

They may:

- remain provider-local execution detail when they stay inside the accepted Assignment scope; or
- be emitted as a **WorkItem Proposal** when they would materially change scope, architecture, priority, risk, cost, deployment, maintenance, or other Project semantics.

A WorkItem Proposal becomes canonical only after Workflow OS applies the applicable validation/policy/approval rule and creates or changes a WorkItem explicitly.

### D3 — tenant and credential isolation

The default Paperclip evaluation mapping is:

```text
Workflow OS Workspace -> Paperclip Company
```

This is a logical isolation hypothesis, not sufficient proof by itself.

Production acceptance must also prove that the adapter credential/control identity has an acceptable **Workspace-bounded blast radius**. A global credential that can freely cross unrelated client Workspaces is not accepted merely because provider objects are company-scoped.

If company-level isolation plus credential scoping cannot meet the Workflow OS isolation requirement, a stronger deployment boundary such as a dedicated provider instance per Workspace must be evaluated.

### D4 — asymmetric synchronization

Synchronization is authority-asymmetric:

```text
Workflow OS -> provider
  assignments, allowed scope, policy-derived constraints, references

provider -> Workflow OS
  progress, runtime state, artifacts, evidence, costs, failures, proposals
```

Manual provider-side changes to mirrored priority, scope, lifecycle, or other canonical fields are treated as provider drift/proposals/conflicts. They must not silently mutate canonical Workflow OS state.

### D5 — completion separation

Provider `done`, success, or equivalent maps to a normalized state such as `execution_finished` / evidence available.

It does **not** mean canonical WorkItem `complete`.

Canonical completion requires the Workflow OS acceptance contract, including applicable verification, reconciliation, policy, and human-approval gates.

### D6 — consequential human approval

Consequential approvals are authoritative in Workflow OS.

Provider-native reviewer/approval stages may be used for worker-level execution control and may contribute evidence, but they do not replace Workflow OS approval for high-impact business actions, production deployment, material scope/risk acceptance, or other policy-governed decisions.

### D7 — worktrees and parallelism are advanced capabilities

Provider worktree/workspace isolation is not required for the initial single-worker adapter pass.

Parallel coding or other mutable-resource concurrency may be enabled only after an **advanced parallel-engineering gate** proves isolation, dependency finalization, integration ownership, collision handling, and verification. This preserves ADR-012.

### D8 — Phase 1 remains provider-independent

Paperclip or another internal-workforce provider is not added to Phase 1 acceptance criteria.

Phase 1 first proves the canonical Project/WorkItem/WIR/evidence/Command Center vertical slice independently. Internal workforce integration is a later capability once those semantics exist and can remain authoritative.

## Acceptance separation

External workforce state is normalized back into Workflow OS.

```text
Agent/runtime execution
  -> execution_finished
  -> evidence collected
  -> verification / reconciliation / policy checks
  -> accepted complete OR changes required / failed / escalated
```

Provider-native review stages may satisfy part of the evidence requirement only when an explicit compatibility rule proves equivalence for that requirement.

## Integration preference

Initial workforce-provider evaluation should prefer documented, supported API/SDK surfaces. For Paperclip, REST/OpenAPI is the first candidate boundary.

Do not:

- write directly to the provider database;
- fork the provider as the first approach;
- make provider Project/Issue/task IDs canonical Workflow OS IDs;
- rely on unstable/alpha plugin surfaces as the primary integration boundary when a supported API exists;
- let provider-side UI edits silently change canonical Workflow OS scope, priority, authorization, completion, or lifecycle state.

## Secret and integration-reference rule

Workflow OS stores canonical integration/secret **references and policy**, not reusable raw secrets in Project/WorkItem/WIR/agent instruction artifacts.

A workforce adapter may map a canonical reference to a provider-specific secret binding for the minimum necessary worker/run.

The adapter must declare and test:

- credential/control-plane blast radius;
- provider tenant scope;
- worker-specific grants;
- run-bound/on-demand access where supported;
- auditability of secret access;
- rotation/revocation semantics;
- log/evidence redaction.

## Provider selection is a separate decision

This ADR accepts the **adapter boundary**, not Paperclip itself.

Paperclip is the first candidate to test behind the contract. Selecting it as an initial supported workforce provider requires the hands-on due-diligence gates in `docs/research/paperclip-due-diligence.md` and, if the dependency becomes architectural, a separate provider-selection ADR.

## Consequences

### Positive

- avoids rebuilding mature agent-company infrastructure prematurely;
- keeps Paperclip/other workforce products replaceable;
- preserves Workflow OS differentiation and canonical truth;
- prevents agent-created subtasks from silently expanding scope;
- reduces risk from two-way task/project synchronization;
- keeps consequential approval in one cross-domain operator surface;
- reduces Phase 1 scope;
- allows direct single-agent adapters as simpler fallback;
- permits later comparison among Paperclip, Agentic Factory-style runtimes, or custom implementations;
- allows sequential/single-worker use even when parallel worktree support is not production-ready.

### Negative

- adds a mapping/reconciliation boundary;
- provider-native and canonical lifecycle states may differ;
- requires proposal/drift/conflict handling;
- requires credential-isolation testing in addition to tenant isolation;
- two UIs may exist initially (Workflow OS Command Center plus provider detail UI);
- provider upgrades require compatibility tests;
- Workflow OS must maintain enough canonical event/evidence state to remain explainable when the provider is unavailable.

## Phase impact

Phase 1 does not implement a full Internal Workforce Adapter or Paperclip dependency.

Phase 1 continues proving the canonical Project/WorkItem/WIR/evidence/Command Center model independently.

Before implementing a bespoke internal agent-company runtime, run the provider due-diligence spike defined in `docs/research/paperclip-due-diligence.md`.

## Revisit triggers

Revisit this decision if:

1. workforce providers cannot preserve required isolation/authorization semantics;
2. adapter reconciliation/proposal handling becomes materially more complex than a small internal implementation;
3. a provider becomes necessary for canonical semantics rather than execution;
4. Paperclip or alternatives fail the hands-on core gates;
5. measured client/project usage demonstrates a simpler architecture;
6. provider credential scoping cannot meet client isolation requirements;
7. a future provider-neutral standard removes the need for this custom adapter contract.

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
