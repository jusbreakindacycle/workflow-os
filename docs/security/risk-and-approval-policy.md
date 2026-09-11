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

## Approval binding

An Approval references the exact subject/version/action and records:

- approver;
- reason/context;
- approved bounds;
- expiry when applicable;
- evidence presented;
- timestamp.

A material change to the subject invalidates or supersedes the prior approval. Do not reuse a stale approval for a different action.

## Verification depth

Suggested minimum direction:

- R0: L1 where applicable;
- R1: L1–L2;
- R2: L2–L4 depending on side effect;
- R3: L3–L5 plus explicit approval/recovery evidence.

These are minimum policy hints, not substitutes for Project-specific requirements.

## Agent rule

A model/agent may classify or recommend risk, but policy enforcement and approval checks occur outside model reasoning.
