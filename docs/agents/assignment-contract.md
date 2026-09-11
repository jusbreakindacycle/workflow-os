# Agent Assignment Contract

An AgentAssignment is the bounded contract sent to an internal worker/runtime.

## Required semantics

Equivalent fields:

- assignment id/version;
- Workspace/Project/WorkItem ids;
- role/capability profile;
- exact objective;
- authoritative input/artifact references;
- in-scope work;
- explicit out-of-scope work;
- allowed tools/capabilities;
- repository/environment/workspace reference;
- selected Project Pack version;
- dependency/readiness snapshot;
- time/tool/iteration/cost budgets;
- SpendEnvelope ref when paid;
- required output artifacts;
- required evidence/verification;
- side-effect/risk/approval policy;
- stop conditions;
- escalation reason/target;
- provider/model/runtime route metadata after routing.

## State

Execution state remains distinct from WorkItem acceptance:

- created;
- queued;
- running;
- waiting;
- blocked;
- failed;
- canceled;
- execution_finished.

`execution_finished` means evidence is ready for acceptance checks, not WorkItem complete.

## Return contract

A worker returns structured references/summaries for:

- outcome;
- artifacts/changes;
- evidence/checks;
- assumptions/limitations;
- unresolved findings;
- provider-local decomposition if relevant;
- WorkItem Proposals;
- cost/usage;
- recommended next action;
- required escalation.

Private model reasoning is not required.
