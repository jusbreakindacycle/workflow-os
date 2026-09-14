# Workflow OS (temporary name)

> **Status:** Foundation v3, Phase 1, Phase 2, Phase 2.1, Phase 2.2, the complete Phase 3 synthetic/local delivery golden path, **Phase 4.0 governed external actions**, and **Phase 4.1 governed source control** are implemented. Phase 2.1 passed representative real zero-spend provider certification on 2026-09-12. Phase 4.0 is deterministic fixture-certified. Phase 4.1 is fixture-certified for exact non-default branch + commit/tree + pull-request delivery and includes a bounded GitHub adapter, but **no live GitHub mutation certification is claimed yet**. This is still not production/deployment autonomy. The product name `workflow-os` is temporary.

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

## Phase 3 — Synthetic/local end-to-end delivery — complete

Phase 3 proves one controlled synthetic Project can move from raw request through adaptive discovery, strategy-specific Work Graph, governed local execution, real tests/local application exercise, independent reconciliation, bounded repair and final delivery evidence.

The local execution workspace rejects path/symlink escape, uses deny-by-default command classes and minimal process environment, and does not imply shared-remote or production authority.

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

Phase 4.0 merge-candidate CI passed **91/91 tests with 15 migrations**. `npm run phase40:certify` passed with one fixture attempt, one confirmed reconciliation, one provider mapping, exact approval binding and L3 evidence while explicitly reporting `realExternalSideEffects: false`.

See `docs/reviews/phase-4.0-implementation-report.md`.

## Phase 4.1 — Governed Source Control — implemented and fixture-certified

Phase 4.1 consumes Phase 4.0 to project one independently verified local artifact into a tightly bounded source-control delivery action:

```text
verified local artifact
-> exact repository/base/branch/content plan
-> exact current R2 authority
-> non-default branch
-> exact commit/tree
-> exact pull request
-> remote read-back
-> reconciliation
```

The implementation binds the governed-workspace artifact manifest and SHA-256 content hashes, exact base ref/commit, exact delivery branch, commit message and PR metadata before mutation. Artifact/base drift blocks execution. Partial or uncertain provider outcomes must be reconciled before retry.

Normal CI uses a deterministic source-control fixture and fake GitHub HTTP. The merge-candidate implementation passed **102/102 tests with 16 migrations**, Phase 3 and Phase 4.0 regression certifications, and `npm run phase41:certify`. The Phase 4.1 certification reports `realExternalSideEffects: false`, one confirmed non-default branch/commit/PR fixture path, one attempt, one provider mapping, exact approval binding, L3 evidence and `mergeAuthority: false`.

A bounded `GitHubSourceControlAdapter` is implemented for repository/ref inspection, non-default branch creation, exact blobs/tree/commit, non-force branch update, PR creation and remote tree/PR/check read-back. It uses a credential reference via `WORKFLOW_OS_GITHUB_TOKEN`; raw tokens are not canonical Project state.

**The GitHub adapter is not live-certified yet.** A real GitHub certification requires separate explicit operator authorization and one exact disposable/non-production repository.

Phase 4.1 does not implement PR merge, force push/history rewrite, default-branch direct mutation, branch/tag/release deletion, repository settings/permissions/secrets/rulesets, deployment, package publication, external messaging or arbitrary git/shell authority.

See `docs/reviews/phase-4.1-implementation-report.md`.

## Next engineering direction — evidence-driven

The next planned adapter class is **Phase 4.2 Deployment**, but it should start only when a concrete Project requires deployment and we can bind one provider's exact staging/production/rollback authority model. A separately authorized live GitHub Phase 4.1 certification can happen earlier when real remote-source-control evidence is useful.

Do not add every possible provider or enterprise-scale subsystem speculatively.

## Run locally

```bash
npm run verify
npm run db:migrate
npm run db:backup
npm run phase3:certify
npm run phase40:certify
npm run phase41:certify
npm start
```

`phase3:certify`, `phase40:certify`, and `phase41:certify` are synthetic/fixture certification paths and create no live GitHub or production effects.

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
9. `docs/architecture/source-control-adapter-contract.md`
10. `docs/reviews/phase-4.1-implementation-report.md`

## One-line product test

If the operator still has to manually copy prompts between AI products, remember what each worker was doing, or reconstruct Project truth from chats, the system has not achieved its goal.
