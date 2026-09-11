# Architecture

## Thesis

Workflow OS is a **local-first, provider-independent, human-governed autonomous delivery control plane** for a solo builder.

It owns the meaning, state, policy, memory-of-work, approvals, evidence, and operator visibility required to take a raw client request or idea through delivery and maintenance.

It does not need to implement every model, coding runtime, workflow engine, source-control system, deployment provider, or observability product itself.

> Workflow OS decides what the work means, what is allowed, what is ready, what evidence is required, and whether the result is accepted. Replaceable providers perform specialized execution.

## Human contract

The target operator interaction is intentionally small:

```text
Give / revise goal
  -> answer important discovery questions
  -> approve / reject / revise consequential decisions
  -> provide credentials when required
  -> approve paid execution and high-impact actions
```

The system coordinates everything else until it either reaches an accepted outcome or genuinely requires human authority.

## Canonical hierarchy

```text
Operator
  -> Workspace                         # security/isolation boundary
      -> Client?                       # commercial party; optional for internal work
      -> Engagement?                   # commercial agreement/scope
          -> Project                   # delivery/operational unit
              -> Project Brief
              -> Project Pack
              -> WorkItems + dependencies
              -> WorkItem Proposals
              -> Decisions / Approvals
              -> Artifacts / Evidence
              -> Events / Activity
              -> Repositories / environments / deployments
              -> Workflows / WIR versions
              -> AgentAssignments
              -> Spend Envelopes / Cost Records
              -> Incidents / Maintenance
```

For client work, the default safety posture is one client per Workspace. Internal product work may use an internal Workspace without a Client.

## Main layers

### 1. Operator interface

Local-first web Command Center initially; optional desktop packaging later.

Primary surfaces:

- New Project;
- Projects/Clients/Engagements;
- Needs My Attention;
- Activity Feed;
- Work graph;
- approvals/decisions;
- costs/spend;
- repositories/deployments;
- incidents/maintenance.

### 2. Canonical delivery control plane

Owns Workspace, Client, Engagement, Project, WorkItem, Decision, Approval, Artifact, Evidence, Event, Project Pack, cost authorization, deployment, incident, and maintenance semantics.

### 3. Discovery and planning layer

Converts raw input into explicit problem/outcome/scope/requirements/architecture/work graph.

The interview is adaptive and must support `I don't know`. The system may research and propose an assumption rather than forcing the operator to answer technical questions they cannot reasonably know.

### 4. Autonomy kernel

Contains:

- ready-work selection;
- loop/routine engine;
- dynamic role activation;
- bounded AgentAssignments;
- WorkItem Proposal handling;
- verification/escalation;
- budget/stop conditions.

### 5. Model/Runtime Broker

Separates **model choice** from **runtime choice**.

A WorkItem declares capability/risk/privacy/cost/tool requirements. The broker chooses an eligible model/runtime combination based on hard constraints and dynamic scoring.

Paid execution cannot begin without an operator-approved spend envelope.

### 6. Project Bootstrapper + Instruction Compiler

After accepted scope/architecture and an explicit repository-creation approval, the bootstrapper creates or connects the repository/workspace and compiles a case-specific Project Pack into provider-supported instruction/configuration projections.

Examples may include:

- `AGENTS.md`;
- `CLAUDE.md`;
- GitHub Copilot instructions;
- OpenCode/runtime configuration;
- API-based AgentAssignment payloads.

These generated files are projections, not canonical Project truth.

### 7. Skill Registry

Stores versioned, evaluated capabilities that agents can invoke. A skill is more than prompt text: it declares purpose, inputs/outputs, prerequisites, tools/permissions, failure modes, verification, and compatibility.

### 8. Adapter plane

Provider-neutral adapter classes include:

- Model Adapter;
- Runtime Adapter;
- Internal Workforce Adapter;
- Workflow Engine Adapter;
- Source Control Adapter;
- Deployment Adapter;
- Observability Adapter;
- communication/notification adapters.

### 9. Execution plane

Replaceable systems may include local/open models, hosted AI APIs, Codex, Claude Code, GitHub Copilot, OpenCode, Paperclip, Activepieces, GitHub, deployment platforms, databases, and monitoring tools.

### 10. Evidence and production layer

Provider events/results are normalized into canonical evidence and activity. Deployment is not the end of a Project: incidents, maintenance, change, recovery, and improvement remain part of Project state.

## Project Pack

The Project Pack is the machine-oriented, case-specific execution contract for one Project/version. It contains references or normalized summaries for:

- problem/outcome;
- accepted client/commercial constraints;
- requirements/non-goals;
- architecture/ADRs;
- WorkItems/dependencies;
- acceptance criteria;
- risk/data classification;
- allowed tools/capabilities;
- repository/environment references;
- model/runtime policy;
- spend policy;
- verification policy;
- escalation rules.

It is generated from canonical state and is versioned. It does not contain reusable raw secrets.

## Internal workforce

Every Project may expose a full logical roster, but workers are activated only when the work requires their separation.

The preferred pattern is:

```text
Project state
  -> derive ready WorkItem
  -> choose role/capability
  -> choose model/runtime
  -> compile bounded Assignment
  -> execute
  -> capture artifacts/evidence
  -> verify/reconcile
  -> accept / repair / escalate
  -> derive next-ready work
```

Do not coordinate through free-form agent-to-agent chat when durable state/artifacts can carry the handoff.

## Loops and routines

A loop is a controlled execution structure with:

- trigger;
- goal/predicate;
- authorized scope;
- work strategy;
- verification;
- max iterations/time/cost/tool use;
- stop conditions;
- escalation.

A routine adds a time/event schedule. No unbounded autonomous loop is permitted.

## Local-first does not mean local-only AI

Core state and operator functions remain local-capable. Intelligence may be local or remote depending on WorkItem requirements and availability.

Fallback is capability-based, for example:

```text
eligible local model
  -> eligible free/approved remote model
  -> paid model requiring Spend Gate
  -> Needs My Attention if no acceptable route exists
```

## Completion semantics

Provider `done` means only execution finished/evidence available.

Canonical WorkItem completion requires the applicable verification, reconciliation, policy, and human approval gates.

## Architectural invariants

1. Workspace is the isolation boundary.
2. Project is the top-level operational delivery unit.
3. Engagement is commercial context, not Project execution state.
4. WIR is canonical only for business workflows inside a Project.
5. Project Pack is the case-specific execution contract compiled from canonical state.
6. External providers never own canonical Project/WorkItem meaning.
7. Models and runtimes are replaceable and separately routed.
8. Paid execution requires explicit prior approval.
9. Human authority is required for consequential commercial/risk/production decisions.
10. Full logical roster does not mean all agents run.
11. Agent-created material scope becomes a proposal, not automatic canonical work.
12. Activity Feed is derived from events/evidence, not chat narration.
13. Deterministic mechanisms are preferred where reasoning is unnecessary.
14. Every loop is bounded and verifiable.
15. Raw reusable secrets are references/bindings, never embedded in Project Packs/prompts.
16. Production ownership continues after deployment.
17. Scale infrastructure is evidence-driven.
18. Core Project state remains understandable when any AI provider is unavailable.

## Current phase

Foundation v3 changes the implementation order. The first serious coding milestone is the local canonical control plane, not an Activepieces or Paperclip integration.

See `docs/plans/phase-1-core-control-plane.md`.
