# System Context

## Actors

### Operator
The freelance automation practitioner who discovers processes, designs workflows, configures execution, reviews failures, and reports outcomes.

### Client approver/operator
A client-side human who may approve high-impact actions, supply business rules, or receive handoff/reporting.

### External systems
SaaS applications, APIs, databases, mail systems, file stores, messaging systems, browser/desktop applications, AI providers, and execution engines.

## Context boundary

Workflow OS is the authoritative control plane for workflow intent, policy, versions, tests, deployment metadata, run metadata, and reusable templates.

It is **not** authoritative for the business records stored in external systems. It should store only the workflow metadata and execution evidence needed to operate safely.

## Core components

1. **Discovery/Briefing** — converts process information into a structured Workflow Brief.
2. **Feasibility/Risk** — scores whether and how the process should be automated.
3. **Workflow Registry** — stores WIR and immutable published versions.
4. **Policy Engine** — resolves action risk, approvals, allowed tools, and execution budgets.
5. **Engine Router/Adapter Layer** — translates portable intent into an execution target.
6. **Test/Evaluation Layer** — validates deterministic and AI behavior before production.
7. **Run Ledger** — records normalized execution state and events.
8. **Approval Layer** — represents human decisions as explicit workflow state.
9. **Observability/Recovery** — surfaces failures and supports safe replay/reconciliation.
10. **Template/ROI Layer** — preserves reusable process knowledge and measured outcomes.

## Trust boundaries

Treat every external execution engine, connector, webhook sender, AI provider, and third-party API as a separate trust boundary. Inputs and outputs must be validated and policies applied at the Workflow OS boundary.
