# Phase 2 Implementation Report — Autonomy Kernel

## Verdict

**IMPLEMENTATION PASS. REPRESENTATIVE REAL-PROVIDER CERTIFICATION PASS THROUGH PHASE 2.1.**

This report separates what normal repository tests prove from what required an intentional real-provider run.

## Implemented

- normalized capability registry;
- Workspace-scoped ProviderConnections and execution routes;
- non-spending connection/config health inspection;
- capability/data/locality/health/spend-aware Broker;
- persisted RouteDecision candidate/rationale evidence;
- Project Bootstrapper and deterministic provider-neutral projections;
- Assignment instruction compiler using exact Project Pack + Context Slice;
- versioned/hashes Skill Registry;
- fixture, OpenAI Responses and Anthropic Messages route adapters;
- bounded worker/verifier Loop Engine;
- independent-verifier requirement by independence group;
- worker/verifier fallback via re-brokering;
- metered-route SpendEnvelope enforcement and conservative-cost accounting;
- execution-attempt/event evidence;
- explicit first-real-execution / independent-verifier / portability certification records;
- opt-in local live certification harness.

## Offline evidence

Normal CI proves:

- no provider credential is required to start or test the system;
- ProviderConnection/route state stays outside canonical Project meaning;
- metered route selection fails without approved spend;
- Project Bootstrap and instruction compilation are deterministic;
- unrelated commercial information is absent from normal Assignment instructions;
- prompt-injection-style intake content cannot create Approval or Spend authority;
- worker and verifier attempts remain separate;
- canonical completion still requires evidence + verification;
- route failure can fall back to another eligible route;
- missing independent verifier blocks rather than self-certifies;
- rejected verification stops after bounded retries;
- two independently configured fixture routes can exercise the same projection without changing Project meaning;
- OpenAI/Anthropic-compatible HTTP normalization is tested with fake responses and no network;
- live harnesses fail closed in CI because explicit operator approval is absent.

## Real-provider evidence achieved through Phase 2.1

On 2026-09-12, the zero-spend Phase 2.1 certification harness supplied real evidence for the same Phase 2 kernel contracts:

- Google Antigravity completed the representative worker execution;
- OpenRouter completed independent verification through a different independence group;
- the verifier accepted the bounded deterministic artifact;
- canonical verification persisted as L2 `pass`;
- the WorkItem completed only after verification;
- `first_real_execution` certification passed;
- `independent_verifier` certification passed;
- cross-provider `portability_drill` certification passed;
- certification Workspace contained zero SpendEnvelope records and zero CostRecord records.

The operator then manually inspected the persisted SQLite evidence. See `docs/reviews/phase-2.1-live-certification-report.md`.

## What remains unproven

The real-provider certification does **not** prove:

- every supported or future provider works;
- paid OpenAI/Anthropic routes have been exercised with real paid credentials;
- a coding runtime may safely mutate a repository;
- production deployment is ready;
- external-system writes, client communications, or other consequential side effects are ready;
- the canonical approval boundary is sufficiently hardened for high-authority operation.

Those require later authority hardening and adapter-specific evidence.

## Live evidence levels

### Level A — first real execution — passed

Satisfied through the Phase 2.1 zero-spend harness using Google Antigravity.

### Level B — independent real verifier — passed

Satisfied through the Phase 2.1 zero-spend harness using OpenRouter in a different independence group.

### Level C — operational portability — passed for the representative pair

Satisfied through the Phase 2.1 portability drill across independent Antigravity and OpenRouter ProviderConnections without changing Project meaning.

This is representative operational portability evidence, not a claim that all providers are interchangeable under all capabilities.

## Security / authority conclusions

- API key values are environment inputs only; database records store environment-variable references.
- normal CI has no live-provider secret requirement and no live network execution path;
- untrusted content is explicitly non-authoritative in compiled instructions;
- provider success is execution evidence, never direct WorkItem completion authority;
- paid/unknown-billing routes require explicit prior SpendEnvelope bounds;
- worker output is not allowed to self-certify independent verification or external side effects.

## Exit recommendation

Phase 2 and Phase 2.1 now have both offline orchestration evidence and a representative real-provider certification chain.

The next substantive work should **not** be another provider experiment. Before granting consequential capabilities, harden canonical authority boundaries in Phase 2.2, then proceed to controlled end-to-end delivery through the appropriate adapter/runtime.
