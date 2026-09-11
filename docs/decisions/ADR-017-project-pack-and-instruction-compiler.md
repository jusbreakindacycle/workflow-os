# ADR-017: Project Pack, Context Slice, and Instruction Compiler

**Status:** Accepted

## Context

A manually maintained giant Markdown prompt cannot reliably represent case-specific Project truth across agent products, and sending the entire Project/Engagement to every provider would create unnecessary privacy/context risk.

## Decision

Use a versioned **Project Pack** compiled from accepted canonical Project/Engagement/Decision/policy/work-graph versions.

For each AgentAssignment, derive a minimum-authorized **Context Slice** containing only the relevant WorkItem objective, requirements/constraints, permitted artifact references, permissions, verification, and stop/escalation instructions.

Provider-specific instruction/configuration files are generated projections through an Instruction Compiler. Examples include AGENTS.md, CLAUDE.md, Copilot instructions, OpenCode configuration, or API Assignment payloads where supported.

Generated provider files and provider sessions are not canonical and cannot silently edit scope/authority.

## Consequences

- switching providers does not require rebuilding Project context manually;
- context minimization limits client/commercial exposure;
- instruction generation is deterministic/versioned;
- provider-specific capabilities need not force a lowest-common-denominator prompt;
- Pack, Context Slice, compiler, and projection provenance are core contracts.
