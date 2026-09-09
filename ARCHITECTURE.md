# Architecture

## Architectural thesis

Workflow OS is a **personal automation engineering control plane**, not a universal workflow execution engine.

> Model once, execute through the right engine, govern everything from one place.

The control plane owns business-process discovery, canonical workflow/role representations, policy, tests, versioning, deployment metadata, run/task visibility, reusable templates, and ROI reporting. Actual runtime execution is delegated through adapters.

## Logical lifecycle

```text
Business intent
  -> Workflow / Role Brief
  -> Feasibility + Risk Assessment
  -> Work Decomposition
  -> Workflow IR (WIR) and/or AI Employee Spec
  -> Static Validation
  -> Execution / Agent-Runtime Selection
  -> Test / Shadow / Dry Run
  -> Deploy
  -> Execute bounded runs/tasks
  -> Observe / Approve / Escalate / Recover
  -> Measure
  -> Template / Improve
```

## Participant model

Workflow OS can coordinate:

- deterministic workflows;
- AI-assisted workflow steps;
- governed AI Employees / agent sessions;
- human tasks and approvals;
- external systems;
- RPA/robots;
- execution and agent runtimes.

An AI Employee is a **role participant**, not the owner of Workflow OS process state.

## Control plane responsibilities

- workspaces/clients;
- workflow briefs and AI Employee role briefs;
- WIR definitions and immutable published versions;
- AI Employee Role Templates/Instances/Versions in future Phase 3;
- bounded Task Assignment state for AI Employees in future Phase 3;
- connector/tool metadata;
- capability/identity policy;
- approval rules;
- tests and AI evaluations;
- deployments;
- run/task/event metadata;
- reusable workflow/role templates;
- observability views;
- ROI/time-saved records;
- documentation/handoff artifacts.

## Execution plane

Candidate execution classes include low-code API automation, Microsoft automation/RPA, durable workflow runtimes, BPMN/process orchestrators, agent runtimes, and isolated custom functions.

The Phase 1 MVP uses exactly **one primary execution adapter**.

Future agentic work may use a separate Agent Runtime Adapter, but Workflow OS remains authoritative for task state, authorization, budgets, role versioning, and tool access.

## Tool/connectivity plane

MCP, webhooks, OpenAPI-derived actions, and native connectors expose capabilities.

MCP is a tool-access layer, not Workflow OS's canonical business-process or AI-Employee state machine.

## AI Employee layer — Phase 3

AI Employee is a business-facing role abstraction.

```text
AI Employee RoleVersion
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

1. WIR is the canonical portable workflow model.
2. AI Employee Spec is the canonical future role model; it references workflows/tools rather than replacing WIR.
3. Execution and agent runtimes are adapters, not the source of truth.
4. Deterministic-first, agentic-where-necessary.
5. Responsibility is not permission; tool authority is independently enforced.
6. High-impact side effects require explicit policy; R3 requires human approval.
7. Raw secrets are never embedded in WIR, role specs, or prompts.
8. Every workflow run is attributable to a workspace and workflow version.
9. Every future AI Employee task is attributable to a workspace and exact RoleVersion.
10. Memory is explicit, typed, and workspace-scoped.
11. Failures are resolvable states, not hidden log lines.
12. Scale infrastructure is introduced only when measured triggers justify it.
13. Multi-agent collaboration is deferred until a single governed role proves value.

## Deferred choices

The repository intentionally does not preselect a frontend framework, API framework, ORM, cloud provider, Kubernetes architecture, multi-region design, final long-term execution engine, or final agent runtime/model provider unless an ADR explicitly resolves it.
