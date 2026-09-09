# AI Employee Control-Plane Data Model

This is a conceptual contract. Phase 3 implementation chooses the physical database representation later.

## Entities

### RoleTemplate

Reusable client-neutral role pattern.

Fields conceptually include:

- id
- name
- purpose
- default responsibility/task taxonomy
- default evaluation references
- template version
- publication state

### RoleInstance

Workspace-bound logical AI Employee.

- id
- workspace id
- role template ref (optional)
- human owner ref
- current published role version ref
- status
- created/retired timestamps

### RoleVersion

Immutable published AI Employee Spec.

- id
- role instance id
- version
- spec payload/ref
- created by
- created time
- published time
- supersedes ref

### TaskAssignment

Bounded unit of work.

- id
- workspace id
- role version id
- source/trigger
- requested outcome
- normalized input ref
- deadline
- risk context
- budget
- status
- parent task id (optional)
- created/started/ended times

### AgentSession

Ephemeral reasoning runtime session associated with a TaskAssignment.

- id
- task id
- runtime adapter
- model policy/version
- status
- attempt
- started/ended times
- checkpoint ref if supported
- normalized event stream ref

A TaskAssignment can exist without an AgentSession.

### CapabilityGrant

Resolved permission for a role/deployment.

- workspace
- role version
- tool/workflow/skill ref
- operation
- identity mode
- risk ceiling
- data classification
- target/resource scope
- approval policy
- enabled/disabled state

### KnowledgeSource

Approved reference source with:

- workspace
- classification
- version/provenance
- retrieval policy
- provider/export constraints

### MemoryRecord

Explicit persisted role/task memory.

- workspace
- role instance/version provenance
- task provenance
- memory type
- structured value/ref
- source/evidence
- classification
- created/expires
- superseded/deleted status

### EvaluationSuite

Versioned role evaluation definition.

### EvaluationRun

Evidence that a specific RoleVersion + runtime/model/tool set was evaluated.

### RoleDeployment

Binds a RoleVersion to:

- environment
- runtime adapter/model policy
- execution engine/tool registry
- integration/identity mappings
- active autonomy class
- policy overrides/narrowing
- deployment state

### EscalationRecord

Human handoff/approval/exception associated with a task.

## Core relationships

```text
Workspace
  -> RoleInstance
      -> RoleVersion
          -> RoleDeployment
          -> TaskAssignment
              -> AgentSession
              -> EscalationRecord

RoleVersion
  -> CapabilityGrant
  -> KnowledgeSource refs
  -> EvaluationSuite refs

TaskAssignment
  -> MemoryRecord provenance
  -> Evaluation/production outcome
```

## Version invariant

Historical tasks must render the exact:

- RoleVersion
- WorkflowVersion(s)
- tool contract version(s) where material
- runtime/model policy
- approval state

that governed the task at execution time.

Never explain a historical task using only the current role configuration.

## Workspace invariant

Every persistent entity that could expose client context is workspace-scoped unless explicitly client-neutral and sanitized, such as a RoleTemplate.

## Deletion/retention

Role retirement does not automatically delete task evidence.

Deletion must follow:

- workspace/client policy
- data classification
- retention
- incident/audit obligations
- external runtime artifacts.
