# AI Employee Task and Event Model

## Task state

Suggested normalized TaskAssignment lifecycle:

```text
created
 -> queued
 -> running
 -> waiting_human | waiting_external | waiting_schedule
 -> running
 -> succeeded | rejected | failed | cancelled | expired
```

## State ownership

Workflow OS owns normalized task state.

An agent runtime or workflow engine may have its own run/session state, but that is mapped into the TaskAssignment rather than replacing it.

## Terminal states

### succeeded
Requested bounded outcome was completed and verified to the degree required by the task contract.

### rejected
The task was intentionally refused because it was out of scope, unauthorized, invalid, or rejected by a required human/business rule.

### failed
The role attempted an in-scope task but could not reach a valid outcome.

### cancelled
A human/system explicitly cancelled the task.

### expired
Deadline/time budget elapsed and policy declares expiration rather than failure.

## Waiting states

Waiting must always include a reason and resume condition.

Examples:

- human approval
- human information request
- external callback
- provider recovery
- scheduled retry

## Task event envelope

Normalize events with fields equivalent to:

- event id
- event type
- occurred at
- workspace
- role id/version
- task id
- parent task id
- agent session id when applicable
- workflow/run id when applicable
- tool/action id when applicable
- actor/identity context
- risk tier
- approval reference
- correlation/trace id
- redacted payload metadata
- result/status

## Important event types

- task.created
- task.started
- task.waiting
- task.resumed
- task.completed
- task.rejected
- task.failed
- task.cancelled
- task.expired
- agent.session.started
- agent.session.stopped
- tool.proposed
- tool.authorized
- tool.denied
- tool.started
- tool.completed
- tool.uncertain
- escalation.created
- escalation.resolved
- memory.proposed
- memory.written
- policy.violation
- budget.warning
- budget.exhausted

## Idempotency

Inbound events that create tasks should use stable business/event identifiers where available so duplicate delivery does not create duplicate work.

## Cancellation

Cancellation should:

1. stop future agent/tool activity where possible;
2. cancel child tasks if policy says so;
3. preserve side effects already completed;
4. reconcile uncertain in-flight effects;
5. record final state.

Cancellation is not rollback.

## Task retry

Retrying a failed task should create an explicit new attempt/retry relation rather than silently erasing the prior failure.

Side-effect idempotency/reconciliation still applies.
