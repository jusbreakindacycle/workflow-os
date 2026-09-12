# Phase 2.2 Acceptance Criteria — Canonical Authority Hardening

## WorkItem creation boundary

- [ ] New WorkItems may be inserted only with `draft` or `ready` status.
- [ ] `CanonicalStore.createWorkItem()` cannot create a WorkItem directly in `running`, `complete`, or another later lifecycle state.
- [ ] Direct SQL cannot bypass the WorkItem birth-state invariant.
- [ ] Existing explicit WorkItem transition and verification paths continue to work.

## Approval subject and scope binding

- [ ] An approval for an existing WorkItem requires the exact current WorkItem version.
- [ ] Cross-Workspace and cross-Project approval subjects fail closed.
- [ ] Unknown/unregistered approval subject types fail closed.
- [ ] WorkItem Proposal approval is limited to the exact proposed record in the same Workspace/Project.
- [ ] Repository Proposal approval is bound to the proposal's accepted brief version and current Project brief.
- [ ] Spend authority is bound to one exact future SpendEnvelope ID plus one canonical SpendRequest identity and exact purpose/currency/maximum amount.

## Approval immutability and status

- [ ] Approval subject type, ID, version, Workspace, Project, reason, and bounds cannot be mutated after request creation.
- [ ] Requested approvals can resolve only to approved/rejected/expired/superseded.
- [ ] Approved approvals can only expire or be superseded.
- [ ] Rejected/expired/superseded approvals cannot be resurrected by ordinary UPDATE.

## Resolve-time freshness / TOCTOU

- [ ] `requested -> approved` re-checks the bound canonical subject at the exact requested version.
- [ ] A WorkItem version change between approval request and resolution prevents approval.
- [ ] A Project brief change between repository approval request and resolution prevents approval.
- [ ] A SpendRequest cannot be approved after its captured Project/WorkItem authority version becomes stale.
- [ ] Failed stale resolution does not partially mutate the Approval or subject into an approved state.

## Consequential use-time authority

- [ ] Repository execution re-checks proposal state, linked Approval, bound brief version, and current Project brief immediately before the durable result is inserted.
- [ ] A repository approval that became stale after approval cannot be used.
- [ ] SpendEnvelope creation requires one exact approved Approval and its exact matching SpendRequest/bounds/version snapshot.
- [ ] A SpendRequest cannot become `approved` unless its matching SpendEnvelope actually exists.
- [ ] A CostRecord re-checks the approved SpendEnvelope, linked Approval, matching SpendRequest, current bound Project/WorkItem versions, currency, and remaining cap.
- [ ] Stale spend authority cannot record a new cost.

## Migration / compatibility

- [ ] Migration `0008_phase22_canonical_authority_hardening.sql` applies on a fresh database.
- [ ] Migration sequence is persistent and idempotent at eight migrations.
- [ ] Phase 2.2 metadata is persisted.
- [ ] Existing unresolved pre-Phase-2.2 spend requests are superseded rather than silently upgraded into stronger authority.
- [ ] Existing Phase 1, Phase 2, and Phase 2.1 test suites remain green.
- [ ] Database backup/migration commands remain green in CI.

## Consequential-action policy threshold

- [ ] R0 read-only/synthetic work does not require approval solely because of risk.
- [ ] R1 isolated/reversible writes require explicit bounded pre-authorization or a more specific approval policy.
- [ ] R2 durable shared/external writes require exact authority unless a deliberately defined bounded action class has already been approved.
- [ ] Client/public external communication requires exact or explicitly pre-bounded authority over content/audience/channel.
- [ ] Repository creation/shared-remote mutation is version-bound.
- [ ] R3 production/destructive/security/permission/legal/financial actions require exact human approval plus strong verification/recovery evidence.
- [ ] Paid execution still requires a SpendEnvelope regardless of risk tier.
- [ ] Model/provider/runtime success or verifier output can never create Approval authority.

## Stop conditions

Do not declare Phase 2.2 complete if any of the following remains true:

- a new WorkItem can be born terminal/active through direct SQL;
- an Approval can reference an arbitrary nonexistent/cross-scope subject and later become authoritative;
- authority-bearing Approval bounds can be edited after request creation;
- an Approval can be approved after its version-bound subject changed;
- a repository/spend side effect can use authority that has become stale;
- stronger authority semantics depend only on one JavaScript call path rather than the canonical persistence boundary;
- the test suite passes only by weakening existing human-approval, zero-spend, or independent-verification rules.
