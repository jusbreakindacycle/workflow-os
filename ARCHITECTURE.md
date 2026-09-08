# Architecture

## Architectural thesis

Workflow OS is a **personal automation engineering control plane**, not a universal workflow execution engine.

> Model once, execute through the right engine, govern everything from one place.

The control plane owns business-process discovery, a canonical workflow representation, policy, tests, versioning, deployment metadata, run visibility, reusable templates, and ROI reporting. Actual runtime execution is delegated through adapters.

## Logical lifecycle

```text
Business intent
  -> Workflow Brief
  -> Feasibility + Risk Assessment
  -> Workflow IR (WIR)
  -> Static Validation
  -> Execution-Engine Selection
  -> Test / Dry Run
  -> Deploy
  -> Execute
  -> Observe / Approve / Recover
  -> Measure
  -> Template / Improve
```

## Control plane responsibilities

- workspaces/clients
- workflow briefs
- WIR definitions and immutable published versions
- connector/tool metadata
- policy and approval rules
- tests and AI evaluations
- deployments
- run/event metadata
- reusable templates
- observability views
- ROI/time-saved records
- documentation/handoff artifacts

## Execution plane

Candidate execution classes include low-code API automation, Microsoft automation/RPA, durable workflow runtimes, BPMN/process orchestrators, agent runtimes, and isolated custom functions. The MVP uses exactly **one primary execution adapter**.

## Tool/connectivity plane

MCP, webhooks, OpenAPI-derived actions, and native connectors expose capabilities. MCP is a tool-access layer, not Workflow OS's canonical business-process state machine.

## Architectural invariants

1. WIR is the canonical portable workflow model.
2. Execution engines are adapters, not the source of truth.
3. Deterministic-first, agentic-where-necessary.
4. High-impact side effects require explicit policy; the highest-risk class requires human approval.
5. Raw secrets are never embedded in WIR or prompts.
6. Every run is attributable to a workspace and workflow version.
7. Failures are resolvable states, not hidden log lines.
8. Scale infrastructure is introduced only when measured triggers justify it.

## Deferred choices

Phase 0 intentionally does not select a frontend framework, API framework, ORM, cloud provider, Kubernetes architecture, multi-region design, or final execution engine unless an ADR explicitly resolves it.
