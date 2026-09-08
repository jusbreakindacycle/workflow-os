# Reviewer and Subagent Contracts

These roles define bounded responsibilities for future Codex/agentic engineering work. They may be executed by separate subagents when the environment supports them, or sequentially by one agent.

No reviewer is allowed to silently expand product scope.

## 1. Scope Guardian

**Reads:** goal, MVP scope, active plan, acceptance criteria.

**Checks:**
- task is inside MVP
- implementation has no disguised future-scale work
- acceptance criteria are mapped
- non-goals remain intact

**May:** request removal/splitting of out-of-scope work.

**May not:** invent new product features.

## 2. Architecture Reviewer

**Reads:** ARCHITECTURE, WIR, adapter contract, ADRs.

**Checks:**
- control-plane/execution-plane boundary
- canonical WIR ownership
- adapter semantic fidelity
- data/event/version integrity
- no accidental universal executor

**May not:** override product scope without an ADR.

## 3. Security Reviewer

**Reads:** security and risk models.

**Checks:**
- workspace authorization/isolation
- sensitive-value handling/redaction
- inbound/outbound integration boundaries
- action authorization
- approval bypass
- common API/web risks

## 4. Reliability Reviewer

**Checks:**
- deadlines/timeouts
- retry classification/backoff
- idempotency/reconciliation
- concurrency/backpressure
- failed-run recovery
- compensation semantics
- no duplicate side effects

## 5. AI/Agent Safety Reviewer

**Checks:**
- deterministic logic was preferred where sufficient
- AI output has schema/evaluation
- agents have tool allowlists
- loop/cost/time budgets
- human gates for high-risk effects
- prompt/model changes do not bypass policy

## 6. QA/Test Reviewer

**Checks:**
- happy and failure paths
- adapter contracts
- idempotency tests
- approval paths
- workspace boundary tests
- AI evaluations
- acceptance criteria evidence

May identify missing tests; does not redefine the feature.

## 7. Adversarial Reviewer

Assumes the implementation is wrong until evidence says otherwise.

Attempts to break:
- scope boundaries
- graph validation
- retry safety
- duplicate events
- concurrent approvals
- adapter capability declarations
- stale versions
- cross-workspace access
- log redaction
- recovery/replay
- agent loop termination

## 8. Documentation/Handoff Reviewer

Checks that repository docs, ADRs, WIR examples, operator guidance, and handoff artifacts match implemented behavior.

## 9. Implementation agents

Future implementation may use bounded frontend, backend/control-plane, engine-adapter, and test agents. Their authority is limited by the same source-of-truth hierarchy in `AGENTS.md`.

## Recommended review order

```text
Scope
 -> Architecture
 -> Security + Reliability
 -> QA
 -> AI Safety (when applicable)
 -> Adversarial
 -> Documentation
```

Findings should be specific and evidence-based. Reviewers should avoid duplicating each other's remit unless a finding crosses boundaries.
