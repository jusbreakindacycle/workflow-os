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

Adversarial tests cover direct-SQL WorkItem bypass, cross-Project/unknown/stale approval subjects, immutable approval bounds, repository resolve/use-time staleness, and spend version staleness.

See `docs/plans/phase-2.2-canonical-authority-hardening.md` and `docs/reviews/phase-2.2-implementation-report.md`.

## Phase 3 — End-to-end Delivery Golden Path — complete for the synthetic/local certification path

Phase 3 proves one controlled synthetic Project can move from raw request to a verified real local outcome with minimal operator coordination while preserving the Phase 2.2 authority boundary.

### Phase 3.0 — Golden Path and Governed Execution Contract — complete

Defines the canonical synthetic certification case, adaptive discovery/research/challenge boundaries, capability-driven workforce direction, strategy-dependent work graph, Project Pack/Context Slice expectations, and the governed local execution-workspace boundary before workers receive real filesystem/command permissions.

### Phase 3.1 — Adaptive Discovery / Challenge / Strategy — complete

Implements bounded AI-assisted pre-brief reasoning that preserves the request/requested solution, asks only material questions, keeps unknowns explicit, challenges the requested solution, records conditional research requirements, recommends strategy from evidence, reuses Free-First zero-incremental routing, and waits for operator acceptance/revision before creating canonical Project truth.

### Phase 3.2 — Dynamic Workforce / Work Graph — complete

Consumes the accepted Brief/strategy and creates strategy-specific WorkItems, dependencies, capability activations, evidence contracts, risk/action class, authority requirements, verification requirements, mutable-resource declarations, and stop/escalation conditions.

### Phase 3.3 — Governed Local Execution Workspace — complete for bounded synthetic R1 local work

Implements a dedicated per-Project workspace with path/symlink/absolute escape rejection, hashed artifact manifests, deny-by-default command classes, minimal process environment, loopback-only local server execution, owned-process lifecycle records and bounded cleanup.

### Phase 3.4 — Verification / Repair / Delivery — complete for the local golden path

Implements Phase 3 Project Pack/Context Slice projections, bounded Assignments, real syntax/behavior checks, actual local-flow verification, deterministic independent reconciliation, bounded repair, and delivery evidence.

### Phase 3.5 — Full End-to-end Certification — complete for the canonical synthetic case

The certification runs the canonical request through accepted strategy, strategy-specific planning, governed workspace preparation, real local artifact creation, tests, actual loopback flow, independent verification and final delivery evidence.

See `docs/reviews/phase-3.5-end-to-end-certification-report.md`.

### Phase 3 boundary

Phase 3 does not certify production deployment, shared GitHub mutation, real client/customer data, real Meta/CRM/email/SMS integrations, ad spend/performance, arbitrary external integrations, credential/permission grants, or unattended always-on hosting.

## Phase 4 — Real Delivery Adapters — next

Phase 4 moves from verified local outcomes to governed real external delivery. See `docs/plans/phase-4-real-delivery-adapters.md`.

### Phase 4.0 — External Action Contract — next coding task

Implement the provider-neutral plan/authority/preflight/attempt/reconciliation/verification substrate in `docs/architecture/external-action-contract.md`.

The core bounded loop is:

```text
observe -> compile exact plan -> authorize -> preflight -> act -> reconcile -> verify -> complete/repair/escalate
```

Uncertain external mutations are reconciled before retry.

### Phase 4.1 — Governed Source Control — immediately after / alongside 4.0

Implement the Source Control Adapter contract in `docs/architecture/source-control-adapter-contract.md`.

The first certified write path is deliberately narrow: inspect repository/base, create one non-default delivery branch, project one verified artifact snapshot to an exact commit/tree, open one exact pull request, read checks/state, reconcile.

Merge, force push, settings, permissions, secrets, releases and deployment remain outside Phase 4.1.

### Phase 4.2 — Deployment Adapter — evidence-triggered

Target one deployment provider first. Separate preview/staging from production authority, bind exact artifact/source versions, verify health and define rollback/recovery before production use.

### Phase 4.3 — Workflow Engine / WIR Execution — evidence-triggered

When an `automate`/`integrate` Project requires it, compile canonical WIR into a replaceable workflow-engine projection. Evaluate Activepieces or an alternative as an execution provider, not canonical truth.

### Phase 4.4 — Configure / Integrate External Systems — evidence-triggered

Add concrete forms/spreadsheets/databases/CRM/email/storage/API adapters only from measured Project demand. Do not build an integration marketplace by imagination.

### Phase 4.5 — Real Delivery Certification

Certify one representative Project across a real non-production external boundary with exact authority and observable reconciliation evidence.

## Phase 5 — Commercial Operations — later, evidence-triggered

Expand operator-side commercial workflows only when real work requires them: quotations/proposals, change requests, invoice/payment status, client acceptance/handoff, maintenance reminders and a minimal client delivery surface.

Workflow OS may coordinate commercial state but must not become a full accounting ERP.

## Phase 6 — Internal Workforce Provider Evaluation — later

If direct runtime orchestration becomes measurably burdensome, run Paperclip core/advanced gates. Adopt only the proven subset behind ADR-013. Rejection is a valid outcome. A workforce provider never replaces canonical Workflow OS authority.

## Phase 7 — Client-facing AI Workers — later

After internal delivery value is proven, define governed client-facing AI role packaging with explicit data/tool/authority/cost/verification/escalation contracts.

## Phase 8 — Execution Host / Background Autonomy — demand-triggered

If work must continue while the operator laptop is unavailable, define a replaceable `ExecutionHost` topology with scheduling, leases/heartbeats, crash recovery, bounded secret injection and capability registration. Canonical state must not depend on one hosting vendor.

## Phase 9 — Production Reliability / Operations — demand-triggered

When Workflow OS operates real production client systems, add evidence-driven observability, incidents, backups, rollback, maintenance windows, dependency health and service-level evidence.

## Phase 10 — Multi-operator / Productization — only after personal use is proven

Only after successful real solo-freelance usage should the product consider multi-user tenancy, organization roles, hosted SaaS, billing or extension ecosystems.

## Scale

Kubernetes, multi-region, complex queues, service discovery, sharding and similar infrastructure require measured triggers. They are not roadmap milestones by default.
