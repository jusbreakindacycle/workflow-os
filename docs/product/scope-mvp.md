# Phase 1 / MVP Scope

## Objective

Prove the **local canonical control plane** before depending on any real AI/model/runtime/workflow provider.

The MVP demonstrates that a raw request can become a structured, explainable Project with commercial context, versioned goal state, work state, operator attention, Project Pack/Context Slice, and evidence while remaining useful offline/local.

## Golden path

```text
Open local web app
  -> New Project
  -> internal or client work
  -> raw request
  -> Workspace / Client? / Engagement? / Project Draft
  -> small structured discovery (`I don't know` allowed)
  -> approve initial problem/outcome/working-scope summary
  -> initial WorkItems/dependencies
  -> Project Pack + Context Slice
  -> repository creation proposal + approval state
  -> simulated/manual Assignment
  -> evidence
  -> Activity / Needs My Attention / Command Center
  -> revise goal once and prove impact/version propagation
```

## In scope

### Local control plane

One local operator; local-first web UI; persistent local development database; multiple Workspaces; optional Client records; Engagement records for client work; Projects/ProjectBrief versions/ProjectRevisions; WorkItems/dependencies; Decisions/Approvals; WorkItem Proposals; Artifact/Evidence refs; Activity/Event ledger; ContextSlice; basic SpendEnvelope/CostRecord; mock/manual Assignment.

### New Project / discovery

Raw text input; optional uploaded-material refs; internal vs client choice; `I don't know`; question/answer records separate from accepted facts; human approval before uncertain discovery becomes accepted working scope. Deterministic question rules are sufficient; real LLM interviewer is later.

### Commercial foundation

Client Projects may record Client, Engagement, requested outcome, working/proposed/client-accepted scope state, quote/price records, deadline, maintenance placeholder, and scope-change proposal. Operator approval is not automatically client acceptance.

### Goal revision

A material accepted-goal change creates a new version/revision and explicit impact over derived work. Stale approvals/WorkItems/Pack versions cannot remain silently executable.

### Project Pack + Context Slice

Versioned Project Pack generated from accepted canonical state; no raw secrets; deterministic regeneration; strict schema validation; visible provenance/diff. Assignment Context Slice exposes only authorized WorkItem-relevant context.

### Command Center

Portfolio/project views show phase/status/health, active/next-ready work, blockers, Needs My Attention, recent Activity, commercial deadline/scope indicator, Project Pack version, and repository/deployment placeholders.

### Provider-independent contracts

Define but do not require real execution for Model/Runtime Broker, Spend Gate, capability manifests, ProviderConnection, AgentAssignment, adapters, loops/routines, and repository bootstrap/instruction compilation. A mock/manual adapter proves state transitions.

### Verification

Schema validation, state-transition/version tests, dependency/readiness tests, approval tests, Proposal tests, strict Project Pack/Assignment validation, goal-revision impact tests, Context Slice minimization tests, local restart/recovery tests, and derived Command Center/Activity consistency tests.

## Explicitly out of scope for Phase 1

Required paid AI APIs; automatic paid execution; real multi-model routing; real ProviderConnection execution; persistent autonomous agent fleet; Paperclip/Activepieces integration; real GitHub repository creation; real provider-specific instruction generation beyond fixtures; autonomous coding/deployment/incident remediation; payment collection; communication integrations; client portal; client-facing AI Employees; drag-and-drop workflow builder; Kubernetes/multi-region infrastructure.

## Exit criteria

Phase 1 is complete when the operator can create/revise/understand a Project locally; Project Pack is reproducible from canonical state; WorkItem readiness/attention is explainable; a simulated bounded Assignment receives only authorized context and produces evidence; and no agent/provider narrative is required as the state store.
