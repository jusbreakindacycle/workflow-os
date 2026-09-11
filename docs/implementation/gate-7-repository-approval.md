# Phase 1 Gate 7 — Optional Repository Approval

## Purpose

Prove that a source repository is a strategy-dependent external resource, not an automatic side effect of every Project.

## Strategy rule

Phase 1 allows a RepositoryProposal only for the synthetic strategies that can reasonably require a code repository:

- `custom_build`;
- `hybrid`.

A Project using `process_change`, `adopt_existing`, `configure`, `integrate`, `automate`, `research_pilot`, or `defer` is not forced through repository creation merely because Workflow OS is capable of software delivery.

## Approval flow

```text
accepted strategy
  -> RepositoryProposal
  -> Approval requested
  -> operator approves/rejects
  -> mock repository result only when approved
```

Approval is bound to the exact RepositoryProposal/Brief version and desired visibility.

## Phase 1 adapter behavior

`executeMockRepository()` never calls GitHub, GitLab, Bitbucket, or another source-control provider. It creates a deterministic-looking local evidence record with a `mock://repository/...` reference so the approval/authority semantics can be tested without provider lock-in or an external side effect.

The local UI exposes this proposal/approval path only after accepting a `custom_build` or `hybrid` Project.

## Evidence

`test/phase1-control-plane.test.js` proves:

- mock execution fails before approval;
- approved custom-build repository proposal can create the mock result;
- an `adopt_existing` Project cannot invent a repository requirement.

## Non-goals

No real repository API, OAuth token, SSH key, branch protection, CI provisioning, or deployment resource is created in Phase 1.
