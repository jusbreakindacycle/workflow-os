# Project Bootstrapper and Instruction Compiler

## Purpose

Eliminate the manual sequence:

`write giant prompt -> open a coding AI -> paste context -> recreate rules -> repeat for another provider`.

The system instead builds a case-specific Project Pack from canonical state and compiles provider-supported instruction/configuration projections.

## Repository approval gate

The default flow is:

```text
accepted problem/scope/architecture
  -> repository/workspace proposal
  -> Needs My Attention
  -> operator Approve / Revise / Reject
  -> only then create/connect repository
```

Automatic repository creation without this approval is not the default.

## Project Pack source inputs

Include references/summaries for:

- raw request provenance;
- accepted problem/outcome;
- Engagement scope/deadline constraints;
- requirements/non-goals;
- architecture/ADRs;
- risks/data classification;
- WorkItems/dependencies;
- acceptance/evidence rules;
- tool/permission policy;
- model/runtime policy;
- spend policy;
- repository/environment refs;
- stop/escalation rules.

## Instruction Compiler

Compiler targets may include, when supported:

- `AGENTS.md`;
- `CLAUDE.md`;
- `.github/copilot-instructions.md` or path-specific instructions;
- OpenCode/runtime configuration;
- Paperclip/internal-workforce assignment payloads;
- generic API AgentAssignment payloads;
- verification scripts/maps generated from structured contracts.

The compiler must use provider adapters/capability manifests rather than pretending all tools accept the same instruction mechanism.

## Projection rule

Generated files are **derived artifacts**. Editing them directly does not automatically change canonical Project state.

If a human/provider edit contains a meaningful change, ingest it as a proposal/decision and regenerate after acceptance.

## Case-specific requirement

The compiler must not produce a generic “be a senior developer” prompt as the primary Project contract.

Generated instructions must include only the context/rules relevant to the current Project/WorkItem/provider, with links/references to authoritative artifacts.

## Reproducibility

Record:

- Project Pack version;
- compiler version;
- target provider/runtime/version;
- generated artifact hash/version;
- source canonical versions.

This enables replacement of one runtime without reconstructing the Project manually.
