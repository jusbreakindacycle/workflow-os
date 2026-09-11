# Commercial Engagement Model

## Why it exists

A technically useful feature can still be commercially out of scope. Workflow OS therefore needs enough business context to distinguish:

- “this should be built” from
- “this was actually agreed/quoted/authorized.”

It is not intended to become a full accounting ERP.

## Entities

### Client

Commercial party for whom work is performed.

Suggested fields:

- id;
- Workspace id;
- display name;
- contact references;
- billing/communication notes references;
- status.

Real sensitive client information must follow data policy.

### Engagement

A commercial agreement or working agreement that may contain one or more Projects.

Fields/concepts:

- Client/Workspace;
- title;
- requested outcome;
- scope status (`draft`, `proposed`, `accepted`, `change_requested`, `closed`);
- quote/price/currency;
- payment terms/status records;
- target/deadline;
- maintenance/support terms;
- accepted exclusions;
- links to proposal/contract artifacts.

### Project

Operational delivery unit. It references an Engagement when commercial context exists.

A Project's technical WorkItems must not silently rewrite Engagement scope.

## Scope change

When new work materially affects scope, cost, deadline, architecture risk, or maintenance obligation:

```text
Agent/provider finding
  -> WorkItem Proposal / ScopeChangeProposal
  -> commercial + technical impact
  -> Needs My Attention
  -> approve / reject / revise
  -> canonical WorkItem + Engagement update if accepted
```

Small in-scope implementation decomposition may continue without human approval.

## Quotations / invoices / payments

Foundation contracts may store records/references for:

- quotation;
- accepted price;
- invoice status;
- payment status;
- maintenance fee.

Phase 1 does not integrate payment processors or automatically issue invoices.

## Human authority

Only the operator (or future explicitly authorized commercial human role) may accept client-facing price/scope/deadline commitments.
