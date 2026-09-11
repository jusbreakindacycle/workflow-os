# Data and Event Model

This document defines semantics, not final SQL tables/classes. The list is capability-gated; an entity appearing here does not make it Phase 1 implementation scope.

## Phase 1 canonical entities

### Identity / isolation

- `Operator`
- `Workspace`

### Commercial

- `Client`
- `Engagement`
- `QuoteRecord`
- `PaymentRecord`
- `MaintenanceAgreement`
- `ScopeChangeProposal`

### Delivery

- `Project`
- `ProjectBrief` / accepted goal version
- `ProjectRevision`
- `ProjectPackVersion`
- `WorkItem`
- `WorkDependency`
- `WorkItemProposal`
- `Decision`
- `Approval`
- `ArtifactReference`
- `EvidenceReference`
- `ProjectEvent`

### Phase 1 execution-policy foundation

- `AgentAssignment` (mock/manual capable)
- `ContextSlice` / `ExecutionContextSnapshot`
- `SpendEnvelope`
- `CostRecord`

## Later capability entities

These are introduced only when their roadmap gate activates:

- `RoleDefinition`
- `SkillVersion`
- `LoopDefinition` / `LoopRun`
- `ModelProfile`
- `RuntimeProfile`
- `ProviderConnection`
- `ExecutionHost`
- `RouteDecision`
- `ProviderMapping`
- `RepositoryReference`
- `EnvironmentReference`
- `Workflow` / `WorkflowVersion`
- `Deployment`
- `ExecutionRun`
- `Incident`
- `MaintenanceRecord`

## Relationships

- Workspace is the authorization/isolation boundary.
- External client work defaults to one Client per Workspace.
- Engagement belongs to Workspace and normally one Client.
- Project belongs to Workspace and may reference an Engagement.
- WorkItem belongs to exactly one Project.
- Cross-Project dependencies are deferred unless later explicitly designed.
- ProjectRevision references the before/after accepted ProjectBrief versions and affected records.
- ProjectPackVersion belongs to a Project and references exact accepted canonical versions.
- ContextSlice belongs to an Assignment purpose and contains/references only the minimum authorized context.
- AgentAssignment belongs to one Project + exact WorkItem version.
- SpendEnvelope belongs to a bounded purpose and records human approval.
- ProviderConnection represents configured access/entitlement; it references secure credentials but never stores reusable secret values in ordinary canonical fields.
- ProviderMapping links canonical IDs to replaceable provider-native IDs.
- Workflow/WIR belongs to a Project.
- Deployment/Incident/Maintenance belongs to a Project/environment and references exact versions.

## Project phase / status / health

Keep separate:

- phase — where in the delivery lifecycle;
- operational status — what can happen now;
- health — explainable risk condition.

Do not derive arbitrary percentage from LLM judgment.

## WorkItem state

Recommended canonical states: `draft`, `ready`, `running`, `waiting_external`, `needs_attention`, `blocked`, `failed`, `complete`, `canceled`, plus an explicit `stale`/`superseded` treatment when a Project revision invalidates the accepted basis for work.

Execution provider state is separate. Provider-native `done` normally maps to Assignment `execution_finished`, then verification/acceptance decides WorkItem completion.

## Approval state

Suggested: `requested`, `approved`, `rejected`, `expired`, `superseded`.

Approval references exact subject/version and authority reason. A material change invalidates/supersedes stale approval. Approval is not external client acceptance evidence.

## Event envelope

Material events include equivalents of event id/type/time, Workspace/Project/WorkItem, actor type/id, Assignment/Loop/Run/provider refs, status from/to, correlation/idempotency keys, reason/error classification, artifact/evidence refs, cost/spend refs, sensitivity classification, and exact relevant versions.

## Activity Feed and Needs My Attention

Activity is a filtered read model over events, not a second state store. Attention items derive from unresolved approvals/decisions/unknowns, failed/blocked/stale work, credential/spend requests, scope changes, deployment gates, and incidents.

## Data minimization

Prefer structured summaries, references, hashes, and evidence metadata over copying full external payloads/transcripts. Never persist private chain-of-thought as required business state.
