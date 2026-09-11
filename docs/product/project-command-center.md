# Project Command Center

## Purpose

The Command Center is the operator's single operational surface across client and internal work. It removes the need to open AI chats, repos, CI, workflow engines, deployments, and task boards merely to understand state.

It is a read/action model over canonical state/evidence, not a manually updated PM board.

## Home view

Primary navigation/actions:

- `+ New Project`;
- Needs My Attention;
- Activity Feed;
- Projects;
- Clients / Engagements;
- Costs / Spend;
- Production / Maintenance;
- Settings / Providers.

Within a Project, `Revise Goal` is a first-class action.

## Portfolio Project card

At minimum show Project name/type, Workspace/client/Engagement, accepted goal/brief version, delivery strategy, phase/status/health + reason, active WorkItem/Assignment, next-ready WorkItem, attention count, latest meaningful activity, Project Pack version, commercial deadline/scope warning, stale/revision warning, and deployment/incident indicator when applicable.

## Needs My Attention

Priority classes include goal/strategy decision, discovery unknown needing human judgment, scope/price/deadline/client-acceptance change, repository creation approval, credential/permission request, metered spend, risk/security acceptance, failed verification with business choice, deployment approval, and production incident/high-impact remediation.

Every item explains consequence, recommendation, alternatives, evidence, exact subject/version, and safe actions.

## Activity Feed

Show meaningful events, not raw logs: Project/revision created, discovery answered, recommendation/strategy decided, scope proposed/client accepted, WorkItem readiness change, assignment start/finish/fail, verification result, spend approval/consumption, repository/PR/deployment action, incident opened/resolved.

## Project detail

Sections:

1. goal/problem/outcome + revision history;
2. requested solution + chosen delivery strategy;
3. Client/Engagement commitments + external acceptance evidence;
4. lifecycle/work graph;
5. Needs My Attention;
6. active assignments/Context Slice summary;
7. Project Pack/artifacts;
8. decisions/approvals;
9. verification/evidence;
10. costs/spend envelopes;
11. repositories/deployments;
12. production/maintenance;
13. Activity Feed.

## Next-ready semantics

`Next` means eligible after dependencies, accepted versions, policy, approvals, spend, capabilities, provider/host availability when execution is requested, and resource conflicts. It is not the next item an LLM mentions.

## Worker visibility

Default is compact event/status information. Drill-down may show role, model/runtime/provider/connection/version, Assignment objective/scope, tool/log refs, artifacts, cost, and failure/evidence summary. Do not store private chain-of-thought as Project state.

## MVP boundary

Phase 1 may be simple forms/tables/timeline. It does not need Slack-like chat, Gantt, drag/drop planning, mobile app, or polished multi-user PM features.

## Success test

The operator can leave the system, return, and understand each active Project, stale work, and required human actions without asking workers for a recap.
