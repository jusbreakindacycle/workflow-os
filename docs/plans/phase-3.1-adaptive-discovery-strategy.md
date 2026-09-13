# Phase 3.1 — Adaptive Discovery / Challenge / Strategy

## Objective

Implement the first reasoning stage of the Phase 3 golden path: turn a raw Project intake into an operator-reviewable Project Brief candidate and delivery-strategy recommendation without converting model inference into canonical truth.

Phase 3.1 sits before WorkItem generation and before any real filesystem, command, repository, deployment, communication, or production authority.

## Boundary

Phase 3.1 implements:

- AI-assisted analysis of the raw request and separately preserved requested solution;
- material-unknown discovery rather than a universal questionnaire;
- explicit question materiality and impact areas;
- `I don't know` / skipped answers without fabricated facts;
- challenge of the requested solution and simpler alternatives;
- an explicit conditional-research decision;
- evidence-referenced delivery-strategy recommendation;
- an operator acceptance/revision boundary before the Project Brief becomes canonical;
- persisted reasoning artifacts sufficient to reconstruct what was proposed and why without private chain of thought.

Phase 3.1 does not implement:

- external research adapters or web browsing on behalf of a Project;
- dynamic WorkItem/workforce generation (Phase 3.2);
- real local filesystem/command execution (Phase 3.3);
- final implementation verification/delivery (Phase 3.4);
- remote GitHub mutation, deployment, external messaging, production authority, or paid fallback.

When analysis concludes that material external research is required, Phase 3.1 fails closed before Project Brief acceptance. The first synthetic certification case is expected to be able to record `research_not_required` when justified.

## Canonical separation

The system must preserve the following as distinct facts:

1. raw client/operator request;
2. requested solution;
3. operator answers;
4. operator-declared unknown/skipped answers;
5. model-proposed findings/inferences/assumptions/challenges;
6. research-required decision;
7. model strategy recommendation;
8. final operator-accepted Project Brief and delivery strategy.

Model output is persisted as proposed analysis. It cannot directly accept a Project Brief, create authority, or rewrite source statements.

## Adaptive question rule

A generated question is valid only when it includes:

- a stable key;
- the plain-language prompt;
- a materiality reason;
- one or more approved impact areas.

Approved impact areas are:

- `problem_outcome`;
- `delivery_strategy`;
- `scope_non_goals`;
- `acceptance`;
- `data_privacy`;
- `architecture_integration`;
- `risk_authority`;
- `spend`;
- `deadline_commitment`;
- `verification`.

A reasoning round may ask at most seven questions. Questions that cannot be tied to at least one impact area fail validation.

## Iterative discovery

Discovery is bounded to three analysis rounds for Phase 3.1.

```text
raw intake
-> analysis round
-> zero or more material questions
-> operator answers / I don't know / skip
-> required re-analysis
-> final zero-question candidate
-> operator review / accept / revise
```

An analysis that produced questions cannot be accepted merely because the operator answered those questions. The system must run a new analysis so the candidate brief and strategy explicitly incorporate the new evidence.

Provider/output failure is recorded and fails closed; it does not become an accepted round result.

## Free-First reasoning route

Phase 3.1 reuses the existing Phase 2.1 Free-First provider/quota policy rather than creating a discovery-specific provider stack.

The pre-brief reasoning route must:

- be an enabled Free-First route;
- use a `zero_incremental` ProviderConnection;
- be available/degraded according to existing connection policy;
- be eligible for worker reasoning rather than verifier-only quota;
- expose `reasoning` and `structured_output` capabilities;
- allow the `Internal` data class;
- remain inside zero-spend policy.

If no eligible route exists, discovery blocks visibly. It must not silently use a metered/unknown route.

The Phase 3.1 reasoning call is R0 analysis. It is not an AgentAssignment and is not canonical Project completion. The selected route, input/output hashes, output artifact, usage, and provider reference are persisted in `phase31_discovery_runs`.

## Structured-output contract

