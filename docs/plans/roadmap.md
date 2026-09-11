# Roadmap

The roadmap is capability-gated. Phase numbers do not promise dates, and a later Project's actual delivery strategy may justify moving one adapter evaluation earlier without changing canonical authority.

## Foundation v3 — complete

Aligned the repository with the human-governed, local-first, provider-independent North Star and removed obsolete/duplicated speculative files.

## Phase 1 — Core Control Plane — complete

Implemented locally: Workspace/Client/Engagement/Project; New Project intake; discovery/unknowns/strategy/approval; goal revision/impact; WorkItems/dependencies/proposals; Decisions/Approvals; Project Pack + Context Slice; SpendEnvelope; Activity/Attention/Command Center; mock Assignment + evidence/verification.

Phase 1 exited at the anti-PM-suite boundary.

## Phase 2 — Autonomy Kernel / First Real Execution — implementation complete, live certification separate

The Phase 2 PR implements normalized capabilities, ProviderConnection/entitlement/health state, Broker + Spend enforcement, deterministic Project Bootstrapper, Assignment instruction compiler, Skill Registry, bounded Loop Engine, independent verifier routing, fallback/rerouting, provider adapters, execution evidence, and live-certification records.

Normal CI proves provider-independent orchestration using fixture routes and fake provider HTTP responses. It does **not** claim a real provider call.

Live evidence remains deliberately separate:

1. first non-fixture real execution;
2. independent non-fixture verifier;
3. two independent non-fixture ProviderConnections passing a representative portability/rerouting drill.

Until operator credentials/entitlements are configured and those checks pass, the accurate state is **autonomy kernel implemented; live provider certification pending operator configuration**.

See `docs/plans/phase-2-autonomy-kernel.md` and `docs/testing/phase-2-acceptance-criteria.md`.

## Phase 3 — End-to-end Delivery Golden Path

Add AI-assisted discovery/research/challenge and dynamic internal role activation, then choose the first complete delivery path from an actual controlled Project's **delivery strategy**.

Examples:

- `custom_build` / hybrid software: approved repository/bootstrap -> implementation -> test/review -> controlled deploy/delivery;
- `automate` / integrate: evaluate/activate Workflow Engine Adapter earlier and execute the governed automation path;
- `configure` / adopt existing: use appropriate tool/provider adapters and evidence without inventing source-code/repository/deployment steps.

Goal: one controlled internal/synthetic Project reaches a verified real outcome from raw request with minimal operator coordination. The system does not privilege coding merely because coding agents are available.

If unattended/background execution becomes valuable, define an `ExecutionHost` topology (local desktop, always-on self-hosted machine, or replaceable remote host). Canonical state must not depend on one hosting vendor.

## Phase 4 — Broaden Delivery Adapters

Expand beyond the first golden path. If business workflow automation was not already the Phase 3 path, add WIR execution and evaluate Activepieces (or alternative). Add additional source/deployment/tool adapters only from measured Project needs.

## Phase 5 — Commercial Operations

Expand operator-side commercial workflows only when real work requires them: quotation/change-request generation, invoice/payment status integration, maintenance reminders, client communication/portal. Do not become an accounting ERP.

## Phase 6 — Internal Workforce Provider Evaluation

If direct runtime orchestration becomes burdensome, run Paperclip core/advanced gates. Adopt only the proven subset behind ADR-013. This may move earlier if measured coordination cost justifies it, but cannot replace canonical authority.

## Phase 7 — Future client-facing AI workers

Re-research and define governed client-facing AI role packaging only after internal delivery/value is proven.

## Scale

Kubernetes, multi-region, complex queues, service discovery, sharding, etc. require measured triggers. They are not roadmap milestones by default.
