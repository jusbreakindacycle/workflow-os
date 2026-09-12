# Risk and Approval Policy

## Principle

Risk controls **verification depth, authority, and side-effect permission**. Risk is not the same as implementation complexity.

A one-line production permission change may be technically simple and still high risk.

## Risk tiers

### R0 — observation / no meaningful side effect

Examples: read-only inspection, local calculation, synthetic transformation.

Default: no human approval solely because of risk, but normal privacy/tool policy still applies.

### R1 — low consequence / reversible

Examples: sandbox edits, draft artifact generation, isolated branch changes.

Default: bounded autonomous execution may be allowed with ordinary verification.

### R2 — meaningful external side effect

Examples: creating/updating non-production external records, sending a controlled notification, modifying shared development resources.

Default: stronger verification/reconciliation. Approval may be required by action/client/project policy.

### R3 — high consequence

Examples: destructive/irreversible action, production release with meaningful impact, deletion, broad permission/security change, material financial/legal/client commitment, high-stakes external action.

Default: explicit human approval on the exact action/version before execution, plus strong verification/recovery planning.

## Separate gates

Risk approval is not the only authority gate.

The following may require human approval even when technical risk is lower:

- commercial scope/price/deadline commitment;
- repository creation when operator policy requires it;
- credential/permission grants;
- any unapproved paid AI/runtime execution;
- production deployment during early product maturity;
- policy exceptions.

## Consequential-action authority threshold

Risk tier provides a floor, but the **kind of side effect** determines whether a human authority boundary must be crossed.

| Action class | Minimum authority before execution |
| --- | --- |
| R0 read-only/local calculation/synthetic output | No approval solely because of risk; remain inside accepted Project/Assignment scope. |
| R1 isolated, reversible local/sandbox/temporary branch write | May run autonomously only when an explicit policy/Assignment already pre-authorizes that bounded class and recovery is straightforward. Otherwise ask. |
| R2 durable shared or external non-production mutation | Exact subject/action/version approval unless an explicit operator policy already pre-authorizes a narrowly bounded action class. |
| Client/public external communication | Exact approval of content/audience/channel or an already-approved bounded template/workflow with equivalent constraints. Drafting alone is not sending authority. |
| Repository creation or mutation of a shared remote | Exact proposal/action/version authority. Local isolated source edits are distinct from pushing/creating/changing shared remote state. |
| Production deployment or production mutation | R3 exact human approval on the current action/version plus applicable verification and rollback/recovery evidence. |
| Destructive delete, security/permission change, irreversible action | R3 exact human approval plus recovery/reconciliation plan where possible. |
| Material price/deadline/legal/financial/client commitment | Exact human approval. A model may recommend wording or terms but cannot bind the operator/client. |
| New metered/variable-cost execution | Valid bounded SpendEnvelope before cost is incurred, regardless of technical risk tier. |
| Credential/permission grant | Exact human approval for the requested scope; possession of a credential is not authorization to widen its use. |

A provider/runtime may execute a previously authorized bounded action, but provider success, verifier success, model confidence, or retrieved instructions **never create authority**.

When a policy pre-authorizes a class of R1/R2 actions, that policy must state at least the allowed action kind, target/scope, side-effect bounds, expiry/revocation condition where applicable, verification requirement, and escalation/stop condition. An open-ended phrase such as “do whatever is needed” is not a bounded authority grant.

## Approval binding

An Approval references the exact subject/version/action and records:

- approver;
- reason/context;
- approved bounds;
- expiry when applicable;
- evidence presented;
- timestamp.

A material change to the subject invalidates or supersedes the prior approval. Do not reuse a stale approval for a different action.

### Resolve-time and use-time freshness

Approval validity is checked twice for consequential actions:

1. **resolve time** — before a requested Approval becomes `approved`, the canonical subject must still exist in the same Workspace/Project at the bound version and within the original bounds;
2. **use time** — immediately before a consequential durable/external effect, the action path must re-check that the Approval and bound subject are still current.

This is a time-of-check/time-of-use (TOCTOU) defense. An Approval that was correct earlier does not remain usable after its subject, Project brief, WorkItem version, spend bounds, or other authority-bearing context changes.

Approval subject identity/version/reason/bounds are immutable after request creation. If those need to change, create a new Approval request rather than editing the old authority record.

Future-resource approvals, such as authority to create a bounded SpendEnvelope, must bind to a canonical precursor request. They are provisional until that precursor exists and matches the exact approved bounds.

## Verification depth

Suggested minimum direction:

- R0: L1 where applicable;
- R1: L1–L2;
- R2: L2–L4 depending on side effect;
- R3: L3–L5 plus explicit approval/recovery evidence.

These are minimum policy hints, not substitutes for Project-specific requirements.

## Agent rule

A model/agent may classify or recommend risk, but policy enforcement and approval checks occur outside model reasoning.
