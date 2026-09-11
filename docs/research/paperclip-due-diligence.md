# Paperclip Due Diligence for Workflow OS

**Status:** Research / provider candidate; architecture boundary accepted in ADR-013

**Initial review:** 2026-09-11  
**Adversarial update:** 2026-09-12

**Purpose:** Determine whether Paperclip should become the first implementation behind Workflow OS's provider-neutral Internal Workforce Adapter.

## Executive conclusion

Paperclip is the strongest public overlap found so far with Workflow OS's **internal AI-company / agent-workforce layer**.

It is **not** a replacement for Workflow OS as currently defined.

Paperclip is best treated as a candidate **Internal Workforce Adapter**: a replaceable external control/execution subsystem for internal AI agents.

Workflow OS continues to own the meaning and canonical state of:

- Workspace;
- Project;
- WorkItem;
- business/domain policy;
- WIR;
- Decisions, Artifacts, Evidence, and Project events;
- consequential human approvals;
- deployment, incident, maintenance, and recovery;
- client-facing AI Employee semantics;
- cross-provider portfolio state and ROI.

The architectural adapter boundary is accepted by ADR-013. **Paperclip itself is not yet an accepted dependency.**

No production dependency should be accepted from desk research alone.

---

## Approved D1-D8 constraints

The Paperclip evaluation must preserve the following approved decisions:

1. **D1 — canonical authority:** Workflow OS remains the sole canonical Project/WorkItem authority.
2. **D2 — provider-created work:** agent-created provider tasks remain provider-local execution detail or become WorkItem Proposals; they do not silently become canonical WorkItems.
3. **D3 — isolation:** default mapping is `Workflow OS Workspace -> Paperclip Company`, but adapter/control credentials must also have acceptable Workspace-bounded blast radius; stronger instance isolation is the fallback if needed.
4. **D4 — asymmetric synchronization:** Paperclip reports facts/proposals; provider UI edits cannot silently mutate canonical Workflow OS state.
5. **D5 — completion:** Paperclip `done` maps to `execution_finished` / evidence available, not canonical WorkItem `complete`.
6. **D6 — approvals:** consequential human approvals remain authoritative in Workflow OS; Paperclip review/approval is worker-level control/evidence.
7. **D7 — worktrees/parallelism:** isolated workspaces/worktrees are an advanced capability, not required for the initial single-worker pass.
8. **D8 — phase boundary:** Paperclip is not part of Phase 1 acceptance criteria; Phase 1 first proves Workflow OS's canonical Project/WorkItem/WIR/evidence/Command Center slice.

---

## Sources reviewed

Primary sources reviewed during the desk-research pass:

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

At the initial review time, the latest stable release identified was `v2026.831.1` (2026-09-02). Paperclip is MIT-licensed.

Exact version/release assumptions must be refreshed during the hands-on spike.

---

# 1. What Paperclip actually is

Paperclip describes itself as an operating system/control plane for an AI company. Its relevant concepts include:

- companies;
- human board operators;
- agents/reporting hierarchy;
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

Its architecture is broadly:

```text
React UI
  -> REST API
      -> persistence
      -> agent runtime adapters
          -> Claude Code / Codex / other runtime
```

This overlaps strongly with Workflow OS's internal-workforce mechanics but not with Workflow OS's broader business-delivery semantics.

---

# 2. Capability assessment

## 2.1 Company as tenant boundary

Paperclip Company is a useful candidate provider-side tenant boundary.

Candidate mapping:

```text
Workflow OS Workspace
      1 : 1
Paperclip Company
```

This mapping must be tested, not assumed.

### Critical addition: adapter credential blast radius

Company scoping alone is not sufficient if the integration/control identity can freely cross multiple unrelated client companies.

The spike must prove:

- which identity/credential Workflow OS uses to control a Paperclip Company;
- whether that identity can be constrained per Workspace/company;
- what happens after credential compromise;
- how rotation/revocation works;
- whether a dedicated provider instance per Workspace is required for stronger isolation.

The production goal is **Workspace-bounded control capability**, not merely company labels.

## 2.2 Projects

Paperclip Projects are useful runtime/project context for agents, repositories, workspaces, budgets, and tasks.

Workflow OS Project remains semantically richer and canonical across:

