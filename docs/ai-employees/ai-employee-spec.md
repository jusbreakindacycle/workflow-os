# AI Employee Specification v0

## Purpose

The AI Employee Spec is the canonical definition of a governed digital role.

It complements WIR:

- **AI Employee Spec** defines the role, authority, context, budgets, and responsibilities.
- **WIR** defines executable workflow/process structure.

An AI Employee may reference one or more workflows and tools.

## Required top-level fields

- `spec_version`
- `role`
- `purpose`
- `responsibilities`
- `non_responsibilities`
- `operating_model`
- `authority`
- `capabilities`
- `context_policy`
- `limits`
- `escalation`
- `evaluation`
- `observability`

## Role identity

Required:

- role id;
- display name;
- workspace reference;
- version;
- environment;
- human owner reference;
- lifecycle status.

## Responsibilities

Responsibilities describe outcomes and task families.

They are not permission grants.

A responsibility such as “manage invoice follow-ups” does not automatically grant refund, pricing, payment, or deletion authority.

## Non-responsibilities

Every role must explicitly state what it does **not** own.

This protects against goal expansion and provides escalation boundaries.

## Operating model

Declare:

- request-driven;
- event-driven;
- scheduled;
- batch;
- monitored/background.

“Background” still means bounded task assignments are created from events/schedules. It does not mean an infinite uncontrolled agent loop.

## Authority

Declare:

- autonomy class;
- maximum automatic action risk;
- actions requiring approval;
- prohibited actions;
- identity mode;
- delegation policy.

R3 actions always require human approval under current Workflow OS policy.

## Capabilities

References to:

- workflow refs;
- skill refs;
- tool refs;
- approved knowledge sources.

No raw secret values.

## Context policy

Defines:

- task input;
- knowledge scope;
- memory types allowed;
- memory write policy;
- retention;
- workspace boundary;
- data classification.

## Limits

At minimum when agentic reasoning is possible:

- max task runtime;
- max reasoning iterations;
- max tool calls;
- max cost;
- max delegation depth;
- concurrency ceiling.

## Escalation

Required:

- human escalation destination;
- explicit escalation triggers;
- timeout behavior;
- what context may be sent;
- terminal failure behavior.

## Evaluation

References to evaluation suites and readiness rules.

No role moves from test/shadow to higher autonomy solely because it “looked good” in demos.

## Versioning

Published role versions are immutable.

Task runs always reference the exact role version used.
