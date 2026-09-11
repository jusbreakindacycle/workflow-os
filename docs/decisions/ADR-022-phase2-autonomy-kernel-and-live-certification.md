# ADR-022 — Phase 2 autonomy kernel and live-route certification boundary

**Status:** Accepted by implementation proposal; merge of the Phase 2 PR makes it active.

## Context

Phase 1 proved canonical Project/WorkItem/Assignment semantics with mock execution. Phase 2 must connect real model/runtime execution without letting provider identity, credentials, billing, or provider-local state become canonical Project meaning.

A second risk is evidentiary: deterministic fixtures can prove orchestration semantics but cannot prove that a real provider worked, and two fixture adapters cannot prove operational cross-provider portability.

## Decision

1. Workflow OS adds a normalized **ProviderConnection → ExecutionRoute → RouteDecision → ExecutionAttempt** boundary.
2. Provider credentials remain outside canonical state. Records store only a credential/config reference such as an environment-variable name.
3. Model and runtime identifiers are route configuration. Project/WorkItem semantics remain capability-oriented.
4. Broker eligibility is evaluated before scoring and includes capability, health, data class, locality, spend, and operator bounds.
5. Metered/unknown routes require an applicable approved SpendEnvelope before execution. Unknown actual provider cost is never treated as free; Phase 2 may conservatively debit an approved estimate until later reconciliation.
6. Project Bootstrap and instruction files are deterministic projections from Project Pack + Context Slice + versioned Skills. They cannot silently mutate canonical state.
7. Autonomous execution is bounded by explicit iteration/time/spend/side-effect/stop/escalation policy.
8. When independent verification is required, the verifier route must come from a different `independence_group`; otherwise execution blocks rather than self-certifying.
9. Route failures may re-broker to another eligible route. Fallback reruns all authority/data/spend checks.
10. Direct provider HTTP adapters are replaceable implementation adapters. Their presence does not make OpenAI, Anthropic, or any other provider canonical.
11. Live-provider claims require persisted certification evidence:
    - `first_real_execution`: one non-fixture route successfully executes representative bounded work;
    - `independent_verifier`: a non-fixture independent verifier successfully verifies representative work;
    - `portability_drill`: two independent non-fixture ProviderConnections execute representative equivalent work without changing canonical Project meaning.
12. Fixture-only tests may prove implementation portability but must never be described as real-provider or operational portability evidence.

## Consequences

- Normal CI remains deterministic and does not require or expose API secrets.
- Operator credentials can be added/removed without redefining Projects.
- A provider outage becomes a routing/attention condition rather than canonical-state corruption.
- Live certification requires explicit operator configuration and may remain pending after the implementation PR is otherwise green.
- A future runtime/provider can be added by implementing the normalized adapter/route contract rather than rewriting Project semantics.

## Non-decision

ADR-022 does not select a preferred model vendor, coding runtime, workforce provider, workflow engine, or deployment platform.
