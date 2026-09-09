# Master Build Prompt

Use this prompt when implementation is authorized for the active phase.

---

You are implementing Workflow OS from the repository contract, not inventing the product from scratch.

## 1. Read before acting

Read:

1. `AGENTS.md`
2. `docs/product/goal.md`
3. `docs/product/scope-mvp.md`
4. `ARCHITECTURE.md`
5. `docs/decisions/index.md` and every ADR relevant to the task
6. `docs/workflow-ir/wir-v0-spec.md`
7. `docs/architecture/engine-adapter-contract.md`
8. the active engine adapter profile when the task is engine-specific
9. `docs/risk/workflow-risk-model.md`
10. `docs/reliability/reliability-model.md`
11. `docs/security/security-model.md`
12. `docs/testing/testing-strategy.md`
13. the acceptance criteria for the active phase
14. the active phase plan
15. task-specific due-diligence/research documents referenced by applicable ADRs

Repository docs are authoritative.

For the first Phase 1 coding task, use `prompts/phase-1-activepieces-spike.md` rather than trying to build the whole application.

## Phase boundary

AI Employee specifications under `docs/ai-employees/` are future Phase 3 contracts.

During Phase 1:

- use them only to avoid architectural dead ends;
- do not implement Role Registry, persistent memory, AI Employee task orchestration, or multi-agent features;
- do not expand Phase 1 acceptance criteria to include Phase 3.

When Phase 3 is explicitly activated, additionally read:

- `docs/plans/phase-3-ai-employees.md`
- `docs/ai-employees/acceptance-criteria.md`
- ADR-007 through ADR-010
- task-relevant AI Employee contracts.

## 2. Scope first

Before writing code, state:

- the exact active-phase acceptance criteria affected;
- which ADRs constrain the task;
- what is explicitly **not** being implemented;
- risks/failure modes;
- the smallest vertical slice that proves the task.

Do not implement future-phase or future-scale features unless their gate is active and approved.

## 3. Implementation discipline

- preserve WIR as canonical workflow truth;
- preserve AI Employee Spec as future canonical role truth without replacing WIR;
- preserve workspace isolation;
- keep execution and agent runtimes behind adapters;
- use only supported control transports;
- never bypass plan/license boundaries through undocumented APIs or direct engine-database writes;
- deterministic-first;
- responsibility is not permission;
- enforce policy outside AI reasoning;
- model human approval explicitly;
- use timeouts and classified bounded retries;
- design idempotency/reconciliation for mutations;
- make failed states observable/recoverable;
- do not embed sensitive values in workflow/role definitions;
- validate inputs and external boundaries;
- preserve exact workflow/role version attribution.

## 4. Subagents/reviewers

When the environment supports parallel agents, delegate bounded reviews using `docs/agents/reviewer-contracts.md`.

Do not ask multiple agents to independently redesign the product.

Recommended review chain:

`Scope -> Architecture -> Security + Reliability -> AI Employee Role Review if applicable -> QA -> AI Safety -> Adversarial -> Documentation`

## 5. Tests before completion

A task is incomplete until applicable happy paths, failure paths, authorization boundaries, retry/idempotency behavior, adapter semantics, evaluations, and acceptance criteria have evidence.

## 6. Documentation

If implementation changes a contract or decision, update the relevant documentation/ADR in the same change. Do not change docs merely to make an accidental implementation conform.

## 7. Finish with evidence

Report:

- files changed;
- acceptance criteria satisfied;
- tests/checks run and results;
- reviewer findings and resolutions;
- remaining limitations;
- proposed ADR/scope follow-up.

Never claim completion solely because the application runs locally.
