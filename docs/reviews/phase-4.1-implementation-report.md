# Phase 4.1 — Governed Source Control Implementation Report

## Status

**Implemented and fixture-certified for the normalized governed source-control path.**

The first GitHub adapter implementation is present behind the normalized adapter boundary, but **no live GitHub mutation certification is claimed** in this report. Any real-provider certification remains a separate explicit opt-in action against one exact disposable/non-production repository.

## What Phase 4.1 proves

Phase 4.1 extends the Phase 4.0 external-action contract with one deliberately narrow source-control delivery bundle:

```text
verified governed local artifact
  -> exact source-control delivery plan
  -> exact current R2 authority
  -> remote repository/base preflight
  -> one non-default delivery branch
  -> one exact commit/tree from the verified artifact manifest
  -> one exact pull request
  -> branch/commit/PR/check read-back
  -> external reconciliation evidence
  -> canonical completion / retry / block / escalation
```

The source-control provider executes the approved effect. It does not become canonical Project truth and it does not create authority.

## Canonical state

Migration `0016_phase41_source_control_delivery.sql` adds `source_control_delivery_plans`.

Each source-control plan binds at least:

- Workspace, Project and WorkItem;
- exact Phase 4.0 `ExternalActionPlan`;
- provider and repository identity;
- exact base ref and base commit;
- exact non-default delivery branch;
- governed execution-workspace identity;
- exact verified artifact manifest and manifest hash;
- deterministic projected-tree hash;
- exact commit message;
- exact pull-request title/body/base/head;
- allowed source-control operation set;
- checks policy;
- bounded lifecycle status.

One active source-control plan may own a provider/repository/delivery-branch tuple at a time. Completed/rejected/superseded/failed records remain historical evidence.

## Artifact boundary

Phase 4.1 does not grant workers arbitrary repository contents or arbitrary filesystem access.

The source-control projection is compiled from the current governed execution-workspace manifest only after the Project has independent L3-or-higher verification evidence. Immediately before mutation Workflow OS re-reads the manifest and every manifest-listed file and checks size/SHA-256 again.

A changed manifest or changed file after approval blocks the action before a provider attempt.

The initial certified projection supports text artifacts only. Binary artifacts fail closed rather than being silently re-encoded or omitted.

## Authority

The source-control bundle is an R2 durable shared/external mutation and consumes the Phase 4.0 exact authority boundary.

The approved bundle fixes the repository, base ref/commit, delivery branch, artifact manifest/hash, commit message, pull-request metadata, action class, risk tier and allowed operation set before execution.

Changing a material field requires a new plan/authority decision. Provider capability does not widen that authority.

## Provider-neutral fixture

`FixtureSourceControlAdapter` implements the normalized semantics without a real remote provider. It supports deterministic:

- repository/default-branch inspection;
- exact base-ref resolution;
- branch + commit + pull-request creation;
- read-after-write reconciliation;
- uncertain-applied behavior;
- uncertain-not-applied behavior;
- drift behavior;
- fixture check evidence.

Normal CI uses this path and creates no real remote repository state.

## GitHub adapter implementation

`GitHubSourceControlAdapter` is the first real provider implementation.

Its current bounded capabilities are:

- repository metadata read;
- branch/ref read;
- non-default branch creation;
- blob/tree/commit creation through GitHub Git Data APIs;
- non-force delivery-branch update;
- pull-request creation/read;
- commit status/check-run read;
- remote tree/blob read-back and SHA-256 reconciliation.

The credential is referenced through `WORKFLOW_OS_GITHUB_TOKEN`. The token itself is not persisted into canonical Project state.

The adapter intentionally exposes no merge, force-push, repository-settings, secrets, ruleset, release, deletion, deployment or messaging operation.

## Uncertain / partial mutation handling

A consequential provider call is never blindly retried merely because the caller did not receive a clean response.

GitHub execution tracks whether an earlier mutation in the bundle has already succeeded. If a later provider operation fails after mutation began, the result is treated as reconciliation-required uncertainty rather than as a known clean failure.

Canonical flow:

```text
partial/uncertain provider outcome
  -> stop new mutation
  -> inspect remote branch/commit/PR/tree
  -> classify confirmed / not applied / drifted / still uncertain
  -> only then complete / retry / block / escalate
```

The fixture tests prove both critical uncertainty branches:

1. effect already applied -> reconcile the existing result; do not create a duplicate attempt/effect;
2. effect not applied -> reconcile first, return to authorized state, then allow one bounded retry.

## Remote reconciliation

For the GitHub implementation, provider HTTP success alone is not completion evidence.

The adapter is designed to read back and compare:

- repository identity;
- default branch;
- exact delivery branch;
- exact commit identity;
- commit parent against the approved base commit;
- exact commit message;
- remote tree file set;
- per-file byte size and SHA-256 content hash;
- exact pull-request title/body/base/head;
- status/check evidence when available/required.

Drift blocks completion. When checks are explicitly required but unavailable, pending or failing, the action remains uncertain rather than being described as verified.

## HTTP boundary

Phase 4.1 exposes bounded local control-plane endpoints for:

- plan compilation;
- plan inspection;
- authority request;
- authority resolution;
- execution;
- reconciliation.

Provider selection is restricted to the known `fixture` or `github` adapters. There is no API route for merge, deletion, settings, secrets, releases or deployment.

## Adversarial coverage

The Phase 4.1 test suite covers:

- exact branch/commit/PR happy path;
- completed-plan idempotency;
- uncertain applied effect without duplicate mutation;
- uncertain not-applied effect before bounded retry;
- artifact drift after approval;
- base-commit drift;
- default-branch refusal even when the requested base ref differs;
- missing GitHub credential binding;
- GitHub rate/quota normalization;
- GitHub partial mutation followed by provider failure;
- pre-mutation base validation failure.

Phase 1–4.0 regression suites continue to run unchanged.

## Certification evidence

Merge-candidate CI on the implementation branch passed:

- **102/102 tests**;
- **16 migrations**;
- database migrate + backup commands;
- Phase 3.5 local delivery certification;
- Phase 4.0 external-action certification;
- Phase 4.1 governed source-control fixture certification;
- live-provider opt-in guards.

`npm run phase41:certify` reported:

- `passed: true`;
- provider: `fixture`;
- `realExternalSideEffects: false`;
- repository: `fixture/phase41-certification`;
- base ref: `main`;
- delivery branch: `workflow-os/phase41-certification`;
- artifact count: `2`;
- plan status: `complete`;
- attempt count: `1`;
- reconciliation: `confirmed`;
- mapping count: `1`;
- approval bound: `true`;
- merge authority: `false`;
- evidence level: `L3`.

## What this does not prove

Phase 4.1 does **not** yet prove a live GitHub branch/commit/pull-request mutation because that certification has not been explicitly authorized and run.

It also does not certify:

- pull-request merge;
- force push/history rewrite;
- deletion of branches/tags/releases;
- repository settings, permissions, secrets or rulesets;
- deployment/hosting;
- package publication;
- production effects;
- client/public messaging;
- arbitrary git/shell access;
- unattended always-on execution.

## Exit / next direction

The provider-neutral Phase 4.1 semantics and GitHub implementation are ready for merge once the final documentation-closed CI head is green.

After merge, the roadmap remains evidence-driven. Phase 4.2 deployment is the planned next adapter class, but it should start only when a concrete Project/delivery need justifies one deployment provider and its exact staging/production/rollback authority model. A separate GitHub live certification may be run earlier only with explicit operator authorization and one exact disposable/non-production repository.