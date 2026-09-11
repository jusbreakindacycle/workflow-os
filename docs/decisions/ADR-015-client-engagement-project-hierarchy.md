# ADR-015: Separate Isolation, Commercial Context, and Delivery State

**Status:** Accepted

## Decision

Use distinct concepts:

- `Workspace` — security/data-isolation boundary;
- `Client` — commercial party, optional for internal work;
- `Engagement` — commercial agreement/working scope;
- `Project` — operational delivery/maintenance unit.

For external client work the default safety posture is one Client per Workspace.

## Why

A Project can be technically healthy while commercially out of scope. A Client can have multiple Engagements/Projects over time. Security isolation is not the same concept as a quotation/contract.

## Authority

Agents may propose technical/commercial impacts but cannot accept price, deadline, or client scope commitments.
