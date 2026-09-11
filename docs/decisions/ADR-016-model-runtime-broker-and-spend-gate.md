# ADR-016: Model/Runtime Broker + Configured Provider Connections + Spend Gate

**Status:** Accepted

## Decision

Models and runtimes are separate replaceable capabilities. Actual access/entitlement is a third concept: **ProviderConnection**.

Routing uses WorkItem requirements, normalized capability evidence, configured connection health/limits, hard privacy/risk constraints, and quality/cost/latency/reliability scoring. The default strategy is dynamic balance, not always-cheapest or always-strongest.

No metered model/runtime execution may begin without an applicable operator-approved SpendEnvelope. Provider fallback cannot silently change zero-incremental work into metered work or weaken data/risk policy.

## Portability rule

Provider-neutral interfaces reduce lock-in but do not prove replacement works. Before claiming operational portability, representative work must be rerouted through a second independently configured eligible route/provider without changing canonical Project/Assignment/evidence semantics.

## Consequences

- cancelling/revoking one provider changes route eligibility rather than Project meaning;
- local/open/hosted/fixed-subscription options can coexist;
- capability manifests and connection state are distinct;
- cost authorization and usage records are normalized;
- provider-specific IDs remain adapter metadata.