`intake -> research -> definition -> architecture -> planning -> build -> verification -> review -> deployment -> production -> maintenance -> closure`

Therefore Paperclip Project is a provider projection/reference, not a replacement.

## 2.3 Issues/tasks

Paperclip Issues overlap heavily with Workflow OS WorkItems for AI-executed work.

Do not mirror every WorkItem into Paperclip. Create/mirror provider work only when the Internal Workforce Adapter actually needs AI-agent execution or provider-local coordination.

### Provider-created child tasks

Provider agents may create child tasks as internal execution detail.

Those child tasks may stay provider-local if they remain within accepted assignment scope.

If they imply a material change to scope, architecture, priority, risk, budget, deployment, maintenance, or acceptance criteria, the adapter must surface a **WorkItem Proposal**.

Provider task creation never automatically expands canonical Workflow OS scope.

## 2.4 Heartbeats and session persistence

Paperclip's wake/resume/session model may save Workflow OS from rebuilding:

- worker wakeups;
- resumption;
- run status;
- usage/cost capture;
- pause/termination;
- recurring worker routines.

Persistent model/session state remains convenience context, not canonical Project knowledge.

Every material handoff must persist artifacts/evidence outside hidden model context.

## 2.5 Agent runtime adapters

Existing Codex/Claude/runtime integration is one of Paperclip's highest-value reuse opportunities.

Workflow OS should not prematurely rebuild process spawning, session restoration, runtime diagnostics, and vendor-specific agent process management if a provider passes the adapter contract.

## 2.6 Execution workspaces/worktrees

Paperclip workspaces/worktrees are promising but are treated as an **advanced parallel-engineering capability**.

Core Paperclip adoption must not depend on them.

A provider may pass the core single-worker adapter gates while parallel coding stays disabled.

Parallel coding becomes eligible only after separate advanced tests prove:

- isolation;
- branch/worktree safety;
- dependency finalization;
- integration ownership;
- collision handling;
- verification.

This aligns with ADR-012.

## 2.7 Review and approval policy

Paperclip review/execution-policy stages can provide worker-level control and evidence.

Distinction:

```text
Paperclip review/approval
= provider worker/execution control + evidence

Workflow OS approval
= canonical consequential business/risk authorization
```

Production deployment, high-impact external actions, material scope/risk acceptance, privilege expansion, and policy exceptions remain Workflow OS approvals.

## 2.8 Budgets and costs

Paperclip cost/token/budget data may be normalized into Workflow OS Project/WorkItem cost records.

Workflow OS retains canonical cross-provider budget/ROI semantics because costs can also come from workflow engines, cloud/deployment providers, APIs, human work, and other services.

## 2.9 Secrets

Workflow OS stores canonical integration/secret **references and policy**, not reusable raw values in Project/WorkItem/WIR/agent instructions.

The adapter may map those references to provider secret bindings.

Required tests include:

- company/tenant isolation;
- worker-specific grants;
- adapter/control credential scope;
- run-bound/on-demand access when available;
- read auditing;
- rotation/revocation;
- redaction;
- unauthorized access denial.

## 2.10 Dashboard, decisions, and audit

Workflow OS should not recreate every detailed provider workforce screen.

Early UX may deep-link into Paperclip for:

- agent runtime details;
- sessions;
- provider task history;
- worker settings;
- detailed provider cost/run views.

Workflow OS Command Center remains necessary because it aggregates:

- multiple client Workspaces;
- human/non-agent WorkItems;
- WIR workflow runs;
- approvals;
- deployments;
- production health;
- incidents/maintenance;
- evidence/business outcomes;
- client-facing AI Employees.

## 2.11 API/OpenAPI

Preferred integration boundary:

```text
Workflow OS
  -> Internal Workforce Adapter
      -> Paperclip REST/OpenAPI
```

Do not use direct provider-database writes.

## 2.12 Plugins

Do not make an unstable/alpha plugin surface the first integration boundary when supported API surfaces are available.

REST/OpenAPI first. Plugin use, if later justified, requires its own version compatibility policy.

## 2.13 Portability

Provider export/import can help with templates and recovery but is not sufficient as Workflow OS's canonical audit/history backup.

Workflow OS must retain enough normalized state/evidence that Paperclip can be removed without losing Project meaning or history.

---

# 3. Capability overlap matrix

