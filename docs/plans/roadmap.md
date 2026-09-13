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

## Phase 2.2 — Canonical Authority Hardening — complete

Phase 2.2 strengthens the authority boundary that decides what work and approvals are valid before any consequential real adapter/runtime capability is enabled.

Implemented controls include:

- WorkItems may be born only as `draft` or `ready`, including at the SQLite boundary;
- registered Approval subjects are exact Workspace/Project/version-bound canonical references;
- unknown/cross-scope/stale approval subjects fail closed;
- authority-bearing Approval identity/version/reason/bounds are immutable;
- Approval status transitions are bounded and stale subjects are rechecked before approval;
- repository authority is rechecked again at consequential use time;
- SpendRequests capture current Project/WorkItem versions and SpendEnvelope/CostRecord paths revalidate that authority before use;
- unresolved legacy spend requests without Phase 2.2 version evidence are superseded rather than silently upgraded;
- the risk/approval policy defines explicit authority thresholds for shared/external writes, communication, repository mutation, production/destructive actions, spend, and credential/permission grants.

Adversarial tests cover direct-SQL WorkItem bypass, cross-Project/unknown/stale approval subjects, immutable approval bounds, repository resolve/use-time staleness, and spend version staleness. Final Phase 2.2 CI passed 69/69 tests with eight migrations.

See `docs/plans/phase-2.2-canonical-authority-hardening.md` and `docs/reviews/phase-2.2-implementation-report.md`.

## Phase 3 — End-to-end Delivery Golden Path — in progress

Phase 3 proves one controlled internal/synthetic Project can move from raw request to a verified real outcome with minimal operator coordination and with every consequential effect governed by the Phase 2.2 authority contract.

### Phase 3.0 — Golden Path and Governed Execution Contract — complete

Defines the first synthetic certification case, adaptive discovery/research/challenge boundaries, capability-driven workforce direction, strategy-dependent work graph, Project Pack/Context Slice expectations, and the governed local execution-workspace authority boundary before workers receive real filesystem/command permissions.

### Phase 3.1 — Adaptive Discovery / Challenge / Strategy — implemented and CI-verified

Implements bounded AI-assisted pre-brief reasoning that:

- preserves raw request and requested solution separately;
- asks only structured material questions with explicit impact areas;
- keeps `I don't know`/skipped answers explicit;
- requires re-analysis after answers;
- records conditional research requirements rather than inventing external facts;
- challenges the requested solution and compares alternatives;
- recommends delivery strategy from source-backed evidence;
- reuses zero-incremental Free-First routing without silent paid fallback;
- waits for operator acceptance/revision before creating the canonical Project Brief;
- preserves a rejected model recommendation when the operator chooses another strategy.

Phase 3.1 CI passed **75/75 tests** with nine migrations plus migration/backup and live-harness opt-in checks. See `docs/plans/phase-3.1-adaptive-discovery-strategy.md` and `docs/reviews/phase-3.1-implementation-report.md`.

### Phase 3.2 — Dynamic Workforce / Work Graph — next

Consume the accepted Phase 3.1 Project Brief and selected delivery strategy to generate strategy-specific WorkItems, dependencies, capability requirements, evidence contracts, authority requirements, verification requirements, and logical role activation. Replace the universal Phase 1 initial graph as the Phase 3 default without breaking its regression path.

### Phase 3.3 — Governed Local Execution Workspace — later

Implement the dedicated per-Project local execution workspace with bounded filesystem, command, network and process authority. Local isolated execution remains distinct from GitHub/shared-remote mutation.

### Phase 3.4 — Verification / Repair / Delivery — later

Implement deterministic checks, actual local user/business flow verification, independent review, bounded repair, evidence reconciliation, and delivery semantics.

### Phase 3.5 — Full End-to-end Certification — later

Run the canonical synthetic Project from raw client request through the complete governed local delivery outcome and certify the Command Center evidence chain.

The first consequential adapter/runtime capability must consume exact subject/version/bounds authority when approval is required, freshness at resolution, and revalidation immediately before a durable/external effect.

Examples remain strategy-dependent:

- `custom_build` / hybrid software: governed local workspace -> implementation -> test/review -> controlled later delivery/deploy;
- `automate` / integrate: evaluate/activate Workflow Engine Adapter when the accepted strategy requires it;
- `configure` / adopt existing: use appropriate tool/provider adapters and evidence without inventing source-code/repository/deployment steps.

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
