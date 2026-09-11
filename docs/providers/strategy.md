# Provider Strategy

## Principle

Build canonical semantics; adapt specialized execution.

## BUILD in Workflow OS

- Workspace/Client/Engagement/Project semantics;
- WorkItems/dependencies/readiness;
- Decisions/Approvals/Needs My Attention;
- Project Pack;
- Activity/Event/Evidence model;
- risk/spend/authority policy;
- Model/Runtime routing semantics;
- loop/routine semantics;
- Command Center;
- production/maintenance ownership.

## ADAPTER / INTEGRATE

- model APIs/local model servers;
- coding/agent runtimes;
- internal workforce managers;
- workflow engines;
- Git/source control;
- deployment platforms;
- observability systems;
- communication channels.

## Current candidates

- Paperclip — internal workforce provider candidate, not selected;
- Activepieces — business workflow engine candidate, not selected for Phase 1;
- GitHub — likely source-control adapter target when repository bootstrap is activated;
- Codex / Claude Code / Copilot / OpenCode / other runtimes — runtime candidates, no canonical preference.

## Selection test

A provider is acceptable only if:

- its capability can be expressed behind a provider-neutral contract;
- canonical Project meaning survives provider removal;
- security/credential isolation is acceptable;
- failure/reconciliation is understandable;
- version/API surface is supportable;
- cost/benefit beats building the minimal missing layer.

## Anti-lock-in test

Ask:

> If this provider disappeared tomorrow, can the operator still understand the Project, its commitments, decisions, evidence, pending work, and production state?

If not, too much authority/state was delegated.
