# Subagent Orchestration Prompt

Use repository-defined roles from `docs/agents/reviewer-contracts.md`.

## Rule

Subagents are bounded specialists, not independent product owners.

## Delegation

Use parallelism only for independent review concerns. Give each subagent:

- exact task/change scope
- relevant repository documents
- the specific review remit
- prohibition against scope expansion
- required finding format

## Synthesis

The primary agent owns final synthesis. Conflicting reviewer recommendations are resolved using the source-of-truth hierarchy in `AGENTS.md`, not majority vote.

## Minimum meaningful set

For a material backend/workflow change:
- Scope Guardian
- Architecture Reviewer
- Security Reviewer
- Reliability Reviewer
- QA/Test Reviewer
- Adversarial Reviewer

For AI/agent changes, add AI/Agent Safety Reviewer.

For UI-only work, still use Scope + QA and add security/accessibility checks appropriate to the surface.
