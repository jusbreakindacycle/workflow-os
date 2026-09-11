# Product Brief

## Primary user

One solo builder / freelance AI-software-and-automation operator who may simultaneously run client deliveries, internal products, experiments, deployed systems, and recurring maintenance.

## Secondary users

Client operators, managers, approvers, technical owners, and future human owners of governed client-facing AI Employee roles.

## Problem

A solo builder can increasingly use AI to research, plan, code, test, automate, and deploy, but the work still fragments across chats, repositories, prompts, agents, task lists, automation engines, CI systems, cloud providers, notes, and production dashboards.

The bottleneck shifts from “can AI perform the task?” to:

- what should happen next;
- which specialist should do it;
- what context is authoritative;
- which tasks can run in parallel;
- what is blocked;
- what needs human approval;
- whether an agent actually proved completion;
- what was deployed;
- what failed in production;
- what needs maintenance;
- what knowledge should be reused on the next project.

Without a control layer, a solo builder becomes the manual project manager, dispatcher, context copier, reviewer, deployment coordinator, and incident tracker for their own AI workforce.

The core problem is:

> How can one person run an AI-native delivery business where a raw problem or project idea is converted into a maintainable production outcome without manually coordinating every agent, workflow, repository, test, deployment, and maintenance action?

## Value proposition

Workflow OS provides a consistent Project/portfolio control plane above heterogeneous workflow engines, coding agents, deployment systems, AI runtimes, and human work while preserving:

- problem/outcome context;
- Project lifecycle state;
- work dependencies and next-ready actions;
- policy and human approval;
- artifacts, decisions, and versions;
- verification/evaluation evidence;
- workflow and agent run history;
- deployment/environment records;
- incidents and maintenance obligations;
- reusable client-neutral patterns;
- operator visibility through one Command Center.

## Product layers

### 1. Project and portfolio layer

Canonical Projects, lifecycle phases, work graphs, decisions, artifacts, evidence, blockers, approvals, and the operator-facing Command Center.

### 2. Internal AI delivery workforce

Bounded research, product, architecture, engineering, verification, deployment, maintenance, and documentation agents. These agents receive assignments from Project state rather than owning the Project in hidden conversation context.

### 3. Workflow layer

Deterministic, AI-assisted, agentic, and human-in-the-loop business-process execution modeled through WIR and external execution adapters.

### 4. Agent-engineering layer

Project/repository maps, verification harnesses, machine-enforced constraints, evaluation cases, independent review, and isolated execution environments that make coding agents capable of proving their work rather than merely generating code.

### 5. Production operations and maintenance layer

Deployment registry, production health, incident/change/maintenance work, recovery evidence, and continuing ownership after launch.

### 6. Future client-facing AI Employee layer

A governed business-facing role that:

- owns explicit responsibilities/non-responsibilities;
- receives bounded tasks;
- uses approved workflows/tools/knowledge;
- has explicit identity and authority;
- escalates to a human owner;
- earns autonomy through evaluation;
- is measured by business outcome.

The client-facing AI Employee layer is not the same as the internal delivery workforce.

## Design principles

1. Project state above agent state.
2. Spec-first before broad implementation.
3. Deterministic-first where exact rules are sufficient.
4. Agents receive bounded assignments, not unrestricted company authority.
5. Engine/runtime/vendor-agnostic canonical state where practical.
6. WIR remains canonical for workflows; Project is canonical for delivery state.
7. Responsibility is not permission.
8. Human-in-the-loop where consequence requires it.
9. Verification evidence matters more than agent confidence.
10. Machine-enforced constraints are preferred over endlessly longer prompts.
11. Reliability around every side effect.
12. Workspace isolation from the first usable version.
13. Memory is explicit and scoped.
14. Deployment is a lifecycle transition, not the end of ownership.
15. Observability and maintenance are product features.
16. Reuse without copying confidential client material.
17. Parallelism and multi-agent complexity are dependency- and evidence-driven.
18. The Command Center must reduce, not recreate, project-management overhead for the operator.

## North-star outcomes

- operator can start from a problem/idea instead of manually constructing the whole delivery process;
- every active Project has visible phase, health, owner/assignee, next action, blockers, and evidence;
- research/specification/engineering/deployment handoffs are reproducible rather than chat-dependent;
- coding agents can run and verify the real product with less human babysitting;
- failures create reusable tests/constraints/knowledge;
- deployed Projects remain observable and maintainable;
- increasing reuse across projects without client-data leakage;
- fewer manual coordination steps per delivered Project;
- measurable cycle-time, quality, reliability, and business-outcome improvements.
