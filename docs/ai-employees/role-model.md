# AI Employee Role Model

## Model hierarchy

```text
RoleTemplate
   ↓ instantiate
RoleInstance
   ↓ publish
RoleVersion
   ↓ receives
TaskAssignment
   ↓ may start
AgentSession
   ↓ invokes
Workflow / Skill / Tool
```

## Role Template

Reusable client-neutral intellectual property.

Contains:

- title and purpose;
- typical responsibilities;
- task taxonomy;
- suggested skills;
- default risk assumptions;
- default evaluation plan;
- discovery questions.

Must not contain client identifiers, client secrets, or confidential examples.

## Role Instance

Workspace-bound role configuration.

Required bindings:

- workspace;
- human owner;
- role template/reference or custom role;
- approved integrations;
- knowledge sources;
- escalation destinations;
- identity mode;
- environment;
- applicable workspace policies.

## Role Version

A published immutable snapshot.

Material changes that create a new role version include:

- goal or responsibilities;
- non-responsibilities;
- allowed tools or workflows;
- authority level;
- data classification;
- memory policy;
- identity model;
- escalation behavior;
- model/provider policy;
- evaluation thresholds.

## Task Assignment

Every unit of work has:

- task id;
- workspace;
- role version;
- source/trigger;
- requested outcome;
- structured input;
- deadline;
- risk context;
- runtime/cost/tool budgets;
- status;
- result;
- escalation state.

A role is not permitted to keep working after the task reaches a terminal state unless a new assignment is created.

## Agent Session

Agent sessions are ephemeral by default.

A task may use zero, one, or multiple bounded agent sessions, but Workflow OS remains the task owner and preserves task state independently of the model session.

## Identity chain

A completed action should remain attributable to:

```text
human/request source
 -> Workflow OS task
 -> AI Employee role version
 -> agent/workflow step
 -> tool/action
 -> target system identity
```

## Catalog

Workflow OS may eventually present a catalog of reusable Role Templates, but a template is never deployed directly. Deployment always creates a workspace-specific Role Instance and published Role Version.
