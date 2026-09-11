# Agent Assignment Contract

An AgentAssignment is the bounded contract sent to an internal worker/runtime.

## Required semantics

Equivalent fields:

- assignment id/version;
- Workspace/Project ids;
- WorkItem id **and exact WorkItem version**;
- role/capability profile;
- exact objective;
- Project Pack ref/version;
- minimum-authorized Context Slice ref/version;
- authoritative input/artifact refs;
- in-scope and out-of-scope work;
- allowed tools/capabilities;
- repository/environment/workspace reference;
- dependency/readiness snapshot;
- time/tool/iteration/cost budgets;
- SpendEnvelope ref when incremental paid execution is authorized;
- required output artifacts/evidence;
- side-effect/risk/approval policy;
- stop conditions;
- escalation reason/target;
- route metadata after routing.

## State

Execution state remains distinct from WorkItem acceptance: `created`, `queued`, `running`, `waiting`, `blocked`, `failed`, `canceled`, `execution_finished`.

`execution_finished` means evidence is ready for acceptance checks, not WorkItem complete.

## Context rule

Project Pack is not automatically the provider prompt. The worker receives the Context Slice plus authorized references it needs. Context assembly must enforce Workspace/data/tool policy and record provenance.

## Return contract

A worker returns structured references/summaries for outcome, artifacts/changes, evidence/checks, assumptions/limitations, unresolved findings, provider-local decomposition, WorkItem Proposals, cost/usage, recommended next action, and escalation.

Private model reasoning is not required.
