# Project Bootstrapper and Instruction Compiler

## Purpose

Eliminate the manual sequence `write giant prompt -> open coding AI -> paste context -> recreate rules -> repeat for another provider`.

The system builds a case-specific Project Pack from canonical state and compiles provider-supported, Assignment-scoped instruction/configuration projections.

## Repository approval gate

```text
accepted problem/scope/architecture
  -> repository/workspace proposal
  -> Needs My Attention
  -> operator Approve / Revise / Reject
  -> only then create/connect repository
```

Automatic repository creation without this approval is not the default.

## Project Pack source inputs

The Pack references/summarizes raw-request provenance, accepted problem/outcome, Engagement constraints, requirements/non-goals, architecture/ADRs, risks/data classification, versioned work graph, acceptance/evidence rules, permission/model/runtime/spend policy, repository/environment refs, and stop/escalation rules.

The Project Pack is a stable project execution contract, not a live dump of rapidly changing Assignment status.

## Context Slice / Assignment Context

Before sending work to a provider, compile the minimum authorized context for the exact WorkItem/Assignment:

- exact accepted objective/version;
- only relevant requirements/non-goals/architecture decisions;
- permitted artifact/source refs;
- tool/capability/side-effect policy;
- evidence/verification expectations;
- stop/escalation conditions;
- provider/runtime-specific operational instructions.

Do not send the full Engagement/commercial record or entire Project history merely because it exists in the Project Pack.

## Instruction Compiler

Compiler targets may include `AGENTS.md`, `CLAUDE.md`, Copilot instructions, OpenCode/runtime configuration, Paperclip assignment payloads, generic API AgentAssignments, and verification scripts/maps when supported.

The compiler uses provider capability manifests rather than pretending all tools accept the same instruction mechanism.

## Projection rule

Generated files are derived artifacts. Editing them directly does not silently change canonical Project state. Meaningful edits become proposals/decisions and are regenerated after acceptance.

## Case-specific requirement

Do not produce a generic “be a senior developer” prompt as the primary Project contract. Generated instructions include only relevant context/rules for the current Project/WorkItem/provider.

## Reproducibility

Record Project Pack version, WorkItem/Assignment version, Context Slice version/hash, compiler version, target provider/runtime/version, generated artifact hash/version, and source canonical versions.
