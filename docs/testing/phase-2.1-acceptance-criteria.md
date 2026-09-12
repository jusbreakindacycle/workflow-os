# Phase 2.1 Acceptance Criteria — Free-First Provider & Quota Broker

Status: **accepted and live-certified for the representative zero-spend path on 2026-09-12.**

## Offline / CI acceptance

- [x] Migration 0007 applies on a fresh database and replays idempotently.
- [x] `free_routing_policies`, `quota_snapshots`, `provider_usage_counters`, and accounted-attempt records are Workspace-scoped.
- [x] Free-First policy defaults to zero-spend lock enabled.
- [x] A metered/unknown route cannot become a Free-First fallback merely because it has a high model score.
- [x] Antigravity model discovery is runtime-driven rather than a hard-coded provider catalog.
- [x] Antigravity bridge uses loopback, headless JSON output, sandbox mode, bounded timeout, and never adds `--dangerously-skip-permissions`.
- [x] A loopback local-service Responses route does not need a reusable API secret.
- [x] A remote API-key route still fails closed when its credential binding is missing.
- [x] Direct OpenAI route preserves `store:false` while Groq-compatible Responses calls omit unsupported OpenAI-only fields.
- [x] Groq-style request/token rate-limit headers survive adapter normalization into attempt usage evidence.
- [x] Quota parser never invents a positive quota when provider output is unrecognized.
- [x] Healthy quota is preferred to reserved/exhausted quota for ordinary worker routing.
- [x] Routine work prefers economy capacity over scarce frontier capacity when both can satisfy the capability contract.
- [x] Reserved capacity is strongly deprioritized for worker use rather than consumed first.
- [x] Exhausted quota removes a route from ordinary free routing.
- [x] Independent verification remains required; no independent free verifier means blocked/Needs My Attention rather than self-verification.
- [x] A representative Free-First WorkItem can complete using two independent zero-incremental fixture routes with zero SpendEnvelope and zero CostRecord.
- [x] Usage attempts are accounted once only; repeated synchronization does not double-increment counters.
- [x] Stale Antigravity model routes remain disabled after rediscovery removes them and policy is re-applied.
- [x] OpenRouter local daily counter is bounded by policy instead of assuming unlimited free requests.
- [x] An unmanaged zero-incremental/included-subscription route cannot bypass Free-First policy.
- [x] `npm run phase21:certify` refuses to execute in CI without explicit `WORKFLOW_OS_FREE_FIRST_RUN=yes`.
- [x] Existing Phase 1/2 tests remain green.

## Live preflight acceptance

- [x] Antigravity CLI is installed and authenticated locally.
- [x] `agy models` returns at least one selectable model.
- [x] `/usage` can be queried without executing a Project WorkItem.
- [x] Antigravity `useG1Credits` is not enabled.
- [x] At least one independent free API provider is configured locally:
  - OpenRouter key constrained to `openrouter/free`; or
  - Groq API key whose account is explicitly confirmed to remain on the Free Plan.
- [x] Key presence may be reported, but key values never appear in console output, SQLite canonical state, logs, commits, issues, or PR text.

## Full free live certification acceptance

- [x] The operator explicitly sets `WORKFLOW_OS_FREE_FIRST_RUN=yes` for the certification process.
- [x] A representative synthetic WorkItem is executed by a non-fixture Free-First route.
- [x] A second independently configured non-fixture route performs verification.
- [x] The WorkItem reaches canonical completion only after verification.
- [x] The worker produces only the bounded deterministic artifact and does not self-certify execution/verification claims.
- [x] A representative portability drill succeeds through two independent real free ProviderConnections.
- [x] `phase2_certifications` contains passed evidence appropriate to the real routes.
- [x] Certification Workspace contains zero SpendEnvelope records.
- [x] Certification Workspace contains zero CostRecord records.
- [x] No production/destructive side effect is requested or performed.
- [x] Certification evidence is manually inspected before documentation changes from `live certification pending` to a stronger claim.

## Live evidence snapshot — 2026-09-12

Sanitized operator-inspected evidence:

- worker provider: Google Antigravity;
- verifier provider: OpenRouter;
- worker attempt status: `succeeded`;
- verifier attempt status: `succeeded`;
- provider independence: passed;
- loop outcome: `pass` / `objective_verified`;
- assignment verification status: `passed`;
- verification run: `L2` / `pass`;
- first real execution certification: `passed`;
- independent verifier certification: `passed`;
- portability drill certification: `passed`;
- SpendEnvelope count: `0`;
- CostRecord count: `0`;
- Antigravity paid-credit fallback: disabled.

See `docs/reviews/phase-2.1-live-certification-report.md`.

## Stop conditions for future recertification

Do not declare a future Phase 2.1 recertification valid when any of these is true:

- only fixtures passed;
- Antigravity is the worker and verifier within the same independence group;
- only one real provider is configured;
- Groq is treated as free without operator confirmation of Free Plan status;
- Antigravity credit fallback is enabled;
- a paid OpenRouter model is substituted for `openrouter/free`;
- the run produces a SpendEnvelope or CostRecord;
- provider quota/account state is unknown in a way that could cause paid execution;
- the evidence exists only in console text and was not persisted.
