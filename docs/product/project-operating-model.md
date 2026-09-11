# Project Operating Model

## Purpose

`Project` is the canonical container for delivery and ongoing operation. It is larger than a repository, workflow, agent session, or model conversation.

## Context hierarchy

```text
Workspace
  -> Client? / Engagement?
      -> Project
          -> Project Brief versions / Project Revisions
          -> Project Pack versions
          -> WorkItems / dependencies
          -> WorkItem Proposals
          -> Decisions / Approvals
          -> Artifacts / Evidence
          -> Events
          -> AgentAssignments / Context Slices
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

Projects may move backward when evidence invalidates an assumption. `paused` is an operational condition, not evidence of lifecycle achievement.

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

Use explainable health only: `healthy`, `at_risk`, `blocked`, `unknown`. Do not invent arbitrary AI confidence/progress percentages.

## WorkItem

A WorkItem is bounded planned/reactive work with Project id, class, outcome/title, status/priority, dependencies, inputs/artifacts, acceptance condition, required evidence, assignee kind/reference, risk/approval/spend policy, blocker/error, timestamps, and version.

Possible classes include intake, research, decision, commercial, product/design, specification, architecture, implementation, automation, verification, review, approval, deployment, incident, maintenance, and documentation.

## Readiness

A WorkItem is ready only when predecessors/gates are satisfied, required accepted artifacts exist, policy permits it, required approval/spend envelope exists, an eligible role/runtime/tool route exists when execution is requested, and mutable-resource conflicts are controlled.

AI may rank eligible work. It cannot make ineligible work ready by narration.

## WorkItem Proposal

Agents/providers may discover new work. In-scope provider-local decomposition may remain provider-local; material new work becomes a WorkItem Proposal. Proposals never silently change Project/Engagement truth.

Proposal impact should cover scope, cost, deadline, architecture, risk, production, and maintenance where applicable.

## Goal / scope revision

A material operator/client goal revision creates a new `ProjectRevision` / accepted `ProjectBrief` version rather than rewriting history.

The system performs impact analysis over:

- requirements/non-goals;
- WorkItems/dependencies/readiness;
- architecture/decisions;
- approvals and spend envelopes;
- Project Pack versions and generated instruction projections;
- active/queued Assignments;
- repository/deployment plans;
- Engagement scope/deadline/price where applicable.

Affected records become `stale`, `superseded`, `needs_attention`, or otherwise non-executable according to policy. Running work is stopped/paused when continuing would be unsafe or materially wasteful. Historical artifacts/evidence remain attributable to the version that produced them.

A revision may be small enough to preserve unaffected work. Impact is explicit; never invalidate everything merely because one sentence changed.

## Project Pack

The versioned Project Pack is compiled from accepted canonical state for machine execution. It is not the Project database and should not copy rapidly changing runtime status into one giant document.

Prefer stable accepted facts plus exact versioned references to the Work graph, architecture, policy, and evidence contracts. Regeneration is deterministic for the same canonical versions/configuration and preserves provenance.

## Context Slice

An Assignment receives a minimum-authorized `ContextSlice` derived from the Project Pack + exact WorkItem + allowed artifact references. Referencing a Project Pack does not authorize transmitting every client/commercial/project artifact to a provider.

## Assignment

A WorkItem may be assigned to the human operator, an internal AI worker, a deterministic workflow, an external tool/runtime, or a future client-facing AI role.

The assignee performs work and returns evidence/proposals. It does not own canonical completion.

## Evidence and completion

Evidence standard increases with consequence. Examples include schema/type/lint, automated tests, evals, real user/business flow, side-effect reconciliation, independent review, deployment health, and human/client acceptance when required.

Provider success is evidence, not automatically completion.

## Decisions and approvals

Material ambiguity becomes an explicit Decision record. Approval is authority to perform an exact bounded action/version; it is not automatically evidence that an external client accepted a proposal or delivery.

## Events

Every material transition emits an event sufficient to reconstruct what happened without opening private model reasoning.

## Closure

Closing a Project requires an explicit outcome such as delivered/accepted, experiment concluded, canceled/not viable, superseded, or support transferred.
