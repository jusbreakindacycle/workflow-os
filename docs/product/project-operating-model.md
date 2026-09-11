# Project Operating Model

## Purpose

`Project` is the canonical container for delivery and ongoing operation. It is larger than a repository, workflow, agent session, or model conversation.

## Context hierarchy

```text
Workspace
  -> Client? / Engagement?
      -> Project
          -> Project Brief
          -> Project Pack versions
          -> WorkItems / dependencies
          -> WorkItem Proposals
          -> Decisions / Approvals
          -> Artifacts / Evidence
          -> Events
          -> AgentAssignments
          -> Repositories / environments / deployments
          -> Workflows / WIR versions
          -> Spend Envelopes / Cost Records
          -> Incidents / Maintenance
```

Workspace remains the isolation boundary. Engagement provides commercial context. Project owns delivery/operational state.

## Project kinds

Initial kinds:

- `client_delivery`;
- `internal_product`;
- `experiment`.

## Lifecycle phase

Suggested phases:

`intake -> research -> definition -> architecture -> planning -> build -> verification -> review -> deployment -> production -> maintenance -> closed`

Projects may move backward when evidence invalidates an assumption.

`paused` is an operational condition, not evidence of a lifecycle achievement.

## Operational status

Keep status separate from phase:

- `draft`;
- `ready`;
- `running`;
- `waiting_external`;
- `needs_attention`;
- `blocked`;
- `failed`;
- `complete`;
- `canceled`.

## Health

Use explainable health only:

- `healthy`;
- `at_risk`;
- `blocked`;
- `unknown`.

Do not invent arbitrary AI confidence/progress percentages.

## WorkItem

A WorkItem is bounded planned/reactive work with:

- Project id;
- class;
- outcome/title;
- status/priority;
- dependencies;
- inputs/artifacts;
- acceptance condition;
- required evidence;
- assignee kind/reference;
- risk/approval/spend policy;
- blocker/error;
- timestamps/version.

Possible classes include intake, research, decision, commercial, specification, architecture, implementation, automation, verification, review, approval, deployment, incident, maintenance, and documentation.

## Readiness

A WorkItem is ready only when:

- predecessors/gates are satisfied;
- required accepted artifacts exist;
- policy permits it;
- required approval/spend envelope exists;
- an eligible role/runtime/tool route exists;
- mutable-resource conflicts are controlled.

AI may rank eligible work. It cannot make ineligible work ready by narration.

## WorkItem Proposal

Agents/providers may discover new work.

- in-scope provider-local decomposition may remain provider-local;
- material new work becomes a WorkItem Proposal;
- proposals never silently change Project/Engagement truth.

Proposal impact should cover scope, cost, deadline, architecture, risk, production, and maintenance where applicable.

## Project Pack

The versioned Project Pack is compiled from accepted canonical state for machine execution. It is not the Project database itself.

Regeneration must be deterministic for the same canonical version/configuration and must preserve provenance.

## Assignment

A WorkItem may be assigned to:

- human operator;
- internal AI worker;
- deterministic workflow;
- external tool/runtime;
- future client-facing AI role.

The assignee performs work and returns evidence/proposals. It does not own canonical completion.

## Evidence and completion

Evidence standard increases with consequence. Examples:

- schema/type/lint;
- automated tests;
- evals;
- real user/business flow;
- side-effect reconciliation;
- independent review;
- deployment health;
- human acceptance.

Provider success is evidence, not automatically completion.

## Decisions

Material ambiguity becomes an explicit Decision record with question, options, recommendation, choice, reason/evidence, authority, affected records, and timestamp.

## Events

Every material transition emits an event sufficient to reconstruct what happened without opening private model reasoning.

## Closure

Closing a Project requires an explicit outcome such as delivered/accepted, experiment concluded, canceled/not viable, superseded, or support transferred.
