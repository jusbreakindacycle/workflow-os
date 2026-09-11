# AGENTS.md

This repository is **spec-first**. The documentation defines the product and architectural boundaries before implementation.

`workflow-os` is a temporary repository/product name.

## Read before changing implementation

1. `docs/product/goal.md`
2. `docs/product/scope-mvp.md`
3. `docs/product/project-operating-model.md`
4. `docs/product/operator-experience.md`
5. `ARCHITECTURE.md`
6. `docs/decisions/index.md`
7. `docs/testing/acceptance-criteria.md`
8. `docs/plans/phase-1-core-control-plane.md`
9. task-specific contracts referenced by the active WorkItem.

## Product invariant

The product is a **human-governed autonomous delivery operating system for a solo builder**, not a wrapper around one model/vendor and not a generic prompt pack.

The intended human role is:

- give/revise goals;
- answer consequential questions;
- provide credentials when required;
- approve/reject/revise consequential decisions;
- approve any paid execution before spend.

## Canonical state rules

- `Workspace` is the isolation boundary.
- `Client` and `Engagement` capture commercial context.
- `Project` is the top-level delivery/operational unit.
- `WorkItem` is the bounded unit of work.
- `Project Pack` is the case-specific machine-readable execution contract compiled from canonical Project state.
- WIR remains canonical only for business workflow definitions inside a Project.
- Agent/runtime/provider state is never canonical Project truth.
- Activity Feed and Command Center are derived from canonical events/state/evidence.
- Hidden chat/session memory is not business truth.

## Provider independence

Never design a core entity around one vendor's schema.

Models and runtimes are separate concepts:

- model: the intelligence/capability source;
- runtime: the environment that can execute work with tools/files/terminal/browser/etc.

All provider-specific execution sits behind capability-aware adapters/brokers.

Do not assume OpenAI, Anthropic, Google, GitHub Copilot, Codex, Claude Code, Kimi, OpenCode, Paperclip, Activepieces, or any other provider is permanently available.

## Local-first rule

The control plane must remain understandable and operable when external AI/runtime providers are unavailable.

Phase 1 must not require a paid AI service to create/read/update Projects, approvals, events, Project Packs, or Command Center state.

## Human authority

The system may autonomously continue bounded, already-approved, in-scope work.

It must stop and create a `Needs My Attention` item for material changes to:

- client commitment or commercial scope;
- price or deadline;
- architecture with meaningful consequence;
- risk acceptance;
- production/destructive action;
- credentials/permissions;
- paid execution without an approved spend envelope.

Provider-created subtasks remain provider-local when safely inside the accepted assignment. Material new work becomes a WorkItem Proposal.

## AI/workforce rules

- Every Project may have a full logical role roster, but activate roles dynamically.
- Do not simulate a human company by spawning agents without measurable benefit.
- Every active agent receives a bounded AgentAssignment.
- No agent may approve its own high-impact work.
- Prefer independent verification for material changes.
- Parallel work requires dependency and mutable-resource isolation.
- Every loop has a checkable goal, budget, termination, and escalation condition.

## Spend rule

Any paid AI/model/runtime execution requires explicit operator approval before spend begins. Approval should be a bounded envelope attached to an Assignment/WorkItem/Project purpose. Exceeding it requires new approval.

## Prompt/instruction rule

Do not make one giant generic prompt the architecture.

Provider-specific instruction files are generated projections of the Project Pack. When the system eventually compiles `AGENTS.md`, `CLAUDE.md`, Copilot rules, OpenCode configuration, or runtime instructions for a client Project, those files must be case-specific and reproducible from canonical state.

## Verification

Agent claims are not evidence. Completion requires the applicable level of verification described in `docs/testing/verification-ladder.md`.

No task is `complete` merely because:

- code was generated;
- a provider says `done`;
- an agent says it tested something;
- a deployment command returned success.

## Phase 1 discipline

Phase 1 proves the local canonical control plane before real autonomous provider orchestration.

Do not add Paperclip, Activepieces, paid models, a full autonomous coding fleet, automated production deployment, invoicing integrations, or client-facing AI Employees merely because future contracts exist.

## Public repository

Use synthetic examples. Never commit real client names/data, secrets, payment data, API keys, proprietary prompts, private contracts, or production payloads.
