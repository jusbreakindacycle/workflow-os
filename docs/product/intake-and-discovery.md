# Intake and Discovery

## Purpose

Convert incomplete human intent into accepted Project facts without forcing the operator to become the requirements engineer for every domain — and without assuming that every problem should become custom software.

## Input classes

A Project may begin from client request, user problem, internal product idea, observed operational pain, bug/change request, or maintenance need.

## State separation

Do not collapse raw input, inference, recommendation, and accepted fact.

Store/reference distinct concepts:

- `RawRequest` — what the operator/client actually said;
- `DiscoveryQuestion` / `DiscoveryAnswer`;
- `Unknown`;
- `ResearchFinding`;
- `AssumptionProposal`;
- `SolutionOption`;
- `DeliveryStrategyDecision`;
- `Decision`;
- accepted `ProjectBrief` fields.

This prevents an AI-generated assumption from becoming client truth merely because it was phrased confidently.

## Interview behavior

Questions should be adaptive to known context, plain-language, prioritized by impact on scope/risk/architecture, skippable with `I don't know`, and avoided when the answer can be safely researched/derived.

Phase 1 Gate 3 begins with a small deterministic question set. Later AI-assisted discovery may choose questions dynamically, but it must preserve the same state separation and unknown semantics.

## Requested solution vs actual problem

Preserve what the client/operator requested, but do not assume the requested artifact is the best intervention.

Before architecture, compare the problem/outcome against plausible delivery strategies such as:

- `process_change` — fix/standardize the process before software;
- `adopt_existing` — use an existing product/service;
- `configure` — configure an existing system;
- `integrate` — connect existing systems;
- `automate` — automate a repeatable workflow;
- `custom_build` — build bespoke software;
- `hybrid` — combine approaches;
- `research_pilot` — research or pilot first because uncertainty is too high for full commitment;
- `defer` — decline or defer because value/feasibility/risk does not justify proceeding yet.

The decision is case-specific. No strategy wins by default.

## Feasibility/value challenge

For material options, evaluate the evidence that actually changes the decision, for example:

- user/business value;
- process clarity and exception rate;
- interface/API/tool availability;
- data quality;
- privacy/security/legal constraints;
- reversibility/verifiability;
- implementation/operating cost;
- expected maintenance burden;
- time-to-value;
- whether a simpler existing solution satisfies the outcome.

Do not fabricate numeric ROI or weighted scores when reliable inputs do not exist. Unknowns remain explicit.

## Client request rule

The system may recommend something different from what the client requested, but it never silently substitutes the recommendation for the request/commitment. Present the trade-off and record the human/client decision required.

## Stop condition

Discovery is sufficient to move forward when the target problem/outcome is explicit; material constraints are captured; a working delivery strategy is chosen or a strategy-comparison WorkItem exists; unresolved unknowns are non-blocking or represented as work/risks; success/acceptance is describable; and required operator/client decisions are recorded.

Do not seek perfect certainty before an MVP/pilot.
