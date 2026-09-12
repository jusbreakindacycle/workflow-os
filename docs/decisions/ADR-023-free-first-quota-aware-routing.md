# ADR-023 — Free-first, quota-aware provider routing

**Status:** Proposed until the Phase 2.1 PR is merged.

## Context

Phase 2 established provider-neutral execution, bounded spend, fallback, independent verification, and live-certification evidence. The operator's current practical constraint is stronger: routine autonomous work should use genuinely free or already-included capacity first and must never silently cross into paid execution when free quotas are exhausted.

Free capacity is not unlimited capacity. Providers expose different reset windows, request/token limits, model pools, and account-level quotas. Treating every zero-price route as permanently available would cause avoidable rate-limit failures and can consume scarce high-capability quota on trivial work, leaving no independent verifier capacity for important work.

## Decision

1. Workflow OS adds a Workspace-scoped **Free Routing Policy** as operational policy, not Project meaning.
2. Free-First mode has a **zero-spend lock**. It may select only routes explicitly configured as zero-incremental under the Free-First policy.
3. Free-First mode never falls back to `metered` or `unknown` billing. A paid route requires a separate explicit operator action outside Free-First mode and the existing Spend Gate still applies.
4. Provider/model quota is represented by timestamped **QuotaSnapshot** records. Quota records are operational observations and do not become canonical Project truth.
5. Provider usage is counted locally even when a provider supplies no machine-readable quota headers. Provider-reported headers take precedence when available.
6. Quota state is normalized into `healthy`, `conserve`, `reserved`, `exhausted`, or `unknown`.
7. Default reservation bands are:
   - at least 40% remaining: normal use;
   - 15–40%: conserve;
   - 10–15%: reserve scarce capacity primarily for verification/important work;
   - below 10%: treat as exhausted for ordinary autonomous routing.
   These are configurable operational defaults, not provider facts.
8. Model strength and quota state both affect routing. Routine work prefers economical capacity; complex/high-risk work may justify stronger models while sufficient quota remains.
9. Independent verification remains an authority boundary. When no independent free verifier remains, the WorkItem blocks/needs attention rather than self-certifying or silently paying.
10. Google Antigravity is integrated through a loopback bridge around the official `agy` CLI. Workflow OS discovers model slugs from `agy models` instead of hard-coding the vendor catalog as canonical state.
11. Antigravity runs use sandboxed headless execution. Workflow OS must not invoke `--dangerously-skip-permissions` in the Free-First bridge.
12. Antigravity paid-credit fallback must be off for zero-spend certification. `useG1Credits=true` causes the Free-First preflight/certification to refuse execution.
13. Groq may be treated as a Free-First route only when the operator explicitly confirms the configured key belongs to a Free Plan account. This is an external-account assertion because Workflow OS cannot independently guarantee the provider's future billing-plan state.
14. OpenRouter Free Models Router must be pinned to `openrouter/free`; the broker must not substitute a paid OpenRouter model.
15. Secrets stay outside canonical state and committed files. ProviderConnection stores only credential references such as `GROQ_API_KEY` and `OPENROUTER_API_KEY`.
16. Free quotas are not availability guarantees. Provider changes, capacity limits, account restrictions, or model removals become route-health/fallback conditions.

## Consequences

- Normal work can rotate among free routes without manual prompt copying.
- Exhausting one free provider does not alter the Project or WorkItem; it changes route eligibility.
- Strong model quota can be preserved instead of consumed first simply because that model has the highest raw quality score.
- A zero-price route and an independently verified zero-spend claim are different things. Live certification still requires evidence from real configured accounts.
- Groq's no-spend guarantee depends on the operator keeping that key on the Free Plan. OpenRouter's `openrouter/free` route and Antigravity with credit fallback disabled provide stronger route-level zero-price constraints.
- Provider quotas and model catalogs may change without requiring a schema rewrite.

## Non-decision

This ADR does not make Google, Groq, or OpenRouter permanent dependencies. They are initial replaceable Free-First routes behind the Phase 2 ProviderConnection/ExecutionRoute boundary.
