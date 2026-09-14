# Phase 4.0 Implementation Report

## Status

**Complete for the deterministic provider-neutral external-action fixture path.**

Phase 4.0 implements the generic governed boundary required before Workflow OS may add real shared/external delivery adapters. It does not itself authorize or certify GitHub, deployment, production, communication, credential mutation, or arbitrary network activity.

## Implemented contract

The implemented external-action lifecycle is:

```text
accepted Project / WorkItem
  -> exact ExternalActionPlan
  -> applicable Approval / SpendEnvelope
  -> deterministic preflight
  -> use-time authority revalidation
  -> bounded adapter attempt
  -> read-after-write reconciliation
  -> L3 evidence
  -> verified / complete / retry / block / escalate
```

Implemented capabilities include:

- canonical Workspace/Project/WorkItem-bound external action plans;
- exact plan version, Project version and WorkItem version capture;
- deterministic plan/input/target hashing and idempotency keys;
- immutable authority-bearing plan intent enforced by current-content re-hashing;
- exact approval bounds for plan id/version/hash, idempotency key, adapter/action, target hash, action class and risk tier;
- resolve-time and use-time authority freshness checks;
- optional SpendEnvelope validation;
- explicit provider attempts with normalized `succeeded`, `failed`, and `uncertain` outcomes;
- reconciliation classifications: `confirmed`, `not_applied`, `drifted`, and `uncertain`;
- reconciliation-before-retry enforcement;
- bounded attempt budget;
- L3 reconciliation evidence;
- canonical provider-resource mappings after confirmed effects;
- Command Center / Needs My Attention visibility for proposed, blocked, failed and uncertain actions;
- provider-neutral HTTP/domain APIs for Phase 4.1 to consume;
- deterministic fixture adapter with no real external side effects.

## Adversarial coverage

The Phase 4.0 test suite proves that the supported domain/API path fails closed when:

- a durable external mutation has no approval;
- an approved WorkItem version becomes stale;
- another Project's WorkItem is supplied;
- authority-bearing plan content is modified after approval;
- an uncertain mutation has not yet been reconciled;
- the bounded external-attempt budget is exhausted.

It also proves both uncertain outcomes that matter for retry safety:

1. **effect was applied** — reconciliation confirms the existing effect and no duplicate mutation is attempted;
2. **effect was not applied** — reconciliation returns the plan to an authorized retryable state before another attempt may begin.

## Certification evidence

The merge-candidate CI run on the Phase 4.0 branch passed:

- source checks;
- **91/91 tests**;
- **15 migrations**;
- migration and backup commands;
- the existing Phase 3.5 local golden-path certification;
- the dedicated `npm run phase40:certify` gate;
- live-provider opt-in safety checks.

The Phase 4.0 certification reported:

```text
phase: phase-4.0
passed: true
provider: fixture
realExternalSideEffects: false
planStatus: complete
attemptCount: 1
reconciliation: confirmed
mappingCount: 1
approvalBound: true
evidenceLevel: L3
```

This is intentionally fixture evidence. It proves the generic authority/reconciliation substrate, not a real provider integration.

## Approval-subject implementation note

The current Phase 2.2 SQLite approval-subject registry predates `ExternalActionPlan`. Phase 4.0 therefore uses an exact version-bound WorkItem Approval as the registered subject while binding the external action itself in immutable approval bounds.

Before execution, Workflow OS revalidates:

- current Project version;
- current WorkItem version;
- approval status and subject version;
- exact external action plan id/version/hash;
- idempotency key;
- adapter/action;
- target hash;
- action class and risk tier;
- current plan-content hash;
- applicable SpendEnvelope.

This does **not** create open-ended WorkItem authority. Any material plan change invalidates the approved action. A later migration may register `external_action_plan` as a first-class Approval subject, but Phase 4.1 must not wait on that refactor or weaken the current exact-bound checks.

## Explicit non-claims

Phase 4.0 does not prove or authorize:

- real GitHub branch/commit/pull-request mutation;
- merge, force push, repository settings, permissions, secrets or releases;
- deployment or production mutation;
- external messaging;
- real client/customer data;
- arbitrary provider credentials;
- unattended background execution;
- paid external actions without an applicable SpendEnvelope.

## Next phase

**Phase 4.1 — Governed Source Control** is next.

It must consume the Phase 4.0 contract rather than bypass it. The first narrow path is:

```text
verified local artifact
  -> inspect exact repository/base
  -> compile exact source-control ExternalActionPlan
  -> operator R2 authority
  -> create non-default branch
  -> project exact verified artifact tree/commit
  -> open exact pull request
  -> read remote state/checks
  -> reconcile provider evidence
```

Normal CI remains credential-free. Any live GitHub certification must be separately opt-in and restricted to an exact disposable/non-production repository.
