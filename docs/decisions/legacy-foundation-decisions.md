# Legacy Foundation Decision Disposition

Foundation v3 removes duplicated historical ADR files from the active working tree, but **carried-forward decisions remain normative here**. Their original full text remains in Git history.

## Carried-forward invariants

### ADR-001 — control plane, not universal execution engine
Workflow OS owns delivery meaning/governance and delegates specialized execution through replaceable adapters. Do not build a second general-purpose executor unless a later ADR proves a measured need.

### ADR-002 — WIR canonical for business workflows
WIR is the canonical portable representation of a business workflow **inside a Project**. Provider/engine workflow definitions are derived projections. WIR does not replace Project/WorkItem/Project Pack state.

### ADR-003 — deterministic first
Use deterministic rules/workflows when stable business rules can define the action. Use bounded AI for semantic reasoning; use agents only when dynamic contextual action selection is genuinely required.

### ADR-005 — Workspace/client isolation
Workspace is the security/data-isolation boundary. Provider tenancy alone is insufficient; control credentials, context routing, logs, evidence, and local storage must preserve isolation.

### ADR-006 — evidence-driven scale
Do not add Kubernetes, multi-region, sharding, complex queues, service discovery, or similar infrastructure without measured need.

### ADR-011 — Project top-level operational unit
Project is the top-level delivery/maintenance unit. Repositories, workflows/WIR, AgentAssignments, deployments, incidents, and future client-facing AI roles exist inside/reference a Project.

### ADR-012 — internal collaboration is gated
Parallel/multi-agent work requires dependency-safe decomposition, mutable-resource isolation, explicit integration ownership, bounded assignments, and independent verification.

## Superseded / deferred

| Legacy ADR | Current disposition |
|---|---|
| ADR-004 Activepieces first MVP engine | **Superseded by ADR-019.** Activepieces remains a future candidate. |
| ADR-007–010 client-facing AI Employee contracts | **Deferred.** Re-research after internal delivery value is proven. |
| ADR-013 internal workforce adapter | **Retained as active ADR-013** with D1–D8 authority rules. |

This file prevents a shallow checkout/future worker from needing Git archaeology to recover still-active invariants.
