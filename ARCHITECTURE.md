# Architecture

## Thesis

Workflow OS is a **local-first, provider-independent, human-governed autonomous delivery control plane** for a solo builder.

It owns the meaning, state, policy, memory-of-work, approvals, evidence, and operator visibility required to take a raw client request or idea through delivery and maintenance. Replaceable providers perform specialized execution.

> Workflow OS decides what the work means, what is allowed, what is ready, what evidence is required, and whether the result is accepted.

## Human contract

```text
Give / revise goal
  -> answer important discovery questions
  -> approve / reject / revise consequential decisions
  -> provide credentials when required
  -> approve new metered spend and high-impact actions
```

The system coordinates everything else until accepted outcome or genuine human authority is required.

## Canonical hierarchy

```text
Operator
  -> Workspace
      -> Client?
      -> Engagement?
          -> Project
              -> Project Brief versions / Revisions
              -> Project Pack versions
              -> WorkItems + dependencies / Proposals
              -> Decisions / Approvals
              -> Artifacts / Evidence / Events
              -> AgentAssignments / Context Slices
              -> Repositories / environments / deployments
              -> Workflows / WIR versions
              -> Spend Envelopes / Cost Records
              -> Incidents / Maintenance
```

Workspace is the isolation boundary. Project is the top-level delivery/maintenance unit. Engagement is commercial context.

## Main layers

### 1. Operator interface

Local-first web Command Center first; optional desktop shell later. Primary surfaces: New Project, Projects/Clients/Engagements, Needs My Attention, Activity Feed, work graph, approvals/decisions, costs/spend, repositories/deployments, incidents/maintenance.

### 2. Canonical delivery control plane

Owns canonical identities, delivery/commercial state, revisions, WorkItems, decisions/approvals, Project Pack, evidence/events, cost authorization, deployments/incidents/maintenance.

### 3. Discovery and planning

Converts incomplete intent into explicit accepted problem/outcome/scope/requirements/architecture/work graph. `I don't know` is valid. Client request is preserved even when challenged.

### 4. Revision / impact engine

A material goal/scope change creates a new ProjectBrief/ProjectRevision version, computes affected requirements/work/approvals/Pack/Assignments/commercial commitments, stops unsafe stale work, and preserves history. Revision is selective, not a blind full reset.

### 5. Autonomy kernel

Contains ready-work selection, loop/routine engine, dynamic role activation, bounded Assignments, Proposals, verification/escalation, and budgets/stop conditions.

### 6. Model / Runtime / Connection Broker

Separates model capability, runtime capability, and actual configured ProviderConnection/entitlement. Work declares capability/risk/data/cost/tool requirements. Broker routes only through eligible configured healthy connections.

ProviderConnection may represent API key/OAuth, installed subscription CLI, local service, or self-hosted runtime. Cancellation/revocation changes route eligibility, not Project meaning.

### 7. Project Bootstrapper + Instruction Compiler

After accepted scope/architecture and repository approval, bootstrapper creates/connects workspace/repo and compiles case-specific provider projections. `AGENTS.md`, `CLAUDE.md`, Copilot/OpenCode config, Paperclip/API payloads are derived artifacts, not canonical truth.

A provider receives a minimum-authorized **Context Slice** for the exact Assignment, not the whole Project/Engagement merely because the data exists.

### 8. Skill Registry

Stores versioned evaluated capabilities with input/output, prerequisites, tools/permissions, failure modes, verification, and compatibility.

### 9. Adapter plane

Provider-neutral classes include Model, Runtime, Internal Workforce, Workflow Engine, Source Control, Deployment, Observability, and communication/notification adapters.

### 10. Execution plane

Replaceable systems may include local/open models, hosted AI APIs, Codex, Claude Code, Copilot, OpenCode, Paperclip, Activepieces, Git/source providers, deployment platforms, databases, and monitoring tools.

### 11. Evidence and production

Provider results normalize into evidence/activity. Deployment is not the end: incidents, maintenance, change, recovery, and improvement remain Project state.

## Project Pack

The Project Pack is the machine-oriented case-specific execution contract for one accepted Project version. It references stable accepted facts, requirements/non-goals, architecture, versioned work graph, policies, verification, and escalation. It is not a live mutable runtime-state dump and contains no reusable raw secrets.

## Internal workforce

Every Project may expose a full logical roster, but roles activate only when useful. Handoffs use durable state/artifacts rather than free-form agent chat.

```text
Project state
  -> ready WorkItem
  -> role/skills
  -> Context Slice + bounded Assignment
  -> eligible model/runtime/connection
  -> execute
  -> evidence/proposals
  -> verify/reconcile
  -> accept / repair / escalate
  -> next ready work
```

## Loops and routines

Every loop has trigger, goal predicate, authorized scope, execution strategy, verification, iteration/time/tool/cost bounds, stop conditions, and escalation. A routine adds time/event scheduling. No unbounded autonomous loop is valid.

## Local-first does not mean local-only or always-on

Core Project/commercial state and operator functions remain locally usable. Intelligence may be local or remote by capability/policy.

If the coordinator host is asleep/offline, local autonomous work waits visibly. A future optional always-on host may be self-hosted or replaceable remote infrastructure, but it does not become canonical truth.

## Spend

No new metered/variable-cost external action begins without applicable operator-approved bounds. This includes AI/runtime and later metered APIs/cloud/workflow/deployment services. Already-paid fixed subscription usage may be zero-incremental when ProviderConnection evidence confirms no new per-use charge.

## Security / untrusted content

Retrieved/uploaded/client/repository/provider content is untrusted data and cannot grant itself authority. Data classification, Context Slice minimization, prompt/tool poisoning defenses, approval binding, and provider fallback policy are enforced outside model reasoning.

## Completion semantics

Provider `done` means execution finished/evidence available. Canonical WorkItem completion requires applicable verification, reconciliation, policy, and human/client acceptance gates.

## Provider-independence proof

Adapters reduce lock-in but are not proof by themselves. Before claiming operational portability for a capability, execute representative work through a second independently configured eligible route/provider and confirm canonical Project/Assignment/evidence semantics survive replacement.

## Architectural invariants

1. Workspace is the isolation boundary.
2. Project is the top-level operational delivery unit.
3. Engagement is commercial context, not Project execution state.
4. WIR is canonical only for business workflows inside a Project.
5. Project Pack is a case-specific contract compiled from accepted canonical state.
6. Context Slice is the minimum-authorized execution context for one Assignment.
7. External providers never own canonical Project/WorkItem meaning.
8. Models, runtimes, and ProviderConnections are separate replaceable concepts.
9. New metered spend requires explicit prior authorization.
10. Human authority is required for consequential commercial/risk/production decisions.
11. Operator approval and external client acceptance are distinct facts.
12. Full logical roster does not mean all agents run.
13. Agent-created material scope becomes a proposal.
14. Activity Feed derives from canonical events/evidence.
15. Deterministic mechanisms are preferred where reasoning is unnecessary.
16. Every loop is bounded and verifiable.
17. Untrusted content cannot grant authority.
18. Raw reusable secrets are references/bindings, not Pack/prompt data.
19. Material goal revisions are versioned and impact-propagated.
20. Production ownership continues after deployment.
21. Scale infrastructure is evidence-driven.
22. Core Project state remains understandable when any AI/provider is unavailable.
23. Continuous background execution requires an available host; lack of one becomes visible waiting state.

## Current phase

Foundation v3 changes implementation order. First serious coding milestone is the local canonical control plane, not Activepieces/Paperclip integration. See `docs/plans/phase-1-core-control-plane.md`.
