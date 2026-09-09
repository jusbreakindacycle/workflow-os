# AI Employee Specification v0

## Purpose

The AI Employee Spec is the canonical definition of a governed digital role.

It complements WIR:

- **AI Employee Spec** defines the role, authority, context, budgets, responsibilities, reasoning policy, governance, and delegation policy.
- **WIR** defines executable workflow/process structure.

An AI Employee may reference one or more workflows, skills, tools, and knowledge sources.

## Required top-level fields

- `spec_version`
- `role`
- `purpose`
- `responsibilities`
- `non_responsibilities`
- `operating_model`
- `governance`
- `authority`
- `capabilities`
- `reasoning_policy`
- `context_policy`
- `delegation`
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

## Governance

Every role declares:

- applicable high-stakes domains;
- whether special review is required.

If a role affects employment, credit/insurance, health, legal, safety, significant financial, education-access, public-benefit/enforcement, or similar high-impact decisions, follow `high-stakes-role-gate.md`.

Generic Workflow OS controls do not substitute for client/jurisdiction-specific review.

## Authority

Declare:

- autonomy class;
- maximum automatic action risk;
- actions requiring approval;
- prohibited actions;
- identity mode.

R3 actions always require human approval under current Workflow OS policy.

## Capabilities

References to:

- workflow refs;
- skill refs;
- tool refs;
- approved knowledge sources.

No raw secret values.

## Reasoning policy

Defines references for future agentic execution:

- immutable role instruction reference;
- model policy reference;
- optional agent-runtime policy/reference.

Instructions guide model behavior but do not grant authorization.

## Context policy

Defines:

- task input;
- knowledge scope;
- memory types allowed;
- memory write policy;
- retention;
- workspace boundary;
- data classification.

## Delegation

Defines:

- allowed child-role references;
- whether delegation is enabled.

The global `limits.max_delegation_depth` remains authoritative.

Default is no child roles and depth 0.

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

## Observability

Declares core role/task metrics, with role-specific business KPIs added as needed.

## Versioning

Published role versions are immutable.

Task runs always reference the exact role version used.

Changing role instructions, model policy, authority, capabilities, governance classification, memory policy, or delegation rules is material and requires version/evaluation review.
