# Agent Operability and Harness Contract

## Purpose

Workflow OS should not make the human operator become an AI worker's eyes, terminal, test runner, or manual context courier.

A coding/research/automation worker is useful only when the surrounding environment lets it understand the task, operate the real system, observe results, and prove what happened.

> Prefer a verifiable agent environment over a longer prompt.

## Minimum operability

For a Project/repository that is ready for autonomous implementation, an unfamiliar authorized worker should be able to determine, from durable Project/Assignment state and repository guidance:

1. the exact Project/WorkItem outcome;
2. which artifacts/contracts are authoritative;
3. how to bootstrap/install dependencies;
4. how to start required local/dev services;
5. how to know the system is ready;
6. how to reach or invoke the relevant feature/API/workflow;
7. how to inspect logs/state/errors;
8. how to run the applicable automated checks/evals;
9. how to exercise the real relevant user/business flow when required;
10. how to capture evidence;
11. how to clean up/reset test state;
12. how to stop/escalate when verification is impossible.

If the operator repeatedly has to perform these operations for the worker, the harness is incomplete.

## Repository / capability map

Generated Project/repository guidance should map, without duplicating the codebase, important modules/directories, feature locations, commands/startup/readiness checks, tests/evals, deployment/config entry points, architecture restrictions, diagnostic/log paths, cleanup/reset steps, and known failure modes.

This map is execution/navigation knowledge, not canonical Project truth.

## Verification contract

A material WorkItem defines proof in advance or during planning: action/input, expected observable result, side effects, evidence, failure signals, cleanup/recovery, and independent-review level when required.

`implemented`, `looks correct`, provider `success`, or agent confidence are never enough by themselves.

## Failure -> harness rule

Repeated failure should improve the correct layer rather than only lengthen a prompt: add tests/evals, schema/type/static guards, repository/capability maps, automated verification, narrower tool permissions, corrected canonical fixtures, or model/prompt evaluation cases as appropriate.

## Independent verifier

For material changes, prefer a verifier that did not author the implementation. It receives accepted requirements/artifacts, the candidate result, and allowed verification tools, not the implementer's private reasoning.

## Evidence bundle

A material engineering Assignment should finish with references to applicable files/commit/PR/artifact changes, tests/evals, real-flow verification, side-effect reconciliation, logs/screenshots/recordings when useful, verifier findings, known limitations, rollback/recovery notes, and exact Project/WorkItem/Project Pack/Assignment versions.

## Human-intervention metric

Repeated cases where the operator must run commands, re-send already-known context, inspect UI/logs on a worker's behalf, explain failures manually, reconcile workers, or reconstruct Project state are signals to improve the harness.

## Phase boundary

Phase 1 does not build a universal autonomous coding runtime. It must establish enough deterministic startup, state inspection, tests, and evidence handling that later provider workers can operate against a stable harness instead of chat-only instructions.
