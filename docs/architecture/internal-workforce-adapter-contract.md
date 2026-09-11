# Internal Workforce Adapter Contract

**Status:** accepted boundary; provider selection pending.

## Rule

> Workflow OS owns canonical delivery state. An Internal Workforce Adapter executes bounded internal assignments and returns normalized runtime facts, artifacts, evidence, costs, failures, and proposals.

The provider is an execution subsystem/projection, not a peer source of truth.

## D1 — canonical authority

Workflow OS is the sole canonical Project/WorkItem authority.

## D2 — provider-created work

Provider-created child work may remain provider-local when safely inside Assignment scope. Material new scope/architecture/priority/risk/cost/deployment/maintenance work becomes a WorkItem Proposal and is not canonical until Workflow OS accepts it through policy/approval.

## D3 — tenant and credential isolation

Default candidate mapping for Paperclip evaluation remains:

```text
Workflow OS Workspace -> Paperclip Company
```

This mapping is not sufficient proof. Control credentials must also have an acceptable Workspace-bounded blast radius. If that cannot be achieved, stronger per-Workspace provider-instance isolation must be evaluated.

## D4 — asymmetric synchronization

```text
Workflow OS -> provider
  Assignment, scope, constraints, references, budgets

provider -> Workflow OS
  progress, artifacts, evidence, costs, failures, proposals
```

Provider-side edits never silently change canonical scope/priority/lifecycle/authorization/completion.

## D5 — completion separation

Provider `done`/success maps to `execution_finished` / evidence available. Workflow OS verification/acceptance decides canonical WorkItem completion.

## D6 — human approval

Consequential human approval remains authoritative in Workflow OS. Provider-native review can control execution and contribute evidence but does not replace business/risk/production approval.

## D7 — advanced parallelism

Worktree/workspace isolation is not required for a basic sequential worker provider. Parallel coding requires separate proof of isolation, dependency finalization, integration ownership, collision handling, and verification.

## D8 — provider independence

The local canonical control plane is proven before an internal-workforce provider becomes required.

## Conceptual operations

An adapter may expose equivalents of:

```text
health
capabilities
ensureTenant
ensureProjectProjection
ensureWorker
createAssignment
startAssignment
getAssignment
cancelAssignment
listEvents
listArtifacts
listCosts
listProposals
reconcile
pauseWorker
resumeWorker
```

## Required Assignment boundary

The provider receives only authorized Project/WorkItem context, tools, environment refs, budgets, evidence requirements, side-effect policy, and stop/escalation conditions.

## Paperclip

Paperclip remains candidate provider #1 because it may supply worker lifecycle, heartbeats, sessions, task checkout, runtime adapters, costs, review, and detailed workforce UI. It is not selected until hands-on gates pass. See `docs/providers/paperclip.md`.
