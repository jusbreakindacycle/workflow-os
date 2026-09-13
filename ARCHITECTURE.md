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
              -> Work Specs / logical capability activations
              -> Decisions / Approvals
              -> Artifacts / Evidence / Events
              -> AgentAssignments / Context Slices
              -> Execution Workspaces / process evidence
              -> Repositories / environments / deployments
              -> Workflows / WIR versions
              -> Spend Envelopes / Cost Records
              -> Delivery records / repair history
              -> Incidents / Maintenance
```

Workspace is the isolation boundary. Project is the top-level delivery/maintenance unit. Engagement is commercial context.

ProviderConnections, ExecutionRoutes, Skills and execution-host configuration are Workspace/control-plane configuration. RouteDecisions, ExecutionAttempts and LoopRuns are execution evidence linked to Project/WorkItem/Assignment state; they do not redefine canonical Project meaning.

## Main layers

### 1. Operator interface

Local-first web Command Center first; optional desktop shell later. Primary surfaces: New Project, Projects/Clients/Engagements, Needs My Attention, Activity Feed, work graph, approvals/decisions, costs/spend, repositories/deployments, incidents/maintenance.

### 2. Canonical delivery control plane

Owns canonical identities, delivery/commercial state, revisions, WorkItems, decisions/approvals, Project Pack, evidence/events, cost authorization, delivery/deployments/incidents/maintenance.

### 3. Discovery and strategy

Converts incomplete intent into explicit accepted problem/outcome/scope/requirements and a delivery strategy. `I don't know` is valid. The client request is preserved even when challenged.

Phase 3.1 makes pre-brief reasoning operational: raw request/requested solution remain source records; Free-First R0 reasoning may propose findings, material questions, research requirements and strategy; operator answers/unknowns remain distinct evidence; and only operator acceptance/revision creates the canonical Project Brief.

### 4. Strategy-specific planning / dynamic workforce

Phase 3.2 converts the accepted Project Brief into a strategy-specific Work Graph. It persists per-WorkItem requirements for:

- logical role and capabilities;
- dependencies;
- evidence;
- risk tier and action class;
- authority;
- verification level/independence;
- mutable resources;
- stop/escalation conditions.

Work activates capabilities; a permanent role roster does not invent tasks. `configure`, `process_change`, `defer`, `automate`, and other non-build strategies do not inherit a generic software-development graph.

### 5. Revision / impact engine

A material goal/scope change creates a new ProjectBrief/ProjectRevision version, computes affected requirements/work/approvals/Pack/Assignments/commercial commitments, stops unsafe stale work, and preserves history. Revision is selective, not a blind full reset.

### 6. Autonomy kernel

Contains ready-work selection, loop/routine engine, dynamic role activation, bounded Assignments, Proposals, verification/escalation, and budgets/stop conditions.

Phase 2 adds persisted RouteDecisions/ExecutionAttempts and a bounded worker -> verifier feedback loop. External execution still cannot directly complete WorkItems.

### 7. Model / Runtime / Connection Broker

Separates model capability, runtime capability, and actual configured ProviderConnection/entitlement. Work declares capability/risk/data/cost/tool requirements. Broker routes only through eligible configured healthy connections.

ProviderConnection may represent API key/OAuth, installed subscription CLI, local service, or self-hosted runtime. Cancellation/revocation changes route eligibility, not Project meaning.

Phase 2 makes eligibility deterministic and records the candidate set, winner and rationale. Fallback reruns eligibility rather than silently switching to an otherwise-disallowed or paid route.

Phase 3.1 reuses Free-First broker state for zero-incremental discovery reasoning. Quota/route state remains operational evidence and never changes accepted Project meaning.

### 8. Project Bootstrapper + Instruction Compiler

After accepted direction and applicable resource authority, the bootstrapper creates/connects required delivery context and compiles case-specific provider projections. `AGENTS.md`, `CLAUDE.md`, Copilot/OpenCode config, Paperclip/API payloads are derived artifacts, not canonical truth.

A provider receives a minimum-authorized **Context Slice** for the exact Assignment, not the whole Project/Engagement merely because the data exists.