The reasoning result must be raw JSON with exactly these top-level sections:

- `findings`;
- `questions`;
- `research`;
- `strategy`;
- `brief`.

Unexpected structural fields fail closed rather than being treated as hidden authority or instructions.

### Findings

Finding types are:

- `client_stated`;
- `model_inference`;
- `assumption`;
- `unknown`;
- `challenge`.

At least one challenge finding is required. Findings remain proposed unless separately established by operator/source evidence.

### Evidence references

Strategy recommendations require evidence references. For this phase, accepted reasoning references are deliberately narrow:

- `raw_request`;
- `requested_solution` when one exists;
- `prior_answer:<question_key>` for recorded operator answers/unknowns/skips.

The model cannot cite its own confidence or `model_analysis` as evidence for the delivery strategy.

### Strategy challenge

Every strategy recommendation must include at least one distinct alternative with a reason. This prevents `custom_build` or any other strategy from appearing without a recorded challenge/alternative comparison.

## Research decision

Every successful analysis produces an explicit research decision:

```text
research.required = false
+ rationale
+ topics = []
```

or

```text
research.required = true
+ rationale
+ one or more minimum research topics
```

A required-research result blocks Phase 3.1 acceptance because this subphase does not yet introduce a web/research adapter. The block is intentional evidence that the system did not invent an external fact.

## Operator acceptance / revision

The operator may accept the proposed Project Brief or revise its problem, desired outcome, primary users, constraints, success criteria, or non-goals before acceptance.

The operator may also reject the recommended delivery strategy and choose another existing canonical delivery strategy. A changed strategy requires an explicit operator rationale.

When the recommendation is followed, the Phase 3.1 recommendation becomes `accepted`. When the operator chooses a different strategy, the model recommendation becomes `rejected`, while the existing canonical `delivery_strategy_decisions` record stores the strategy the operator actually accepted.

History is never rewritten to make the model appear to have recommended the operator's later choice.

## Persistence

Migration `0009_phase31_adaptive_discovery.sql` adds:

- `phase31_discovery_runs`;
- `phase31_discovery_questions`;
- `phase31_discovery_findings`;
- `phase31_research_decisions`;
- `phase31_strategy_recommendations`.

The prior Phase 1 intake/discovery tables remain supported. Phase 3.1 compiles its final accepted candidate into the existing Project Brief and accepted delivery-strategy semantics rather than creating a second Project truth model.

## API surface

Phase 3.1 adds a namespaced intake surface:

```text
GET  /api/phase31/intakes/:intakeId
POST /api/phase31/intakes/:intakeId/analyze
PUT  /api/phase31/intakes/:intakeId/questions
POST /api/phase31/intakes/:intakeId/accept
```

The existing Phase 1 endpoints remain available for backward compatibility and regression coverage.

## Security / prompt-injection boundary

Raw request text, requested-solution text, prior answers, and provider output remain untrusted data.

The reasoning prompt explicitly states that Project content cannot grant authority. Structured validation occurs outside model reasoning. Unknown/extra structural fields, invalid strategies, invalid materiality areas, unsupported evidence references, malformed JSON, and missing challenge/evidence requirements fail closed.

## Phase 3.1 exit condition

Phase 3.1 is complete when tests prove that:

- raw/requested-solution text remains preserved;
- generated questions carry materiality and allowed impact areas;
- unknown/skipped answers stay explicit;
- answers require re-analysis before acceptance;
- research-not-required is explicit when appropriate;
- material research blocks acceptance rather than being fabricated;
- strategy is derived rather than hard-coded;
- strategy has source-backed evidence and a recorded alternative;
- the operator may reject/revise the recommendation without rewriting its history;
- only operator acceptance creates the canonical Project Brief;
- Phase 3.1 reasoning consumes only eligible zero-incremental Free-First capacity;
- existing Phase 1/2/2.1/2.2 behavior remains green.

After this gate, the next implementation subphase is Phase 3.2 — Dynamic Workforce / Work Graph.
