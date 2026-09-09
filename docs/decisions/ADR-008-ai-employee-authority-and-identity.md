# ADR-008: AI Employee Authority Is Capability-Scoped and Independently Enforced

**Status:** Accepted

## Context

A role title such as “Finance Assistant” or “Operations Manager” can imply far broader authority than any automated system should receive.

Agent prompts are not reliable authorization mechanisms.

## Decision

AI Employee responsibility, capability, and authority are separate.

Every tool/action is authorized outside model reasoning using:

- workspace;
- role version;
- tool/action;
- data classification;
- identity mode;
- risk tier;
- runtime context;
- approval state.

AI Employees never receive raw reusable credentials as part of role context.

R3 actions remain human-approved.

## Identity

A role uses one of:

- role service identity;
- delegated user identity;
- explicitly mixed identity.

Actor chains remain auditable.

## Consequences

- least privilege becomes enforceable;
- model/tool compromise has reduced blast radius;
- deployment requires more explicit capability metadata;
- target-system identity design becomes part of role engineering.

## Guardrail

An AI Employee cannot modify its own authority or approve its own authority expansion.
