# AI Employees in Workflow OS

## Positioning

An **AI Employee** is a business-facing abstraction for a governed digital worker that performs a defined role through Workflow OS.

It is **not** the Workflow OS itself, and it is not synonymous with an LLM or agent runtime.

```text
Workflow OS
  ├─ deterministic workflows
  ├─ AI-assisted steps
  ├─ AI Employees / governed agents
  ├─ human tasks and approvals
  ├─ tools and integrations
  └─ policy, testing, observability, recovery, ROI
```

## Core definition

An AI Employee is a versioned role specification that defines:

- purpose and measurable outcomes;
- responsibilities and explicit non-responsibilities;
- allowed workflows, skills, tools, and knowledge;
- authority and approval requirements;
- identity/delegation model;
- context and memory policy;
- execution/autonomy limits;
- escalation paths;
- evaluation requirements;
- observability and ROI measures;
- deployment lifecycle.

At runtime, Workflow OS creates **bounded task sessions** for the AI Employee. The role does not run as an unconstrained infinite process.

## Why this belongs inside Workflow OS

Business work is mixed:

- some tasks are fully deterministic;
- some require semantic AI transformations;
- some require dynamic reasoning;
- some require a human;
- some should not be automated.

An “AI Employee” should therefore orchestrate or participate in existing workflows rather than replace workflow engineering.

## Design principle

> Give AI a role, not unrestricted authority.

A role expresses what the digital worker is responsible for. Workflow OS still owns:

- process state;
- authorization;
- approvals;
- execution budgets;
- workflow versions;
- recovery;
- auditability;
- client/workspace isolation.

## Phase placement

AI Employees are a **Phase 3 capability**.

Phase 1 MVP remains unchanged. Phase 1 proves deterministic workflow control, one execution adapter, run normalization, reliability, and approval foundations first.

## Example

```text
AI Employee: Accounts Receivable Assistant

Role goal:
Reduce overdue receivables without making unauthorized financial commitments.

Responsibilities:
- review overdue invoices
- classify follow-up priority
- draft reminders
- send approved/low-risk reminders
- escalate disputes

Uses:
- deterministic invoice workflow
- customer lookup tool
- drafting AI transform
- approved messaging action

Cannot:
- change invoice amount
- waive debt
- issue refunds
- move funds
- sign legal agreements
```

The business sees one “AI Employee.” Underneath, Workflow OS may use mostly deterministic workflows with only a small amount of agentic reasoning.
