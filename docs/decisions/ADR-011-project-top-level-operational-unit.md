# ADR-011: Project Is the Top-Level Operational Unit

**Status:** Accepted

## Context

The original Workflow OS foundation centered the product around business-process discovery and WIR-based workflow automation. That remains necessary, but the intended product is broader: one solo operator should be able to start from a raw user problem, client request, or product idea and have Workflow OS coordinate research, specification, implementation, verification, deployment, production operation, maintenance, and reuse.

A workflow definition cannot faithfully represent all of that state. A Project may contain multiple workflows, repositories, deployments, research artifacts, architecture decisions, coding tasks, approvals, incidents, and future client-facing AI Employee roles.

If WIR were stretched into the top-level project model, it would mix process execution semantics with product-delivery/portfolio state and make both harder to reason about.

## Decision

`Project` is the canonical top-level operational unit inside a Workspace.

A Project owns/references:

- problem/outcome/constraints;
- lifecycle phase and operational status;
- dependency-aware WorkItems;
- decisions, artifacts, and evidence;
- repositories/environments/deployments;
- workflows and WIR versions;
- internal AgentAssignments;
- approvals;
- incidents/maintenance;
- future client-facing AI Employee roles where applicable.

WIR remains the canonical portable representation of a **workflow inside a Project**.

AI Employee Spec remains the canonical future representation of a **client-facing governed role inside/associated with a Project**.

Workspace remains the authorization/data-isolation boundary.

Workflow OS, not any agent session, is authoritative for Project/WorkItem state.

## Consequences

Positive:

- aligns the data model with the full solo-AI-business delivery lifecycle;
- allows the Command Center to show all project work, not only workflow runs;
- lets software/product/research work coexist with automation work;
- preserves WIR semantics instead of overloading them;
- creates a durable place for deployment/maintenance/incident ownership;
- allows agent assignments to remain bounded and attributable.

Costs:

- Phase 1 must introduce a Project/WorkItem layer before broad UI/application implementation;
- existing workflow records/runs must carry Project attribution;
- acceptance criteria and architecture must distinguish Project state from workflow execution state;
- more canonical state exists than in the original automation-only MVP.

## Non-decision

This ADR does not require a particular database schema, frontend framework, project-management UI library, or autonomous agent framework.

It also does not authorize full autonomous multi-agent delivery in Phase 1.

## Revisit trigger

Revisit only if real implementation evidence shows that Project cannot remain the coherent top-level delivery unit or that a distinct higher-level commercial portfolio/engagement object is required. Do not supersede this ADR merely to mirror a third-party project-management tool's data model.
