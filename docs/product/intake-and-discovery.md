# Intake and Discovery

## Purpose

Convert incomplete human intent into accepted Project facts without forcing the operator to become the requirements engineer for every domain.

## Input classes

A Project may begin from:

- client request;
- user problem;
- internal product idea;
- observed operational pain;
- bug/change request;
- maintenance need.

## State separation

Do not collapse raw input, inference, recommendation, and accepted fact.

Store/reference distinct concepts:

- `RawRequest` — what the operator/client actually said;
- `DiscoveryQuestion` / `DiscoveryAnswer`;
- `Unknown`;
- `ResearchFinding`;
- `AssumptionProposal`;
- `SolutionOption`;
- `Decision`;
- accepted `ProjectBrief` fields.

This prevents an AI-generated assumption from becoming client truth merely because it was phrased confidently.

## Interview behavior

Questions should be:

- adaptive to known context;
- plain-language;
- one decision at a time where practical;
- prioritized by how much the answer changes scope/risk/architecture;
- skippable with `I don't know`.

The system should avoid asking for information it can safely derive or research itself.

## Challenge loop

Before locking a solution, compare:

1. what was requested;
2. the underlying problem/outcome;
3. constraints and commercial commitments;
4. at least the simplest viable solution;
5. material alternatives where they change cost/risk/time/value.

The output is a recommendation, not unilateral authority.

## Stop condition

Discovery is sufficient to move forward when:

- the target problem/outcome is explicit;
- unresolved unknowns are either non-blocking or represented as WorkItems/risks;
- material constraints are captured;
- success/acceptance can be described;
- the operator/client decision required to choose the working direction is recorded.

Do not seek perfect certainty before building an MVP.
