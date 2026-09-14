# Source Control Adapter Contract

## Purpose

The Source Control Adapter turns a verified local Project artifact into bounded shared-remote source-control effects while Workflow OS retains canonical meaning, authority, evidence, and completion semantics.

The contract is provider-neutral. GitHub may be the first implementation, but canonical Project state must not depend on GitHub-specific schemas or lifecycle names.

## Phase 4.1 initial scope

The first certified write path is deliberately narrow:

1. inspect an existing remote repository and exact base ref;
2. compile an exact source-control delivery plan from a verified local artifact snapshot;
3. request/resolve exact R2 authority;
4. create one non-default delivery branch when absent;
5. create/update one exact commit derived from the bound artifact snapshot;
6. open one pull request with exact pre-approved title/body content;
7. read back branch/commit/pull-request state;
8. observe provider checks/statuses;
9. reconcile evidence back into Workflow OS.

Normal Phase 4.1 does **not** include:

- merging a pull request;
- force-push;
- rewriting published history;
- deleting branches/tags/releases;
- changing default branch;
- repository visibility/settings/permissions;
- creating or rotating secrets;
- changing branch protection/rulesets;
- production deployment;
- package/release publication;
- arbitrary issue/comment/messaging actions.

Those require separate future action contracts and authority.

## Normalized capabilities

A Source Control Adapter may advertise capabilities such as:

- `source_control_read`;
- `source_control_branch_write`;
- `source_control_commit_write`;
- `source_control_pull_request_write`;
- `source_control_checks_read`.

Capability advertisement is not authorization. The current ExternalActionPlan and Approval remain the execution boundary.

## Required adapter surface

Equivalent operations should exist for:

- `health()`;
- `capabilities()`;
- `inspectRepository(target)`;
- `resolveRef(target, ref)`;
- `findDeliveryBranch(plan)`;
- `createDeliveryBranch(plan)`;
- `writeVerifiedSnapshot(plan)`;
- `findPullRequest(plan)`;
- `openPullRequest(plan)`;
- `getPullRequest(plan)`;
- `getChecks(plan)`;
- `reconcile(plan)`.

Method names are illustrative. Implementations may differ internally, but the normalized semantics and evidence must be preserved.

## SourceControlDeliveryPlan

The source-control projection of an ExternalActionPlan binds at least:

- canonical Workspace/Project/WorkItem/Assignment refs and versions;
- source-control provider connection/binding reference;
- exact remote repository identity;
- expected repository visibility/classification when relevant;
- exact base ref and resolved base commit SHA/hash;
- exact delivery branch name;
- verified local artifact manifest reference and content hash;
- deterministic remote tree/content projection hash;
- exact commit message;
- exact pull-request title and body hash/content reference;
- allowed operation set;
- expected check/verification policy;
- R2 risk/action classification;
- exact approval ref/version;
- idempotency keys;
- stop/escalation conditions.

A changed base SHA, artifact hash, target repository, branch, commit content, PR content, or operation set makes the authorized plan stale.

## Artifact projection

Only files explicitly included in the verified Project artifact manifest may be projected to the remote repository.

The adapter must not:

- sweep unrelated host directories;
- inherit hidden files by accident;
- include Workflow OS state/database files;
- include raw credentials;
- follow symlinks outside the governed workspace;
- silently add generated secrets/configuration.

The exact remote tree/content hash must be reproducible from the bound local artifact snapshot.

## Target and branch safety

Phase 4.1 must fail closed when:

- the target repository does not match the approved plan;
- the resolved base ref differs from the approved base SHA;
- the requested branch is the protected/default branch for write operations;
- an existing delivery branch contains unexpected remote changes;
- the provider cannot prove branch/ref state;
- branch creation would overwrite an unrelated ref;
- repository permissions/scopes are insufficient or unexpectedly broader behavior is required.

No implicit rebase, force update, or target substitution is allowed.

## Commit semantics

The first implementation should create a commit/tree from the exact verified artifact snapshot rather than giving an AI worker unrestricted remote Git access.

Transport may use provider APIs, a bounded git implementation, or another adapter-specific mechanism. The contract cares about the resulting exact tree/commit identity and evidence, not the transport.

If the same authorized plan already produced the exact commit/tree, reconciliation should reuse the existing result rather than create duplicate mutations.

## Pull-request semantics

Opening the pull request is part of the pre-authorized bounded plan only when its target/base/head/title/body are fixed in that plan.

If an equivalent open pull request already exists for the same branch/base and approved content, reconciliation should return it instead of opening a duplicate.

A model may draft a PR description before approval. It may not change approved content during execution.

## Checks and verification

Source-control delivery is not complete merely because a branch or pull request exists.

At minimum Phase 4.1 records:

- observed remote repository identity;
- base commit;
- created/resolved branch ref;
- commit/tree hash;
- pull-request provider reference/URL metadata;
- observed check/status results where available;
- reconciliation outcome against the exact plan.

Workflow OS may mark the source-control delivery action complete only after external state matches the plan. Project/WorkItem completion still follows its own verification/acceptance contract.

## Merge boundary

Pull-request **merge is intentionally excluded** from the first adapter write path.

Merge changes shared history and may trigger deployment/production effects. It requires its own later action plan, current checks/evidence, target-specific policy, and exact authority. A successful PR creation must never be interpreted as merge authority.

## Authentication

Provider credentials live behind a configured connection/binding. Canonical records contain references and expected scopes only.

For the initial GitHub implementation, a local environment binding or another operator-configured credential mechanism may be used. The adapter must not log/store the raw token and must reject missing or insufficient scope distinctly.

## CI and certification

Normal CI remains credential-free and must use a deterministic fixture/fake source-control adapter to prove:

- plan compilation and hashing;
- authority/use-time guards;
- idempotency;
- uncertain-outcome reconciliation;
- stale base/artifact rejection;
- duplicate branch/PR avoidance;
- provider error normalization.

A separate live certification may target only an explicitly allowlisted disposable/non-production repository. It must be opt-in, create canonical approval evidence, forbid writes to the default branch, and cleanly report the created branch/PR for operator cleanup/review.

Passing fixture CI is not a claim that a real remote provider worked. Passing one GitHub certification is not proof that all source-control providers are portable.

## Provider replacement

GitHub-specific IDs, REST/GraphQL payloads, check-suite states, or permission names remain adapter-local mappings/evidence.

A later GitLab/Bitbucket/self-hosted implementation must be able to consume the same canonical delivery intent without rewriting the Project Brief, WorkItem, authority, or artifact semantics.