# Phase 2 Acceptance Criteria

Phase 2 is split into **offline implementation evidence** and **live certification evidence**. Offline fixtures cannot be presented as proof of a real provider call or real cross-provider portability.

## Capability / connection registry

- [x] normalized capability keys exist independently from provider marketing names;
- [x] ProviderConnection stores provider/access/entitlement/health metadata outside Project meaning;
- [x] raw credentials are never persisted; only credential references are stored;
- [x] missing credential/config makes a route unavailable rather than silently usable;
- [x] locality and allowed data classes participate in eligibility.

## Broker / spend

- [x] route selection filters hard capability/data/health constraints before scoring;
- [x] candidate set + rationale + chosen route are persisted in RouteDecision;
- [x] no eligible route produces Needs My Attention instead of silent degradation;
- [x] metered/unknown routes are ineligible without an approved matching SpendEnvelope;
- [x] purpose/currency/WorkItem/balance are checked before paid execution;
- [x] provider calls with unknown actual price use a conservative approved estimate rather than silently recording zero cost.

## Bootstrap / instructions / skills

- [x] Project Bootstrap is deterministic from current Project Pack;
- [x] generated projections are derived artifacts, not canonical Project truth;
- [x] Assignment instruction bundle binds exact WorkItem/Context Slice/Pack versions;
- [x] commercial data outside the Context Slice is not copied into normal worker instructions;
- [x] untrusted request/content cannot grant authority, tools, scope, spend, or approval;
- [x] Skills are versioned, hashed, capability-declared, and risk-tiered.

## Execution / loops

- [x] one ready WorkItem can be executed without operator prompt-copying through the kernel;
- [x] worker attempt and verifier attempt are separately recorded;
- [x] `execution_finished` still does not directly complete WorkItem;
- [x] canonical completion only occurs through evidence + verification;
- [x] verification failure retries only within bounded iterations/time;
- [x] exhausted loop leaves work incomplete / needing attention;
- [x] worker route failure can re-broker to an eligible fallback without changing canonical objective;
- [x] no independent verifier route blocks instead of self-certifying.

## Provider adapters

- [x] fixture adapter supports deterministic CI without network;
- [x] OpenAI Responses adapter is normalized behind the same route interface;
- [x] Anthropic Messages adapter is normalized behind the same route interface;
- [x] adapter contract parsing/auth behavior is tested with fake HTTP responses;
- [x] normal CI performs no live provider call.

## Portability

- [x] two independently configured fixture routes can execute the same Assignment projection without mutating Project meaning;
- [x] portability drill rejects same-route/same-connection/non-independent configurations;
- [ ] at least one non-fixture real route has passed a bounded WorkItem execution;
- [ ] a non-fixture independent verifier has passed representative verification;
- [ ] two independent non-fixture ProviderConnections have passed a representative portability/rerouting drill.

The final three boxes require operator-supplied live credentials/entitlements and cannot be completed by repository CI.

## Live execution safety

- [x] `npm run phase2:live` fails closed without explicit `WORKFLOW_OS_LIVE_APPROVE_SPEND=yes`;
- [x] live harness requires a positive operator-selected maximum spend amount;
- [x] API keys are read from environment only;
- [x] model identifiers are operator configuration rather than hardcoded canonical semantics;
- [x] live results/certifications persist to a local database for inspection;
- [x] one live route never results in a false claim of operational provider portability.

## Exit interpretation

**Repository implementation exit:** all checked offline criteria + CI green.

**First-real-execution exit:** first real execution box checked using a non-fixture route.

**Operational-portability exit:** all portability boxes checked using two independent non-fixture connections.
