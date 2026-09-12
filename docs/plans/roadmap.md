# Roadmap

The roadmap is capability-gated. Phase numbers do not promise dates, and a later Project's actual delivery strategy may justify moving one adapter evaluation earlier without changing canonical authority.

## Foundation v3 — complete

Aligned the repository with the human-governed, local-first, provider-independent North Star and removed obsolete/duplicated speculative files.

## Phase 1 — Core Control Plane — complete

Implemented locally: Workspace/Client/Engagement/Project; New Project intake; discovery/unknowns/strategy/approval; goal revision/impact; WorkItems/dependencies/proposals; Decisions/Approvals; Project Pack + Context Slice; SpendEnvelope; Activity/Attention/Command Center; mock Assignment + evidence/verification.

Phase 1 exited at the anti-PM-suite boundary.

## Phase 2 — Autonomy Kernel / First Real Execution — complete for the representative provider path

Phase 2 implements normalized capabilities, ProviderConnection/entitlement/health state, Broker + Spend enforcement, deterministic Project Bootstrapper, Assignment instruction compiler, Skill Registry, bounded Loop Engine, independent verifier routing, fallback/rerouting, provider adapters, execution evidence, and certification records.

Normal CI proves provider-independent orchestration using fixture routes and fake provider HTTP responses. Real-provider evidence is supplied separately by the Phase 2.1 zero-spend certification harness.

On 2026-09-12, the representative real-provider evidence chain passed:

1. non-fixture real worker execution through Google Antigravity;
2. independent non-fixture verification through OpenRouter;
3. canonical L2 verification outcome `pass`;
4. cross-provider portability drill through independent ProviderConnections;
5. zero SpendEnvelope and zero CostRecord in the certification Workspace.

This certifies the representative model execution/verifier/portability path. It does not certify production deployment or high-authority external actions.

See `docs/reviews/phase-2.1-live-certification-report.md`.

## Phase 2.1 — Free-First Provider & Quota Broker — complete and live-certified

Phase 2.1 adds quota-aware zero-spend routing over real free/zero-incremental capacity while preserving independent verification and refusing silent paid fallback.

The live certification passed with Antigravity as worker and OpenRouter as independent verifier, with the portability drill passed and zero paid-spend records. Normal CI remains credential-free and live execution remains explicit opt-in.

Recertification is not a routine step. Run it again only after material provider/broker/certification changes, a materially different environment, or when evidence needs renewal.

## Phase 2.2 — Canonical Authority Hardening — next

Before Workflow OS receives consequential real capabilities, strengthen the authority boundary that decides what work and approvals are valid.

Primary targets:

- restrict `createWorkItem(...)` initial status to the intended creation states (`draft` or `ready`);
- make `requestApproval(...)` validate that the referenced subject exists and belongs to the same Workspace/Project;
- add adversarial stale-version and approval TOCTOU tests;
- define an explicit authority threshold for repository writes, deployment, production mutation, external communication, and other consequential actions;
- preserve the rule that provider/model success is evidence, not authority.

Exit condition: the first consequential adapter/runtime capability can be granted without relying on caller discipline to preserve canonical authority.

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
