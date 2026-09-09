# ADR-007: AI Employee Is a Role Abstraction, Not a Runtime Primitive

**Status:** Accepted

## Context

“AI Employee” is a useful business-facing concept, but treating it as one continuously running autonomous agent would conflate:

- business responsibility;
- process state;
- reasoning;
- tool execution;
- authorization;
- memory;
- scheduling.

That would duplicate Workflow OS orchestration and create unclear accountability.

## Decision

An AI Employee is a **versioned governed role specification**.

At runtime, Workflow OS creates bounded Task Assignments. A task may use deterministic workflows, AI transforms, agent sessions, tools, and human work.

The AI Employee itself is not a new universal execution engine.

## Consequences

### Positive

- role can be mostly deterministic when appropriate;
- task state remains explicit;
- authority is separable from responsibility;
- easier testing/versioning;
- no infinite “always-on” agent is required;
- execution engines remain replaceable.

### Trade-off

The product must explain the distinction between the simple client-facing “AI Employee” concept and the underlying technical objects.

## Guardrail

Do not implement an AI Employee as a long-running LLM session that owns hidden business state.

## Revisit

Only if a future runtime requires persistent process identity and can still preserve Workflow OS task/state/policy ownership.
