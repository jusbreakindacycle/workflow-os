# Phase 2 Implementation Report — Autonomy Kernel

## Verdict

**IMPLEMENTATION PASS pending final PR CI. LIVE CERTIFICATION PENDING OPERATOR CONFIGURATION.**

This report deliberately separates what repository tests can prove from what requires a real provider entitlement/credential and an intentional paid/live run.

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
- OpenAI/Anthropic HTTP normalization is tested with fake responses and no network;
- `phase2:live` fails closed in CI because explicit operator approval is absent.

## What is not yet proven by CI

The repository does **not** claim the following from fixture tests:

- a real OpenAI/Anthropic/model call succeeded;
- a real independent verifier succeeded;
- two real provider connections are operationally portable;
- a coding runtime can edit/test a repository;
- an autonomous Project can deploy to production.

Those require later evidence or the opt-in live harness.

## Live evidence levels

### Level A — first real execution

Configure at least one non-fixture route plus explicit bounded spend and run `npm run phase2:live`. A passing `first_real_execution` certification proves the first real model route can consume Workflow OS's canonical Assignment projection.

### Level B — independent real verifier

Configure a second non-fixture route in a different independence group and obtain a passing `independent_verifier` certification.

### Level C — operational portability

With two independently configured non-fixture ProviderConnections, run the portability drill and obtain a passing `portability_drill` certification. Only then may the product claim representative operational provider portability.

## Security / authority conclusions

- API key values are environment inputs only; database records store the environment-variable reference.
- normal CI has no live-provider secret requirement and no live network execution path;
- untrusted content is explicitly non-authoritative in compiled instructions;
- provider success is execution evidence, never a direct WorkItem completion authority;
- paid/unknown-billing routes require explicit prior SpendEnvelope bounds;
- no route can silently expand scope, approve itself, or fabricate client acceptance.

## Exit recommendation

When PR CI is green, merge the Phase 2 implementation even if live certifications remain unchecked, but describe the state accurately as:

> **Autonomy kernel implemented; live provider certification pending operator configuration.**

After at least one live certification, the next substantive product work is Phase 3 end-to-end delivery using a controlled Project and an appropriate real execution/runtime adapter — not more control-plane redesign.
