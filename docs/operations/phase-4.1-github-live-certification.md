# Phase 4.1 — Controlled Live GitHub Certification

## Purpose

This harness closes the gap between fixture-certified source-control semantics and actual GitHub behavior without widening Phase 4.1 authority.

It deliberately tests more than the happy path while remaining bounded to one explicitly allowlisted disposable/non-production repository.

The harness performs three cases:

1. **Successful delivery** — exact non-default branch, commit/tree, pull request, read-back and reconciliation.
2. **Idempotent re-entry** — re-executing the completed canonical plan must create no second attempt or duplicate remote effect.
3. **Real stale-base rejection** — a dedicated non-default certification base branch is advanced after approval; Workflow OS must reject the now-stale plan before any provider attempt or stale delivery branch/PR creation.

## Safety boundary

The live harness refuses to run unless all required opt-in variables are present.

It also refuses `jusbreakindacycle/workflow-os` as the target repository so Workflow OS does not certify itself by mutating its own implementation repository.

The harness never:

- writes directly to the repository default branch;
- merges a pull request;
- force-pushes;
- changes repository settings, permissions, secrets or rulesets;
- creates releases or deployments;
- deletes branches;
- stores the GitHub token in canonical Project state.

The stale-base setup mutates only a dedicated branch under `workflow-os-cert/<run-id>/drift-base`. That setup mutation exists solely to create real external drift and is reported separately from the governed delivery effect.

## Disposable repository prerequisite

Create or designate one repository used only for certification. It must:

- be non-production;
- contain no real client/customer data;
- have an initialized default branch with at least one commit;
- be writable by the local GitHub token used for the test;
- be safe to leave with temporary non-default branches and one open pull request until operator cleanup.

Do not use an active client/project repository merely because it is empty or convenient.

## Required local environment

Never commit these values.

```text
WORKFLOW_OS_ENABLE_LIVE_GITHUB_CERT=1
WORKFLOW_OS_GITHUB_CERT_CONFIRM=I_UNDERSTAND_THIS_CREATES_REMOTE_GITHUB_STATE
WORKFLOW_OS_GITHUB_CERT_REPOSITORY=<owner/disposable-repo>
WORKFLOW_OS_GITHUB_CERT_ALLOWLIST=<owner/disposable-repo>
WORKFLOW_OS_GITHUB_CERT_RUN_ID=<unique-lowercase-run-id>
WORKFLOW_OS_GITHUB_TOKEN=<local-token>
```

`WORKFLOW_OS_GITHUB_CERT_ALLOWLIST` is comma-separated, but the recommended first certification contains only the one exact target repository.

`WORKFLOW_OS_GITHUB_CERT_RUN_ID` must be unique for the run. Example: `cert-001`.

## Run

```bash
npm run phase41:github-live
```

Normal CI must **not** set these variables. CI explicitly verifies that the command fails closed when opt-in authority is absent.

## Remote state created by a successful run

The exact names are derived from the run ID:

```text
workflow-os-cert/<run-id>/delivery
workflow-os-cert/<run-id>/drift-base
workflow-os-cert/<run-id>/stale-delivery   # must NOT be created
```

The successful delivery branch contains only the verified synthetic certification artifact projected by the approved Phase 4.1 plan.

One pull request is opened from `.../delivery` to the repository default branch. The harness does not merge it.

The drift-base branch receives one harmless setup commit after stale-plan approval. The stale delivery branch and stale PR must remain absent.

## Pass criteria

The harness passes only when all of the following are true:

- target repository is explicitly allowlisted;
- target is not `workflow-os` itself;
- default branch resolves to an exact SHA;
- all certification branch names are non-default and under the approved prefix;
- successful case creates one exact branch/commit/PR path and reconciliation is `confirmed`;
- successful case uses exactly one canonical external-action attempt;
- idempotent re-entry leaves the attempt count at one and reuses the existing remote effect;
- stale-base setup advances only the dedicated non-default base branch;
- stale approved base SHA no longer equals the observed remote base SHA;
- stale plan becomes `blocked` before a provider attempt;
- stale delivery branch is absent;
- stale reconciliation classifies the external effect as `not_applied`;
- `mergeAuthority` remains false;
- default branch is never mutated by the harness.

## Evidence output

The command prints JSON containing:

- target repository and default branch;
- certification run ID;
- success delivery branch and pull-request reference;
- attempt count and reconciliation result;
- idempotent re-entry result;
- stale-base approved and observed SHAs;
- stale-plan status and provider-attempt count;
- cleanup branch list;
- explicit `mergeAuthority: false` and `defaultBranchMutationByHarness: false` markers.

Save that output as the factual basis for the live-certification report. Do not claim GitHub live certification merely because the harness exists or normal CI passes.

## Cleanup

Cleanup remains an operator action after evidence is reviewed.

The harness intentionally does not merge or delete remote state. Close the certification pull request if desired, then manually delete the two created non-default branches after recording evidence.
