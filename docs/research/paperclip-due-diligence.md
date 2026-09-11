# Paperclip Due Diligence for Workflow OS

**Status:** Research / non-authoritative

**Reviewed:** 2026-09-11

**Purpose:** Determine whether Paperclip should be copied, adopted, integrated, or treated as an execution/runtime dependency for Workflow OS after Foundation v2.

## Executive conclusion

Paperclip is the strongest public overlap found so far with Workflow OS's **internal AI-company / agent-workforce layer**.

It is **not** a replacement for Workflow OS as currently defined.

Paperclip is best treated as a candidate **Internal Workforce Adapter**: a replaceable external control/execution subsystem for internal AI agents. Workflow OS should continue to own the meaning and canonical state of Workspace, Project, WorkItem, business/domain policy, WIR, evidence, deployment, incident, maintenance, and client-facing AI Employee semantics.

The recommendation from desk research is therefore:

> **ADAPTER CANDIDATE — do not make Paperclip the canonical Workflow OS database or product model. Do not rebuild Paperclip's agent-runtime/company primitives until a hands-on adapter spike proves they are unsuitable.**

No production dependency should be accepted from desk research alone.

---

## Sources reviewed

Primary sources:

- Paperclip repository: https://github.com/paperclipai/paperclip
- Architecture: https://github.com/paperclipai/paperclip/blob/master/docs/start/architecture.md
- Current documentation: https://docs.paperclip.ing/
- API overview: https://docs.paperclip.ing/reference/api/overview/
- Companies API: https://docs.paperclip.ing/reference/api/companies/
- Goals and Projects API: https://docs.paperclip.ing/reference/api/goals-and-projects/
- Issues guide/API: https://docs.paperclip.ing/guides/day-to-day/issues/
- Dashboard API: https://docs.paperclip.ing/reference/api/dashboard/
- Decisions: https://docs.paperclip.ing/guides/day-to-day/decisions/
- Execution policy: https://docs.paperclip.ing/guides/power/execution-policy/
- Execution workspaces: https://docs.paperclip.ing/guides/projects-workflow/workspaces/
- Agent lifecycle: https://github.com/paperclipai/paperclip/blob/master/docs/guides/agent-developer/how-agents-work.md
- Adapters: https://docs.paperclip.ing/reference/adapters/overview/
- Secrets: https://docs.paperclip.ing/reference/api/secrets/
- Activity/audit: https://docs.paperclip.ing/reference/api/activity/
- Plugins: https://docs.paperclip.ing/administration/plugins/
- Export/import: https://docs.paperclip.ing/guides/power/export-import/
- Releases: https://github.com/paperclipai/paperclip/releases

At review time the latest listed stable release was `v2026.831.1`, released 2026-09-02. Paperclip is MIT-licensed.

---

# 1. What Paperclip actually is

Paperclip describes itself as an operating system for an AI company. It is a control plane for:

- companies;
- human board operators;
- agents and reporting hierarchy;
- goals;
- projects;
- issues/tasks and dependencies;
- agent execution heartbeats;
- runtime adapters;
- budgets/costs;
- approvals/reviews;
- skills;
- secrets;
- workspaces/worktrees;
- activity/audit history;
- human attention/decision queues.

Its architecture is currently roughly:

```text
React UI
  -> Express REST API
      -> PostgreSQL/PGlite
      -> agent runtime adapters
          -> Claude Code / Codex / other CLI/runtime
```

Paperclip explicitly positions itself as a **control plane rather than an execution plane**. Agent runtimes execute externally through adapters and report back.

This is architecturally similar to Workflow OS's adapter philosophy.

---

# 2. Important Paperclip capabilities

## 2.1 Company as tenant boundary

Paperclip states that every agent, project, issue, approval, cost event, and asset belongs to one Company, and company boundaries are enforced by the API.

This maps well to Workflow OS's client/workspace isolation requirement, but the safest mapping is **not** `one Paperclip company = the operator's whole freelance business`.

For real client isolation the candidate mapping should be:

```text
Workflow OS Workspace
      1 : 1
