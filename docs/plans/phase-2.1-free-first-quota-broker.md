# Phase 2.1 — Free-First Provider & Quota Broker

## Objective

Extend the merged Phase 2 autonomy kernel so Workflow OS can automatically choose and rotate among eligible free/zero-incremental model routes while preserving quota for harder work and independent verification and never silently crossing into paid execution.

Phase 2.1 answers:

> Can Workflow OS use multiple real free model sources as a governed pool, adapt to quota/usage pressure, preserve verifier capacity, and stop safely when free capacity is insufficient?

## Gate 0 — Phase 2 merged

The Phase 2 ProviderConnection → ExecutionRoute → Broker → bounded Assignment → independent verifier path remains authoritative. Phase 2.1 extends routing policy; it does not replace Project/WorkItem/Assignment semantics.

## Gate 1 — Free Routing Policy + zero-spend lock

Add Workspace-scoped policy with:

- Free-First enabled/disabled state;
- hard zero-spend lock;
- quota thresholds;
- verifier reserve threshold;
- explicit behavior when quota is unknown.

Free-First execution cannot use metered/unknown billing routes.

## Gate 2 — Quota observations + usage accounting

Persist timestamped quota observations and local request/token counters without treating them as canonical Project truth.

Sources may include:

- Antigravity `/usage` / `/quota` output;
- provider rate-limit headers;
- conservative local counters;
- explicit operator observations.

## Gate 3 — Google Antigravity bridge

Use the official `agy` CLI as a replaceable local-service ProviderConnection:

- authenticate interactively once on the operator machine;
- discover current model slugs with `agy models`;
- query quota with `/usage`;
- execute pinned models through headless JSON mode;
- use a loopback bridge into the existing normalized Responses adapter;
- force sandbox mode;
- never use `--dangerously-skip-permissions`;
- reject zero-spend certification when `useG1Credits=true`.

The model catalog is discovered at runtime rather than frozen into Workflow OS canonical state.

## Gate 4 — Independent free API routes

Initial independent routes:

- Groq Free Plan, currently using an OpenAI-compatible Responses endpoint and a free-plan-supported model;
- OpenRouter `openrouter/free` as a zero-price fallback router.

Credentials remain local environment bindings. Groq requires an explicit operator assertion that the account/key remains on the Free Plan. OpenRouter is pinned to the free router rather than a paid model identifier.

## Gate 5 — Quota reservation + task-aware scoring

Normalize remaining capacity:

```text
>= 40%      healthy     normal routing
15–40%      conserve    penalize scarce routes
10–15%      reserved    preserve scarce capacity
< 10%       exhausted   remove from ordinary routing
unknown     controlled fallback according to policy
```

Task classes:

- routine;
- standard;
- complex;
- critical.

Routine work should prefer faster/economical free routes. Complex/critical work may prefer stronger models when capacity remains. Provider identity is not part of Project meaning.

## Gate 6 — Automatic fallback and stop behavior

A failed/rate-limited/exhausted route may re-broker only to another eligible Free-First route. It must not silently enter the existing paid/metered execution path.

If no independent free verifier remains, block and create visible attention instead of self-certifying.

## Gate 7 — Operator API + Windows harness

Expose local API/state for:

- policy inspection/update;
- usage synchronization;
- policy application;
- governed Free-First WorkItem execution.

Provide Windows PowerShell preflight and certification procedures without ever asking the operator to paste API keys into chat, Git, documentation, issues, or PRs.

## Gate 8 — Full free live certification

A full zero-spend certification requires:

1. authenticated Antigravity CLI with credit fallback disabled;
2. at least one independent real zero-cost API route (OpenRouter free router or acknowledged Groq Free Plan);
3. one representative WorkItem completed by real free routes with independent verification;
4. one representative portability drill across two independent real ProviderConnections;
5. zero SpendEnvelope and zero CostRecord for the certification Workspace;
6. persisted certification/evidence records.

## Exit states

### Implementation complete

- migrations green/idempotent;
- quota policy/counters tested;
- Antigravity bridge tested without live calls;
- provider-compatible Responses payloads tested;
- Free-First bounded execution tested with independent fixture routes;
- normal CI cannot start a live free-provider run;
- documentation/operator procedures complete.

### Full free live certification complete

- real Antigravity execution succeeds;
- a second independent real free provider participates in verification;
- portability drill passes;
- zero paid spend invariant is evidenced;
- certification records are inspected before repository status is upgraded.

Until the operator configures those accounts locally, the honest status is:

> **Phase 2.1 Free-First Broker implemented/offline-verified; full free live certification pending operator account setup.**

## Non-goals

Phase 2.1 does not introduce paid automatic fallback, production deployment, a generic provider marketplace, Paperclip/Activepieces, autonomous high-risk side effects, or a full model-management dashboard.
