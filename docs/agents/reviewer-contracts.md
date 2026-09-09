# Reviewer and Subagent Contracts

These roles define bounded responsibilities for future Codex/agentic engineering work. They may be executed by separate subagents when the environment supports them, or sequentially by one agent.

No reviewer is allowed to silently expand product scope.

## 1. Scope Guardian

**Reads:** goal, MVP scope, active plan, acceptance criteria.

**Checks:**
- task is inside the active phase
- implementation has no disguised future-phase/scale work
- acceptance criteria are mapped
- non-goals remain intact

**May:** request removal/splitting of out-of-scope work.

**May not:** invent new product features.

## 2. Architecture Reviewer

**Reads:** ARCHITECTURE, WIR, AI Employee contracts when applicable, adapter contracts, ADRs.

**Checks:**
- control-plane/execution-plane boundary
- canonical WIR ownership
- AI Employee Spec vs WIR separation
- adapter semantic fidelity
- data/event/version integrity
- no accidental universal executor
- no hidden process state inside an agent session

**May not:** override product scope without an ADR.

## 3. Security Reviewer

**Reads:** security and risk models.

**Checks:**
- workspace authorization/isolation
- sensitive-value handling/redaction
- inbound/outbound integration boundaries
- action authorization
- identity/delegation
- approval bypass
- common API/web risks

## 4. Reliability Reviewer

**Checks:**
- deadlines/timeouts
- retry classification/backoff
- idempotency/reconciliation
- concurrency/backpressure
- failed-run/task recovery
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
- untrusted retrieved/tool content cannot override system policy
- context/memory remain workspace-scoped

## 5A. AI Employee Role Reviewer — Phase 3+

Use when work creates or changes an AI Employee role.

**Reads:**
- `docs/ai-employees/`
- applicable ADR-007 through ADR-010
- role spec and Role Brief
- evaluation/readiness evidence

**Checks:**
- role has measurable outcome
- responsibilities and non-responsibilities are explicit
- task inventory was decomposed before agentic design
- role title is not being treated as permission
- human owner exists
- autonomy class is justified
- RoleVersion is immutable/attributable
- TaskAssignments are bounded
- memory is necessary and explicitly governed
- identity mode is explicit
- promotion stage has evidence
- multi-agent complexity is not introduced without its gate

**May not:**
- broaden the role to “do anything in department X”
- promote a role based only on demo/model confidence
- authorize a tool or R3 action

## 6. QA/Test Reviewer

**Checks:**
- happy and failure paths
- adapter contracts
- idempotency tests
- approval paths
- workspace boundary tests
- AI evaluations
- AI Employee lifecycle/readiness tests when applicable
- acceptance criteria evidence

May identify missing tests; does not redefine the feature.

## 7. Adversarial Reviewer

Assumes the implementation is wrong until evidence says otherwise.

Attempts to break:
- scope boundaries
- graph/task validation
- retry safety
- duplicate events
- concurrent approvals
- adapter capability declarations
- stale versions
- cross-workspace access
- log redaction
- recovery/replay
- agent loop termination
- memory poisoning
- tool/identity privilege escalation
- delegation cycles

## 8. Documentation/Handoff Reviewer

Checks that repository docs, ADRs, WIR/AI Employee examples, operator guidance, and handoff artifacts match implemented behavior.

## 9. Implementation agents

Future implementation may use bounded frontend, backend/control-plane, execution-adapter, agent-runtime, and test agents. Their authority is limited by the same source-of-truth hierarchy in `AGENTS.md`.

## Recommended review order

```text
Scope
 -> Architecture
 -> Security + Reliability
 -> AI Employee Role Review (when applicable)
 -> QA
 -> AI Safety
 -> Adversarial
 -> Documentation
```

Findings should be specific and evidence-based. Reviewers should avoid duplicating each other's remit unless a finding crosses boundaries.
