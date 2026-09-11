# Architecture

## Architectural thesis

Workflow OS is a **personal AI business delivery control plane** for one human operator. It is not a universal workflow executor and not one giant autonomous agent.

It owns the state and governance required to move a raw problem or project idea through research, specification, implementation, verification, deployment, production operation, maintenance, and reuse.

> Workflow OS owns the project state; agents perform bounded work.

> Model once, execute through the right engine, govern everything from one place.

## Top-level lifecycle

```text
Business/User Problem or Project Idea
  -> Project Intake
  -> Research / Challenge
  -> Problem + Outcome Definition
  -> Scope / Requirements
  -> Architecture / Risk / Feasibility
  -> Work Graph / Plan
  -> Build / Configure / Automate
  -> Verify / Review
  -> Deploy
  -> Observe Production
  -> Incident / Maintenance / Change
  -> Measure
  -> Improve / Reuse
```

A Project may contain software delivery, deterministic workflows, AI-assisted steps, client-facing AI Employees, documentation, integrations, research, or combinations of these.

## Canonical hierarchy

```text
Workspace
  -> Project
      -> Project artifacts / decisions
      -> WorkItems + dependencies
      -> Repository / environment / deployment references
      -> Workflow(s) -> WIR versions
      -> future AI Employee role(s) -> RoleVersions
      -> internal AgentAssignments
      -> Evidence / evaluations / approvals
      -> Incidents / maintenance records
```

### Workspace

The authorization and data-isolation boundary.

### Project

The top-level operational unit for a client delivery, internal product, or approved experiment. Project is authoritative for lifecycle phase, work graph, current state, related artifacts, production ownership, and portfolio visibility.

### Workflow / WIR

WIR remains the canonical portable model for a workflow inside a Project. It does not represent the whole Project.

### AI Employee

AI Employee Spec remains the canonical future model for a client-facing governed role. A client AI Employee is a Project deliverable/participant and does not own Project state.

## Project Command Center

The Command Center is the operator-facing read model over canonical Project, WorkItem, AgentAssignment, WorkflowRun, Deployment, Approval, Evidence, Incident, and Maintenance state.

It must expose, at minimum:

- all Projects and lifecycle phases;
- health and blockers;
- active work;
- next ready action;
- approvals/decisions requiring the human operator;
- research/spec/build/test/deploy/maintenance status;
- latest evidence/activity;
- production deployments/incidents where applicable.

A status badge is never authoritative merely because an agent wrote it. Read models are derived from canonical state/events and reconciled evidence.

## Internal AI workforce

Workflow OS can coordinate bounded internal specialist roles such as:

- problem/intake analyst;
- researcher;
- product/requirements analyst;
- solution architect;
- planner/orchestrator;
- frontend/backend/mobile/automation implementation worker;
- verification/QA/security/reliability/adversarial reviewer;
- deployment/operations worker;
- incident/maintenance worker;
- documentation/handoff worker.

An internal agent receives a bounded AgentAssignment referencing exact Project/WorkItem state. It returns artifacts, proposed state transitions, and evidence. It cannot make itself authoritative by storing hidden state in its context.

Parallel work requires dependency-safe isolation and explicit integration/verification. A multi-agent swarm is not a default architecture.

## Project work graph

Known delivery state is represented as WorkItems with explicit dependencies rather than hidden conversation sequencing.

Typical WorkItem classes include:

- research;
- decision;
- specification;
- implementation;
- workflow design;
- verification;
- review;
- approval;
- deployment;
- incident;
- maintenance;
- documentation.

A WorkItem can be assigned to a human, deterministic workflow, external tool/runtime, or bounded agent.

## Agent engineering layer

Engineering agents require an operable environment, not just a better prompt. The architecture therefore supports a future agent-engineering layer containing:

- repository/project maps;
- project-specific verification skills;
- feature/capability maps;
- machine-enforced architecture and CI constraints;
- evidence contracts;
- stored evaluation cases;
- isolated branches/worktrees/environments for parallel workers;
- independent verification for material changes.

See `docs/engineering/agent-operability-and-verification.md`.

## Production operations layer

Deployment is not the end of a Project. Production-capable Projects retain:

- deployment/environment records;
- health/observability references;
- incident state;
- maintenance/change WorkItems;
- dependency/update obligations;
- rollback/recovery evidence;
- ownership and escalation rules.

See `docs/operations/production-maintenance-model.md`.

## Workflow execution plane

Candidate execution classes include low-code API automation, Microsoft automation/RPA, durable workflow runtimes, BPMN/process orchestrators, agent runtimes, and isolated custom functions.

The Phase 1 MVP uses exactly **one primary workflow execution adapter**.

Future agentic work may use separate Agent Runtime Adapters, coding agents, cloud development environments, or other tool-specific adapters, but Workflow OS remains authoritative for Project/WorkItem state, authorization, budgets, versioning, approvals, and evidence.

## Tool/connectivity plane

MCP, webhooks, OpenAPI-derived actions, native connectors, source-control APIs, CI/CD systems, deployment providers, databases, and observability tools expose capabilities.

Tool discovery does not grant execution permission.

## Future client-facing AI Employee layer — Phase 3

```text
Project
  -> AI Employee RoleVersion
      -> bounded TaskAssignment
          -> deterministic Workflow(s)
          -> AI Transform(s)
          -> optional AgentSession
          -> Tool(s)
          -> Human escalation/approval
```

The role does not run as an unconstrained permanent LLM session.

See `docs/ai-employees/`.

## Architectural invariants

1. Project is the top-level operational unit inside a Workspace.
2. WIR is the canonical portable workflow model within a Project.
3. AI Employee Spec is the canonical future client-facing role model; it references workflows/tools rather than replacing Project or WIR.
4. Workflow OS, not an agent context, owns Project/WorkItem/approval/deployment/incident state.
5. Command Center state is derived from canonical state/events and evidence.
6. Execution, coding, deployment, and agent runtimes are adapters/tools, not the source of truth.
7. Deterministic-first, agentic-where-necessary.
8. Responsibility is not permission; tool authority is independently enforced.
9. High-impact side effects require explicit policy; R3 requires human approval.
10. Raw secrets are never embedded in Project specs, WIR, role specs, or prompts.
11. Every workflow run is attributable to a Workspace, Project, and workflow version.
12. Every future AI Employee task is attributable to a Workspace, Project, and exact RoleVersion.
13. Every internal AgentAssignment is attributable to a Project and bounded WorkItem.
14. Memory is explicit, typed, and scoped; hidden agent memory is not business truth.
15. Failures are resolvable states, not hidden log lines.
16. Production ownership continues after deployment through incident and maintenance state.
17. Scale infrastructure is introduced only when measured triggers justify it.
18. Parallel/multi-agent work is evidence- and dependency-gated, never the default substitute for clear architecture.

## Deferred choices

The repository intentionally does not preselect a frontend framework, API framework, ORM, cloud provider, Kubernetes architecture, multi-region design, final long-term workflow engine, final coding-agent vendor, final agent runtime/model provider, or final observability vendor unless an ADR explicitly resolves it.
