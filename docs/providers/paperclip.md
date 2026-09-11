# Paperclip Candidate

**Decision:** candidate Internal Workforce Adapter; not selected dependency.

## Why it is interesting

Paperclip may provide agent/company organization, worker lifecycle/heartbeats, task checkout, coding-runtime adapters, sessions, costs/budgets, reviews, secrets, workspaces/worktrees, audit, and detailed workforce UI.

Workflow OS should avoid rebuilding those mechanics until real evidence says the provider cannot satisfy our boundary.

## What Paperclip must never own

- Workspace/client meaning;
- Engagement/Project lifecycle;
- canonical WorkItem graph/acceptance;
- Project Pack;
- business/commercial/risk approval;
- final completion;
- cross-provider evidence;
- deployment/incident/maintenance truth.

## Core evaluation gates

1. reproducible pinned install/recovery;
2. supported documented API contract;
3. tenant **and control-credential** isolation using two synthetic Workspaces;
4. bounded worker execution with logs/artifacts/costs/cancel;
5. provider `done` -> `execution_finished`, never canonical completion;
6. provider-local child work vs WorkItem Proposal behavior;
7. drift/manual provider edit detection;
8. idempotent event/cost reconciliation;
9. secret/grant/redaction behavior;
10. outage/restart recovery;
11. version compatibility detection.

## Advanced parallel gates

Only after core pass:

- isolated worktree/workspace behavior;
- dependency/integration correctness;
- intentional collision/conflict test;
- independent verification after integration.

Failure of advanced gates may still allow sequential/core use.

## Timing

Do not integrate Paperclip in Phase 1. Evaluate after the canonical control plane and Assignment/Project Pack contracts exist.
