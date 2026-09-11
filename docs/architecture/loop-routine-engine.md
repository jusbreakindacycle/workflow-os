# Loop / Routine Engine

## Purpose

Allow approved work to continue, retry, verify, react to events, and maintain systems without the operator repeatedly typing prompts.

## Loop contract

Every loop defines:

- `trigger`;
- `goal_predicate` / acceptance target;
- Project/WorkItem scope;
- authorized roles/tools/capabilities;
- input/artifact references;
- verification strategy;
- max iterations;
- time/deadline budget;
- tool/cost budget;
- retry/fallback policy;
- side-effect policy;
- stop conditions;
- escalation reason/target.

No unbounded loop is valid.

## Routine

A routine is a loop activated by time/event conditions, for example:

- CI failure;
- new customer feedback;
- deployment health event;
- dependency completion;
- scheduled maintenance/research;
- incoming approved business event.

## Basic state machine

```text
triggered
  -> validate readiness/authority/budget
  -> execute one bounded iteration
  -> collect evidence
  -> verify predicate
      -> passed: finish/transition
      -> failed but retryable: diagnose + next bounded iteration
      -> blocked/unsafe/budget: escalate
```

## Loop engineering principle

Repeated failure should improve the harness, test, skill, guard, contract, or environment when possible. Do not respond to systemic failure only by adding more prompt prose.

## Spend interaction

A loop may consume paid resources only inside an existing approved SpendEnvelope. Exhaustion stops/escalates; it never silently extends budget.

## Production policy

Low-risk maintenance loops may eventually run unattended when evidence supports it. High-impact production remediation remains approval-gated.

## Phase boundary

Phase 1 defines/contracts loop records but does not require autonomous background scheduling/execution.
