# ADR-001: Build a Control Plane, Not a Universal Execution Engine

**Status:** Accepted

## Context

Existing platforms already solve connector execution, scheduling, worker queues, RPA, BPMN, durable workflows, or agent runtimes. Reimplementing all execution modes would turn the project into several infrastructure products before it solves the freelance operating problem.

## Decision

Workflow OS owns the engineering/control layer and delegates runtime execution through adapters.

## Consequences

### Positive
- smaller MVP
- portable business-process knowledge
- reuse of mature connectors/runtime capabilities
- ability to select different engines per future workflow class
- lower operational burden

### Negative
- adapter complexity
- imperfect semantic portability
- dependency on execution-engine APIs/capabilities

## Guardrail

No work should create a second general-purpose executor inside Workflow OS unless a later ADR proves that an existing engine cannot satisfy a measured requirement.
