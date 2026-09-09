# Roadmap

The roadmap is capability-driven. Dates are intentionally omitted until implementation velocity and real client demand exist.

## Phase 0 — Engineering contract
Specification, architecture, risk/reliability/security, WIR, acceptance criteria, scale gates, Codex harness.

## Phase 1 — MVP
One operator, multiple workspaces, discovery, WIR, one execution adapter, tests, approvals, observability, templates, ROI.

AI Employee product features remain out of scope.

## Phase 2 — Freelancer-ready
- richer connector coverage
- additional execution adapters based on client demand
- dev/test/prod promotion
- stronger audit/reporting
- generated proposals/handoff packs
- recurring client health/ROI reports
- incident workflows
- backup/restore operational proof
- stronger reusable Skill/Workflow packaging that Phase 3 can consume

## Phase 3 — Governed AI Employees
See `phase-3-ai-employees.md`.

Capability order:

1. Role Template / Role Instance / immutable Role Version
2. bounded Task Assignments
3. capability/identity/authority bindings
4. explicit context/knowledge; memory disabled first
5. one bounded single-role Agent Runtime Adapter use case
6. test -> shadow -> supervised -> active promotion
7. AI Employee observability and ROI
8. reusable role templates

Explicitly defer unrestricted autonomy and multi-agent collaboration.

## Phase 4 — Durable orchestration
When real workflows require it:
- long-running wait states
- event correlation
- durable checkpoints
- compensation/Sagas
- BPMN import/export or process-orchestrator adapter
- durable-runtime adapter
- long-lived AI Employee task patterns only when process semantics justify them

## Phase 5 — Scale
Only from scale-trigger evidence:
- horizontal service/worker scaling
- distributed tracing
- SLO/error-budget operations
- advanced deployment strategies
- WAF and stronger edge/network controls
- partitioning/read replicas if needed
- Kubernetes if operationally justified
- multi-region only from explicit continuity requirements

## Future gate — Multi-agent collaboration

Not automatically part of Phase 3.

Enable only when a real role demonstrates measurable value that cannot reasonably be achieved with one AI Employee plus workflows/tools, and ADR-010 revisit criteria are met.
