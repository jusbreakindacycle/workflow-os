# AI Employee Terminology

## AI Employee

A **business-facing role abstraction** representing governed digital work.

This term is for product/service communication. It does not imply legal employment status, personhood, labor rights, or that the system should imitate a human unnecessarily.

Alternative client-facing labels may include:

- AI Worker
- Digital Worker
- AI Role
- AI Operations Assistant
- Agent

The repository uses **AI Employee** as the umbrella product concept and more precise technical terms underneath.

## Role Template

A reusable, client-neutral definition of a role.

Examples:

- Accounts Receivable Assistant
- Support Triage Assistant
- Operations Coordinator

Contains no real client secrets or confidential context.

## Role Instance

A workspace-specific instantiation of a Role Template or custom role.

It binds:

- workspace;
- role version;
- integrations/tool policies;
- knowledge sources;
- human owner;
- escalation destinations;
- deployment environment.

## Role Version

An immutable published version of an AI Employee specification.

Changing responsibilities, authority, tools, context policy, or instructions creates a new version.

## Task Assignment

A bounded unit of work assigned to an AI Employee.

Examples:

- investigate ticket 123;
- process today’s overdue-invoice batch;
- prepare a vendor-comparison brief.

The assignment has its own run/task identity, deadline, budget, and outcome.

## Agent Session

The runtime reasoning session used to perform a task assignment when agentic reasoning is necessary.

Not every AI Employee task requires an agent session.

## Skill

A reusable business capability exposed to an AI Employee.

In Workflow OS, a skill should normally be implemented as or backed by:

- a governed workflow;
- a narrow tool;
- a deterministic function;
- an approved sub-process.

“Skill” is a packaging concept, not permission to create another hidden execution engine.

## Tool

A narrowly scoped action or read capability governed by the Connector/Tool Contract.

## Knowledge

Approved read-oriented sources used to ground a task.

Knowledge is distinct from memory.

## Memory

Explicit persisted state derived from prior tasks or interactions.

Memory is optional, typed, scoped, reviewable, and subject to retention rules.

## Human Owner

The accountable person responsible for the AI Employee’s role definition, authority, performance review, and escalation handling.

Every deployed AI Employee must have one.

## Autonomy Class

A policy class describing what the AI Employee may do without a new human decision.

See `lifecycle-and-autonomy.md`.

## Important distinction

```text
AI Employee = role
Agent       = dynamic reasoning component
Workflow    = process/state model
Tool        = capability
Task        = bounded unit of work
Workflow OS = governor/orchestrator
```
