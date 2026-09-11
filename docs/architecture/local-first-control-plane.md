# Local-first Control Plane

## Decision

The initial product is a **local-first web application**. A desktop shell may be added later without redefining core state.

## What must work locally

Without an AI provider connection, the operator must still be able to:

- start/open the application;
- create/read/update Workspaces, Clients, Engagements, Projects, WorkItems;
- review decisions/approvals;
- inspect Project Pack versions;
- view Needs My Attention and Activity Feed;
- inspect evidence/artifact references already stored;
- understand provider outages and queued work;
- export/backup canonical state.

## What may require external connectivity

- hosted model execution;
- hosted coding/runtime execution;
- GitHub/cloud APIs;
- workflow engines;
- remote deployment/monitoring;
- external research/search;
- client communications.

Loss of these dependencies must degrade execution, not erase Project meaning.

## Desktop later

A desktop wrapper may later add:

- automatic local service startup;
- filesystem/repository access;
- local runtime/model management;
- native notifications;
- background routines/tray behavior;
- OS credential-store integration.

The canonical API/domain model must remain usable without desktop-specific assumptions.

## Offline model policy

Local models are preferred when they meet WorkItem requirements for quality, tools, privacy, context, and latency.

Do not route high-consequence work to an under-capable local model merely to claim offline autonomy.

## Backup/recovery

Before real client use, local canonical state requires documented backup/export and recovery. Provider exports are supplemental, never the only backup of Project truth.
