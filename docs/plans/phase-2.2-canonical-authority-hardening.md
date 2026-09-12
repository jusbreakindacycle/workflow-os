# Phase 2.2 — Canonical Authority Hardening

## Objective

Strengthen Workflow OS's canonical authority boundary before any adapter/runtime receives consequential real-world capabilities.

Phase 2 and Phase 2.1 proved that provider-independent execution, independent verification, zero-spend routing, and representative portability can work. Phase 2.2 addresses a different question:

> Can Workflow OS prove that a requested or approved action still refers to the exact current canonical subject, scope, version, and bounds at the moment authority is granted and at the moment a consequential effect is used?

The answer must not depend on caller discipline, model reasoning, provider claims, or a happy-path API.

## Non-negotiable authority rules

1. **Creation is not transition.** A new WorkItem may be born only as `draft` or `ready`. Later states must be reached through explicit transition/verification paths.
2. **An Approval cannot point at arbitrary text.** Existing canonical approval subjects must exist in the same Workspace/Project and match the requested version.
3. **Approval authority is immutable.** Subject identity, subject version, reason, and approved bounds cannot be rewritten after request creation.
4. **Approval is version-bound.** A subject changing after the request was created invalidates approval of that stale request.
5. **Approval is checked again at use time.** A previously valid approval cannot authorize a consequential effect after its subject or authority context becomes stale.
6. **Future-resource authority is provisional.** When the approved subject is a resource that does not exist yet (for example, a SpendEnvelope), the request must bind to canonical precursor state and cannot become approved until that precursor exists and matches exactly.
7. **Evidence is not authority.** Provider/model/runtime success or verification may support a decision but cannot grant human authority.

## Gate 1 — WorkItem birth-state enforcement

Enforce `draft|ready` as the only valid INSERT states for `work_items`.

This must exist at the SQLite boundary, not only in `CanonicalStore.createWorkItem()`, so direct SQL or a future adapter cannot create a WorkItem already marked `running`, `complete`, `failed`, or another later lifecycle state.

Expected evidence:

- normal `draft`/`ready` creation succeeds;
- domain creation with a later state fails closed;
- direct SQL INSERT with a later state fails closed.

## Gate 2 — Approval subject validation

Introduce a deliberately small approval-subject registry for the subject classes Workflow OS currently authorizes:

- `work_item` — exact WorkItem ID + version + Workspace + Project;
- `work_item_proposal` — exact proposed record in the same Workspace/Project;
- `repository_proposal` — exact proposal and accepted brief version in the same Workspace/Project;
- `spend_envelope` — provisional future-resource authority bound to a canonical SpendRequest identity and exact purpose/currency/maximum amount.

Unknown subject types fail closed until explicitly designed and added.

## Gate 3 — Authority immutability and legal status transitions

Once an Approval is requested, the following authority-bearing fields are immutable:

- Workspace / Project scope;
- subject type / ID / version;
- authority reason;
- approval bounds.

Only resolution metadata may change. Approval status transitions are bounded:

```text
requested -> approved | rejected | expired | superseded
approved  -> expired | superseded
```

No rejected/expired/superseded Approval can be resurrected by ordinary UPDATE.

## Gate 4 — Resolve-time freshness / TOCTOU defense

Before `requested -> approved`, re-check that the exact subject is still current.

Examples:

- a WorkItem must still have the bound version;
- a repository proposal must still refer to the Project's current accepted brief;
- a SpendRequest must still match the approval bounds and the Project/WorkItem versions captured when authority was requested.

If the state changed between request and approval, approval fails closed and a fresh authority request is required.

## Gate 5 — Consequential use-time revalidation

Approval resolution is not the last authority check.

Before a consequential persistence effect:

- repository creation/mock execution re-checks the proposal, linked Approval, bound brief version, and current Project brief;
- SpendEnvelope creation re-checks exact request/Approval/bounds/version binding;
- cost recording re-checks the active envelope, approval, canonical request versions, currency, and remaining amount.

This closes the window where an approval was valid earlier but became stale before action execution.

## Gate 6 — Spend authority version binding

Persist the Project version and, when applicable, WorkItem version that existed when a SpendRequest was created.

A requested spend approval becomes unusable if those bound canonical versions change before approval. An approved SpendEnvelope also becomes unusable for new CostRecords if the bound versions later become stale.

Existing unresolved pre-Phase-2.2 spend requests are not grandfathered into stronger authority semantics; they fail closed and require a fresh request.

## Gate 7 — Consequential-action authority threshold

The security policy must explicitly define the minimum authority required for durable/external effects.

Direction:

- R0 observation/synthetic/read-only: no human approval solely because of risk;
- R1 isolated/reversible local or sandbox writes: may be pre-authorized by explicit bounded policy;
- R2 durable shared/external non-production writes: exact approval unless a deliberately defined bounded policy class pre-authorizes them;
- client/public external communication: exact approval unless content, audience, channel, and limits are already explicitly authorized;
- repository creation/shared-remote writes: exact proposal/action/version authority;
- production deployment/mutation, destructive changes, permission/security changes, legal/financial commitments: R3 exact human approval plus stronger verification/recovery evidence;
- paid execution: always remains subject to the SpendEnvelope gate regardless of technical risk tier.

## Database-first enforcement

Phase 2.2 intentionally places core authority invariants in SQLite triggers in addition to domain/API checks.

Why: Workflow OS will eventually have more runtimes and adapters. An invariant that exists only in one JavaScript call path can be bypassed accidentally by another path. The canonical database must reject invalid authority even when the domain wrapper is bypassed.

This does not make arbitrary direct database mutation a supported product API. It makes the failure boundary stronger.

## Migration policy

Migration `0008_phase22_canonical_authority_hardening.sql` is append-only and must remain checksum-stable after merge.

Legacy unresolved spend requests cannot prove the version snapshot required by the new semantics. They are superseded during migration rather than silently upgraded into authority they never captured.

## Acceptance evidence

Phase 2.2 requires adversarial tests for:

- invalid WorkItem initial states through both domain and direct SQL paths;
- cross-project approval subjects;
- unknown approval subject types;
- stale approval subject versions;
- mutation of approval bounds after request creation;
- stale repository approval at resolution;
- stale repository authority at use time;
- stale SpendRequest authority after a WorkItem version change;
- migration persistence/idempotence;
- all existing Phase 1/2/2.1 tests remaining green.

See `docs/testing/phase-2.2-acceptance-criteria.md`.

## Exit condition

Phase 2.2 is complete when canonical authority no longer depends on callers remembering to preserve these invariants and the first consequential adapter/runtime can be designed against an explicit, version-bound, use-time-revalidated authority contract.

## Non-goals

Phase 2.2 does not add production deployment, real repository mutation, client messaging, credential delegation, Activepieces/Paperclip adoption, additional AI providers, or a generic policy engine/dashboard.
