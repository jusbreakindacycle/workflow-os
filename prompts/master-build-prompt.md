# Master Build Prompt

Use this prompt when implementation is authorized for the active phase.

---

You are implementing Workflow OS from the repository contract, not inventing the product from scratch.

Workflow OS is a personal AI business delivery operating system for one human operator. `Project` is the top-level operational unit. WIR is canonical for workflows inside a Project. Internal agents are bounded workers and do not own Project state.

## 1. Read before acting

Read:

1. `AGENTS.md`
2. `docs/product/goal.md`
3. `docs/product/project-operating-model.md`
4. `docs/product/project-command-center.md`
5. `docs/product/scope-mvp.md`
6. `ARCHITECTURE.md`
7. `docs/decisions/index.md` and every ADR relevant to the task
8. `docs/plans/foundation-v2.md`
9. `docs/workflow-ir/wir-v0-spec.md` when workflows are involved
10. `docs/architecture/engine-adapter-contract.md` when execution engines are involved
11. the active engine adapter profile when engine-specific
12. `docs/risk/workflow-risk-model.md`
13. `docs/reliability/reliability-model.md`
14. `docs/security/security-model.md`
15. `docs/testing/testing-strategy.md`
16. `docs/engineering/agent-operability-and-verification.md`
17. `docs/operations/production-maintenance-model.md` when deployment/production is involved
18. `docs/testing/acceptance-criteria.md`
19. the active phase plan
20. task-specific due-diligence/research documents referenced by applicable ADRs.

Repository docs are authoritative.

For the first Phase 1 coding task, use `prompts/phase-1-activepieces-spike.md` rather than trying to build the whole application.

## Foundation v2 boundary

The broader North Star does **not** authorize building a self-organizing autonomous software company in Phase 1.

During Phase 1:

- Project/WorkItem/Command Center state is in scope only as defined by `/scope-mvp` and the Phase 1 plan;
- the Activepieces spike remains isolated and first;
- internal agents may be used as bounded development/reviewer subagents but no persistent self-organizing internal-agent runtime is required;
- future client-facing AI Employee specifications under `docs/ai-employees/` remain Phase 3 contracts;
- do not implement client AI Employee Role Registry, persistent memory, client AI Employee task orchestration, or client multi-agent features.

When Phase 3 is explicitly activated, additionally read:

- `docs/plans/phase-3-ai-employees.md`
- `docs/ai-employees/acceptance-criteria.md`
- ADR-007 through ADR-010
- task-relevant AI Employee contracts.

## 2. Scope first

Before writing code, state:

- the exact Project/WorkItem or foundation task being changed;
- the exact active-phase acceptance criteria affected;
- which ADRs constrain the task;
- what is explicitly **not** being implemented;
- risks/failure modes;
- the smallest vertical slice that proves the task;
- required completion evidence.

Do not implement future-phase or future-scale features unless their gate is active and approved.

## 3. Canonical state discipline

- preserve Workspace isolation;
- preserve Project as the top-level operational unit;
- preserve WIR as canonical workflow truth within a Project;
- preserve AI Employee Spec as future canonical client-facing role truth without replacing Project or WIR;
- do not store authoritative Project/WorkItem status only in agent context, chat text, prompt memory, or third-party tool status;
- Command Center views must derive from canonical state/events/evidence;
- execution/coding/deployment/agent runtimes remain adapters/tools rather than the source of truth;
- preserve exact Project/WorkItem/workflow/role/deployment attribution.

## 4. Implementation discipline

- deterministic-first;
- responsibility is not permission;
- enforce policy outside AI reasoning;
- model human approval explicitly;
- use timeouts and classified bounded retries;
- design idempotency/reconciliation for mutations;
- make failed states observable/recoverable;
- do not embed sensitive values in Project/workflow/role definitions;
- validate inputs and external boundaries;
- avoid arbitrary progress percentages when the denominator is not meaningful;
- prefer machine-enforced rules/tests/CI over adding more prompt prose;
- deployment is not “done” until required health/verification evidence is captured.

## 5. Internal agents/subagents

When the environment supports agents, use `docs/agents/internal-ai-workforce.md` and `docs/agents/reviewer-contracts.md`.

Each assignment must be bounded by:

- Project/WorkItem;
- objective;
- inputs/artifacts;
- scope/non-scope;
- tools/permissions;
- budget/stop conditions;
- required output/evidence;
- escalation.

Do not ask multiple agents to independently redesign the product.

Parallel work is allowed only when dependencies permit safe isolation and integration/verification is explicit.

Recommended review chain:

`Scope -> Architecture -> Security + Reliability -> QA/Verification -> AI Safety -> Adversarial -> Documentation`

## 6. Verification before completion

A task is incomplete until applicable evidence exists.

Use `docs/engineering/agent-operability-and-verification.md`.

Depending on consequence, evidence may include:

- static/schema/type/lint validation;
- automated tests/evals;
- real user/API/workflow execution;
- side-effect reconciliation;
- deployment health;
- independent verification/review;
- human approval.

Never claim completion solely because code was generated, the application starts, or a tool returned “success.”

## 7. Documentation

If implementation changes a contract or decision, update the relevant documentation/ADR in the same change. Do not change docs merely to make an accidental implementation conform.

## 8. Finish with evidence

Report:

- Project/WorkItem or task changed;
- files/artifacts changed;
- acceptance criteria satisfied;
- tests/checks/user-flow verification run and results;
- reviewer/verifier findings and resolutions;
- deployment/production effect if any;
- remaining limitations/blockers;
- next ready WorkItem(s);
- proposed ADR/scope follow-up.
