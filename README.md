# Workflow OS

Workflow OS is a **personal AI business delivery operating system** for a solo builder. It turns a raw user problem, client request, or product idea into governed work that can be researched, specified, built, verified, deployed, operated, maintained, improved, and reused.

It combines:

- a project/portfolio control plane;
- deterministic workflows and WIR;
- bounded internal AI specialist agents;
- external execution and agent runtimes through adapters;
- verification, security, reliability, and human approval;
- production operations and maintenance state;
- future client-facing AI Employees / AI Workers.

The human operator remains the final authority for scope, commitments, high-impact production actions, and policy exceptions.

## North-star promise

> Give Workflow OS the problem, desired outcome, constraints, and approvals; let it organize the rest of the delivery lifecycle.

The target lifecycle is:

> Intake -> Research -> Challenge -> Define -> Scope -> Architect -> Plan -> Build -> Verify -> Review -> Deploy -> Observe -> Maintain -> Improve -> Reuse

## Project is the top-level operational unit

A Project represents one client delivery, internal product, or research/experiment stream. Workflows, repositories, deployments, tasks, evidence, incidents, AI-agent assignments, and maintenance records belong to a Project.

WIR remains the canonical representation of a workflow **inside** a Project. AI Employee Spec remains the canonical future representation of a client-facing governed role. Neither replaces Project state.

## Project Command Center

Workflow OS must give the operator one place to see the portfolio:

- every active Project;
- current lifecycle phase and health;
- what is running now;
- next ready task;
- blockers and approvals needed;
- research/spec/build/test/deploy/maintenance state;
- active agent or human assignee;
- latest evidence and activity;
- production environment, incidents, and maintenance needs.

Status is derived from canonical project/task/event state, not from an agent merely claiming that work is done.

## Internal AI workforce

Internal agents are bounded workers, not the owner of project state. Typical roles include research, requirements, architecture, planning, implementation, verification, security/reliability review, deployment, incident investigation, maintenance, and documentation.

Workflow OS owns the work graph, dependencies, budgets, approvals, evidence, and project state. Agents receive bounded assignments and return artifacts/evidence.

## Current status

**The original Phase 0 specification is complete and merged. Foundation v2 is being added before serious application implementation to align the repository with the broader solo-AI-business vision.**

The Activepieces hands-on adapter spike can remain the first execution-engine coding experiment, but broad application implementation should follow the updated Project, Command Center, internal-agent, and maintenance contracts.

## Public-repository rule

This repository is currently public. Do **not** commit client names, client data, credentials, tokens, secrets, private workflow payloads, proprietary SOPs, private role instructions, or other confidential material.

Use synthetic examples only.

## Navigation

Start with:

1. `AGENTS.md`
2. `docs/index.md`
3. `docs/product/goal.md`
4. `docs/product/project-operating-model.md`
5. `docs/product/project-command-center.md`
6. `docs/product/scope-mvp.md`
7. `ARCHITECTURE.md`
8. `docs/decisions/index.md`
9. `docs/plans/foundation-v2.md`
10. the active phase plan and acceptance criteria

Future client-facing AI Employee architecture starts at `docs/ai-employees/overview.md`.

## Core principles

> Workflow OS owns the project state; agents perform bounded work.

> Model once, execute through the right engine, govern everything from one place.

For client-facing AI Employees:

> Give AI a role, not unrestricted authority.
