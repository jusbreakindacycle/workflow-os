# Commercial Engagement Model

## Why it exists

A technically useful feature can still be commercially out of scope. Workflow OS therefore needs enough business context to distinguish “this should be built” from “this was actually agreed/quoted/authorized.”

It is not intended to become a full accounting ERP.

## Entities

### Client

Commercial party for whom work is performed. Suggested fields include id, Workspace id, display name, contact references, billing/communication-note references, and status. Sensitive client information follows data policy.

### Engagement

A commercial agreement or working agreement that may contain one or more Projects.

Concepts include Client/Workspace, title, requested outcome, quote/price/currency, payment terms/status records, target/deadline, maintenance/support terms, accepted exclusions, and proposal/contract artifacts.

Recommended scope/commitment states distinguish internal workflow from actual client confirmation:

- `draft` — internal working state;
- `proposed_to_client` — sent/presented, not yet accepted;
- `client_accepted` — external acceptance evidence exists;
- `change_requested` — material change under discussion;
- `closed`.

### Project

Operational delivery unit. It references an Engagement when commercial context exists. Technical WorkItems must not silently rewrite Engagement scope.

## Operator approval vs client acceptance

These are different facts.

- **Operator approval** grants Workflow OS authority to perform/propose the bounded action.
- **Client acceptance** records that the client actually accepted scope, price, deadline, change request, delivery, or other commitment.

The system must never infer `client_accepted` merely because the operator approved an internal recommendation. Client acceptance requires evidence/reference appropriate to the interaction, such as signed proposal/contract, confirmed message/email, meeting decision recorded by the operator, or another explicit acceptance artifact.

## Scope change

When new work materially affects scope, cost, deadline, architecture risk, or maintenance obligation:

```text
Agent/provider finding
  -> WorkItem Proposal / ScopeChangeProposal
  -> technical + commercial impact
  -> Needs My Attention
  -> operator approves/rejects/revises what may be proposed
  -> client acceptance when required
  -> canonical WorkItem + Engagement update
```

Small in-scope implementation decomposition may continue without human approval.

## Quotations / invoices / payments

Foundation contracts may store records/references for quotation, accepted price, invoice status, payment status, and maintenance fee. Phase 1 does not integrate payment processors or automatically issue invoices.

## Human authority

Only the operator (or future explicitly authorized commercial human role) may make client-facing price/scope/deadline commitments on behalf of the business. External client acceptance is recorded separately.
