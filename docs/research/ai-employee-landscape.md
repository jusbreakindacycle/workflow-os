# AI Employee / Digital Workforce Landscape

## Purpose

This research informs the Workflow OS AI Employee model. It does not mean Workflow OS should copy a vendor's terminology or architecture.

## Market pattern

Current enterprise products increasingly combine:

- AI agents for ambiguous/contextual work;
- deterministic automations/robots for structured execution;
- reusable skills/tools;
- scoped identity/permissions;
- human supervision/approvals;
- observability/audit;
- central orchestration.

This supports Workflow OS's decision to make AI Employees **participants inside an orchestration/control plane**, not standalone unrestricted agents.

## UiPath

UiPath distinguishes agents from robots:

- agents handle dynamic/contextual reasoning;
- robots handle structured/repetitive execution;
- orchestration coordinates agents, robots, people, and systems.

UiPath Agent components include prompt, context, tools, and escalation.

**Lesson for Workflow OS:** role intelligence and deterministic execution are different capabilities. Keep both and orchestrate them.

## Workato

Workato Agent Studio represents agents as governed assets with:

- purpose;
- skills;
- organizational context;
- authenticated actions;
- approvals;
- auditability;
- reusable workflows.

**Lesson:** reusable Skills and verified identity are useful product abstractions, but Workflow OS should keep Skills backed by explicit workflows/tools rather than creating opaque capabilities.

## Microsoft Copilot Studio

Microsoft guidance for autonomous agents emphasizes:

- narrow goals/scope;
- least-privileged permissions;
- staged testing;
- human oversight for sensitive actions;
- monitoring and iterative expansion.

Microsoft also warns that model-triggered human supervision is probabilistic and should not be treated as a guaranteed fail-safe.

**Lesson:** Workflow OS approval requirements must be deterministic policy outside the model, not something the model merely decides to request.

## Salesforce

Salesforce markets AI agents as “digital labor” or a digital workforce capable of acting across multi-step work.

**Lesson:** “AI Employee” can be a useful business-facing frame, but the engineering layer still needs role boundaries, process ownership, permissions, and outcome measurement.

## Strategic differentiation for Workflow OS

Workflow OS should not compete by claiming:

> “Our AI employee is more human-like.”

Instead:

> “Workflow OS turns a business role into the right combination of workflows, AI, tools, and human controls, then measures and governs the outcome.”

## Design implications adopted

1. AI Employee is a **role abstraction**, not a single runtime process.
2. Deterministic workflows remain the default for predictable work.
3. Agent reasoning is a bounded component.
4. Every role has explicit tools, context, authority, and escalation.
5. Human approval is policy-driven.
6. Role autonomy increases through staged evidence.
7. Task sessions are bounded.
8. Identity and audit attribution are explicit.
9. Multi-agent collaboration is deferred until single-role operation is proven.
10. ROI is measured by business outcomes, not “agent activity.”

## Primary sources

- UiPath Agents: https://docs.uipath.com/agents/automation-cloud/latest/user-guide/about-uipath-agents
- UiPath Business Orchestration: https://www.uipath.com/platform/agentic-automation/business-orchestration
- Workato Agent Studio: https://docs.workato.com/agentic/agent-studio
- Workato Agent Studio product page: https://www.workato.com/agentstudio
- Microsoft autonomous-agent guidance: https://learn.microsoft.com/en-us/microsoft-copilot-studio/guidance/autonomous-agents
- Microsoft human supervision guidance: https://learn.microsoft.com/en-us/microsoft-copilot-studio/human-supervision-computer-use
- Salesforce Digital Labor: https://www.salesforce.com/agentforce/digital-labor/

Re-check product behavior and feature availability when implementation begins.