Paperclip Company
```

This prevents a broadly capable internal agent for Client A from automatically seeing Client B merely because both are in the same Paperclip company.

A standardized company package can seed the same internal workforce into multiple client companies if needed.

## 2.2 Projects

Paperclip Projects group related Issues and attach concrete execution context such as repositories, local paths, workspaces, environment bindings, target dates, lead agents, and project budgets.

Paperclip's Project status is intentionally simple:

- backlog
- planned
- in_progress
- completed
- cancelled

Workflow OS Project is semantically richer. It must carry a delivery lifecycle including intake, research, definition, architecture, planning, build, verification, deployment, production, maintenance, and closure.

Therefore Paperclip Project can be a **runtime mirror/reference**, but cannot replace Workflow OS Project semantics without losing important domain state.

## 2.3 Issues/tasks

Paperclip Issues have:

- hierarchy (`parentId`);
- blockers/dependencies;
- assignees;
- one active checkout at a time;
- statuses such as backlog/todo/in_progress/in_review/done/blocked/cancelled;
- reviewers and approvers;
- execution workspaces;
- linked runs and costs.

This overlaps heavily with Workflow OS WorkItem.

The important difference is that Workflow OS WorkItem can represent work assigned to:

- a human;
- an internal AI agent;
- a deterministic workflow;
- an external tool/runtime;
- an approval;
- an incident/maintenance process.

Paperclip Issue is strongest as an **agent-work execution object**.

Recommended rule:

> Do not mirror every Workflow OS WorkItem into Paperclip. Create a Paperclip Issue only when an Internal Workforce Adapter needs Paperclip to execute or coordinate an AI-agent assignment.

## 2.4 Heartbeats and session persistence

Paperclip agents run in bounded heartbeats triggered by schedules, assignments, mentions, approvals, or manual invocation. Adapters can persist underlying sessions between heartbeats.

This solves several mechanisms Workflow OS should avoid rebuilding prematurely:

- waking workers;
- resuming sessions;
- capturing run status;
- tracking usage/cost;
- scheduling recurring agent work;
- pausing/terminating workers.

However persisted model conversation/session state must remain **non-authoritative convenience context**. Workflow OS artifacts, decisions, evidence, and WorkItem state remain authoritative.

## 2.5 Agent runtime adapters

Paperclip already supports multiple execution adapter classes and has first-class local integrations for coding agents including Claude Code and Codex. It also exposes adapter APIs and supports custom/external adapters.

This is high-value reuse because Workflow OS does not need to invent process spawning, session restoration, log capture, usage extraction, adapter diagnostics, and multiple vendor-specific runtime integrations before delivering value.

## 2.6 Execution workspaces

Paperclip can create isolated Git worktrees per task, reuse workspaces, and manage project-primary workspaces. It explicitly addresses dependency finalization and environment mismatch.

This closely matches Workflow OS's dependency-safe parallel-agent requirement.

Recommendation: if Paperclip is adopted as a Workforce Adapter, prefer its isolated workspace capability rather than building a second worktree manager in Workflow OS.

Workflow OS should only store normalized workspace/run references and verification evidence.

## 2.7 Review and approval policy

Paperclip has runtime-enforced execution policies. An executor trying to finish an issue can be automatically routed through reviewer and approver stages. Agent-to-agent change-request loops are bounded and may escalate to a human.

This is stronger than prompt-only review.

However Paperclip review/approval must not silently replace Workflow OS policy.

Recommended distinction:

```text
Paperclip review
= worker/execution acceptance evidence

