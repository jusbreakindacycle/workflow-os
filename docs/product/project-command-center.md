# Project Command Center

## Purpose

The Command Center is the operator's single operational surface across client and internal work.

It should remove the need to open many AI chats, repositories, CI pages, workflow engines, deployment dashboards, and task boards merely to understand what is happening.

It is a read/action model over canonical state and evidence, not a manually updated project board.

## Home view

Primary navigation:

- `+ New Project`;
- Needs My Attention;
- Activity Feed;
- Projects;
- Clients / Engagements;
- Costs;
- Production / Maintenance;
- Settings / Providers.

## Portfolio Project card

At minimum:

- Project name/type;
- Workspace/client/Engagement reference;
- phase/status/health + reason;
- active WorkItem/Assignment;
- next-ready WorkItem;
- attention count;
- latest meaningful activity;
- Project Pack version;
- commercial deadline/scope warning when applicable;
- deployment/incident indicator when applicable.

## Needs My Attention

Priority classes include:

- goal/scope decision;
- discovery unknown requiring human judgment;
- scope/price/deadline change;
- repository creation approval;
- credential/permission request;
- paid execution approval;
- risk/security acceptance;
- failed verification with business choice;
- deployment approval;
- production incident/high-impact remediation.

Every item explains consequence, recommendation, alternatives, evidence, and available actions.

## Activity Feed

Show meaningful events, not raw logs.

Examples:

- Project created;
- discovery question answered;
- recommendation produced;
- scope approved;
- WorkItem became ready;
- agent/workflow/runtime assignment started/finished/failed;
- verification passed/failed;
- paid budget approved/consumed;
- repository/PR/deployment created;
- incident opened/resolved.

Drill-down can link to provider logs/transcripts, but Project truth remains in canonical records.

## Project detail

Sections:

1. Goal / problem / outcome;
2. Client/Engagement commitments;
3. lifecycle and work graph;
4. Needs My Attention;
5. active assignments;
6. Project Pack and artifacts;
7. decisions/approvals;
8. verification/evidence;
9. costs/spend envelopes;
10. repositories/deployments;
11. production/maintenance;
12. Activity Feed.

## Next-ready semantics

`Next` means eligible after dependencies, policy, approvals, spend, capabilities, and resource conflicts are evaluated. It is not merely the next item an LLM mentions.

## Agent visibility

Default display is compact event/status information.

Optional drill-down may show:

- role;
- model/runtime/provider/version;
- assignment objective/scope;
- tool calls/log refs;
- artifacts;
- cost;
- failure/evidence summary.

Do not expose or store private chain-of-thought as required Project state.

## MVP boundary

Phase 1 may be a simple local web dashboard with forms/tables/timeline. It does not need Slack-like chat, Gantt, drag/drop planning, mobile app, or polished multi-user PM features.

## Success test

The operator can leave the system, return, and understand each active Project plus required human actions without asking agents for a recap.
