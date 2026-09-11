# Phase 2.1 Acceptance Criteria — Free-First Provider & Quota Broker

## Offline / CI acceptance

- [ ] Migration 0007 applies on a fresh database and replays idempotently.
- [ ] `free_routing_policies`, `quota_snapshots`, `provider_usage_counters`, and accounted-attempt records are Workspace-scoped.
- [ ] Free-First policy defaults to zero-spend lock enabled.
- [ ] A metered/unknown route cannot become a Free-First fallback merely because it has a high model score.
- [ ] Antigravity model discovery is runtime-driven rather than a hard-coded provider catalog.
- [ ] Antigravity bridge uses loopback, headless JSON output, sandbox mode, bounded timeout, and never adds `--dangerously-skip-permissions`.
- [ ] A loopback local-service Responses route does not need a reusable API secret.
- [ ] A remote API-key route still fails closed when its credential binding is missing.
- [ ] Direct OpenAI route preserves `store:false` while Groq-compatible Responses calls omit unsupported OpenAI-only fields.
- [ ] Groq-style request/token rate-limit headers survive adapter normalization into attempt usage evidence.
- [ ] Quota parser never invents a positive quota when provider output is unrecognized.
- [ ] Healthy quota is preferred to reserved/exhausted quota for ordinary worker routing.
- [ ] Routine work prefers economy capacity over scarce frontier capacity when both can satisfy the capability contract.
- [ ] Reserved capacity is strongly deprioritized for worker use rather than consumed first.
- [ ] Exhausted quota removes a route from ordinary free routing.
- [ ] Independent verification remains required; no independent free verifier means blocked/Needs My Attention rather than self-verification.
- [ ] A representative Free-First WorkItem can complete using two independent zero-incremental fixture routes with zero SpendEnvelope and zero CostRecord.
- [ ] Usage attempts are accounted once only.
- [ ] OpenRouter local daily counter is bounded by policy instead of assuming unlimited free requests.
- [ ] An unmanaged zero-incremental/included-subscription route cannot bypass Free-First policy.
- [ ] `npm run phase21:certify` refuses to execute in CI without explicit `WORKFLOW_OS_FREE_FIRST_RUN=yes`.
- [ ] Existing Phase 1/2 tests remain green.

## Live preflight acceptance

- [ ] Antigravity CLI is installed and authenticated locally.
- [ ] `agy models` returns at least one selectable model.
- [ ] `/usage` can be queried without executing a Project WorkItem.
- [ ] Antigravity `useG1Credits` is not enabled.
- [ ] At least one independent free API provider is configured locally:
  - OpenRouter key constrained to `openrouter/free`; or
  - Groq API key whose account is explicitly confirmed to remain on the Free Plan.
- [ ] Key presence may be reported, but key values never appear in console output, SQLite canonical state, logs, commits, issues, or PR text.

## Full free live certification acceptance

- [ ] The operator explicitly sets `WORKFLOW_OS_FREE_FIRST_RUN=yes` for the certification process.
- [ ] A representative synthetic WorkItem is executed by a non-fixture Free-First route.
- [ ] A second independently configured non-fixture route performs verification.
- [ ] The WorkItem reaches canonical completion only after verification.
- [ ] A representative portability drill succeeds through two independent real free ProviderConnections.
- [ ] `phase2_certifications` contains passed evidence appropriate to the real routes.
- [ ] Certification Workspace contains zero SpendEnvelope records.
- [ ] Certification Workspace contains zero CostRecord records.
- [ ] No production/destructive side effect is requested or performed.
- [ ] Certification evidence is manually inspected before documentation changes from `live certification pending` to a stronger claim.

## Stop conditions

Do not declare Phase 2.1 live-certified when any of these is true:

- only fixtures passed;
- Antigravity is the worker and verifier within the same independence group;
- only one real provider is configured;
- Groq is treated as free without operator confirmation of Free Plan status;
- Antigravity credit fallback is enabled;
- a paid OpenRouter model is substituted for `openrouter/free`;
- the run produces a SpendEnvelope or CostRecord;
- provider quota/account state is unknown in a way that could cause paid execution;
- the evidence exists only in console text and was not persisted.
