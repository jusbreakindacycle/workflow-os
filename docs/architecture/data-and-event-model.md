# Data and Event Model

This document defines semantics, not final SQL tables/classes.

## Core entities

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
- `ProjectBrief`
- `ProjectPackVersion`
- `WorkItem`
- `WorkDependency`
- `WorkItemProposal`
- `Decision`
- `Approval`
- `ArtifactReference`
- `EvidenceReference`
- `ProjectEvent`

### Autonomy / execution

- `RoleDefinition`
- `AgentAssignment`
- `SkillVersion`
- `LoopDefinition`
- `LoopRun`
- `ModelProfile`
- `RuntimeProfile`
- `RouteDecision`
- `SpendEnvelope`
- `CostRecord`
- `ProviderMapping`

### Repositories / workflow / production

- `RepositoryReference`
- `EnvironmentReference`
- `Workflow`
- `WorkflowVersion`
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
- Cross-Project dependencies are deferred; use explicit coordination records later if proven necessary.
- ProjectPackVersion belongs to a Project and references exact accepted inputs/decisions.
- AgentAssignment belongs to one Project + WorkItem.
- SpendEnvelope belongs to a bounded purpose (Assignment/WorkItem/Project) and records human approval.
- ProviderMapping links canonical IDs to replaceable provider-native IDs.
- Workflow/WIR belongs to a Project.
- Deployment/Incident/Maintenance belongs to a Project/environment and references exact versions.

## Project phase / status / health

Keep separate:

- phase — where in delivery lifecycle;
- operational status — what can happen now;
- health — explainable risk condition.

Do not derive an arbitrary percentage from LLM judgment.

## WorkItem state

Recommended canonical states:

- `draft`
- `ready`
- `running`
- `waiting_external`
- `needs_attention`
- `blocked`
- `failed`
- `complete`
- `canceled`

Execution provider state is separate. A provider-native `done` normally maps to assignment `execution_finished`, then verification/acceptance decides WorkItem completion.

## Approval state

Suggested:

- `requested`
- `approved`
- `rejected`
- `expired`
- `superseded`

Approval must reference exact subject/version and authority reason. A later change invalidates approval when the approved subject materially changes.

## Event envelope

Material events should include equivalents of:

- event id/type/time;
- Workspace/Project/WorkItem;
- actor type/id;
- Assignment/Loop/Run/provider refs;
- status from/to;
- correlation/idempotency keys;
- reason/error classification;
- artifact/evidence refs;
- cost/spend refs;
- sensitivity classification;
- exact relevant version(s).

## Activity Feed

Activity is a filtered read model over events. It should not create a second manually maintained state store.

## Needs My Attention

Attention items are derived from unresolved approvals, decisions, unknowns, failed/blocked work, credential requests, spend requests, scope changes, deployment gates, and incidents.

## Provider mappings

Store stable mappings with provider type/version and external IDs. Provider IDs never replace canonical Workflow OS IDs.

## Data minimization

Prefer structured summaries, references, hashes, and evidence metadata over copying full external payloads/transcripts.

Never persist private chain-of-thought as required business state.
