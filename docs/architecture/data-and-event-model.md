# Data and Event Model

## Minimum control-plane entities

### Project/portfolio

- Workspace
- Operator
- Project
- ProjectBrief
- WorkItem
- WorkDependency
- ProjectEvent / ActivityEvent
- Decision
- ArtifactReference
- EvidenceReference
- AgentAssignment

### Workflow/execution

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

### Production/reuse

- Incident
- MaintenanceWorkItem (may be a WorkItem specialization rather than separate persistence type)
- Template
- ROIRecord
- ArchitectureDecision reference

Exact physical tables/classes are implementation decisions; these names define required semantics.

## Key relationships

- a Workspace is the authorization/data-isolation boundary and owns Projects/integration references;
- a Project belongs to exactly one Workspace;
- a Project owns/references WorkItems, decisions, artifacts, evidence, workflows, deployments, incidents, and internal AgentAssignments;
- WorkItems form a dependency graph within one Project unless a later explicit cross-Project dependency contract is introduced;
- a Workflow belongs to a Project and owns immutable published WorkflowVersions;
- a WorkflowVersion produces zero or more Deployments;
- a Deployment belongs to a Project, targets one adapter/environment, and references exact source/workflow versions as applicable;
- a Run references Workspace + Project + Deployment + WorkflowVersion;
- NodeRuns and RunEvents belong to a Run;
- Approvals reference Project + applicable WorkItem/run/action/version;
- AgentAssignments reference Project + WorkItem and do not own canonical WorkItem state;
- Incidents reference Project/environment/deployment and create/reference follow-up WorkItems;
- Templates derive only from sanitized client-neutral Project/workflow/role knowledge.

## Project lifecycle state

Project stores/derives separately:

- `phase` — intake/research/definition/architecture/planning/build/verification/review/deployment/production/maintenance/paused/closed;
- `operational_status` — not_started/ready/running/waiting_external/needs_approval/blocked/failed/complete/canceled;
- `health` — healthy/at_risk/blocked/unknown plus explainable reason(s).

Do not collapse these into one ambiguous status field.

## WorkItem state

Suggested lifecycle:

`not_started -> ready -> running -> complete`

with explicit alternate states:

- `waiting_external`
- `needs_approval`
- `blocked`
- `failed`
- `canceled`

Readiness is derived from dependencies, gates, policy, required artifacts, and allowed execution capability.

## Normalized workflow run state

Suggested lifecycle:

`queued -> running -> waiting -> succeeded | rejected | failed | cancelled`

`waiting` must include a reason such as human approval, timer, external callback, or execution-engine wait.

Workflow run state is not the same as Project/WorkItem state; adapters/events map execution evidence back to the applicable WorkItem.

## Event envelope

Normalize meaningful control-plane events with fields equivalent to:

- `event_id`
- `event_type`
- `occurred_at`
- `workspace_id`
- `project_id`
- `work_item_id` when applicable
- `actor_type` / `actor_id` or tool/assignment reference
- `workflow_id` / `workflow_version` when applicable
- `deployment_id` when applicable
- `run_id` / `node_id` when applicable
- `agent_assignment_id` when applicable
- `incident_id` when applicable
- `correlation_id`
- `attempt` when applicable
- `source`
- `status_from` / `status_to` when applicable
- `reason/error_code`
- `evidence_references`
- `payload_metadata`
- sensitivity classification.

CloudEvents conventions may inform the envelope, but Foundation v2 does not mandate a transport implementation.

## Command Center read model

Command Center fields must be derived from canonical entities/events. Materialized views/caches are allowed, but they must be rebuildable/reconcilable from authoritative state.

At minimum derive:

- Project phase/status/health/reason;
- active WorkItems/assignments;
- next ready WorkItem(s);
- blockers/approvals requiring attention;
- latest meaningful activity;
- current deployment/production health/incident summary.

Do not create a separate manually updated “dashboard status” that can diverge from Project/WorkItem reality.

## Data minimization

Prefer references, hashes, metadata, and redacted execution summaries over storing complete third-party payloads, source files, or agent transcripts. Retention must follow data classification and Workspace/client requirements.

Do not store private agent chain-of-thought. Persist useful artifacts, decisions, evidence, summaries, tool outputs, and explicit state transitions instead.

## Version integrity

Historical evidence must be explainable against the exact versions that produced it:

- Project/WorkItem state at the relevant event;
- WorkflowVersion;
- RoleVersion for future client AI Employees;
- source commit/build/deployment where applicable;
- prompt/model/tool/evaluation version when needed for AI regression.

Never render current content as though it were the historical version that previously ran or was approved.
