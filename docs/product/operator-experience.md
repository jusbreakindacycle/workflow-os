# Operator Experience

## Default mental model

The operator runs the business from the **Command Center**. VS Code, coding agents, workforce managers, workflow engines, source control, and deployment dashboards are execution/detail tools, not where the operator reconstructs the company.

## Primary actions

The operator should normally need only:

- `+ New Project`;
- `Revise Goal`;
- answer/record important discovery/client questions;
- provide credentials when required;
- approve/reject/revise consequential decisions;
- approve new metered spend;
- inspect exceptions/evidence when desired.

## Starting a Project

```text
Command Center -> + New Project
```

The first screen accepts incomplete natural input: client message, idea, user problem, meeting notes, pasted requirements, and later file/screenshot/voice references. No repository is required first.

## New Project flow

```text
Raw input
  -> Draft
  -> adaptive discovery / explicit unknowns
  -> research/challenge later
  -> accepted problem/outcome
  -> choose delivery strategy
  -> Engagement/scope for client work
  -> architecture/plan
  -> repository proposal
  -> operator approval
  -> bootstrap
  -> autonomous delivery work
```

Delivery strategy may be process change, adopt/configure/integrate existing systems, automate, custom build, hybrid, pilot/research, or defer/decline. Do not force every Project into software development.

## Revising a goal

`Revise Goal` opens a change flow rather than editing the old statement in place.

The system shows:

- proposed new direction;
- what requirements/work/architecture/approvals/Pack/Assignments/commercial commitments may be affected;
- what can safely remain valid;
- what must stop or be re-approved.

After acceptance, the system creates the new version and visibly marks stale/superseded work. The operator should not manually hunt through old prompts to update them.

## Adaptive interview

Ask questions the operator can reasonably answer. Every material question supports an answer, `I don't know`, and later `research this for me`. Unknowns are state, not pressure to invent technical facts.

## Requested solution vs real problem

Preserve the client's request and separately challenge it. The system may recommend another strategy but never silently replace an accepted client commitment.

## Needs My Attention

This is the most important queue. Items include discovery/strategy decisions, scope/price/deadline changes, architecture/risk acceptance, credential requests, repository approval, metered spend, failed verification requiring business choice, deployment approval, and high-impact incidents/remediation.

Every item says what happened, why human authority is needed, consequence of waiting, recommendation/alternatives, evidence, and safe actions.

## Activity Feed

Default visibility is event-oriented, not raw worker conversation. Drill-down may show provider/runtime logs, tool calls, artifacts, route, cost, and evidence subject to retention/privacy policy.

## Full roster, dynamic activation

Project can display its logical delivery roster while only active roles consume model/runtime resources. The operator sees who/what is active without dispatching each role manually.

## Spend UX

Before unapproved metered execution:

```text
Spend approval required
Purpose: <WorkItem/action>
Recommended route/service: ...
Estimated range: ...
Maximum envelope: ...
Reason zero-incremental route is insufficient: ...

[Approve envelope] [Choose alternative] [Stop]
```

No hidden spend.

## Offline / host state

The Command Center clearly distinguishes `provider unavailable` from `coordinator host offline`. If no approved execution host is running, background work is queued/waiting; the UI must not imply work continued while the machine was off.

## Desktop vs web

Initial implementation is a local-first web app. A desktop shell may later add startup/background integration, filesystem access, local runtime/model management, notifications, secure OS storage, and tray behavior without redefining canonical state.
