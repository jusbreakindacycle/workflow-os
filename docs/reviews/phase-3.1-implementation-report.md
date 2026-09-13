# Phase 3.1 — Adaptive Discovery / Challenge / Strategy Implementation Report

## Verdict

Phase 3.1 is implemented and CI-verified on PR #18.

Workflow OS can now take a raw Project intake through bounded Free-First reasoning, ask only structured material questions, preserve explicit unknowns, require re-analysis after operator answers, record whether external research is materially required, challenge the requested solution, recommend a delivery strategy from source-backed evidence, and wait for operator acceptance/revision before creating the canonical Project Brief.

This phase remains pre-execution reasoning. It does not grant filesystem, shell, shared-repository, deployment, messaging, production, or paid-fallback authority.

## Implemented evidence

### Canonical persistence

Migration `0009_phase31_adaptive_discovery.sql` adds persisted analysis runs, generated questions, proposed findings, conditional-research decisions, and strategy recommendations while keeping the existing Project Brief as the canonical accepted direction.

The repository now runs with nine ordered migrations.

### Adaptive discovery

The reasoning contract:

- caps Phase 3.1 at three analysis rounds;
- caps one round at seven material questions;
- requires each question to state why it matters and which approved impact areas it may change;
- supports `answered`, `unknown`, and `skipped` operator responses;
- requires a new analysis after any question-bearing round before acceptance;
- rejects malformed or structurally unexpected model output.

### Challenge and strategy

Successful analysis must:

- include an explicit challenge of the requested solution;
- preserve the requested solution separately from the delivery strategy;
- cite allowed source evidence for the recommended strategy;
- record at least one distinct strategy alternative;
- never assume `custom_build` merely because the intake asks for a website/app.

The operator may accept the recommendation or choose another canonical delivery strategy with an explicit rationale. When overridden, the model recommendation remains recorded as rejected instead of being rewritten.

### Conditional research

Every successful analysis records either:

- `research_required=false` with rationale; or
- `research_required=true` with rationale and minimum research topics.

Phase 3.1 deliberately does not add an external research adapter. Material research therefore blocks Project Brief acceptance rather than allowing the model to invent external facts.

### Free-First reasoning

Pre-brief reasoning reuses the existing Phase 2.1 Free-First quota/policy state.

An eligible Phase 3.1 reasoning route must be zero-incremental, available/degraded, worker-eligible rather than verifier-only, support `reasoning` and `structured_output`, and allow `Internal` data. No eligible free route causes a visible stop instead of paid fallback.

Actual Phase 3.1 usage is accounted before a reasoning result is promoted to a successful analysis, so accounting failure cannot leave a successful-looking proposed result.

### Operator interface

The default local UI no longer presents the fixed five-question/manual-strategy form as the primary flow. It now shows:

- raw request and separately preserved requested solution;
- analysis/challenge/research rationale;
- dynamic material questions;
- `I don't know` / skip controls;
- strategy recommendation and alternatives;
- an editable Project Brief review;
- operator strategy override with rationale;
- explicit final acceptance before canonicalization.

The existing `Local Control Plane` identity remains visible for Phase 1 regression compatibility.

## CI evidence

GitHub Actions `Workflow OS Verify` run #109 passed on the corrected PR #18 head.

Observed evidence:

- source check: **55 JavaScript files + JSON parse checks passed**;
- automated tests: **75/75 passed**;
- failed tests: **0**;
- database migration command: **9 migrations passed**;
- database backup command: **passed**;
- `phase2:live` remained disabled without explicit operator approval;
- `phase21:certify` remained disabled without explicit Free-First operator opt-in;
- normal CI made no live provider call.

The earlier run #106 exposed two implementation regressions before closure: an invalid new quota-snapshot source enum and removal of the Phase 1 UI regression marker. Both were corrected rather than weakening existing tests. The accounting path was additionally hardened so usage accounting completes before proposed analysis is promoted to success.

## Explicit non-claims

Phase 3.1 does not prove:

- real external research execution;
- dynamic case-specific WorkItem/workforce generation;
- autonomous coding or filesystem mutation;
- command/shell execution;
- GitHub/shared-remote writes;
- production deployment;
- external/client communication;
- paid model fallback;
- the complete Phase 3 end-to-end delivery golden path.

Those remain later Phase 3 gates.

## Next phase

The next implementation subphase is **Phase 3.2 — Dynamic Workforce / Work Graph**.

Phase 3.2 should consume the operator-accepted Phase 3.1 Project Brief and generate strategy-specific WorkItems, dependencies, capability requirements, evidence contracts, authority requirements, verification requirements, and logical role activation rather than using the current universal Phase 1 software-shaped initial graph.
