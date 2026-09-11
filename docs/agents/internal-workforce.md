# Internal Workforce

## Concept

Every Project can have a complete **logical delivery roster**, while the system dynamically activates only the capabilities needed for ready work.

This satisfies the operator's desire for a full team without turning every simple Project into an expensive multi-agent simulation.

## Logical roster

Typical capability roles:

1. Intake / Problem Analyst
2. Research Analyst
3. Product / Requirements Analyst
4. Solution Architect
5. Planner / Orchestrator
6. Frontend / Web Worker
7. Backend / API Worker
8. Mobile Worker
9. Database / Data Worker
10. Automation / Integration Worker
11. QA / Verification Worker
12. Security / Reliability Reviewer
13. Adversarial Reviewer
14. Deployment / Operations Worker
15. Incident / Maintenance Worker
16. Documentation / Handoff Worker

A role is a capability/authority profile, not a guarantee of a separate model process.

## Dynamic activation

The Planner derives ready WorkItems, then determines whether separation improves:

- expertise/context;
- permissions;
- independence of verification;
- parallelism;
- security/risk isolation.

One capable worker may handle several low-risk sequential WorkItems. Material verification should prefer an independent verifier.

## Orchestration

```text
canonical Project state
  -> ready WorkItem
  -> required role/skills
  -> Broker route
  -> bounded AgentAssignment
  -> execution
  -> artifacts/evidence/proposals
  -> verification/reconciliation
  -> canonical transition
```

Agents do not transfer authority by chatting with each other. Handoffs use durable artifacts/state references.

## In-scope autonomy

A worker may decompose and continue small in-scope implementation details when its Assignment permits it.

It must propose/escalate material changes to scope, price/deadline implications, architecture, risk, production authority, credentials, or spend.

## Parallelism

Parallel execution requires independent ready WorkItems and safe mutable-resource isolation. Otherwise run sequentially.

## Client-facing AI roles

Client-facing AI Employees/Workers are future deliverables and are not the same as the operator's internal workforce. Shared runtime infrastructure does not imply shared authority semantics.
