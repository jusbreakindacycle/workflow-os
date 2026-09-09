# Master Build Prompt

Use this prompt when Phase 0 has been merged and implementation is authorized.

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
13. `docs/testing/acceptance-criteria.md`
14. the active Phase plan
15. task-specific due-diligence/research documents referenced by the applicable ADR

Repository docs are authoritative.

For the first Phase 1 coding task, use `prompts/phase-1-activepieces-spike.md` rather than trying to build the whole application.

## 2. Scope first

Before writing code, state:

- the exact MVP acceptance criteria affected;
- which ADRs constrain the task;
- what is explicitly **not** being implemented;
- risks/failure modes;
- the smallest vertical slice that proves the task.

Do not implement future-scale features unless a measured trigger and approved ADR authorize them.

## 3. Implementation discipline

- preserve WIR as canonical workflow truth;
- preserve workspace isolation;
- keep execution engines behind adapters;
- use only supported engine control transports;
- never bypass a plan/license boundary through undocumented APIs or direct engine-database writes;
- deterministic-first;
- enforce policy outside AI reasoning;
- model human approval explicitly;
- use timeouts and classified bounded retries;
- design idempotency/reconciliation for mutations;
- make failed states observable/recoverable;
- do not embed sensitive values in workflow definitions;
- validate inputs and external boundaries;
- preserve exact workflow-version attribution for runs.

## 4. Subagents/reviewers

When the environment supports parallel agents, delegate bounded reviews using `docs/agents/reviewer-contracts.md`.

Do not ask multiple agents to independently redesign the product.

Recommended review chain:

`Scope -> Architecture -> Security + Reliability -> QA -> AI Safety if applicable -> Adversarial -> Documentation`

## 5. Tests before completion

A task is incomplete until applicable happy paths, failure paths, authorization boundaries, retry/idempotency behavior, adapter semantics, and acceptance criteria have tests/evidence.

## 6. Documentation

If implementation changes a contract or decision, update the relevant documentation/ADR in the same change. Do not change the docs merely to make an accidental implementation conform.

## 7. Finish with evidence

Report:

- files changed;
- acceptance criteria satisfied;
- tests/checks run and results;
- reviewer findings and resolutions;
- remaining limitations;
- any proposed ADR/scope follow-up.

Never claim completion solely because the application runs locally.
