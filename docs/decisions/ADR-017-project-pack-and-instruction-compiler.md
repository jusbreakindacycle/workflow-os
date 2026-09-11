# ADR-017: Project Pack and Instruction Compiler

**Status:** Accepted

## Context

A manually maintained giant Markdown prompt cannot reliably represent case-specific Project truth across different agent products.

## Decision

Use a versioned **Project Pack** compiled from accepted canonical Project/Engagement/WorkItem/Decision/policy state.

Provider-specific instruction/configuration files are generated projections through an Instruction Compiler.

Examples include AGENTS.md, CLAUDE.md, Copilot instructions, OpenCode configuration, or API AgentAssignment payloads where supported.

Generated provider files are not canonical and cannot silently edit canonical scope/authority.

## Consequences

- switching providers does not require rebuilding Project context manually;
- instruction generation becomes deterministic/versioned;
- provider-specific capabilities can be handled without forcing one lowest-common-denominator prompt;
- Project Pack schemas/versioning become core product contracts.
