# ADR-016: Model/Runtime Broker + Explicit Spend Gate

**Status:** Accepted

## Decision

Models and runtimes are separate replaceable capabilities selected dynamically from WorkItem requirements.

Routing uses hard eligibility constraints plus quality/cost/privacy/latency/reliability evidence. The default strategy is a dynamic balance, not always-cheapest or always-strongest.

No paid model/runtime execution may begin without an explicit operator-approved SpendEnvelope for the bounded purpose.

## Consequences

- avoids vendor lock-in;
- permits local/open/hosted fallbacks;
- requires capability manifests and routing evidence;
- requires normalized cost accounting;
- provider fallback can never silently convert zero-cost work into paid work.