| Capability | Paperclip | Workflow OS | Decision implication |
|---|---|---|---|
| Tenant/company | Company | Workspace | candidate 1:1 mapping; Workspace canonical |
| Control credential | provider identity/token | Workspace isolation policy | must prove Workspace-bounded blast radius |
| Project | Project | Project | provider projection/reference |
| Task graph | Issues/dependencies | WorkItem graph | mirror only AI-executed work |
| Provider-created child work | issue hierarchy | WorkItem/Proposal | keep local or emit proposal; never auto-promote |
| AI workforce | agents/org/heartbeats | internal AI workforce | strong adapter candidate |
| Runtime adapters | built in | provider-neutral contract | prefer reuse first |
| Worktree isolation | available/fast-moving capability | advanced parallel requirement | separate advanced gate |
| Costs/budgets | worker/project/company | cross-provider Project/WorkItem/ROI | normalize |
| Review gates | execution policy | verification/evidence | complementary |
| Consequential approval | provider approvals | Workflow OS policy | Workflow OS authoritative |
| Human attention | provider Decisions | Command Center | aggregate cross-domain in Workflow OS |
| Audit | activity/run feeds | Project/Event/Evidence ledger | ingest/normalize |
| Skills | provider/company skills | engineering/business skills | semantics must remain explicit |
| WIR/business automation | not core | WIR | Workflow OS owns |
| Deterministic workflow execution | not core | engine adapter | Activepieces/other engine |
| Business risk/side-effect policy | not equivalent | explicit model | Workflow OS owns |
| Deployment/incidents/maintenance | generic work possible | first-class Project state | Workflow OS owns |
| Client AI Employee role model | generic agents | governed deliverable model | Workflow OS owns contract |
| ROI/time saved | not primary | first-class | Workflow OS owns |

---

# 4. Adversarial findings

## Finding A — two peer control planes are unacceptable

Required invariant:

> Workflow OS canonical state wins. Provider objects are mapped execution records/projections unless a future ADR explicitly changes ownership.

## Finding B — provider `done` is not canonical `complete`

Required translation:

```text
Paperclip done/success
  -> execution_finished
  -> evidence collection
  -> Workflow OS verification/reconciliation/policy
  -> WorkItem complete OR changes required / failed / escalated
```

## Finding C — tenant labels do not prove credential isolation

The spike must test both provider tenant isolation and adapter/control-identity scope.

A single broadly privileged credential crossing unrelated client Workspaces is a production concern even if provider objects are company-scoped.

## Finding D — provider-created work can silently expand scope

Provider child tasks are execution detail unless a material semantic change becomes a WorkItem Proposal and is explicitly promoted by Workflow OS.

## Finding E — manual provider UI edits create drift

Workflow OS and Paperclip are not peers.

Provider-side changes to canonical-like fields become:

- runtime facts;
- drift;
- conflict; or
- proposals.

They do not silently overwrite canonical Workflow OS state.

## Finding F — fast provider velocity creates compatibility risk

Require:

- pinned supported versions;
- exact-version contract tests;
- upgrade gates;
- supported API surfaces only;
- provider/adapter version attribution on evidence;
- fail-closed behavior for unknown semantics.

## Finding G — session memory can hide material state

No Project should require reopening an old model session to understand why work is in its current state.

## Finding H — agent routines are not WIR business workflows

```text
recurring internal agent work -> workforce provider may be appropriate
business process automation -> WIR + workflow engine
```

## Finding I — duplicate dashboards waste effort

Workflow OS builds the cross-domain command center. Provider specialist runtime UI may remain provider-native initially.

## Finding J — worktrees must not block basic provider value

Single bounded agent execution can be useful without parallel worktrees. Worktree/parallel capability is separately gated.

---

# 5. Candidate mapping contract

