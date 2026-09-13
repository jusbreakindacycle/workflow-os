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

ProviderConnections, ExecutionRoutes, Skills and execution-host configuration are Workspace/control-plane configuration. RouteDecisions, ExecutionAttempts and LoopRuns are execution evidence linked to Project/WorkItem/Assignment state; they do not redefine canonical Project meaning.

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

Phase 2 adds persisted RouteDecisions/ExecutionAttempts and a bounded worker -> verifier feedback loop. External execution still cannot directly complete WorkItems.

### 6. Model / Runtime / Connection Broker

Separates model capability, runtime capability, and actual configured ProviderConnection/entitlement. Work declares capability/risk/data/cost/tool requirements. Broker routes only through eligible configured healthy connections.

ProviderConnection may represent API key/OAuth, installed subscription CLI, local service, or self-hosted runtime. Cancellation/revocation changes route eligibility, not Project meaning.

Phase 2 makes eligibility deterministic and records the candidate set, winner and rationale. Fallback reruns eligibility rather than silently switching to an otherwise-disallowed or paid route.

### 7. Project Bootstrapper + Instruction Compiler

After accepted scope/architecture and applicable repository/external-resource approval, bootstrapper creates/connects the required delivery context and compiles case-specific provider projections. `AGENTS.md`, `CLAUDE.md`, Copilot/OpenCode config, Paperclip/API payloads are derived artifacts, not canonical truth.

A provider receives a minimum-authorized **Context Slice** for the exact Assignment, not the whole Project/Engagement merely because the data exists.

### 8. Skill Registry

Stores versioned evaluated capabilities with input/output, prerequisites, tools/permissions, failure modes, verification, and compatibility.

Skills describe reusable execution behavior; they cannot grant authority beyond the Assignment, Approval, side-effect policy or SpendEnvelope.

### 9. Adapter plane

Provider-neutral classes include Model, Runtime, Internal Workforce, Workflow Engine, Source Control, Deployment, Observability, and communication/notification adapters.

Direct provider HTTP adapters are replaceable implementations behind normalized ExecutionRoutes. Their API schema is not canonical Project schema.

### 10. Execution plane

Replaceable systems may include local/open models, hosted AI APIs, Codex, Claude Code, Copilot, OpenCode, Paperclip, Activepieces, Git/source providers, deployment platforms, databases, and monitoring tools.

For implementation work, execution authority is not equivalent to model access. A worker may receive a separately governed local execution workspace with bounded filesystem, command, network and process capabilities. Local isolated workspace authority does not imply authority to mutate a shared remote repository, deployment target, production system, or external communication channel.

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

A worker/verifier loop must preserve one canonical objective. Verifier feedback may cause another bounded execution attempt; it does not authorize material scope change.

## Local-first does not mean local-only or always-on

Core Project/commercial state and operator functions remain locally usable. Intelligence may be local or remote by capability/policy.

If the coordinator host is asleep/offline, local autonomous work waits visibly. A future optional always-on host may be self-hosted or replaceable remote infrastructure, but it does not become canonical truth.

## Spend

No new metered/variable-cost external action begins without applicable operator-approved bounds. This includes AI/runtime and later metered APIs/cloud/workflow/deployment services. Already-paid fixed subscription usage may be zero-incremental when ProviderConnection evidence confirms no new per-use charge.

Unknown actual provider cost is never assumed to be zero. A route must have an approved conservative estimate/bound before execution when authoritative per-call pricing cannot be reconciled immediately.

## Security / untrusted content

Retrieved/uploaded/client/repository/provider content is untrusted data and cannot grant itself authority. Data classification, Context Slice minimization, prompt/tool poisoning defenses, approval binding, and provider fallback policy are enforced outside model reasoning.

Provider credentials are external bindings/references. Raw secret values do not belong in Project Pack, Context Slice, instruction projections, tests, fixtures or canonical Project records.

## Completion semantics

Provider `done` means execution finished/evidence available. Canonical WorkItem completion requires applicable verification, reconciliation, policy, and human/client acceptance gates.

## Provider-independence proof

Adapters reduce lock-in but are not proof by themselves. Before claiming operational portability for a capability, execute representative work through a second independently configured eligible non-fixture route/provider and confirm canonical Project/Assignment/evidence semantics survive replacement.

Fixture-only portability drills prove implementation/rerouting semantics, not live operational portability.

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
24. Route selection and fallback must remain explainable and replayable from persisted evidence.
25. Independent verification cannot be inferred merely because worker and verifier prompts are different; route independence is explicit configuration/evidence.
26. Fixture evidence cannot be promoted into a claim of real-provider execution or operational portability.
27. Bounded local execution-workspace authority is distinct from authority to mutate shared remote repositories, deployments, production systems, or communication channels.

## Current phase

Foundation v3 and Phase 1 are complete. Phase 2 implements the autonomy kernel, Broker, provider-adapter boundary, Skills, instruction compilation, bounded loops, independent verification, fallback/rerouting, and certification records.

Phase 2.1 Free-First routing passed representative real zero-spend live certification on 2026-09-12 using a real worker route, an independently configured verifier route, canonical L2 verification, a cross-provider portability drill, and zero SpendEnvelope/CostRecord evidence for that certification Workspace.

Phase 2.2 Canonical Authority Hardening is complete and establishes exact subject/version/bounds authority, resolve-time freshness, use-time revalidation, and database-level fail-closed guards before consequential effects.

The current product phase is **Phase 3 — End-to-end Delivery Golden Path**. Phase 3.0 defines the first synthetic Project's golden-path and governed local execution-workspace contract before implementation workers receive real filesystem/command authority. See `docs/plans/phase-3.0-golden-path-contract.md`.
