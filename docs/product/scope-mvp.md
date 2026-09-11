# Phase 1 / MVP Scope

## Objective

Prove the **local canonical control plane** before depending on any real AI/model/runtime/workflow provider.

The MVP should demonstrate that a raw project request can become a structured, explainable Project with commercial context, work state, operator attention, Project Pack, and evidence while remaining useful offline/local.

## Golden path

```text
Open local web app
  -> New Project
  -> choose internal or client work
  -> capture raw request
  -> create Workspace / Client? / Engagement? / Project Draft
  -> answer a small adaptive/structured discovery set (`I don't know` allowed)
  -> approve initial problem/outcome/scope summary
  -> create initial WorkItems and dependencies
  -> generate versioned Project Pack
  -> record repository creation proposal + approval state
  -> run one simulated/manual Assignment
  -> attach evidence
  -> derive Activity Feed / Needs My Attention / Command Center state
```

## In scope

### Local control plane

- one local operator;
- local-first web UI;
- persistent local development database;
- multiple Workspaces;
- optional Client records;
- Engagement records for client work;
- Projects;
- WorkItems/dependencies;
- Decisions/Approvals;
- WorkItem Proposals;
- Artifacts/Evidence references;
- Activity/Event ledger;
- basic SpendEnvelope/CostRecord entities even if no paid execution occurs.

### New Project / intake

- raw text input;
- optional references to uploaded material (actual file ingestion may be minimal);
- internal vs client project choice;
- `I don't know` answer state;
- question/answer records separate from final accepted facts;
- explicit human approval before converting uncertain discovery into accepted scope.

Phase 1 may use deterministic rules/fixtures for question selection. A real LLM-driven adaptive interviewer is not required yet.

### Commercial foundation

For client Projects:

- Client;
- Engagement;
- requested outcome;
- agreed/working scope status;
- quotation/price fields as records (no payment processor);
- target/deadline fields;
- maintenance agreement placeholder;
- scope-change flag/proposal.

### Project Pack

- canonical versioned Project Pack generated from accepted Project state;
- no raw secrets;
- deterministic regeneration;
- schema validation;
- visible diff/version history sufficient to explain change.

### Command Center

Portfolio/project views showing:

- phase/status/health;
- active/next-ready work;
- blockers;
- Needs My Attention;
- recent Activity;
- commercial scope/deadline indicator;
- Project Pack version;
- repository/deployment placeholders.

### Provider-independent contracts

Define, but do not yet require real execution for:

- Model/Runtime Broker;
- Spend Gate;
- Runtime/Model capability manifests;
- AgentAssignment;
- Provider adapters;
- loops/routines;
- repository bootstrap/instruction compilation.

A mock/manual adapter may be used to prove assignment/evidence/state transitions.

### Verification

- schema validation;
- state-transition tests;
- dependency/readiness tests;
- approval tests;
- WorkItem Proposal tests;
- Project Pack deterministic generation tests;
- local restart/recovery tests;
- derived Command Center/Activity consistency tests.

## Explicitly out of scope for Phase 1

- required OpenAI/Anthropic/Google/other paid API;
- automatic paid execution;
- real multi-model routing;
- persistent autonomous agent fleet;
- Paperclip integration;
- Activepieces integration;
- real GitHub repository creation;
- provider-specific instruction-file generation beyond fixtures;
- autonomous coding of client products;
- automatic deployment;
- production incident remediation;
- invoicing/payment collection integration;
- email/Slack/Teams communication integration;
- client portal;
- client-facing AI Employees;
- drag-and-drop workflow builder;
- Kubernetes/multi-region infrastructure.

## Exit criteria

Phase 1 is complete when the operator can create and understand a Project locally, the Project Pack is reproducible from canonical state, WorkItem readiness/attention is explainable, and a simulated bounded Assignment can produce evidence that transitions canonical state without relying on agent chat/provider state.

See `docs/testing/acceptance-criteria.md`.
