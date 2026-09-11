# Phase 1 Gate 4 — Work Graph, Needs My Attention, and Activity Feed

## Purpose

Turn an accepted Project Brief into a small, explainable work graph without allowing narrative or provider state to manufacture readiness.

## Implemented behavior

`Phase1ControlPlane.ensureInitialWorkGraph()` creates the minimum synthetic graph required for the Phase 1 golden path. For normal strategies it creates:

1. confirm accepted outcome and constraints;
2. prepare the delivery plan;
3. prepare the verification path.

The latter two depend on their predecessors. A `defer` strategy instead creates a single review/decision item rather than pretending delivery work should begin.

`getWorkGraph()` derives eligibility from canonical state. A WorkItem is next-ready only when:

- its canonical status is `ready`;
- every dependency is `complete`;
- it has no unverified active Assignment;
- it has no pending Approval bound to that WorkItem.

`refreshDerivedReadiness()` moves dependency-satisfied draft work to `ready`; it does not use model narration or confidence scores.

## Operator read models

`getNeedsAttention()` derives operator attention from unresolved source records including open Decisions, requested Approvals, proposed WorkItems, blocked/failed/stale work, pending revision impact, repository proposals, spend requests, and failed/blocked Assignments.

`getActivityFeed()` reads from `project_events`; Activity is not a second canonical state store.

The local Command Center renders these read models directly.

## Authority rule

A `WorkItemProposal` is never automatically converted into a canonical WorkItem. Material new work stays proposed until a later explicit decision/approval path accepts it.

## Evidence

`test/phase1-control-plane.test.js` proves dependency/readiness derivation, attention derivation, Activity events, and that a proposal does not increase the canonical WorkItem count.

## Non-goals

No generic Kanban board, Gantt chart, scheduling optimizer, agent chatroom, or PM-suite expansion is part of Gate 4.
