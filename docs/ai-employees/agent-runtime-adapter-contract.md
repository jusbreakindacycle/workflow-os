# Agent Runtime Adapter Contract

## Purpose

Workflow OS should not make AI Employees depend on one model provider or agent framework.

An Agent Runtime Adapter provides bounded dynamic reasoning for a TaskAssignment.

It does **not** own Workflow OS authorization, business workflow state, role authority, or secrets.

## Conceptual operations

A future adapter should expose operations equivalent to:

- `validateCapability(roleVersion, taskType)`
- `prepareSession(task, roleContext, allowedCapabilities)`
- `startSession(session)`
- `resumeSession(session, normalizedInput)`
- `getSession(sessionRef)`
- `cancelSession(sessionRef)`
- `normalizeEvents(sessionRef)`
- `health()`

If checkpoint/restore is advertised:

- `checkpoint(sessionRef)`
- `restore(checkpointRef)`

These names are conceptual, not implementation code.

## Required capability manifest

Declare:

- runtime/provider/framework
- supported model-policy features
- structured output support
- tool calling
- streaming/event support
- checkpoint/resume
- human interrupt support
- context limits
- timeout/cancellation behavior
- usage/cost reporting
- data residency/retention controls known to the adapter
- supported authentication mode
- known failure semantics.

## Tool-call interception

The agent runtime may **propose** a tool call.

Workflow OS (or its governed tool broker) must authorize the actual call.

```text
agent proposes
 -> Workflow OS policy check
 -> approval check
 -> tool executes
 -> structured result
 -> agent observes result
```

Do not hand the runtime unrestricted credentials and hope the prompt enforces policy.

## Context boundary

The adapter receives a deliberately assembled context package.

It must not independently search other workspaces, hidden operator history, or arbitrary secret stores.

## Model/provider policy

Role definitions should reference a model/runtime policy rather than hard-code business authority into one model.

Changing model/provider can require re-evaluation before promotion.

## Session lifetime

Agent sessions are bounded by the TaskAssignment.

No adapter may turn a completed role task into an indefinite autonomous background loop.

## Event normalization

Record enough structured evidence to reconstruct:

- session start/stop
- model/runtime version where available
- tool proposals/results
- policy decisions
- escalations
- budgets
- final structured outcome.

Do not require storing private hidden chain-of-thought.

## Failure categories

Normalize:

- invalid context/spec
- model unavailable
- model timeout
- provider rate/quota
- structured-output failure
- tool-request denied
- tool failure
- budget exhausted
- context limit exceeded
- runtime internal error
- cancellation
- policy violation.

## Runtime portability

If a role cannot preserve its required semantics on a runtime adapter, deployment validation fails rather than silently weakening authority, context, or evaluation requirements.
