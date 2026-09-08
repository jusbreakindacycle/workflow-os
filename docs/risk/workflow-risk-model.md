# Workflow Risk Model

Risk is scored separately from automation ROI. A valuable workflow may still require more governance.

## Action risk tiers

### R0 — Read-only / no external side effect
Examples: read a record, search documentation, calculate locally.

Default: automatic if authorized.

### R1 — Reversible internal mutation
Examples: add an internal tag, update a draft record, create an internal note.

Default: automatic with audit evidence when policy permits.

### R2 — Externally visible or business-significant mutation
Examples: send an external message, update a customer-facing status, create a non-final business record.

Default: explicit policy required. Human approval may be required based on workflow/context.

### R3 — High-impact / irreversible / destructive / financial / legal
Examples: destructive deletion, irreversible submission, movement/commitment of funds, execution of a legal commitment.

Default: **human approval required in MVP**.

## Risk dimensions

Score each 0–3:

- reversibility
- financial impact
- legal/compliance impact
- customer/external visibility
- data sensitivity
- blast radius
- ambiguity of business rule
- automation confidence
- ability to verify outcome
- ability to reconcile/compensate

The highest material dimension may override a low average.

## Approval policy

Approval is evaluated from:

`risk tier + workflow policy + workspace policy + action policy + context`

A downstream engine must not weaken a Workflow OS approval requirement.

## Escalation

Escalation must preserve:

- what action was proposed
- why it was proposed
- relevant non-sensitive evidence
- current workflow version
- side effects already completed
- deadline/SLA
- available approve/reject/modify options

## AI-specific rule

AI confidence alone never downgrades an R3 action. High confidence is not authorization.

## Risk review triggers

Reassess risk when:

- a connector/action changes behavior
- a workflow gains a new external side effect
- an AI step changes from transform to action selection
- data classification increases
- volume/blast radius materially increases
- a client changes approval policy
- a production incident exposes a new failure mode