Workflow OS approval
= canonical business/risk authorization
```

For high-impact Workflow OS actions, authoritative approval remains in Workflow OS even if Paperclip also records a review or approval.

## 2.8 Budgets and costs

Paperclip tracks provider/model/token/cost data and supports company, agent, and project budget policies with enforcement/auto-pause.

Workflow OS should not rebuild per-agent token accounting if Paperclip supplies reliable data. Instead normalize Paperclip cost events into Workflow OS Project/WorkItem cost/evidence records.

Workflow OS still owns project/business budget semantics because costs may also come from workflow engines, SaaS APIs, cloud infrastructure, or human services.

## 2.9 Secrets

Paperclip has company-scoped secrets, agent grants, encrypted local storage, and run-bound API secret access. It can avoid permanently injecting all secrets into every run.

This is useful, but it creates a dual-secret-store risk if Workflow OS also owns integration references.

Recommended rule:

- Workflow OS stores canonical integration/secret **references**, not raw reusable secrets.
- An adapter maps those references to Paperclip secret bindings when Paperclip must deliver a credential to an internal agent.
- A Paperclip agent may never gain broader secret access merely because its role title is broad.

## 2.10 Dashboard, decisions, and audit

Paperclip already has:

- company dashboard health;
- agent status;
- task counts;
- blocked work;
- costs/budget incidents;
- pending approvals;
- Decisions attention queue;
- activity/audit feeds;
- run logs/events.

Workflow OS should not reproduce these surfaces merely for aesthetic duplication.

The Workflow OS Command Center remains necessary because it must aggregate:

- multiple client Workspaces;
- non-agent WorkItems;
- WIR workflow runs;
- deployments;
- production health;
- incidents/maintenance;
- evidence/business outcomes;
- client-facing AI Employees.

Recommended UX:

> Workflow OS shows normalized portfolio/project state and may deep-link into Paperclip for detailed agent-company/runtime views during early implementation.

## 2.11 API/OpenAPI

Paperclip exposes a REST API and machine-readable OpenAPI document. This is a strong reason to integrate through an adapter rather than fork or query its database.

Preferred initial integration boundary:

```text
Workflow OS
  -> Paperclip Adapter
      -> Paperclip REST/OpenAPI
