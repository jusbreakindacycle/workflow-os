# Workflow OS (temporary name)

> **Status:** Foundation v3, Phase 1, Phase 2, Phase 2.1, Phase 2.2, the complete Phase 3 synthetic/local delivery golden path, and **Phase 4.0 governed external-action control plane** are implemented. Phase 2.1 passed representative real zero-spend provider certification on 2026-09-12. Phase 3 proves one raw synthetic client request can reach a strategy-specific Work Graph, governed real local artifact execution, L2/L3 verification, independent reconciliation and a final delivery record. Phase 4.0 now proves the provider-neutral `plan -> authority -> preflight -> attempt -> reconcile -> verify` external-action lifecycle with deterministic fixture evidence. **This is still not GitHub/shared-remote or production autonomy. Phase 4.1 Governed Source Control is next.** The product name `workflow-os` is temporary.

Workflow OS is intended to become the **one operating interface a solo builder uses to run client and internal delivery work without depending on one AI platform, one coding agent, or one model vendor**.

The operator should be able to say:

> “I have a new client/project. This is the problem. This is what they asked for.”

Workflow OS should then coordinate the work as far as evidence, policy, available capability and approved authority allow, asking the operator only for decisions that genuinely require human authority.

## North-star interaction

The operator primarily:

1. gives or revises the goal;
2. supplies known context/files/messages;
3. answers important discovery questions, including `I don't know`;
4. provides credentials only when required;
5. approves/rejects/revises consequential decisions;
6. approves new metered spend before it occurs.

The system coordinates the rest without reconstructing Project truth from provider chats.

## Target lifecycle

The lifecycle is **conditional**. Not every problem should become custom software or a repository.

```text
Raw request / problem / idea
  -> Intake
  -> Adaptive discovery
  -> Conditional research + challenge
  -> Accepted problem / outcome / constraints / success
  -> Delivery strategy
       process change / adopt / configure / integrate /
       automate / custom build / hybrid / pilot / defer
  -> Strategy-specific Work Graph
  -> Work-driven capability / logical role activation
  -> Project Pack + minimum Context Slices
  -> Governed execution appropriate to strategy
  -> Verification / adversarial review
  -> Bounded repair or escalation
  -> Delivery / deployment / apply change when authorized
  -> Observation / maintenance / improvement when applicable
```

A Project that can be solved by process change or existing software must not be forced through a fake coding/deployment lifecycle.

## Core architectural promise

Workflow OS owns the **meaning, authority and state of the work**. External systems perform replaceable execution.

```text
Workflow OS
  -> Canonical Project state
  -> exact authority / approvals / spend bounds
  -> strategy-specific Work Graph
  -> Project Pack / Context Slice / Assignment
  -> Model / Runtime Broker
  -> governed local or external adapters
  -> observable evidence
  -> verification / reconciliation
```

Provider/model/runtime output is evidence, not canonical authority.

## Provider independence

Models, runtimes and configured ProviderConnections are separate concepts. A Project must remain understandable if Codex, Claude Code, Copilot, OpenCode, Google, OpenAI, Anthropic, Groq, OpenRouter or another provider changes or disappears.

Provider-specific instruction files are projections from canonical state, not the Project source of truth.

## Local-first, not local-only

Core Project/commercial state, approvals, evidence, Activity Feed and Command Center are local-first.

High-capability intelligence may still use remote/free/paid providers when policy and authority allow. If no approved execution host is online, work waits visibly rather than pretending it continued.

## Human governance

Autonomy is bounded by explicit authority.

- R0 read-only/synthetic reasoning may proceed without repeated approval.
- R1 isolated/reversible local work requires a bounded policy/Assignment.
- shared/external R2 mutation requires applicable exact authority.
- production/destructive/credential/legal/financial R3 work requires exact human authority and applicable verification/recovery.
- unknown or metered cost is never silently treated as free.

Local workspace permission never grants GitHub push, deployment, production, client messaging or credential authority.

## Phase 1 — Core Control Plane — complete