Phase 3 extends the Project Pack/Context Slice projection with per-WorkItem capability, evidence, risk/action class, authority, verification and governed-local-workspace policy.

### 9. Skill Registry

Stores versioned evaluated capabilities with input/output, prerequisites, tools/permissions, failure modes, verification, and compatibility.

Skills describe reusable execution behavior; they cannot grant authority beyond the Assignment, Approval, side-effect policy or SpendEnvelope.

### 10. Adapter plane

Provider-neutral classes include Model, Runtime, Internal Workforce, Workflow Engine, Source Control, Deployment, Observability, and communication/notification adapters.

Direct provider HTTP adapters are replaceable implementations behind normalized ExecutionRoutes. Their API schema is not canonical Project schema.

### 11. Execution plane

Replaceable systems may include local/open models, hosted AI APIs, Codex, Claude Code, Copilot, OpenCode, Paperclip, Activepieces, Git/source providers, deployment platforms, databases, and monitoring tools.

Execution authority is not equivalent to model access.

Phase 3.3 adds the first real governed implementation surface: a dedicated per-Project local workspace under a configured root with workspace-only file access, traversal/absolute/symlink escape rejection, hashed manifests, deny-by-default command classes, minimal process environment, loopback-only application execution and owned-process lifecycle tracking.

This local R1 authority does not imply authority to mutate a shared remote repository, deployment target, production system, credential store, or external communication channel.

### 12. Evidence, verification and delivery

Provider/worker `done` means execution finished/evidence available, not canonical completion.

Phase 3.4 adds real local verification for the certified path:

- L2 syntax/behavior command evidence;
- L3 actual loopback application flow;
- deterministic independent reconciliation over artifacts/process/evidence;
- bounded repair records;
- final delivery records that require independent L3-or-higher evidence.

Deployment is not the end: incidents, maintenance, change, recovery, and improvement remain Project state when those later adapters are used.

## Project Pack

The Project Pack is the machine-oriented case-specific execution contract for one accepted Project version. It references stable accepted facts, requirements/non-goals, architecture, versioned work graph, policies, verification, and escalation. It is not a live mutable runtime-state dump and contains no reusable raw secrets.

For Phase 3 execution it additionally projects strategy-specific Work Specs and the bounded local-workspace policy.

## Internal workforce

Every Project may expose a logical capability roster, but roles activate only when useful. Handoffs use durable state/artifacts rather than free-form agent chat.

```text
accepted Project state
  -> strategy-specific ready WorkItem
  -> required capabilities / role
  -> Project Pack + Context Slice + bounded Assignment
  -> eligible runtime/tool/provider
  -> execute within exact authority
  -> observable evidence / proposals
  -> verify / reconcile
  -> accept / repair / escalate
  -> next ready work
```

## Loops and routines

Every loop has trigger, goal predicate, authorized scope, execution strategy, verification, iteration/time/tool/cost bounds, stop conditions, and escalation. A routine adds time/event scheduling. No unbounded autonomous loop is valid.

A worker/verifier loop must preserve one canonical objective. Verifier feedback may cause another bounded execution attempt; it does not authorize material scope change.

Phase 3 repair is explicitly bounded; the first implementation permits at most two repair records for one WorkItem before exhaustion/escalation.

## Local-first does not mean local-only or always-on

Core Project/commercial state and operator functions remain locally usable. Intelligence may be local or remote by capability/policy.

If the coordinator host is asleep/offline, local autonomous work waits visibly. A future optional always-on host may be self-hosted or replaceable remote infrastructure, but it does not become canonical truth.

## Spend

No new metered/variable-cost external action begins without applicable operator-approved bounds. This includes AI/runtime and later metered APIs/cloud/workflow/deployment services. Already-paid fixed subscription usage may be zero-incremental when ProviderConnection evidence confirms no new per-use charge.

Unknown actual provider cost is never assumed to be zero. A route must have an approved conservative estimate/bound before execution when authoritative per-call pricing cannot be reconciled immediately.

The Phase 3 local certification itself creates no SpendEnvelope or CostRecord.

## Security / untrusted content

