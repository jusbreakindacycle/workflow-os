# Phase 4.1 — Governed Source Control Implementation Plan

## Objective

Take a verified local Project artifact and produce a bounded shared-remote source-control delivery result without granting a worker unrestricted Git/provider authority.

The first real provider implementation is GitHub behind the provider-neutral Source Control Adapter contract.

## Preconditions

Phase 4.1 starts only after Phase 4.0 supplies canonical external-action authority/reconciliation primitives.

The Project must have:

- accepted current Project Brief;
- current strategy-specific Work Graph;
- verified local artifact snapshot/manifest;
- exact target repository/base-ref intent;
- current ExternalActionPlan;
- applicable R2 authority before mutation.

## Adapter structure

Add a provider-neutral source-control adapter interface under the existing adapter/runtime architecture.

The implementation should separate:

1. canonical source-control delivery planning;
2. provider-independent adapter contract;
3. deterministic fixture adapter for CI;
4. GitHub-specific transport/mapping implementation;
5. reconciliation/verification back into canonical Phase 4 state.

Do not place GitHub schemas in Project/WorkItem meaning.

## Initial write path

The certified write path is only:

```text
inspect target/base
 -> create bounded delivery branch
 -> project verified local artifact to exact tree/commit
 -> open exact pull request
 -> read back branch/commit/PR/check state
 -> reconcile
```

The implementation must not expose merge, force push, branch deletion, settings, visibility, permission, secret, release, tag or deployment writes through the certified Phase 4.1 path.

## Plan compiler

Compile the source-control projection from current canonical state and the verified artifact manifest.

The projection binds:

- exact repository target;
- exact base ref and observed base commit;
- deterministic non-default branch name;
- local artifact manifest/hash;
- exact file projection/tree hash;
- commit message;
- PR base/head/title/body;
- allowed operations;
- verification/check policy;
- idempotency identity;
- stop/escalation conditions.

The plan compiler is deterministic for the same canonical versions and configuration.

## Local artifact boundary

Source-control projection reads only the governed Project artifact manifest. It must preserve Phase 3 path/symlink isolation and cannot sweep the operator machine or Workflow OS repository/state unless that exact artifact is intentionally the Project being delivered.

## GitHub implementation

The first provider implementation may use GitHub APIs or another bounded transport, but must expose normalized contract results.

Provider configuration stores references to local operator configuration rather than reusable secret values in canonical state.

Normalized errors must distinguish at least:

- authentication unavailable;
- permission/scope denied;
- repository/ref not found;
- base drift;
- branch collision/drift;
- provider rate/quota limit;
- validation failure;
- transport failure with known no-effect;
- uncertain transport outcome;
- provider outage.

## Idempotency

Re-running an already confirmed plan must reconcile and return the existing branch/commit/PR rather than duplicate external state.

If a network result is uncertain, inspect provider state before another write.

If an existing branch or PR does not match the approved plan, classify drift and stop instead of overwriting it.

## Pull-request checks

The adapter reads available checks/statuses as evidence. Phase 4.1 does not invent success when a provider exposes no applicable check system.

A PR existing successfully is source-control delivery evidence, not automatic Project acceptance and not merge authority.

## API / operator experience

Expose enough API/Command Center state to let the operator:

- inspect the exact proposed remote action;
- approve/reject it;
- see the repository/base/branch/artifact/PR content being authorized;
- execute after authority exists;
- see reconciliation/check results;
- see drift/uncertainty/blockers;
- obtain the remote PR reference for review.

The operator should not need provider-chat archaeology.

## Normal CI

Add a deterministic source-control fixture/fake adapter. Normal CI must create zero remote side effects and require no live provider configuration.

Tests cover:

- deterministic plan compilation;
- current authority enforcement;
- stale base rejection;
- local artifact hash drift rejection;
- branch collision behavior;
- exact tree/commit identity;
- duplicate-safe PR behavior;
- uncertain write reconciliation;
- provider error normalization;
- no default-branch/merge path;
- Phase 1–3 regression preservation.

## Optional live GitHub certification

After fixture CI is green, add a separately opt-in certification harness for one exact operator-approved non-production/disposable GitHub repository.

The harness must:

- require explicit operator opt-in;
- restrict the target to an exact configured repository;
- bind a non-default certification branch;
- create canonical R2 approval evidence;
- use synthetic artifact/content only;
- create at most the bounded branch/commit/PR defined by the plan;
- never merge the PR;
- record and print canonical + provider evidence needed for later review/cleanup;
- stop on drift/uncertainty.

Normal CI never runs this harness.

## Exit condition

Phase 4.1 is complete when fixture CI proves the full contract and a live GitHub claim, if made, is supported by an actual reconciled non-production branch/commit/PR through exact current Workflow OS authority.