```

Do **not** use direct Paperclip database writes.

## 2.12 Plugins

Paperclip supports plugins, jobs, webhooks, data/actions, dashboard contributions, and custom UI surfaces.

This could eventually allow Workflow OS-specific functionality inside Paperclip.

But Paperclip's plugin runtime is documented as alpha and may change across releases.

Recommendation:

- REST/OpenAPI first;
- plugin only after the adapter model is proven;
- pin Paperclip/plugin versions together if a plugin is later required.

## 2.13 Portability

Paperclip can export/import company configurations and task state into human-readable packages. This reduces lock-in and may help seed reusable internal agent-company templates per client workspace.

Not everything is exported (for example some audit/cost/approval history), so Workflow OS cannot treat Paperclip export alone as complete audit backup.

---

# 3. Where Paperclip overlaps Workflow OS

| Capability | Paperclip | Workflow OS | Decision implication |
|---|---|---|---|
| Tenant/company | Company | Workspace | map carefully; Workspace remains canonical |
| Project | Project | Project | mirror/reference, not replacement |
| Task graph | Issue hierarchy/dependencies | WorkItem dependency graph | use Paperclip for agent-executed work only |
| AI workforce | agents/org/heartbeats | internal AI workforce | strong adapter candidate |
| Runtime adapters | built in | planned | prefer reuse first |
| Worktree isolation | built in/experimental | required conceptually | reuse if spike passes |
| Costs/budgets | agent/project/company | Project/WorkItem + ROI | normalize, do not duplicate |
| Review gates | execution policy | verification/reviewer/evidence | complementary |
| Human attention | Decisions/approvals | Needs My Attention | aggregate in Workflow OS |
| Audit | activity/run feeds | Project/Event/Evidence ledger | ingest normalized events |
| Skills | company skills | engineering/business skills | names overlap; semantics must remain explicit |
| Business workflow IR | no | WIR | Workflow OS differentiation |
| Workflow execution engines | not core | Activepieces/other adapters | Workflow OS differentiation |
| Business risk/side-effect policy | agent governance | explicit workflow/project risk model | Workflow OS remains authoritative |
| Deployment/production incidents | generic work objects | first-class Project state | Workflow OS differentiation |
| Client AI Employees | generic agents | governed deliverable role model | Workflow OS differentiation |
| ROI/time-saved | not primary | first-class | Workflow OS differentiation |

---

# 4. Adversarial findings

## Finding A — two control planes can become worse than one

If Workflow OS and Paperclip both believe they own Project and task truth, state divergence is inevitable.

Examples:

- Paperclip Issue says `done`, Workflow OS verifier says failure.
- Paperclip Project says `completed`, Workflow OS has an open production incident.
- Paperclip agent creates child tasks that Workflow OS never sees.
- human changes Paperclip task priority but Workflow OS schedules from a different priority.

**Required invariant:** Workflow OS canonical state wins. Paperclip objects are mapped execution records unless an explicit future ADR changes ownership.

## Finding B — Paperclip `done` is not Workflow OS `complete`

Paperclip's `done` is a terminal issue state after configured execution policy. Workflow OS has higher-order verification, side-effect reconciliation, deployment, and business acceptance requirements.

Therefore:

```text
Paperclip issue done
!=
Workflow OS WorkItem complete
```

An adapter must translate `done` into something equivalent to **execution candidate finished / evidence available**, and Workflow OS decides whether canonical completion follows.

If Workflow OS later delegates all required verification stages into Paperclip, the adapter may accept `done` only when a compatibility policy explicitly proves equivalence.

## Finding C — company mapping matters for client isolation

One Paperclip company for every client Project would be convenient but could create unnecessary cross-client visibility for agents.

Safest default:

```text
Workflow OS Workspace == Paperclip Company
```

This must be tested rather than assumed.

## Finding D — Paperclip is evolving quickly

Recent stable releases contain hundreds of commits and changing runtime/plugin surfaces. This is healthy project velocity but creates integration churn.

A Workflow OS adapter therefore needs:

- pinned supported versions;
- adapter capability manifest;
- contract tests against the running Paperclip version;
- upgrade gate;
- no dependency on undocumented/private API;
- graceful `unsupported` result when semantics change.

## Finding E — Paperclip plugins are not yet the safest integration surface

The plugin runtime is documented as alpha. Building Workflow OS as a Paperclip plugin now would couple the product to a fast-moving extension SDK.

REST/OpenAPI is the preferred first boundary.

## Finding F — session memory can hide state

Persistent coding-agent sessions are useful, but they can create invisible assumptions.

Workflow OS should require every material handoff/completion to persist compact artifacts/evidence. Resuming a Paperclip/Claude/Codex session must never be the only way to reconstruct why work is in its current state.

## Finding G — agent routines are not business workflow execution

Paperclip Routines can schedule/wake AI-agent work. They should not replace WIR/Activepieces for deterministic business automations.

Use the right execution plane:

```text
agent recurring job -> Paperclip routine may be appropriate
business process -> WIR + execution engine
```

## Finding H — duplication of dashboards would waste effort

Paperclip already has excellent detailed agent/task/run views. Workflow OS should build the cross-domain, cross-workspace portfolio view and not initially recreate every transcript, agent settings screen, worktree inspector, or budget page.

---

# 5. Candidate mapping contract

The following mapping should be tested in a future spike, not yet treated as final implementation.

| Workflow OS canonical concept | Paperclip execution concept | Direction |
|---|---|---|
| Workspace | Company | 1:1 default candidate |
| Project | Project | reference/mirror |
| WorkItem assigned to AI | Issue | conditional mirror |
| WorkItem dependency | blocked-by / parent issue | only when relevant to mirrored issues |
| Internal role | Agent configuration/template | execution implementation |
| AgentAssignment | issue assignment + heartbeat context | execution implementation |
| Agent run | Heartbeat run | normalized run evidence |
| Project repo/env | Project workspace | runtime mapping |
| isolated coding work | execution workspace/worktree | runtime implementation |
| cost record | cost events/budget observation | ingest/normalize |
| agent review | execution-policy decision | evidence |
| human risk approval | approval/decision may mirror | Workflow OS remains authoritative |
| activity | Activity/audit event | ingest/normalize |
| artifact/evidence | documents/work products/comments/run refs | reference/ingest |

---

# 6. Proposed Internal Workforce Adapter responsibilities

A future Workflow OS `InternalWorkforceAdapter` should expose conceptual operations equivalent to:

```text
health()
capabilities()
ensureTenant(workspace)
ensureProject(project)
ensureWorker(roleVersion)
createAssignment(workItem, assignmentContract)
startAssignment(assignment)
getAssignment(assignmentRef)
cancelAssignment(assignmentRef)
listAssignmentEvents(assignmentRef, cursor)
listArtifacts(assignmentRef)
listCosts(assignmentRef)
reconcile(assignmentRef)
pauseWorker(workerRef)
resumeWorker(workerRef)
```

The adapter must additionally declare:

- supported runtime providers;
- session-persistence semantics;
- task-state mapping;
- worktree/isolation behavior;
- review/approval capabilities;
- cost fidelity;
- secret-delivery model;
- cancellation guarantees;
- event/audit fidelity;
- supported Paperclip versions;
- recovery behavior when Paperclip is unavailable.

This contract should be separate from the client-facing AI Employee Agent Runtime Adapter because an internal workforce manager and one bounded role runtime are different abstraction levels.

---

# 7. Paperclip spike gate

Do not adopt Paperclip into Workflow OS production architecture until a hands-on spike proves the following.

## Gate P0 — reproducible install

- pin an exact stable Paperclip version;
- document Node/database/runtime requirements;
- run locally/self-hosted without a Paperclip cloud account;
- confirm backup/export path.

## Gate P1 — API contract

- obtain board API token;
- fetch `/api/openapi.json`;
- create/read/update synthetic Company, Project, Issue;
- verify error semantics and authentication;
- no direct database writes.

## Gate P2 — client isolation

- create two synthetic Workflow OS Workspaces mapped to two Paperclip Companies;
- prove agents/credentials/issues cannot cross company boundary;
- verify normalized references cannot be confused across tenants.

## Gate P3 — Codex worker execution

- configure one bounded Codex internal worker;
- create one synthetic Assignment;
- run it;
- collect run/log/cost/evidence;
- cancel/retry safely.

## Gate P4 — lifecycle/review mapping

- map ready/running/blocked/review/done states;
- configure independent reviewer;
- force changes-requested loop;
- force escalation;
- prove Paperclip `done` cannot prematurely mark Workflow OS WorkItem `complete`.

## Gate P5 — isolated workspace

- execute two independent coding assignments in separate worktrees;
- prove no file collision;
- verify dependency finalization before downstream work;
- reconcile resulting branches/PR references.

## Gate P6 — audit/cost/event reconciliation

- incrementally consume activity/run events;
- ensure idempotent ingestion;
- simulate duplicate polling/retry;
- prove no duplicated Workflow OS events or cost records.

## Gate P7 — secrets

- bind a synthetic secret by reference;
- prove an unauthorized worker cannot read it;
- use run-bound access where possible;
- verify logs/evidence do not leak the value.

## Gate P8 — outage and restart

- stop Paperclip during active/queued work;
- restart it;
- reconcile state without false completion;
- Workflow OS Project remains explainable while Paperclip is unavailable.

## Gate P9 — version compatibility

- run adapter contract tests against pinned version;
- upgrade to a later version in a disposable environment;
- detect compatibility failure instead of silently accepting changed semantics.

### Pass condition

Paperclip receives **PASS** only if Workflow OS can remove/replace the adapter without losing canonical Project/WorkItem meaning, authorization, evidence, and history.

---

# 8. Preliminary decision

**Paperclip: ADAPTER, not BUILD and not wholesale ADOPT.**

Use it when it is better at:

- agent org/runtime management;
- heartbeats/scheduling;
- session persistence;
- local coding-agent adapters;
- worktree provisioning;
- task checkout;
- agent costs/budgets;
- agent-run logs;
- review stages;
- detailed runtime/operator inspection.

Workflow OS must continue to own:

- client Workspace identity and business isolation intent;
- Project lifecycle from problem through maintenance;
- canonical WorkItem graph;
- WIR and workflow semantics;
- business risk and side-effect authorization;
- canonical Decisions/Approvals;
- cross-engine evidence;
- deployment/production/incident/maintenance state;
- client-facing AI Employee semantics;
- portfolio Command Center;
- ROI/business-outcome records.

---

# 9. Why not fork Paperclip immediately

A fork is legally possible under MIT, but architecturally unattractive now:

- large fast-moving codebase;
- high upstream maintenance cost;
- Workflow OS would inherit many product decisions outside its differentiation;
- harder upgrades/security fixes;
- greater temptation to make Paperclip's schema the canonical Workflow OS schema.

A fork should be revisited only if a required extension cannot be expressed safely through the documented API/adapter/plugin surfaces and the value clearly exceeds long-term maintenance burden.

---

# 10. Decision to carry into the wider review

The strongest current position is:

```text
Workflow OS
  = domain/product control plane

Paperclip
  = candidate internal AI workforce execution/control subsystem

Activepieces
  = candidate deterministic/business workflow execution engine

Codex / Claude / Cursor
  = underlying engineering agent runtimes
```

This preserves Workflow OS's differentiation while avoiding unnecessary reinvention.
