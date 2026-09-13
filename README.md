# Workflow OS (temporary name)

> **Status:** Foundation v3, Phase 1 local control plane, Phase 2 autonomy kernel, Phase 2.1 Free-First Provider & Quota Broker, Phase 2.2 Canonical Authority Hardening, Phase 3.0 Golden Path Contract, and Phase 3.1 Adaptive Discovery / Challenge / Strategy are implemented. Phase 2.1 passed real zero-spend live certification on 2026-09-12 using Google Antigravity for worker execution and OpenRouter for independent verification, including a successful cross-provider portability drill. Phase 3.1 is CI-verified with 75/75 tests and nine migrations. The next implementation subphase is Phase 3.2 — Dynamic Workforce / Work Graph. The product name `workflow-os` is temporary.

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

Workflow OS owns the **meaning, authority, and state of the work**. External systems perform specialized execution.

```text
Workflow OS
  -> Canonical Authority Boundary
      -> exact subject / Workspace / Project / version / bounds
      -> human approval when policy requires it
      -> resolve-time + use-time freshness checks
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

No provider is allowed to become the hidden source of truth or authority for a Project.

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

## Phase 2 autonomy kernel — merged and real-provider certified through Phase 2.1

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

Implemented Phase 2 capabilities include ProviderConnection/route registry, capability/data/locality/health/spend-aware Broker, deterministic bootstrap/instruction compilation, Skill Registry, bounded loops, independent verification, fallback, execution evidence, provider adapters, and certification records.

Fixture/offline CI still proves orchestration semantics without requiring credentials. In addition, Phase 2.1's zero-spend live harness has supplied real-provider evidence for first execution, independent verification, and representative provider portability.

## Phase 2.1 Free-First Provider & Quota Broker — live-certified

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

On 2026-09-12, the operator-run certification harness passed with:

- Google Antigravity as the real worker route;
- OpenRouter as the independent real verifier route;
- canonical L2 verification outcome `pass`;
- successful cross-provider portability drill;
- zero SpendEnvelope records;
- zero CostRecord records;
- Antigravity paid-credit fallback disabled.

This proves the representative Free-First execution/verifier/portability path. It does **not** prove production deployment, high-authority repository mutation, or autonomous consequential side effects are ready.

See `docs/reviews/phase-2.1-live-certification-report.md` for the sanitized evidence summary.

## Phase 2.2 Canonical Authority Hardening — implemented

Phase 2.2 makes consequential authority fail closed at the canonical persistence boundary rather than depending only on a caller choosing the right API path.

Key protections include:

- new WorkItems may be born only as `draft` or `ready`;
- registered Approval subjects are bound to the exact Workspace/Project/subject/version;
- unknown, cross-scope, and stale authority subjects fail closed;
- authority-bearing Approval identity/version/reason/bounds are immutable after request creation;
- stale subjects are rechecked before an Approval becomes approved;
- repository authority is rechecked again at use time;
- SpendRequests capture Project/WorkItem versions and SpendEnvelope/CostRecord paths re-check that authority before use;
- unresolved pre-Phase-2.2 spend requests without the required version evidence are superseded rather than silently upgraded.

The policy now explicitly separates read-only/synthetic work, isolated reversible changes, shared/external mutation, communication, repository mutation, production/destructive actions, paid spend, and credential/permission grants.

Final Phase 2.2 CI passed 69/69 tests with eight migrations, migration/backup checks, and live-provider opt-in guards green.

See:

- `docs/plans/phase-2.2-canonical-authority-hardening.md`
- `docs/testing/phase-2.2-acceptance-criteria.md`
- `docs/reviews/phase-2.2-implementation-report.md`

## Phase 3 End-to-end Delivery Golden Path — in progress

### Phase 3.0 — contract complete

Phase 3.0 defines the canonical synthetic lead-generation test case and the governed local execution-workspace boundary. It separates ordinary bounded local R1 implementation work from R2 shared-remote GitHub mutation and keeps deployment/production outside the first path.

### Phase 3.1 — adaptive discovery/challenge/strategy implemented

Phase 3.1 replaces the fixed-question/manual-strategy default flow with bounded AI-assisted pre-brief reasoning:

```text
raw request + separately preserved requested solution
  -> zero-incremental Free-First reasoning
  -> material questions only
  -> answer / I don't know / skip
  -> required re-analysis
  -> explicit research-required / research-not-required decision
  -> challenge requested solution + compare alternatives
  -> source-backed delivery-strategy recommendation
  -> operator accepts or revises Brief/strategy
  -> canonical Project Brief
```

Model analysis is proposed evidence, not truth. Material external research blocks acceptance rather than being fabricated. `custom_build` is not hard-coded merely because the client requested software. The operator can reject the recommended strategy; the rejected recommendation remains historical evidence rather than being silently rewritten.

Phase 3.1 CI passed **75/75 tests** with nine migrations, migration/backup checks, and live-provider opt-in guards green. See `docs/plans/phase-3.1-adaptive-discovery-strategy.md` and `docs/reviews/phase-3.1-implementation-report.md`.

### Next — Phase 3.2 Dynamic Workforce / Work Graph

Generate strategy-specific WorkItems, dependencies, required capabilities, evidence contracts, authority requirements, verification requirements, and logical role activation from the accepted Phase 3.1 Project Brief. Phase 3.2 must not grant real filesystem/shell authority; that remains Phase 3.3.

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

`phase21:certify` is opt-in because even zero-cost execution consumes real provider quota. It refuses to start unless `WORKFLOW_OS_FREE_FIRST_RUN=yes` is explicitly set. Do not rerun certification routinely; recertify only after material provider/broker/certification changes or when evidence needs renewal.

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
- `docs/reviews/phase-2.1-live-certification-report.md`
- `docs/plans/phase-2.2-canonical-authority-hardening.md`
- `docs/testing/phase-2.2-acceptance-criteria.md`
- `docs/reviews/phase-2.2-implementation-report.md`
- `docs/plans/phase-3.0-golden-path-contract.md`
- `docs/testing/phase-3.0-acceptance-criteria.md`
- `docs/plans/phase-3.1-adaptive-discovery-strategy.md`
- `docs/testing/phase-3.1-acceptance-criteria.md`
- `docs/reviews/phase-3.1-implementation-report.md`
- `docs/operations/free-first-provider-setup-windows.md`

## Repository safety

This repository is public. Use synthetic data only. Never commit real client data, credentials, tokens, private instructions, invoices, proprietary source material, or production payloads.

## Start here

1. `AGENTS.md`
2. `docs/index.md`
3. `docs/product/goal.md`
4. `docs/product/scope-mvp.md`
5. `ARCHITECTURE.md`
6. `docs/plans/phase-3.1-adaptive-discovery-strategy.md`
7. `docs/security/risk-and-approval-policy.md`
8. `docs/plans/roadmap.md`

## One-line product test

If the operator still has to manually copy prompts between AI products, remember what each worker was doing, or reconstruct Project truth from chats, the system has not achieved its goal.
