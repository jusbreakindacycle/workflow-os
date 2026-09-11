# Phase 2 — Autonomy Kernel / First Real Execution

## Objective

Turn Phase 1's provider-neutral Assignment contracts into a real execution kernel without surrendering Project authority to a model vendor, coding runtime, or workforce platform.

Phase 2 answers one practical question:

> Can Workflow OS take one ready WorkItem, select an eligible execution route, compile bounded context/instructions, execute without operator prompt-copying, independently verify the result, retry/fallback within explicit limits, and preserve canonical truth/spend/authority boundaries?

## Gate 0 — Phase 1 accepted

Phase 1 local control-plane evidence is merged and green. Project Pack, Context Slice, Assignment, SpendEnvelope, evidence, verification, Activity Feed, and Needs My Attention remain authoritative.

## Gate 1 — Capability + ProviderConnection registry

Implement normalized capability vocabulary, ProviderConnection/entitlement state, credential references, locality/data-class constraints, and non-spending configuration health checks.

Raw credentials never enter canonical Project state, logs, fixtures, or committed files.

## Gate 2 — Model/runtime Broker + Spend enforcement

Implement route profiles and deterministic eligibility/scoring:

1. capability/data/locality constraints;
2. enabled/healthy configured connection;
3. approved SpendEnvelope for metered/unknown-cost routes;
4. quality/reliability/latency/cost ranking;
5. persisted RouteDecision + candidate rationale;
6. Needs My Attention when nothing qualifies.

Fallback must rerun eligibility checks. It cannot silently upgrade from zero-incremental execution to paid execution.

## Gate 3 — Project Bootstrapper + Instruction Compiler

Compile current Project Pack into deterministic project projections, then compile exact WorkItem + Context Slice + Skills into Assignment-scoped instructions.

Generated `AGENTS.md`, assignment markdown/JSON, or future provider-native instruction files are derived artifacts, not canonical truth.

## Gate 4 — Skill Registry

Store versioned/hashes skills with required capabilities and risk tier. Phase 2 begins with a deliberately small built-in set:

- bounded execution;
- independent evidence verification;
- safe escalation.

Skills cannot grant authority beyond the Assignment, Approval, side-effect policy, or SpendEnvelope.

## Gate 5 — Execution adapters + explicit live harness

Implement a normalized adapter boundary with:

- deterministic `fixture` adapter for CI;
- direct OpenAI Responses adapter;
- direct Anthropic Messages adapter.

Model identifiers are configuration, not product semantics. Normal CI never calls a paid provider. Live execution is opt-in through `npm run phase2:live`, environment credential references, explicit `WORKFLOW_OS_LIVE_APPROVE_SPEND=yes`, and a bounded maximum amount.

## Gate 6 — Bounded Loop Engine

Run a WorkItem inside an explicit loop contract:

```text
ready WorkItem
  -> routed Assignment
  -> worker attempt
  -> verifier attempt
      -> pass: evidence -> canonical verification -> complete
      -> fail/retryable: verifier feedback -> bounded retry
      -> route failure: re-broker fallback
      -> no route / budget / time / authority: stop + surface attention
```

No unbounded iteration is valid.

## Gate 7 — Independent verifier + fallback

Verifier route should use a different independence group from the worker route when independent verification is required. If unavailable, the Assignment blocks instead of self-certifying.

Worker/verifier route failure may select an eligible fallback, but the canonical objective and WorkItem version do not change.

## Gate 8 — Portability drill + certification evidence

The same canonical Assignment projection can be exercised through two distinct configured routes/connections without changing Project meaning.

There are three separate claims:

1. **implementation portability** — fixture routes prove adapter/rerouting semantics;
2. **first real execution** — at least one non-fixture route succeeds under bounded authority/spend;
3. **operational provider portability** — two independently configured non-fixture routes/providers pass a representative rerouting drill.

Do not collapse these claims.

## Phase 2 exit states

### Implementation complete

All offline/fixture tests and provider-adapter HTTP contract tests pass, CI remains green, normal CI performs no live provider call, and the live harness is available.

### First real execution certified

A non-fixture route creates a passing `first_real_execution` certification using operator-provided credentials and bounded spend.

### Operational provider portability certified

Two independent non-fixture ProviderConnections pass a `portability_drill` and representative worker/verifier routing without changing Project semantics.

If credentials are not configured during repository development, the honest Phase 2 repository state is:

> **Autonomy kernel implemented; live provider certification pending operator configuration.**

That is not a failure of the architecture and must not be disguised as a successful live test.

## Non-goals

Phase 2 does not add AI-assisted discovery, full end-to-end client delivery, production deployment, Activepieces, Paperclip, a generic agent chatroom, an ERP/CRM/PM suite, or unattended high-risk production loops.
