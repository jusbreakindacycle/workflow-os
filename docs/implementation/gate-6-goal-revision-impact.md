# Phase 1 Gate 6 — Goal Revision and Impact Propagation

## Purpose

A material change to an accepted goal must create new canonical history and invalidate only work whose basis actually changed.

## Implemented flow

`Phase1ControlPlane.reviseProjectGoal()`:

1. appends a new accepted `ProjectBrief` version through the canonical Gate 2 versioning path;
2. preserves the old Brief as `superseded` rather than rewriting it;
3. records the corresponding `ProjectRevision`;
4. receives an explicit affected WorkItem set, or conservatively treats all active work as affected when no set is supplied;
5. marks affected WorkItems `stale` and increments their versions;
6. supersedes affected queued/running Assignments;
7. supersedes affected requested/approved WorkItem approvals;
8. marks the current Project Pack stale;
9. records applied impact containing both affected and unaffected WorkItem IDs.

Unrelated work stays valid when its basis is unchanged.

## Why the affected set is explicit in Phase 1

Phase 1 has no AI impact-analysis engine. The point of this gate is to prove the version/invalidation semantics without pretending a heuristic or model can safely infer all impacts. A later reasoning layer may propose the affected set, but canonical application remains deterministic and auditable.

## Safety property

An Assignment created against an earlier WorkItem version cannot silently continue after that WorkItem becomes stale. Historical evidence remains tied to the version that produced it.

## Evidence

`test/phase1-control-plane.test.js` revises an accepted synthetic goal while one WorkItem has an approved gate and a running Assignment. The test proves that the affected WorkItem, Approval, Assignment, and Project Pack become stale/superseded while explicitly unaffected work keeps its previous state.

## Non-goals

No semantic AI impact analysis, automatic commercial repricing, or automatic client acceptance is introduced here.
