# Internal Workforce

## Concept

Every Project can have a complete **logical delivery roster**, while the system dynamically activates only the capabilities needed for ready work.

This satisfies the operator's desire for a full team without turning every simple Project into an expensive multi-agent simulation.

## Logical roster

Typical capability roles:

1. Intake / Problem Analyst
2. Research Analyst
3. Product / Requirements Analyst
4. UX / Product Design Worker
5. Solution Architect
6. Planner / Orchestrator
7. Frontend / Web Worker
8. Backend / API Worker
9. Mobile Worker
10. Database / Data Worker
11. Automation / Integration Worker
12. QA / Verification Worker
13. Security / Reliability Reviewer
14. Adversarial Reviewer
15. Deployment / Operations Worker
16. Incident / Maintenance Worker
17. Documentation / Handoff Worker

A role is a capability/authority profile, not a guarantee of a separate model process.

## Dynamic activation

The Planner derives ready WorkItems, then determines whether separation improves expertise/context, permissions, independent verification, parallelism, design responsibility, or security/risk isolation.

One capable worker may handle several low-risk sequential WorkItems. Material verification should prefer an independent verifier.

## Orchestration

```text
canonical Project state
  -> ready WorkItem
  -> role/skills
  -> Context Slice + bounded Assignment
  -> Broker route
  -> execution
  -> artifacts/evidence/proposals
  -> verification/reconciliation
  -> canonical transition
```

Agents do not transfer authority by chatting with each other. Handoffs use durable artifacts/state references.

## In-scope autonomy

A worker may decompose and continue small in-scope details when its Assignment permits it. It escalates material scope, price/deadline, architecture, risk, production authority, credentials, or spend changes.

## Parallelism

Parallel execution requires independent ready WorkItems and safe mutable-resource isolation. Otherwise run sequentially.

## Client-facing AI roles

Client-facing AI Employees/Workers are future deliverables and are not the operator's internal workforce. Shared runtime infrastructure does not imply shared authority semantics.
