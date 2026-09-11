# System Context

## Actors

### Operator
The solo builder/freelance AI-software-and-automation practitioner who provides business intent, constraints, decisions, approvals, and risk acceptance while Workflow OS coordinates delivery state across Projects.

### Client approver/operator
A client-side human who may supply business rules, approve high-impact actions, validate outcomes, or receive handoff/reporting.

### Internal AI delivery agents
Bounded research, product, architecture, engineering, verification, deployment, maintenance, and documentation workers operating on Project/WorkItem assignments.

### Future client-facing AI Employees
Governed business roles delivered for/inside client Projects under the separate AI Employee contracts.

### External systems
SaaS applications, APIs, databases, mail systems, file stores, messaging systems, browser/desktop applications, AI providers, coding agents, source-control/CI systems, deployment providers, observability systems, and workflow/agent execution engines.

## Context boundary

Workflow OS is authoritative for:

- Workspace/Project identity and lifecycle state;
- WorkItems/dependencies/assignments;
- Project decisions/artifact/evidence references;
- workflow intent/WIR/versions;
- policy/approvals/budgets;
- deployment and run metadata;
- incident/maintenance state;
- reusable templates/lessons;
- the derived Project Command Center view.

It is **not** authoritative for the business records stored in external systems, source-code content owned by Git repositories, raw provider telemetry, or the private reasoning/context of an agent. It should store/reference only the metadata, artifacts, events, and evidence needed to coordinate and govern work safely.

## Core components

1. **Project Registry** — canonical Projects, lifecycle phase/status/health, ownership, repository/environment/deployment references.
2. **Work Graph** — WorkItems, dependencies, readiness, assignments, blockers, decisions, and evidence requirements.
3. **Project Command Center** — portfolio, operator-attention queue, project detail, current work, verification, deployment/maintenance visibility.
4. **Discovery/Briefing** — converts a raw problem/process/project request into structured Project/Workflow briefs and accepted scope.
5. **Feasibility/Risk** — evaluates whether/how work should be automated or built and which human gates apply.
6. **Workflow Registry** — stores WIR and immutable published workflow versions inside Projects.
7. **Policy Engine** — resolves action risk, approvals, allowed tools, and execution budgets.
8. **Internal Agent Assignment Layer** — gives bounded Project/WorkItem tasks to specialist agents/tools without transferring canonical state ownership.
9. **Engine/Tool Adapter Layer** — connects workflow engines, coding/source-control systems, deployment providers, agent runtimes, and other execution capabilities.
10. **Test/Evaluation/Verification Layer** — validates deterministic, AI, and delivered behavior and records evidence.
11. **Run/Activity Ledger** — records normalized workflow, assignment, deployment, and Project events/correlation.
12. **Approval Layer** — represents human decisions as explicit state.
13. **Observability/Recovery** — surfaces failures/incidents and supports safe replay/reconciliation/rollback.
14. **Maintenance Layer** — creates/tracks incident, change, upgrade, and recurring operational WorkItems after deployment.
15. **Template/ROI Layer** — preserves sanitized reusable project/workflow/role knowledge and measured outcomes.

## Trust boundaries

Treat every external execution engine, coding agent, source-control/CI provider, deployment provider, connector, webhook sender, AI provider, observability source, and third-party API as a separate trust boundary.

Inputs/outputs must be validated and policy applied at the Workflow OS boundary. A third-party “success” status or an agent claim does not by itself prove the intended Project/business outcome.