| Workflow OS canonical concept | Paperclip concept | Direction |
|---|---|---|
| Workspace | Company | candidate 1:1 mapping |
| Workspace control identity | board/integration identity | must be scoped/tested separately |
| Project | Project | reference/projection |
| AI-assigned WorkItem | Issue | conditional mirror |
| provider-local child task | child Issue | provider local unless promoted via proposal |
| WorkItem dependency | blocked-by / parent issue | mirror only when relevant |
| internal role | Agent configuration/template | provider implementation |
| AgentAssignment | Issue assignment + run/heartbeat context | provider implementation |
| Agent run | heartbeat/run | normalized evidence |
| Project repo/env | provider workspace | runtime mapping |
| isolated coding work | execution workspace/worktree | advanced capability |
| cost record | provider cost event | ingest/normalize |
| agent review | provider execution-policy decision | evidence |
| consequential human approval | provider approval may mirror | Workflow OS authoritative |
| activity | activity/audit event | ingest/normalize |
| artifact/evidence | work products/run refs | reference/ingest |
| material newly discovered work | child issue/proposal | WorkItem Proposal -> Workflow OS decision |

---

# 6. Internal Workforce Adapter requirements

The provider must fit `docs/architecture/internal-workforce-adapter-contract.md`.

At minimum it must support or safely report capability gaps for:

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
listProposals(assignmentRef)
reconcile(assignmentRef)
pauseWorker(workerRef)
resumeWorker(workerRef)
```

The adapter contract remains provider-neutral.

---

# 7. Hands-on spike gates

Paperclip can receive two distinct results:

1. **CORE PASS** — acceptable for bounded/sequential internal workforce execution.
2. **ADVANCED PARALLEL-ENGINEERING PASS** — additional approval for isolated concurrent coding work.

Do not conflate these.

## Core Gate P0 — reproducible install

- refresh and pin an exact stable Paperclip version;
- document Node/database/runtime requirements;
- run locally/self-hosted without requiring a Paperclip cloud account when the intended deployment assumes self-hosting;
- confirm backup/export/recovery path.

## Core Gate P1 — supported API contract

- obtain an appropriate integration/control credential;
- fetch `/api/openapi.json` or the current documented machine-readable API contract;
- create/read/update synthetic Company, Project, and Issue objects through supported APIs;
- verify authentication/error semantics;
- prove no direct database writes are required.

## Core Gate P2 — tenant **and credential** isolation

Create two synthetic Workflow OS Workspaces mapped to two Paperclip Companies.

Prove:

- agents/issues/artifacts/secrets/costs cannot cross the intended company boundary;
- normalized mappings cannot be confused across Workspaces;
- the adapter/control credential's real permissions and blast radius are documented;
- a credential intended for Workspace A cannot silently act as Workspace B unless explicitly designed/approved;
- if acceptable Workspace-bounded credential scoping is unavailable, document/test the stronger per-Workspace-instance fallback.

Failure of this gate blocks real multi-client production use.

## Core Gate P3 — bounded Codex worker execution

- configure one bounded Codex internal worker;
- create one synthetic AgentAssignment from a Workflow OS WorkItem;
- run it;
- collect run/log/cost/artifact/evidence data;
- cancel/retry safely;
- prove authority cannot silently broaden beyond the Assignment contract.

## Core Gate P4 — lifecycle, completion, proposals, and drift

- map provider ready/running/blocked/review/done states into normalized assignment states;
- prove provider `done` maps to `execution_finished`, never direct WorkItem `complete`;
- force Workflow OS verification failure after provider success and prove canonical state stays incomplete;
- let the provider create an in-scope child task and prove it can remain provider-local;
- let the provider propose a material out-of-scope/new architecture task and prove it becomes a WorkItem Proposal rather than automatic canonical work;
- manually alter provider priority/status/scope-like metadata and prove Workflow OS emits drift/conflict/proposal rather than silently accepting the change.

## Core Gate P5 — audit/cost/event reconciliation

- incrementally consume activity/run events;
- ensure idempotent ingestion;
- simulate duplicate polling/event delivery;
- simulate out-of-order events;
- prove no duplicated Workflow OS events/cost records;
- prove provider-runtime progress can be reconciled without giving the provider canonical authority.

## Core Gate P6 — secrets and grants

- bind a synthetic canonical secret/integration reference to a provider binding;
- prove an unauthorized worker cannot read it;
- use least-privilege/run-bound/on-demand access where supported;
- verify secret reads are auditable when supported;
- verify logs/evidence do not leak the value;
- test rotation/revocation behavior;
- include the adapter/control credential itself in the threat model.

## Core Gate P7 — outage and restart

- stop Paperclip during active/queued work;
- keep Workflow OS Project/WorkItem state explainable while unavailable;
- restart Paperclip;
- reconcile without false completion or duplicate assignment mutation;
- prove uncertain outcomes fail closed until reconciled.

## Core Gate P8 — version compatibility

- run adapter contract tests against the pinned version;
- upgrade to a later version in a disposable environment;
- detect incompatible API/semantic changes rather than silently accepting them;
- record provider + adapter versions on test evidence.

### Core PASS condition

Paperclip receives **CORE PASS** only if:

> Workflow OS can remove/replace the adapter without losing canonical Project/WorkItem meaning, authorization, evidence, history, recoverability, or client isolation.

CORE PASS authorizes further provider-integration design; it does not automatically authorize every real-client or high-impact use.

---

# 8. Advanced parallel-engineering gates

Run these only after CORE PASS and only if parallel coding materially improves delivery.

## Advanced Gate A1 — isolated workspace/worktree behavior

- execute independent assignments in isolated workspaces/worktrees;
- prove file/state isolation;
- prove cleanup/recovery after worker failure;
- verify branch/worktree references can be reconciled into Workflow OS evidence.

## Advanced Gate A2 — dependency and integration correctness

- create two parallel independent coding WorkItems plus one dependent integration WorkItem;
- prove the dependent task cannot start until required predecessors are finalized according to Workflow OS state;
- prove provider-local completion cannot bypass dependency readiness;
- identify explicit integration ownership;
- exercise merge/conflict handling.

## Advanced Gate A3 — parallel verification and collision safety

- run concurrent workers that intentionally attempt a shared-resource conflict;
- prove the provider/adapter blocks, isolates, or surfaces the conflict deterministically;
- run independent verification after integration;
- confirm failed verification reopens/creates repair work rather than leaving canonical work complete.

### Advanced PASS condition

Paperclip receives **ADVANCED PARALLEL-ENGINEERING PASS** only if isolated concurrency does not weaken ADR-012's dependency, authority, integration, and verification guarantees.

If advanced gates fail, Paperclip may still remain a CORE PASS provider for sequential/bounded work.

---

# 9. Preliminary provider decision

**Paperclip: ADAPTER CANDIDATE.**

Do not build a bespoke internal agent-company runtime until Paperclip or another provider has been tested against the core gates and fails in a way that justifies owning those mechanics.

Use Paperclip, if it passes, for concerns it is better positioned to provide:

- worker/runtime management;
- heartbeats/scheduling;
- session persistence;
- Codex/Claude adapters;
- provider-native task checkout;
- agent cost/runtime detail;
- worker-level review stages;
- detailed workforce/runtime inspection;
- advanced worktree/parallel mechanics only after advanced pass.

Workflow OS continues to own:

- Workspace/client semantics;
- Project lifecycle;
- canonical WorkItem graph and proposals;
- WIR;
- risk/authorization/approval;
- canonical evidence/acceptance;
- deployment/incident/maintenance;
- client AI Employee contracts;
- portfolio Command Center;
- ROI/business outcomes.

---

# 10. Why not fork Paperclip first

A fork may be legally possible under its license, but it is not the preferred first architecture because it would:

- increase upstream maintenance burden;
- couple Workflow OS to provider internals;
- encourage provider schema to become canonical;
- complicate upgrades/security fixes;
- duplicate functionality outside Workflow OS differentiation.

Revisit a fork only if a high-value required extension cannot be safely expressed through supported APIs/adapters and the long-term maintenance cost is justified.

---

# 11. Relationship to Phase 1

Paperclip integration is **not** a Phase 1 acceptance requirement.

Phase 1 first proves:

```text
Workspace
 -> Project
 -> WorkItem(s)
 -> Workflow Brief
 -> WIR
 -> workflow adapter execution
 -> evidence
 -> Command Center
 -> deployment/maintenance attribution
```

Only after canonical Workflow OS semantics exist should an Internal Workforce Adapter be attached.

---

# 12. Decision carried forward

```text
Workflow OS
  = canonical domain/product/business-delivery control plane

Paperclip
  = candidate internal AI workforce execution/control subsystem

Activepieces
  = candidate deterministic/business workflow execution engine

Codex / Claude / Cursor
  = underlying engineering agent runtimes
```

This preserves Workflow OS's differentiation while avoiding unnecessary reinvention.