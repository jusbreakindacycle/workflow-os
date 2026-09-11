# Data and Event Model

This document defines semantics, not final SQL tables/classes. An entity appearing here does not make it a separate Phase 1 table or implementation task.

## Phase 1 canonical semantics

### Identity / isolation

- `Operator`
- `Workspace`

### Commercial

- `Client`
- `Engagement`
- scope/quote/payment/deadline/maintenance **fields or artifact references sufficient for Phase 1**
- `ScopeChangeProposal`

Do not create separate Quote/Invoice/Payment/Maintenance subsystems in Phase 1 unless implementation evidence shows the simpler Engagement representation is insufficient.

### Delivery

- `Project`
- `ProjectBrief` / accepted goal + delivery-strategy version
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

Physical persistence may combine concepts where boundaries remain explicit and tests preserve semantics.

## Later capability semantics

Introduce only when roadmap gates activate:

- `OperatorPolicyProfile`
- richer `QuoteRecord` / `InvoiceRecord` / `PaymentRecord` / `MaintenanceAgreement` if needed;
- `RoleDefinition`;
- `SkillVersion`;
- `LoopDefinition` / `LoopRun`;
- `ModelProfile`;
- `RuntimeProfile`;
- `ProviderConnection`;
- `ExecutionHost`;
- `RouteDecision`;
- `ProviderMapping`;
- `RepositoryReference`;
- `EnvironmentReference`;
- `Workflow` / `WorkflowVersion`;
- `Deployment`;
- `ExecutionRun`;
- `Incident`;
- `MaintenanceRecord`.

## Relationships

- Workspace is the authorization/isolation boundary.
- External client work defaults to one Client per Workspace.
- Engagement belongs to Workspace and normally one Client.
- Project belongs to Workspace and may reference an Engagement.
- WorkItem belongs to exactly one Project.
- ProjectRevision references before/after accepted ProjectBrief versions and affected records.
- ProjectPackVersion references exact accepted canonical versions.
- ContextSlice belongs to an Assignment purpose and exposes only minimum authorized context.
- AgentAssignment belongs to one Project + exact WorkItem version.
- SpendEnvelope belongs to bounded purpose and human approval.
- ProviderConnection represents configured access/entitlement and references secure credentials without copying reusable secrets into ordinary canonical data.
- ProviderMapping links canonical IDs to replaceable provider-native IDs.
- Workflow/WIR belongs to a Project.
- Deployment/Incident/Maintenance belongs to Project/environment and exact versions.

## Project phase / status / health

Keep phase, operational status, and explainable health separate. Do not derive arbitrary percentage from LLM judgment.

## WorkItem state

Recommended states: `draft`, `ready`, `running`, `waiting_external`, `needs_attention`, `blocked`, `failed`, `complete`, `canceled`, with explicit `stale`/`superseded` treatment after revision invalidation.

Provider state is separate. Provider `done` maps to Assignment `execution_finished`; verification/acceptance decides WorkItem completion.

## Approval state

Suggested: `requested`, `approved`, `rejected`, `expired`, `superseded`. Approval references exact subject/version/authority reason. It is not external client acceptance evidence.

## Event envelope

Material events include equivalents of event id/type/time; Workspace/Project/WorkItem; actor; Assignment/Loop/Run/provider refs; status changes; correlation/idempotency keys; reason/error; artifact/evidence refs; cost/spend refs; sensitivity; and exact versions.

## Activity / attention

Activity is a filtered read model over events, not another state store. Needs My Attention derives from unresolved approvals/decisions/unknowns, failed/blocked/stale work, credentials/spend, scope changes, deployment gates, and incidents.

## Data minimization

Prefer structured summaries, references, hashes, and evidence metadata over full external payloads/transcripts. Never persist private chain-of-thought as required business state.
