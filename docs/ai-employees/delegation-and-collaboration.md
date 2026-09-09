# Delegation and Collaboration

## Principle

Multi-agent systems are not automatically better than one role plus deterministic workflows.

Workflow OS starts with **single-role accountability**.

## Delegation model

A task has one accountable owner at a time:

- Workflow OS workflow;
- AI Employee role instance;
- human queue/owner.

When an AI Employee delegates work, it creates a bounded child task.

## Delegation rules

Every child task inherits or narrows:

- workspace;
- data classification;
- deadline;
- risk policy;
- total cost budget;
- allowed context.

Delegation cannot increase authority.

## Maximum delegation depth

Every role declares `max_delegation_depth`.

Phase 3 initial recommendation: **0 by default**.

Enable depth > 0 only for a demonstrated use case.

## No circular delegation

Task graph validation must prevent:

```text
Agent A -> Agent B -> Agent A -> ...
```

or otherwise enforce a hard cycle/iteration boundary.

## Budget accounting

Parent task budget includes child-task cost unless an explicit budget allocation model says otherwise.

An AI Employee cannot evade:

- tool-call limit;
- cost limit;
- runtime limit;

by delegating.

## Context sharing

Share the minimum context required by the child task.

Do not automatically pass:

- full parent conversation;
- unrelated memory;
- raw credentials;
- all available tools.

## Agent-to-agent communication

Future direct agent messaging should use structured task/result envelopes, not uncontrolled free-form persistent chats as the source of truth.

## Human collaboration

Human work remains first-class.

An AI Employee can:

- request information;
- request approval;
- escalate ambiguity;
- hand off an exception;
- prepare a draft for review.

The human response becomes structured task/workflow state where possible.

## Multi-agent gate

Before enabling multi-agent collaboration, prove:

1. a single AI Employee cannot reasonably satisfy the use case;
2. delegation creates measurable value;
3. ownership and terminal outcomes remain clear;
4. combined budgets are enforceable;
5. cross-agent context is controllable;
6. adversarial tests cover loops and privilege amplification.

See ADR-010.
