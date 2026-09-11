# Operator Experience

## Default mental model

The operator runs the business from the **Command Center**. VS Code, Codex, Claude Code, Copilot, OpenCode, Paperclip, Activepieces, GitHub, and deployment dashboards are execution/detail tools, not the place where the operator must reconstruct the company.

## Starting a Project

The primary entry point is:

```text
Command Center -> + New Project
```

The first screen should accept incomplete natural input:

- a client message;
- an idea;
- a user problem;
- meeting notes;
- pasted requirements;
- screenshots/files/voice references in later phases.

The operator does not need a repository first.

## New Project flow

```text
Raw input
  -> Draft
  -> Discovery questions
  -> Research/challenge proposals (later autonomous phase)
  -> accepted problem/outcome
  -> Engagement/scope when client work
  -> architecture/plan
  -> repository proposal
  -> operator approval
  -> bootstrap
  -> autonomous delivery work
```

## Adaptive interview principle

The system should ask questions the operator can reasonably answer.

Bad question:

> Which database isolation level should be used?

Better question:

> Can two people update the same booking/inventory item at the same time?

Every question supports:

- an answer;
- `I don't know`;
- `Ask/research this for me` in later phases.

Unknowns are explicit state, not pressure on the operator to invent technical facts.

## Requested solution vs real problem

The system must preserve the client's requested solution and may separately challenge it.

Example:

```text
Client request: native Android app
Problem: staff need remote inventory visibility
System recommendation: compare PWA vs native before commitment
```

The system never silently overrides a client commitment. It presents evidence/options and asks for the applicable decision.

## Needs My Attention

This is the most important queue for the operator.

Items include:

- discovery decision;
- scope/price/deadline change;
- architecture/risk acceptance;
- credential request;
- repository creation approval;
- paid execution approval;
- failed verification requiring business choice;
- production deployment approval;
- incident/high-impact remediation.

Every attention item must state:

- what happened;
- why the operator is needed;
- consequence of waiting;
- recommended option and alternatives;
- evidence/links;
- safe actions.

## Activity Feed

Default visibility is an event-oriented feed, not raw agent conversation.

Example:

```text
09:10 Research completed — 14 sources
09:18 Requirements proposal created — 2 decisions required
09:24 Operator approved MVP scope
09:25 Architecture assignment started
10:07 QA rejected candidate — duplicate booking race condition
10:12 Repair assignment started
10:45 QA passed
10:50 Deployment approval requested
```

The operator may drill down to runtime logs/transcripts/tool calls when debugging, subject to retention/privacy policy.

## Full roster, dynamic activation

The Project can display a logical team roster, but only active roles consume runtime/model resources.

The operator should see who/what is active without needing to dispatch them manually.

## Paid work UX

Before any unapproved paid execution:

```text
Paid execution required
Purpose: architecture verification
Recommended route: <model/runtime>
Estimated range: ...
Maximum envelope: ...
Reason free/local route is insufficient: ...

[Approve envelope] [Choose alternative] [Stop]
```

No hidden spend.

## Desktop vs web

Initial implementation is a local-first web application for faster development and portability. A desktop shell may later package the same control plane for startup/background integration, filesystem access, local runtime management, notifications, and tray behavior.

The product architecture must not depend on the desktop shell existing.
