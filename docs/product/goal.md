# /goal

## Product goal

Build a personal **AI Business Delivery Operating System** that lets one solo builder turn a raw user problem, client request, or project idea into a researched, specified, built, verified, deployed, operated, maintained, improved, and reusable solution without manually rebuilding the delivery organization for every project.

Workflow OS should make this lifecycle repeatable:

> Intake -> Research -> Challenge -> Define -> Scope -> Architect -> Plan -> Build -> Verify -> Review -> Deploy -> Observe -> Maintain -> Improve -> Reuse

## North-star promise

The operator should be able to provide primarily:

- the problem or idea;
- the desired outcome;
- known constraints/context;
- decisions and approvals that require human judgment.

Workflow OS should organize the remaining work through explicit Project state, a dependency-aware work graph, deterministic workflows, bounded AI agents, specialist reviewers, external tools/runtimes, evidence, and production-maintenance loops.

The human remains the final authority for commercial commitments, major scope changes, policy exceptions, credentials/secrets, destructive/high-impact production actions, and risk acceptance.

## Primary job to be done

“When I receive a business problem or project idea, help me determine what should actually be built, create the non-coding and coding work required to deliver it, prove that it works, deploy it safely, keep track of its production state, and help maintain and improve it without making me manually coordinate every agent, task, document, repository, test, deployment, and incident.”

## Top-level operational unit

`Project` is the top-level unit of delivery inside a Workspace.

A Project may represent:

- a client delivery;
- an internal product/SaaS;
- an automation engagement;
- a website/mobile application;
- an integration/data project;
- an approved research/experiment stream;
- a project that itself delivers one or more client-facing AI Employees.

Project owns lifecycle state and references the work required to deliver and operate the outcome.

WIR remains canonical for workflow definitions **inside** a Project. It is not the whole Project model.

## Project Command Center

Workflow OS must reduce operator cognitive load by providing one Command Center where the operator can answer:

- What Projects do I have?
- What phase is each one in?
- What is currently happening?
- What is the next ready task?
- What is blocked and why?
- What needs my approval/decision?
- Is research, specification, coding, testing, review, deployment, or maintenance still running?
- Which agent/human/tool owns the current assignment?
- What evidence says the work is actually complete?
- Which production Projects have incidents or maintenance needs?

The Command Center is derived from canonical state and evidence, not manually updated narrative status.

## Internal AI workforce

Workflow OS may coordinate an internal AI delivery workforce for the operator: research, product/requirements, architecture, planning, implementation, verification, security/reliability review, deployment, production operations, maintenance, and documentation.

These internal agents are bounded workers. They do not become the system of record and they do not gain authority from their role title alone.

## Strategic positioning

Workflow OS does not aim to replace every execution engine, coding agent, cloud development environment, deployment system, observability platform, or agent runtime.

It is the **control, memory-of-work, governance, and orchestration layer above them**.

Execution/coding/deployment systems remain tools/adapters. Workflow OS preserves Project state, work dependencies, policy, evidence, versions, approvals, incidents, and operator visibility across them.

## Future client-facing AI Employee capability

Workflow OS may also package governed automation as client-facing **AI Employees / AI Workers**.

A client-facing AI Employee is:

- a versioned role;
- backed by workflows/tools/knowledge;
- given explicit authority and budgets;
- executed through bounded tasks;
- evaluated and promoted through test/shadow/supervised stages;
- owned/escalated to a human.

It is not an unrestricted autonomous process and does not own Project state.

This remains a later product capability and does not authorize premature Phase 1 implementation.

## Success condition

Workflow OS succeeds when one human can manage a growing portfolio of projects while the system reliably answers what is happening, what happens next, what needs human attention, what evidence proves completion, and what production work must be maintained.

The long-term outcome is not merely “AI writes code” or “automation runs.” It is **lower operator coordination load across the full delivery and maintenance lifecycle while preserving control, safety, quality, recoverability, and reuse.**