Phase 1 established canonical Workspace/Client/Engagement/Project state, intake, explicit unknowns, strategy decision, Project Brief, WorkItems/dependencies, Project Pack/Context Slice, revisions, approvals, spend, mock Assignment/evidence/verification, recovery and Command Center semantics.

The legacy Phase 1 initial graph remains as a regression/compatibility path.

## Phase 2 — Provider-neutral Autonomy Kernel — complete

Phase 2 added ProviderConnection/ExecutionRoute state, capability/data/locality/health/spend-aware routing, deterministic bootstrap/instruction compilation, Skills, bounded worker/verifier loops, evidence normalization, fallback/rerouting and certification records.

External execution still cannot complete canonical work merely by saying `done`.

## Phase 2.1 — Free-First Provider & Quota Broker — complete and live-certified

Phase 2.1 routes through governed zero-incremental capacity first and refuses silent paid fallback.

Representative live certification passed on 2026-09-12 with:

- Google Antigravity worker execution;
- OpenRouter independent verification;
- canonical L2 verification `pass`;
- cross-provider portability drill;
- zero SpendEnvelope/CostRecord evidence for that certification Workspace.

Normal CI does not consume real provider quota.

## Phase 2.2 — Canonical Authority Hardening — complete

Phase 2.2 added database-enforced WorkItem birth states, exact/version-bound Approval subjects, immutable authority identity/bounds, stale-subject checks at approval resolution, use-time revalidation, and version-bound spend authority.

Consequential model/provider intent cannot bypass the canonical authority boundary.

## Phase 3.0 — Golden Path Contract — complete

Phase 3.0 defined the first synthetic delivery proof and, before any real local mutation, separated bounded local R1 execution authority from shared-remote/deployment/production authority.

Canonical certification request:

> “I'm running Facebook/Instagram ads for my business. I need somewhere prospects can see the offer, enter their details, and let us follow up. I was thinking of a simple website with a contact form.”

The requested website is preserved, but `custom_build` is never pre-authorized merely because the client mentioned a website.

## Phase 3.1 — Adaptive Discovery / Challenge / Strategy — complete

Phase 3.1:

- preserves the raw request/requested solution separately;
- asks only materially consequential questions;
- keeps `I don't know` explicit;
- re-analyzes after answers;
- records `research_required` instead of inventing external facts;
- challenges the requested solution and compares alternatives;
- recommends strategy from source-backed evidence;
- lets the operator override the recommendation without rewriting history;
- compiles accepted direction into the canonical Project Brief.

## Phase 3.2 — Dynamic Workforce / Work Graph — complete

Phase 3.2 converts the accepted Brief/strategy into case-specific WorkItems, dependencies, capabilities, evidence, risk/action class, authority, verification and stop/escalation requirements.

Roles are logical capabilities activated by work, not permanent AI employees.

The planner has materially different graph families for process change, adopt/configure, integrate, automate, custom build, hybrid, research/pilot and defer. Tests explicitly prove that non-build strategies do not receive fake software-development work.

## Phase 3.3 — Governed Local Execution Workspace — complete for synthetic R1 work

Phase 3.3 implements a real per-Project local workspace under a configured root with:

- traversal/absolute/symlink escape rejection;
- workspace-only file operations;
- hashed artifact manifests;
- deny-by-default command classes;
- minimal process environment;
- loopback-only server execution;
- owned-process lifecycle tracking/cleanup.

It does **not** grant arbitrary shell, shared GitHub, production, credential-store, messaging or package-publishing authority.

## Phase 3.4 — Verification / Repair / Delivery — complete for the local golden path

Phase 3.4 projects Work Specs into Phase 3 Project Packs, Context Slices and bounded Assignments, then requires observable evidence:

- real syntax checks;
- real Node behavior tests;
- actual loopback application flow;
- separate deterministic independent reconciliation;
- bounded repair records (max two attempts in the first implementation);
- independent L3 evidence before final delivery can be recorded.

