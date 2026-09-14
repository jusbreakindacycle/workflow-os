# Phase 4.0–4.1 Acceptance Criteria

## Scope

These gates cover the first Phase 4 coding increment: the provider-neutral External Action Contract and governed source-control delivery.

## Gate A — canonical external action plan

- A durable external mutation is represented by an exact canonical plan before execution.
- Plan identity is Workspace/Project scoped and binds current Project/WorkItem versions where applicable.
- Target, operation set, input/artifact hash, verification and recovery requirements are inspectable.
- Authority-bearing plan content cannot be silently edited after approval; changed intent creates a new/superseding plan.

## Gate B — authority cannot be bypassed

- R2 source-control mutation requires exact applicable Approval.
- Approval is revalidated at resolution and immediately before mutation.
- Stale Project/WorkItem/plan versions make authority unusable.
- Model output, provider output, fixture output and caller-provided request fields cannot self-approve a plan.
- Read-only R0 inspection remains separable from R2 mutation.

## Gate C — uncertain side effects are safe

- A timeout/transport failure may be classified as `uncertain` rather than automatically `failed`.
- An uncertain mutation blocks another mutation attempt until external state is reconciled.
- Reconciliation classifies the effect as confirmed, not applied, drifted or still uncertain.
- Blind retry of an uncertain consequential mutation is impossible through the supported domain/API path.

## Gate D — source-control plan is exact

Before remote mutation, the plan binds:

- exact repository target;
- exact base ref and resolved base commit;
- non-default delivery branch;
- verified local artifact manifest/content hash;
- commit content/message;
- pull-request target/head/title/body;
- allowed operation set.

Changing any material field invalidates the previously approved action.

## Gate E — artifact projection is bounded

- Only files in the verified Project artifact manifest can be projected remotely.
- Path/symlink escape remains impossible.
- Workflow OS database/state files and unrelated host files are excluded.
- Reusable secret material is rejected.
- The projected remote tree/content hash is reproducible.

## Gate F — branch/commit/PR safety

- Phase 4.1 refuses direct writes to the default/protected branch.
- No force push or history rewrite exists in the certified path.
- Unexpected existing branch changes cause drift/blocking rather than overwrite.
- Re-executing the same confirmed plan does not create duplicate branches/commits/PRs.
- Equivalent existing remote results are reconciled and reused where safe.

## Gate G — provider independence

- Source-control operations use normalized adapter semantics.
- GitHub-specific IDs/payloads remain mappings/evidence, not canonical Project meaning.
- A deterministic fixture adapter proves orchestration in normal CI.
- Provider outage/unsupported behavior becomes blocked/failed/uncertain state, not false completion.

## Gate H — verification and evidence

A successful source-control delivery records observable evidence for repository identity, base ref, delivery branch, commit/tree identity, pull-request reference and available checks/status.

Remote provider success alone is insufficient; reconciliation must show external state matches the authorized plan.

## Gate I — merge remains separate

- Pull-request creation does not grant merge authority.
- Phase 4.1 exposes no implicit merge/delete/settings/secrets/release capability.
- Any future merge path must use a distinct current action/authority contract.

## Gate J — normal CI stays safe

Normal CI:

- requires no live source-control credential;
- creates no remote repository state;
- runs all Phase 1–3 regression suites;
- tests stale/cross-scope/unapproved/uncertain/adversarial paths;
- proves fixture idempotency and reconciliation semantics.

## Gate K — optional live certification

A live source-control certification, when implemented, must be separately opt-in and restricted to one exact non-production/disposable repository. It must refuse the default branch, create canonical operator-approval evidence, report every created remote reference, and perform no production deployment or paid action.

Fixture success must not be described as live-provider proof.

## Gate L — operator experience

Command Center / Needs My Attention makes it possible to understand:

- what external action is proposed;
- exact target and content/version;
- whether approval is required/current;
- whether an effect ran;
- whether the result is confirmed, drifted or uncertain;
- what evidence exists;
- what human action is required next.

No provider chat reconstruction is needed.

## Exit

Phase 4.0 is complete when the generic external-action lifecycle passes all authority/reconciliation adversarial gates with a deterministic fixture.

Phase 4.1 is complete when the source-control adapter passes the normalized contract and, for any live-certification claim, a real allowlisted non-production remote branch/commit/PR has been reconciled from provider evidence.