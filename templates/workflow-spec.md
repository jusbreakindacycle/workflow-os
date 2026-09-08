# Workflow Specification Template

## References

- Workflow Brief:
- WIR version:
- Workflow version:
- Workspace:
- Environment:
- ADRs:

## Trigger contract

Define event/manual/schedule semantics, input schema, authenticity/idempotency behavior.

## Node table

| Node | Type | Purpose | Risk | Timeout | Retry | Idempotency | Integration | Approval |
|---|---|---|---|---:|---|---|---|---|

## Routing rules

Document every condition and default/fallback branch.

## Failure semantics

For each external action:
- permanent errors
- retryable errors
- rate-limit handling
- uncertain side-effect reconciliation
- compensation if relevant
- failed/dead-letter behavior

## Human states

Approval evidence, timeout/escalation, reject behavior.

## AI behavior

If used:
- bounded task
- input/output schema
- evaluation set
- model/prompt policy
- cost/time ceiling
- fallback
- prohibited side effects

## Observability

Define run status, metrics, alerts, operator recovery view.

## Tests

Map test cases to acceptance criteria.

## Deployment/handoff

Execution adapter, environment, activation, rollback/deactivation, owner, and handoff notes.
