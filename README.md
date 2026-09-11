# Workflow OS (temporary name)

> **Status:** specification-first foundation for a human-governed autonomous delivery system. The product name `workflow-os` is temporary.

Workflow OS is intended to become the **one operating interface a solo builder uses to run client and internal delivery work without depending on one AI platform, one coding agent, or one model vendor**.

The operator should be able to say, in plain language:

> “I have a new client/project. This is the problem. This is what they asked for.”

The system should then organize the work from discovery through production while asking the operator only for decisions that genuinely require human authority.

## North-star interaction

The operator primarily does four things:

1. give or revise the goal;
2. answer important discovery questions, including `I don't know`;
3. provide credentials only when required;
4. approve, reject, or revise consequential decisions and paid execution.

Everything else should be coordinated by the system as far as evidence, policy, available compute, and approved authority allow.

## Target lifecycle

```text
Raw request / user problem / project idea
  -> Intake
  -> Adaptive discovery
  -> Research and challenge
  -> Problem / outcome definition
  -> Commercial scope
  -> Architecture and plan
  -> Repository approval
  -> Project bootstrap
  -> Build / automate
  -> Verify / review
  -> Deployment approval
  -> Deploy
  -> Observe
  -> Maintain / repair / improve
  -> Reuse lessons and skills
```

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
      -> GitHub / cloud providers / monitoring systems
```

No provider is allowed to become the hidden source of truth for a Project.

## Local-first, provider-independent

The control plane, Project state, commercial records, approvals, activity history, Project Pack, and operator interface are designed to work locally first.

Local-first does **not** mean every high-capability AI model must run on the operator's laptop. The system may route suitable work to local models and may use remote/free/paid models when available and approved.

Any paid AI execution requires an explicit operator-approved spend envelope before money is spent.

## Not a generic template generator

Every Project gets a **case-specific Project Pack** compiled from its actual problem, client commitments, requirements, architecture, risks, decisions, acceptance criteria, work graph, and tool permissions.

Provider-specific files such as `AGENTS.md`, `CLAUDE.md`, Copilot instructions, or OpenCode/runtime configuration are generated projections of that Project Pack. They are not the canonical Project state.

## Internal workforce

A complete logical delivery roster may exist for every Project, but roles are activated dynamically. The system should not run fourteen agents merely because fourteen role names exist.

Typical capabilities include intake, research, product/requirements, architecture, planning, implementation, QA/verification, security/reliability, adversarial review, deployment, maintenance, and documentation.

## Operator experience

The default operator surface is a local-first **Command Center**, not a collection of agent chats. It includes:

- `New Project`;
- Projects and clients;
- engagements and commercial commitments;
- `Needs My Attention`;
- Activity Feed;
- active WorkItems and assignments;
- costs and approved spend;
- repositories and deployments;
- incidents and maintenance.

Detailed agent/runtime logs remain available for debugging but are not the main UI.

## Current implementation boundary

The repository is being realigned around **Foundation v3** before serious coding.

Phase 1 is deliberately smaller than the North Star. It proves the local canonical control plane first:

```text
New Project
  -> Workspace / Client / Engagement / Project
  -> WorkItems / decisions / approvals / events
  -> Project Pack
  -> Needs My Attention + Activity Feed + Command Center
  -> simulated/manual execution evidence
```

Phase 1 does **not** require Paperclip, Activepieces, Codex, Claude Code, a paid model, or a persistent multi-agent runtime.

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

If the operator still has to manually copy prompts between AI products, remember what each agent was doing, or reconstruct Project truth from chats, the system has not yet achieved its goal.
