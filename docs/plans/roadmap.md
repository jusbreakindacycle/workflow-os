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

## Phase 3 — End-to-end Delivery Golden Path — complete for the synthetic/local certification path

Phase 3 proves one controlled synthetic Project can move from raw request to a verified real local outcome with minimal operator coordination while preserving the Phase 2.2 authority boundary.

### Phase 3.0 — Golden Path and Governed Execution Contract — complete

Defines the canonical synthetic certification case, adaptive discovery/research/challenge boundaries, capability-driven workforce direction, strategy-dependent work graph, Project Pack/Context Slice expectations, and the governed local execution-workspace boundary before workers receive real filesystem/command permissions.

### Phase 3.1 — Adaptive Discovery / Challenge / Strategy — complete

Implements bounded AI-assisted pre-brief reasoning that preserves the request/requested solution, asks only material questions, keeps unknowns explicit, challenges the requested solution, records conditional research requirements, recommends strategy from evidence, reuses Free-First zero-incremental routing, and waits for operator acceptance/revision before creating canonical Project truth.

Phase 3.1 CI passed 75/75 tests with nine migrations. See `docs/plans/phase-3.1-adaptive-discovery-strategy.md` and `docs/reviews/phase-3.1-implementation-report.md`.

### Phase 3.2 — Dynamic Workforce / Work Graph — complete

Consumes the accepted Brief/strategy and creates strategy-specific WorkItems, dependencies, capability activations, evidence contracts, risk/action class, authority requirements, verification requirements, mutable-resource declarations, and stop/escalation conditions.

The planner has distinct graph families for process change, adopt/configure, integrate, automate, custom build, hybrid, research/pilot and defer. Tests explicitly prove a configuration job does not fabricate software-development roles and a deferred Project creates no implementation work.

See `docs/plans/phase-3.2-dynamic-workforce-work-graph.md`.

### Phase 3.3 — Governed Local Execution Workspace — complete for bounded synthetic R1 local work

Implements a dedicated per-Project workspace under a Workflow-OS-configured root with path/symlink/absolute escape rejection, hashed artifact manifests, deny-by-default command classes, minimal process environment, loopback-only local server execution, owned-process lifecycle records and bounded cleanup.

Local workspace authority remains distinct from shared GitHub, deployment, production, credential, communication, or paid-execution authority.

See `docs/plans/phase-3.3-governed-local-execution-workspace.md`.

### Phase 3.4 — Verification / Repair / Delivery — complete for the local golden path

Implements Phase 3 Project Pack/Context Slice projections, bounded Assignments, real syntax/behavior checks, actual local lead-flow verification, deterministic independent reconciliation, a two-attempt repair budget, and delivery records that require independent L3 evidence before they can be marked delivered.

See `docs/plans/phase-3.4-verification-repair-delivery.md`.

### Phase 3.5 — Full End-to-end Certification — complete for the canonical synthetic case

The certification runs the canonical request through Phase 3.1 acceptance, strategy-specific planning, governed workspace preparation, real local artifact creation, real tests, actual loopback invalid/valid lead submissions, local receiver/store reconciliation, independent verification, and final delivery evidence.

Workflow OS Verify passed 81/81 tests and 10 migrations on the executable implementation head. The merge-candidate CI also runs `npm run phase3:certify` as a separate local certification gate.

See `docs/reviews/phase-3.5-end-to-end-certification-report.md`.

### Phase 3 boundary after certification

Phase 3 does **not** certify production deployment, shared GitHub mutation, real client/customer data, real Meta/CRM/email/SMS integrations, ad spend/performance, arbitrary external integrations, credential/permission grants, or unattended always-on hosting.

Do not expand those authorities implicitly from the passing local certification.

## Phase 4 — Broaden Delivery Adapters — next, evidence-driven

Broaden beyond the first local custom-build proof only from measured Project needs.

Likely candidates include:

- business workflow/WIR execution and evaluation of Activepieces or another workflow engine;
- governed source-control/shared-remote adapter work when real client delivery requires it;
- deployment/hosting adapters with exact R2/R3 authority and rollback evidence;
- configure/adopt/integrate execution adapters for real external systems;
- observation/production evidence paths.

Do not implement every adapter merely because it is imaginable. Prefer the next real/synthetic Project that exposes a concrete delivery gap.

If unattended/background execution becomes valuable, define an `ExecutionHost` topology (local desktop, always-on self-hosted machine, or replaceable remote host). Canonical state must not depend on one hosting vendor.

## Phase 5 — Commercial Operations

Expand operator-side commercial workflows only when real work requires them: quotation/change-request generation, invoice/payment status integration, maintenance reminders, client communication/portal. Do not become an accounting ERP.

## Phase 6 — Internal Workforce Provider Evaluation

If direct runtime orchestration becomes burdensome, run Paperclip core/advanced gates. Adopt only the proven subset behind ADR-013. This may move earlier if measured coordination cost justifies it, but cannot replace canonical authority.

## Phase 7 — Future client-facing AI workers

Re-research and define governed client-facing AI role packaging only after internal delivery/value is proven.

## Scale

Kubernetes, multi-region, complex queues, service discovery, sharding, etc. require measured triggers. They are not roadmap milestones by default.
