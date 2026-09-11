# Skill Registry

## Purpose

Represent reusable, tested capabilities without turning the product into a pile of unverified prompt snippets.

## Skill definition

A SkillVersion should declare equivalents of:

- id/name/version;
- purpose and task classes;
- inputs/outputs/schema;
- preconditions;
- required tools/capabilities;
- required model/runtime characteristics;
- allowed side effects;
- risk/data classification;
- execution instructions/procedure;
- verification/evaluation cases;
- known failure modes;
- compatibility/version constraints;
- cost/latency notes where measurable.

## Skill selection

Planner/Broker selects skills because they match a WorkItem requirement, not because an agent has a vague job title.

## Promotion

A skill should progress through states such as:

- draft;
- tested;
- approved;
- deprecated.

High-consequence skills require stronger evidence before approval.

## Reuse

Skills can be learned from successful Projects only after client-confidential material is removed and the generalized capability is re-evaluated.

## Provider independence

Skill intent/contract is provider-neutral. Provider-specific instructions/configuration may be compiled by the Instruction Compiler.
