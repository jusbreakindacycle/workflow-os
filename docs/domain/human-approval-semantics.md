# Human Approval Semantics

Human approval is a first-class workflow state, not a chat message or UI decoration.

## Approval request must bind to

- workspace
- workflow id and immutable version
- run id
- node/action id
- exact proposed action summary
- material parameters or an immutable hash/reference to them
- risk tier
- relevant evidence
- requester/system identity
- creation time and expiry/deadline

## Decision states

At minimum:

- pending
- approved
- rejected
- expired
- cancelled

A modification is not an approval of the old action. It creates a revised proposal requiring its own policy evaluation.

## TOCTOU protection

After approval, the executed high-risk action must match the approved action. If material parameters, target, workflow version, or policy change between approval and execution, approval becomes invalid and must be requested again.

## Separation of reasoning and authority

AI may summarize evidence or recommend a decision, but it cannot impersonate the approving human or convert model confidence into authorization.

## Retry behavior

Approval itself must not be repeated as though it were an external mutation. If an approved downstream action has uncertain outcome, reconcile the action; do not request a second approval unless the proposed action materially changes or policy requires it.

## Audit evidence

Record approver identity, decision, timestamp, bound proposal/version, and optional reason. Avoid retaining unnecessary sensitive context.
