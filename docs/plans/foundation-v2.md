# Foundation v2 — Solo AI Business Delivery Operating Model

## Why this pass exists

The original Phase 0 correctly established workflow automation, WIR, execution adapters, risk/reliability/security, evaluations, and future client-facing AI Employee contracts.

The intended North Star is broader: Workflow OS should operate as the internal operating system for a one-person AI-native software/automation business. The operator should be able to start from a raw user problem, client request, or project idea and have the system coordinate the work through research, specification, implementation, verification, deployment, production operation, maintenance, and reuse.

This foundation pass aligns the repository with that North Star **without discarding the original work**.

## Decisions introduced

1. `Project` becomes the top-level operational unit inside a Workspace.
2. WIR remains the canonical representation of a workflow inside a Project.
3. Future AI Employee Spec remains the canonical representation of a client-facing governed role inside/associated with a Project.
4. Workflow OS, not an agent context, owns Project/WorkItem state.
5. A Project Command Center becomes a core product surface.
6. Internal delivery agents are distinct from client-facing AI Employees.
7. Internal parallel/multi-agent work is dependency/isolation/verification gated.
8. Agent operability and verification are engineering requirements, not optional prompt improvements.
9. Deployment does not end Project ownership; production/incident/maintenance state is first-class.

## Existing foundation retained

Keep and build on:

- WIR v0;
- workflow taxonomy/lifecycle;
- execution adapter contracts;
- Activepieces due diligence;
- feasibility/risk models;
- reliability/idempotency/reconciliation;
- workspace isolation/security;
- testing/evaluations;
- human approval semantics;
- observability/ROI;
- reviewer/subagent contracts;
- client-facing AI Employee architecture;
- evidence-driven scale policy.

Do not rewrite these merely to make the new North Star look different.

## New canonical documents

- `docs/product/project-operating-model.md`
- `docs/product/project-command-center.md`
- `docs/agents/internal-ai-workforce.md`
- `docs/engineering/agent-operability-and-verification.md`
- `docs/operations/production-maintenance-model.md`
- ADR-011 and ADR-012

## Phase 1 effect

The Activepieces hands-on adapter spike remains the first coding experiment because it answers a critical execution-engine question and is intentionally isolated.

After the spike passes, the first broad application vertical slice must include Project attribution and Command Center visibility:

```text
Workspace
 -> Project
 -> Project Brief
 -> WorkItem(s)
 -> Workflow Brief
 -> WIR validation
 -> deploy through one adapter
 -> run/status/evidence
 -> Project Command Center
 -> production/deployment record
```

This does not require a full software factory, persistent autonomous agents, or polished enterprise project-management UI.

## Foundation v2 completion checklist

### Product

- [x] North-star goal explicitly covers project idea/problem through maintenance/reuse.
- [x] Project/portfolio layer is defined.
- [x] Command Center operator questions and minimum views are defined.
- [x] internal vs client-facing agents are distinguished.

### Architecture

- [x] Project is top-level operational unit.
- [x] WIR semantics remain scoped to workflow definitions.
- [x] canonical state remains outside agent private context.
- [x] production/maintenance ownership is explicit.
- [x] parallel internal agents are gated by dependencies/isolation/verification.

### MVP discipline

- [x] Phase 1 gains a minimal Project/Command Center layer.
- [x] full autonomous software factory remains out of scope.
- [x] Activepieces spike remains isolated before broad product implementation.
- [x] Phase 1 acceptance criteria are updated.

### Agent engineering

- [x] project/repository operability requirements are defined.
- [x] verification ladder is defined.
- [x] agent assertions are not completion evidence.
- [x] failure-to-guardrail learning loop is defined.
- [x] independent verification and evaluation principles are defined.

### Operations

- [x] deployment record concept is defined.
- [x] incident and maintenance loop is defined.
- [x] Command Center production visibility is defined.

## Explicit non-goals of this foundation pass

- choosing a final UI stack;
- choosing a final coding-agent vendor;
- implementing Project tables/APIs/UI now;
- implementing autonomous agent scheduling now;
- implementing GitHub/Vercel/Supabase/etc. integrations now;
- replacing WIR;
- renumbering or deleting the client-facing AI Employee contracts;
- designing a large enterprise PM system;
- selecting Kubernetes or other scale infrastructure.

## Next implementation sequence after merge

1. Complete/re-run the Activepieces Gate 2B hands-on adapter spike.
2. Resolve/confirm ADR-004 from executable evidence.
3. Design the minimal Project + WorkItem + Event + Command Center data contract needed for Phase 1.
4. Implement the thin Project-to-workflow vertical slice.
5. Add Project-aware observability/evidence.
6. Prove agent-operability/verification for that slice.
7. Only then expand internal agent delivery automation.

## Exit condition

Foundation v2 is ready to merge when the updated goal, architecture, scope, ADRs, Phase 1 plan, acceptance criteria, Command Center, internal-agent, verification, and maintenance contracts are internally consistent and do not silently require future-phase autonomy.
