# Workflow OS (temporary name)

> **Status:** Foundation v3, Phase 1 local control plane, and Phase 2 autonomy kernel are merged. Phase 2.1 Free-First Provider & Quota Broker is under implementation/offline verification in the current PR; full free live certification remains an explicit operator-run evidence step. The product name `workflow-os` is temporary.

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
      -> free / included / paid / local routes according to policy
      -> OpenAI / Anthropic / Google / open models / future providers
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

## Phase 1 local control plane — complete

Phase 1 proves the provider-independent local golden path:

```text
New Project
  -> Workspace / Client? / Engagement? / Project
  -> discovery + explicit unknowns
  -> delivery-strategy decision
  -> accepted Project Brief
  -> Work graph + readiness
  -> Needs My Attention + Activity Feed
  -> deterministic Project Pack + minimum Context Slice
  -> goal revision + selective impact propagation
  -> optional repository proposal/approval + mock result
  -> bounded mock Assignment
  -> execution_finished + evidence + verification
  -> bounded synthetic Spend Gate
  -> restart/recovery + Command Center
```

## Phase 2 autonomy kernel — merged

Phase 2 turns the Phase 1 Assignment contract into a provider-neutral execution kernel:

```text
ready WorkItem
  -> Project Pack + Context Slice
  -> Project Bootstrap + versioned Skills
  -> Broker eligibility/scoring
  -> RouteDecision
  -> bounded worker ExecutionAttempt
  -> independent verifier ExecutionAttempt
       -> pass: evidence -> canonical verification -> complete
       -> fail: bounded feedback/retry
       -> route failure: eligible fallback or stop
```

Implemented Phase 2 capabilities include ProviderConnection/route registry, capability/data/locality/health/spend-aware Broker, deterministic bootstrap/instruction compilation, Skill Registry, bounded loops, independent verification, fallback, execution evidence, provider adapters, and live-certification records.

Fixture/offline CI proves orchestration semantics. It does not prove a real provider account worked.

## Phase 2.1 Free-First Provider & Quota Broker — current PR

Phase 2.1 adds a policy mode for operators who want the autonomy kernel to consume **free/zero-incremental capacity first and never silently pay**.

```text
ready WorkItem
  -> zero-spend lock
  -> refresh/sync quota state
  -> classify task difficulty
  -> rank eligible free routes
       Antigravity discovered models
       Groq Free Plan (operator-asserted)
       OpenRouter openrouter/free
  -> bounded worker
  -> independent free verifier
  -> update quota counters
  -> fallback to another free route OR stop/wait
```

Default quota reservation policy:

```text
>= 40% remaining    normal use
15–40%              conserve
10–15%              reserve scarce capacity
< 10%               exhausted for ordinary routing
```

Routine tasks receive an economy-model preference. Stronger scarce models become more attractive for complex/high-risk work while sufficient quota remains. Provider/model quota is operational state and never rewrites Project meaning.

Phase 2.1 does **not** auto-purchase credits and does not cross into metered/unknown billing when free capacity is unavailable. If no independent free verifier remains, work blocks visibly instead of self-certifying or paying.

Initial replaceable routes are:

- Google Antigravity through the official local `agy` CLI and a loopback bridge;
- Groq when the operator explicitly confirms the configured key remains on a Free Plan account;
- OpenRouter pinned to `openrouter/free`.

Normal CI makes no live provider calls.

Until operator-configured real accounts pass the local certification harness, the accurate claim is:

> **Phase 2.1 Free-First Broker implemented/offline-verified; full free live certification pending operator account setup.**

## Run locally

```bash
npm run verify
npm run db:migrate
npm run db:backup
npm start
```

Free-First operator commands:

```bash
npm run phase21:preflight
npm run phase21:certify
```

`phase21:certify` is opt-in because even zero-cost execution consumes real provider quota. It refuses to start unless `WORKFLOW_OS_FREE_FIRST_RUN=yes` is explicitly set.

The older paid/metered Phase 2 certification harness remains separate:

```bash
npm run phase2:live
```

See:

- `docs/plans/phase-1-core-control-plane.md`
- `docs/reviews/phase-1-completion-report.md`
- `docs/plans/phase-2-autonomy-kernel.md`
- `docs/testing/phase-2-acceptance-criteria.md`
- `docs/reviews/phase-2-implementation-report.md`
- `docs/plans/phase-2.1-free-first-quota-broker.md`
- `docs/implementation/phase-2.1-free-first-quota-broker.md`
- `docs/testing/phase-2.1-acceptance-criteria.md`
- `docs/operations/free-first-provider-setup-windows.md`

## Repository safety

This repository is public. Use synthetic data only. Never commit real client data, credentials, tokens, private instructions, invoices, proprietary source material, or production payloads.

## Start here

1. `AGENTS.md`
2. `docs/index.md`
3. `docs/product/goal.md`
4. `docs/product/scope-mvp.md`
5. `ARCHITECTURE.md`
6. `docs/decisions/index.md`
7. `docs/plans/phase-2.1-free-first-quota-broker.md`
8. `docs/operations/free-first-provider-setup-windows.md`

## One-line product test

If the operator still has to manually copy prompts between AI products, remember what each worker was doing, or reconstruct Project truth from chats, the system has not achieved its goal.