Retrieved/uploaded/client/repository/provider content is untrusted data and cannot grant itself authority. Data classification, Context Slice minimization, prompt/tool poisoning defenses, approval binding, and provider fallback policy are enforced outside model reasoning.

Provider credentials are external bindings/references. Raw secret values do not belong in Project Pack, Context Slice, instruction projections, tests, fixtures or canonical Project records.

The governed local workspace does not inherit the operator's full environment; certified commands receive a minimal environment.

## Completion semantics

Canonical WorkItem completion requires applicable verification, reconciliation, policy, and human/client acceptance gates.

The Phase 3.5 synthetic delivery record requires independent L3 evidence before it may be marked delivered.

## Provider-independence proof

Adapters reduce lock-in but are not proof by themselves. Before claiming operational portability for a capability, execute representative work through a second independently configured eligible non-fixture route/provider and confirm canonical Project/Assignment/evidence semantics survive replacement.

Phase 2.1 supplies representative live worker/verifier/cross-provider evidence. Phase 3.5 intentionally uses fixture discovery reasoning in CI so the governed local delivery lifecycle can be certified repeatedly without consuming live provider quota.

Fixture discovery in Phase 3.5 therefore does not replace or weaken the separate Phase 2.1 live-provider evidence claim.

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
13. Work creates capability/role activation; roles do not invent work.
14. Agent-created material scope becomes a proposal.
15. Activity Feed derives from canonical events/evidence.
16. Deterministic mechanisms are preferred where reasoning is unnecessary.
17. Every loop is bounded and verifiable.
18. Untrusted content cannot grant authority.
19. Raw reusable secrets are references/bindings, not Pack/prompt data.
20. Material goal revisions are versioned and impact-propagated.
21. Production ownership continues after deployment.
22. Scale infrastructure is evidence-driven.
23. Core Project state remains understandable when any AI/provider is unavailable.
24. Continuous background execution requires an available host; lack of one becomes visible waiting state.
25. Route selection and fallback must remain explainable and replayable from persisted evidence.
26. Independent verification cannot be inferred merely because worker and verifier prompts are different; independence is explicit mechanism/evidence.
27. Fixture evidence cannot be promoted into a claim of real-provider execution or operational portability.
28. Bounded local execution-workspace authority is distinct from shared-remote/deployment/production/communication authority.
29. Pre-brief model analysis is proposed evidence; only accepted canonical state may drive later delivery work.
30. Work Graph shape follows accepted delivery strategy rather than coding-agent availability.
31. Workspace path/process authority is enforced outside model reasoning and fails closed.
32. Worker self-report is insufficient for canonical completion.
33. Passing verification does not grant missing authority.
34. Final delivery must state known limitations and remaining human action.

## Current phase

Foundation v3 and Phase 1 are complete. Phase 2 provider-neutral autonomy is implemented. Phase 2.1 Free-First routing passed representative real zero-spend live certification on 2026-09-12 with worker execution, independent verification and cross-provider portability. Phase 2.2 establishes exact/version-bound, resolve-time/use-time-revalidated authority.

**Phase 3 is complete for the canonical synthetic/local end-to-end delivery path.**

The certified path now proves:

```text
raw request
-> adaptive challenge/strategy/accepted Brief
-> strategy-specific Work Graph + dynamic capability activation
-> Phase 3 Project Pack / Context Slices / bounded Assignments
-> governed real local execution workspace
-> real generated artifact + deterministic tests
-> actual loopback user flow
-> independent reconciliation
-> canonical L2/L3 evidence
-> delivered evidence bundle
-> Project complete / closed / healthy
```

The executable implementation passed 81/81 tests with 10 migrations before documentation closure; final merge-candidate CI additionally runs `npm run phase3:certify` as an explicit local certification step.

This is **not** a production-autonomy certification. Shared GitHub mutation, production deployment, real client data, Meta/CRM/email/SMS effects, ad spend, credential grants, arbitrary external integrations and always-on hosting remain outside the proven boundary.

The next roadmap direction is **Phase 4 — Broaden Delivery Adapters**, chosen from measured delivery gaps rather than speculative provider accumulation. See `docs/reviews/phase-3.5-end-to-end-certification-report.md` and `docs/plans/roadmap.md`.
