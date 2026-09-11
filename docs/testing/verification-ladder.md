# Verification Ladder

Use evidence proportional to consequence.

## L0 — assertion only

Agent/provider says it worked. **Not sufficient completion evidence.**

## L1 — static/structural

Schema validation, formatting, type/lint, configuration checks, file existence, compile checks.

## L2 — automated behavior

Unit/integration/contract/evaluation tests in controlled environment.

## L3 — real relevant flow

Exercise the actual user/API/workflow path in an appropriate environment and capture observable result.

## L4 — side-effect / business reconciliation

Confirm the external business state matches intent: read-after-write, database/provider reconciliation, deployment health, message delivery, etc.

## L5 — independent verification / human acceptance

Independent verifier attempts to falsify completion; human approval/acceptance where consequence/policy requires it.

## Rules

- higher risk may require multiple levels;
- implementer self-report never replaces required independent evidence;
- failed verification changes canonical state even if provider status is `done`;
- evidence references exact relevant versions/provider route.
