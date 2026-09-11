# Local-first Control Plane

## Decision

The initial product is a **local-first web application**. A desktop shell may be added later without redefining core state.

## What must work locally

Without an AI provider connection, the operator must still be able to start/open the application; create/read/update Workspaces, Clients, Engagements, Projects, WorkItems; review decisions/approvals; inspect Project Pack versions; view Needs My Attention and Activity Feed; inspect existing evidence/artifact references; understand provider outages/queued work; and export/backup canonical state.

## What may require external connectivity

Hosted model/runtime execution, Git/source control, cloud/workflow/deployment/monitoring APIs, external research, and client communications may require connectivity. Loss of these dependencies degrades execution, not Project meaning.

## Continuous-autonomy availability

`Local-first` is not `always-on by magic`.

If the machine hosting the coordinator is shut down, asleep, disconnected, or the local service is stopped, local routines/loops cannot execute. Canonical state records that work is queued/waiting and resumes safely after restart/reconciliation.

A later optional always-on execution/coordinator host may run on another self-hosted machine or replaceable remote infrastructure while preserving the same canonical contracts. This is not a Phase 1 requirement and must not turn a cloud vendor into the source of truth.

## Desktop later

A desktop wrapper may later add automatic local service startup, filesystem/repository access, local model/runtime management, native notifications, background/tray behavior, and OS credential-store integration. The canonical API/domain model remains usable without desktop-specific assumptions.

## Offline model policy

Local models are preferred when they meet WorkItem requirements for quality, tools, privacy, context, and latency. Do not route high-consequence work to an under-capable local model merely to claim offline autonomy.

## Local data security

Before real client use, define data-at-rest protection, backup/export/recovery, localhost/network exposure, and secret-store behavior appropriate to client sensitivity. Provider exports are supplemental, never the only backup of Project truth.