## Phase 3.5 — Full synthetic/local certification — complete

The full certification now proves:

```text
raw request
-> challenge / strategy / accepted Brief
-> strategy-specific Work Graph
-> bounded roles/capabilities
-> governed local workspace
-> real generated local app
-> real tests
-> actual invalid + valid synthetic lead requests
-> local receiver/store effect
-> independent reconciliation
-> final evidence bundle
-> Project complete / closed / healthy
```

The generated certification artifact contains a synthetic offer, lead form, validation and local in-memory receiver. It uses no real customer/client data and no external business endpoint.

See `docs/reviews/phase-3.5-end-to-end-certification-report.md`.

### What Phase 3 does not prove

Phase 3 does not certify production deployment, GitHub/shared-remote mutation, real client/customer data handling, Meta/Facebook/Instagram API access, real ad spend/performance, CRM/email/SMS/public/client messaging, arbitrary real external integrations, credential/permission grants, unattended always-on hosting, or every strategy end to end.

## Phase 4.0 — Governed External Action Contract — complete for the deterministic fixture path

Phase 4.0 adds the generic canonical boundary for durable shared/external effects without making any provider canonical.

```text
exact plan
-> exact current authority
-> deterministic preflight
-> one bounded attempt
-> reconcile observed external state
-> L3 evidence
-> verified / complete / retry / block / escalate
```

The implementation includes exact Project/WorkItem version capture, plan/input/target hashing, idempotency, use-time authority revalidation, optional SpendEnvelope binding, explicit uncertain outcomes, reconciliation-before-retry, bounded external-attempt budgets, provider-resource mappings and Command Center attention state.

Merge-candidate CI passed **91/91 tests with 15 migrations**. `npm run phase40:certify` also passed with one fixture attempt, one confirmed reconciliation, one provider mapping, exact approval binding and L3 evidence while explicitly reporting `realExternalSideEffects: false`.

See `docs/reviews/phase-4.0-implementation-report.md`.

### What Phase 4.0 does not prove

Phase 4.0 does not certify real GitHub mutation, merge/force-push/settings/secrets/releases, deployment, production mutation, external messaging, real client/customer data, arbitrary credentials, unattended hosting, or paid external effects without an applicable SpendEnvelope.

## Next engineering direction — Phase 4.1 Governed Source Control

Phase 4.1 is the next coding task. It will consume the Phase 4.0 contract to take one verified local artifact through an exact non-default remote branch, exact commit/tree, exact pull request and remote reconciliation.

Normal CI remains credential-free. Any live GitHub certification must be separately opt-in and restricted to one exact disposable/non-production repository. Merge, force push, repository settings, secrets, releases and deployment remain outside Phase 4.1.

Do not add every possible provider or enterprise-scale subsystem speculatively.

## Run locally

```bash
npm run verify
npm run db:migrate
npm run db:backup
npm run phase3:certify
npm run phase40:certify
npm start
```

Free-First operator commands remain separate:

```bash
npm run phase21:preflight
npm run phase21:certify
```

`phase21:certify` consumes real free provider quota and remains explicit opt-in. The older metered/live Phase 2 harness also remains explicit opt-in:

```bash
npm run phase2:live
```

## Repository safety

This repository is public. Use synthetic data only. Never commit real client data, credentials, tokens, private instructions, invoices, proprietary source material, or production payloads.

## Start here

1. `AGENTS.md`
2. `docs/index.md`
3. `docs/product/goal.md`
4. `docs/product/scope-mvp.md`
5. `ARCHITECTURE.md`
6. `docs/security/risk-and-approval-policy.md`
7. `docs/plans/roadmap.md`
8. `docs/architecture/external-action-contract.md`
9. `docs/reviews/phase-4.0-implementation-report.md`
10. `docs/plans/phase-4.1-governed-source-control.md`

## One-line product test

If the operator still has to manually copy prompts between AI products, remember what each worker was doing, or reconstruct Project truth from chats, the system has not achieved its goal.
