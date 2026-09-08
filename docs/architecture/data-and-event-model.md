# Data and Event Model

## Minimum control-plane entities

- Workspace
- Operator
- IntegrationReference
- Connector/Tool
- WorkflowBrief
- Workflow
- WorkflowVersion
- WorkflowNode metadata
- TestCase
- EvaluationCase
- Deployment
- Run
- NodeRun
- Approval
- RunEvent
- ErrorRecord
- Template
- Incident
- ROIRecord
- ArchitectureDecision reference

## Key relationships

- a Workspace owns workflows and integration references
- a Workflow owns immutable published WorkflowVersions
- a WorkflowVersion produces zero or more Deployments
- a Deployment targets one execution adapter/environment
- a Run always references a Deployment and WorkflowVersion
- NodeRuns and RunEvents belong to a Run
- Approvals reference a Run and workflow node/action
- Templates derive from sanitized client-neutral workflow knowledge

## Normalized run state

Suggested lifecycle:

`queued -> running -> waiting -> succeeded | rejected | failed | cancelled`

`waiting` must include a reason such as human approval, timer, external callback, or execution-engine wait.

## Event envelope

Internally normalize execution events with fields equivalent to:

- event_id
- event_type
- occurred_at
- workspace_id
- workflow_id
- workflow_version
- deployment_id
- run_id
- node_id when applicable
- correlation_id
- attempt
- source
- status
- payload_metadata
- sensitivity classification

CloudEvents conventions may inform the envelope, but Phase 0 does not mandate a transport implementation.

## Data minimization

Prefer references, hashes, metadata, and redacted execution summaries over storing complete third-party payloads. Retention must follow the workflow's data classification and client requirements.

## Version integrity

A Run must always be explainable against the exact immutable WorkflowVersion that was deployed. Never render current workflow content as though it were the version that previously ran.
