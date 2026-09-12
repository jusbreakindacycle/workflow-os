# Phase 2.2 Implementation Report — Canonical Authority Hardening

## Verdict

**IMPLEMENTATION PASS — pending operator review/merge.**

Phase 2.2 hardens the canonical authority boundary before Workflow OS receives real consequential repository, deployment, communication, permission, or production capabilities.

The final PR CI evidence on the implementation head passed 69/69 tests, migration/backup checks, and the live-provider opt-in guards without making any live provider call.

## What changed

### WorkItem creation authority

A SQLite trigger now permits new `work_items` to be inserted only as:

- `draft`; or
- `ready`.

Later lifecycle states must be reached through explicit transition/verification paths. This protects the invariant even if a caller bypasses `CanonicalStore` and writes directly to SQLite.

### Approval subject binding

Approval requests now fail closed at the canonical persistence boundary unless the subject belongs to an explicitly supported authority class and satisfies its scope/version contract.

Supported current classes are:

- `work_item`;
- `work_item_proposal`;
- `repository_proposal`;
- `spend_envelope` as a bounded future-resource subject tied to an exact SpendRequest identity/bounds.

Unknown, cross-Project, cross-Workspace, and stale-version subjects cannot become ordinary Approval records that later acquire authority.

### Approval immutability

After request creation, the authority-bearing identity is immutable:

- Workspace;
- Project;
- subject type;
- subject ID;
- subject version;
- authority reason;
- bounds.

Changing authority requires a new request rather than editing the meaning of an existing Approval.

### Approval lifecycle

Database enforcement limits status transitions to:

```text
requested -> approved | rejected | expired | superseded
approved  -> expired | superseded
```

Rejected/expired/superseded authority cannot be resurrected through an ordinary status UPDATE.

### Resolve-time freshness

Before an Approval changes to `approved`, SQLite rechecks the exact bound subject against current canonical state.

This catches stale authority such as:

- a changed WorkItem version;
- a repository proposal whose brief is no longer current;
- a spend request whose captured Project/WorkItem version changed before approval.

### Use-time freshness

Consequential paths are rechecked again at use time:

- repository mock result persistence requires a still-current approved repository proposal/Approval/brief binding;
- SpendEnvelope creation requires the exact approved request/bounds/version snapshot;
- CostRecord insertion requires the envelope, Approval, SpendRequest, current bound Project/WorkItem versions, currency, and remaining cap to still be valid.

An Approval that was valid earlier is therefore not automatically reusable after its authority context changes.

### Spend version evidence

SpendRequests now capture:

- the Project version at request time; and
- the WorkItem version at request time when the request is WorkItem-scoped.

Legacy unresolved spend requests created before these semantics are superseded during migration instead of being silently treated as if they had captured evidence they never recorded.

## Policy clarification

`docs/security/risk-and-approval-policy.md` now defines a consequential-action authority threshold separating:

- read-only/synthetic work;
- isolated reversible writes;
- durable shared/external writes;
- client/public communication;
- shared repository mutation;
- production/destructive/security actions;
- financial/legal/client commitments;
- metered spend;
- credential/permission grants.

The governing rule remains:

> Provider/model/runtime output may become evidence; it cannot become authority by itself.

## Adversarial evidence

Phase 2.2 tests prove that:

- terminal/active WorkItem creation is rejected through the domain path;
- terminal/active WorkItem creation is rejected through direct SQL;
- cross-Project approval subjects are rejected;
- unknown approval subject types are rejected;
- stale subject versions are rejected;
- approval bounds cannot be mutated after request creation;
- repository approval fails when its brief becomes stale before resolution;
- already-approved repository authority fails at use time after the brief changes;
- SpendRequest captures Project/WorkItem versions;
- changing the WorkItem version before spend approval prevents approval and prevents SpendEnvelope creation.

Existing Phase 1, Phase 2, and Phase 2.1 tests remain green.

## Final CI evidence

`Workflow OS Verify` run #97 passed on the Phase 2.2 implementation head.

Final verification summary:

```text
Source check: passed
Tests:       69
Pass:        69
Fail:        0
Migrations:  8
DB migrate:  passed
DB backup:   passed
Live Phase 2 harness opt-in guard: passed
Live Phase 2.1 harness opt-in guard: passed
```

No live provider execution was needed for Phase 2.2 because this phase changes canonical authority semantics, not provider routing/execution behavior.

## What this does not prove

Phase 2.2 does **not** prove that Workflow OS is ready for unrestricted production autonomy.

It does not add or certify:

- real remote repository mutation;
- production deployment;
- destructive actions;
- client/public messaging;
- credential delegation;
- legal/financial commitment automation;
- Activepieces/Paperclip adoption;
- an always-on execution host.

Those future capabilities must consume the hardened authority contract rather than bypass it.

## Exit recommendation

After review and merge, treat Phase 2.2 as complete and proceed to Phase 3: one controlled end-to-end delivery golden path using the appropriate real adapter/runtime for the Project's chosen delivery strategy.

The first Phase 3 consequential capability should be narrow, reversible where possible, exact-version-authorized, independently verifiable, and observable in the canonical event/evidence chain.
