# Phase 3.1 — Adaptive Discovery / Challenge / Strategy Acceptance Criteria

Phase 3.1 passes only when adaptive reasoning remains evidence-bound and human-governed. Model output is proposal/evidence, never automatic Project truth.

## A. Persistence and migration

- [ ] Migration `0009_phase31_adaptive_discovery.sql` is append-only and checksum-stable after merge.
- [ ] Phase 3.1 analysis runs, questions, findings, research decisions, and strategy recommendations are persisted with Workspace/Project/Intake scope.
- [ ] Migration/restart remains idempotent with nine migrations.
- [ ] Existing Phase 2.2 authority triggers remain present.

## B. Raw request and source separation

- [ ] Raw request remains unchanged in `project_intakes`.
- [ ] Requested solution remains separate from accepted delivery strategy.
- [ ] Operator answers/unknown/skipped responses are distinguishable from model-proposed findings.
- [ ] Model analysis cannot mark itself as operator/client acceptance.

## C. Adaptive material questions

- [ ] A reasoning round asks at most seven questions.
- [ ] Every question has a stable key, prompt, materiality reason, and at least one approved impact area.
- [ ] Unknown impact areas fail validation.
- [ ] `answered`, `unknown`, and `skipped` are all supported operator outcomes.
- [ ] Partial answers leave remaining open questions unresolved.
- [ ] Open questions block the next reasoning round.
- [ ] Any round that produced questions requires a subsequent analysis before Project Brief acceptance.
- [ ] Discovery is bounded to three analysis rounds.

## D. Challenge and evidence

- [ ] Successful model output contains at least one explicit challenge finding.
- [ ] Strategy recommendation has at least one source-backed evidence reference.
- [ ] Unsupported/self-referential strategy evidence fails validation.
- [ ] Every recommendation includes at least one distinct alternative strategy and reason.
- [ ] `custom_build` is never inserted as a default merely because a website/app was requested.

## E. Conditional research

- [ ] Every successful analysis records whether material external research is required.
- [ ] `research_required=false` requires rationale and no fake topics.
- [ ] `research_required=true` requires rationale and at least one minimum topic.
- [ ] Required research blocks Project Brief acceptance in Phase 3.1 instead of fabricating an external fact.

## F. Free-First routing

- [ ] Phase 3.1 analysis reuses the existing Free-First policy/broker state.
- [ ] Only enabled `zero_incremental` worker routes with `reasoning`, `structured_output`, and `Internal` data eligibility may be selected.
- [ ] Verifier-only reserved routes are not selected as discovery workers.
- [ ] No eligible free reasoning route creates a visible conflict/block rather than paid fallback.
- [ ] Selected route and reasoning-run input/output hashes/usage/external reference are persisted.
- [ ] Phase 3.1 usage contributes to existing quota/counter state without becoming canonical Project meaning.

## G. Structured-output safety

- [ ] Model result must be raw JSON, not markdown-wrapped JSON.
- [ ] Unexpected top-level or nested contract keys fail closed.
- [ ] Invalid strategy identifiers fail closed.
- [ ] Invalid question keys/materiality areas fail closed.
- [ ] Failed parsing/validation leaves a failed analysis record and does not mutate an accepted Project Brief.

## H. Human acceptance / revision

- [ ] A Project Brief is not accepted solely because the model produced a candidate.
- [ ] Operator can revise problem/outcome/users/constraints/success/non-goals before acceptance.
- [ ] Operator can reject the recommended strategy and choose another canonical strategy with explicit rationale.
- [ ] Followed recommendation is recorded `accepted`.
- [ ] Overridden recommendation is recorded `rejected`; history is not rewritten.
- [ ] Canonical `delivery_strategy_decisions` stores the strategy actually accepted by the operator.

## I. Project Brief compilation

- [ ] Final Phase 3.1 acceptance compiles into the existing Phase 1 Project Brief/version semantics.
- [ ] Required `problem`, `desired_outcome`, and `success` are present.
- [ ] Unknown optional users/constraints remain represented as unknown rather than invented values.
- [ ] Non-goals and Phase 3.1 provenance refs are preserved in the accepted working scope.
- [ ] Internal Project Brief acceptance does not fabricate external client/commercial acceptance.

## J. API and health

- [ ] Phase 3.1 snapshot/analyze/question/accept endpoints are routed by the local app.
- [ ] Snapshot is readable before an analysis exists.
- [ ] Analyze without an eligible Free-First reasoning route fails closed with a conflict response.
- [ ] Health reports Phase 3.1 and nine migrations.

## K. Regression boundary

- [ ] Normal CI remains credential-free and makes no live provider calls.
- [ ] Existing Phase 1 control-plane tests remain green.
- [ ] Existing Phase 2 autonomy tests remain green.
- [ ] Existing Phase 2.1 Free-First tests remain green.
- [ ] Existing Phase 2.2 authority-hardening tests remain green.
- [ ] Phase 3.1 adds no filesystem/command worker authority, shared GitHub mutation, deployment, messaging, or production action.

## Exit gate

Phase 3.1 exits when a controlled synthetic intake can move from raw request -> adaptive proposed analysis -> material operator answers/unknowns -> re-analysis -> explicit research decision -> challenged evidence-backed strategy -> operator acceptance/revision -> canonical Project Brief, while unsupported research/provider/structure conditions fail closed.

The next implementation phase is Phase 3.2 — Dynamic Workforce / Work Graph.
