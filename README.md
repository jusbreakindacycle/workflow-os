# Workflow OS (temporary name)

> **Status:** specification-first foundation for a human-governed autonomous delivery system. The product name `workflow-os` is temporary.

Workflow OS is intended to become the **one operating interface a solo builder uses to run client and internal delivery work without depending on one AI platform, one coding agent, or one model vendor**.

The operator should be able to say, in plain language:

> “I have a new client/project. This is the problem. This is what they asked for.”

The system should then organize the work from discovery through delivery/operation while asking the operator only for decisions that genuinely require human authority.

## North-star interaction

The operator primarily does four things:

1. give or revise the goal;
2. answer important discovery questions, including `I don't know`;
3. provide credentials only when required;
4. approve, reject, or revise consequential decisions and paid execution.

Everything else should be coordinated by the system as far as evidence, policy, available compute, and approved authority allow.

A goal revision is not a silent text edit. The system versions it, assesses impact, invalidates stale derived work/approvals when required, and regenerates affected Project Pack/plan state before continuing.

## Target lifecycle

The lifecycle is **conditional**, not a rule that every problem becomes custom software or a repository.

```text
Raw request / user problem / project idea
  -> Intake
  -> Adaptive discovery
  -> Research and challenge
  -> Problem / outcome definition
  -> Choose delivery strategy
       process change / adopt / configure / integrate /
       automate / custom build / hybrid / pilot / defer
  -> Commercial scope when applicable
  -> Architecture / plan appropriate to that strategy
  -> Repository or external-system approval when required
  -> Execute / build / configure / automate
  -> Verify / review
  -> Deliver / deploy / apply change when applicable
  -> Observe outcome / production when applicable
  -> Maintain / repair / improve
  -> Reuse lessons and skills
```

A Project that can be solved by process change or existing software should not be forced through a fake coding/deployment lifecycle.

## Core architectural promise

Workflow OS owns the **meaning and state of the work**. External systems perform specialized execution.

```text
Workflow OS
  -> Model/Runtime Broker
      -> OpenAI / Anthropic / Google / open models / local models
      -> Codex / Claude Code / Copilot / OpenCode / future runtimes
  -> Internal Workforce Adapter
      -> Paperclip or another provider, if proven useful
  -> Workflow Engine Adapter
      -> Activepieces or another engine
  -> Source / Deployment / Observability adapters
      -> Git/source providers / clouds / monitoring systems
```

No provider is allowed to become the hidden source of truth for a Project.

## Local-first, provider-independent

The control plane, Project state, commercial records, approvals, activity history, Project Pack, and operator interface are designed to work locally first.

Local-first does **not** mean every high-capability AI model must run on the operator's laptop. The system may route suitable work to local models and may use remote/free/paid models when available and approved.

Continuous autonomous work requires an available execution/coordinator host. If the local host is shut down/asleep and no approved always-on host exists, work waits; the product must not pretend it continued running.

Any new metered/variable-cost external execution requires an applicable operator-approved spend envelope before incremental cost is incurred.

## Not a generic template generator

Every active delivery Project gets a **case-specific Project Pack** compiled from its actual problem, chosen delivery strategy, client commitments, requirements, architecture/plan, risks, decisions, acceptance criteria, work graph, and tool permissions.

Provider-specific files such as `AGENTS.md`, `CLAUDE.md`, Copilot instructions, or OpenCode/runtime configuration are generated projections. They are not canonical Project state.

Workers receive a minimum-authorized Assignment Context/Context Slice, not blanket permission to transmit the full Project Pack or commercial record to every provider.

## Internal workforce

A complete logical delivery roster may exist for every Project, but roles are activated dynamically. The system should not run many agents merely because many role names exist.

Typical capabilities include intake, research, product/requirements, UX/product design, architecture, planning, implementation, QA/verification, security/reliability, adversarial review, deployment/operations when applicable, maintenance, and documentation.

## Operator experience

The default surface is a local-first **Command Center**, not a collection of agent chats. It includes New Project / Revise Goal, Projects/clients/engagements, Needs My Attention, Activity Feed, active work/assignments, costs/spend, repositories/deployments when applicable, and incidents/maintenance.

Detailed worker/runtime logs remain drill-down diagnostics.

## Current implementation boundary

Phase 1 is deliberately smaller than the North Star. It proves the local canonical control plane first:

```text
New Project
  -> Workspace / Client / Engagement / Project
  -> discovery + delivery-strategy decision
  -> WorkItems / decisions / approvals / events
  -> Project Pack / Context Slice
  -> Needs My Attention + Activity Feed + Command Center
  -> simulated/manual execution evidence
  -> goal revision / impact propagation
```

Phase 1 does **not** require Paperclip, Activepieces, Codex, Claude Code, GitHub, a paid model, or a persistent multi-agent runtime.

See `docs/plans/phase-1-core-control-plane.md`.

## Repository safety

This repository is public. Use synthetic data only. Never commit real client data, credentials, tokens, private instructions, invoices, proprietary source material, or production payloads.

## Start here

1. `AGENTS.md`
2. `docs/index.md`
3. `docs/product/goal.md`
4. `docs/product/scope-mvp.md`
5. `ARCHITECTURE.md`
6. `docs/decisions/index.md`
7. `docs/plans/phase-1-core-control-plane.md`

## One-line product test

If the operator still has to manually copy prompts between AI products, remember what each worker was doing, or reconstruct Project truth from chats, the system has not achieved its goal.
