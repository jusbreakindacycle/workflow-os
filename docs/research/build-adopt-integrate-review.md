# Build vs Adopt vs Adapter vs Integrate Review

**Status:** Research / recommendation

**Reviewed:** 2026-09-11

**Scope:** Post-Foundation-v2 adversarial review of major external systems that overlap with Workflow OS's intended solo AI business delivery operating model.

This review exists because Foundation v2 expanded Workflow OS from an automation control plane into the internal operating system for a one-person AI-native software/automation business. That expansion creates a new risk: rebuilding mature external systems merely because their concepts resemble our architecture.

The objective is to decide which capabilities Workflow OS must own and which should come from replaceable external systems.

---

## Decision vocabulary

### BUILD

Workflow OS must own the semantics/state because it is central to the product's differentiation, policy, portability, or auditability.

### ADOPT

Use an external system directly as the primary implementation, with little/no Workflow OS abstraction.

### ADAPTER

Integrate an external system behind a Workflow OS contract. Workflow OS owns canonical semantics while the external system performs specialized work.

### INTEGRATE

Use an external service/tool for a secondary concern without making it part of core architecture.

### DEFER

Useful later, but not needed to prove the next product/value milestone.

### REJECT

Do not add; complexity exceeds expected value or conflicts with core invariants.

---

# 1. Canonical ownership test

Before selecting a tool, ask:

1. If the tool disappeared tomorrow, must Workflow OS still understand the Project?
2. Does this data decide business authorization, risk, or historical truth?
3. Does this concept span multiple engines/providers/tools?
4. Is this part of Workflow OS's intended differentiation?
5. Would making a vendor schema canonical lock us into one execution product?

If mostly **yes**, BUILD the canonical model and use adapters beneath it.

If mostly **no**, prefer adoption/integration.

---

# 2. Capability-by-capability decision matrix

| Capability | Decision | Preferred implementation | Why |
|---|---|---|---|
| Workspace/client isolation intent | **BUILD** | Workflow OS | Cross-engine security boundary and client semantics |
| Project lifecycle | **BUILD** | Workflow OS Project | Differentiator: problem -> research -> build -> production -> maintenance |
| WorkItem graph | **BUILD minimal canonical** | Workflow OS | Must coordinate humans, workflows, agents, tools, incidents |
| Project event/evidence ledger | **BUILD** | Workflow OS | Cross-provider forensic truth |
| Command Center portfolio | **BUILD** | Workflow OS read model | Must aggregate every Project/workspace/engine |
| Business workflow IR | **BUILD** | WIR | Core portability/governance layer |
| Workflow execution | **ADAPTER** | Activepieces first | Execution engine is replaceable |
| Internal AI workforce runtime | **ADAPTER candidate** | Paperclip first candidate | Avoid rebuilding agent-company mechanics |
| Direct single coding agent | **ADAPTER/fallback** | Codex/Claude/Cursor | Useful when Paperclip is unnecessary |
| Agent heartbeats/scheduling | **ADAPTER** | Paperclip if fit | Mature runtime concern, not Workflow OS differentiation |
| Agent org chart | **ADAPTER/DEFER** | Paperclip | Do not build company simulation before measured need |
| Agent session persistence | **ADAPTER** | runtime/Paperclip | Context convenience, never canonical state |
| Agent worktree provisioning | **ADAPTER** | Paperclip or runtime tooling | Specialized concurrency implementation |
| Agent token/cost accounting | **ADAPTER + normalize** | Paperclip/provider | Workflow OS aggregates cross-system cost |
| Internal-agent review stages | **ADAPTER + verify** | Paperclip execution policy | Supplemental execution evidence |
| High-impact business approval | **BUILD** | Workflow OS policy | Cannot delegate canonical authorization to worker runtime |
| Risk classification | **BUILD** | Workflow OS | Cross-engine business semantics |
| Verification ladder/evidence | **BUILD** | Workflow OS contracts | Cross-provider acceptance standard |
| Engineering verification harness | **ADOPT patterns / INTEGRATE tools** | Becky/Agentic Factory ideas + repo tools | No need for separate product control plane |
| Git/PR/CI | **ADAPTER** | GitHub | Existing system of record for source/reviews/CI |
| Deployment providers | **ADAPTER** | provider-specific | Vercel/Cloudflare/etc. remain external |
| Production monitoring | **ADAPTER + BUILD normalized state** | provider/APM + Workflow OS | Provider telemetry external; incident meaning canonical |
| Incident/maintenance model | **BUILD** | Workflow OS | Project ownership persists after deploy |
| Client-facing AI Employees | **BUILD contracts + ADAPTER runtime** | Workflow OS role spec | Distinct product/deliverable semantics |
| Client portal | **DEFER / INTEGRATE** | Handoff-like pattern or custom thin portal | Valuable, not needed for core runtime proof |
| Freelancer CRM/leads/invoices | **DEFER** | existing tools | Avoid becoming ERP before delivery engine works |
| Mobile/remote agent control | **DEFER / INTEGRATE** | AgentDeck-like tool | Secondary operator UX |
| Full PM suite/Gantt | **REJECT for MVP** | none | Not core to solo AI delivery outcome |
| Kubernetes/multi-region | **REJECT until trigger** | none | Existing evidence-driven scale rule |

---

# 3. External system assessments

## 3.1 Paperclip — **ADAPTER candidate (highest priority)**

Paperclip is the closest overlap with Foundation v2's internal AI workforce layer.

It already implements:

- company/tenant control plane;
- AI agents and reporting lines;
- goal hierarchy;
- projects and task issues;
- dependencies/checkout;
- agent heartbeats;
- Claude/Codex and other adapters;
- costs/budgets;
- review/approval stages;
- secrets;
- execution workspaces/worktrees;
- dashboards/decision queues;
- audit/run history;
- export/import.

### Use Paperclip for

- bounded internal agent execution;
- wake/resume lifecycle;
- agent process/session management;
- worktree isolation;
- per-agent run logs/costs;
- detailed worker/runtime UI;
- optional internal review routing.

### Do not give Paperclip ownership of

- Workflow OS Workspace meaning;
- Project lifecycle;
- universal WorkItem graph;
- WIR;
- business risk/authorization;
- final cross-system completion;
- deployment/incident/maintenance truth;
- client AI Employee semantics.

See `paperclip-due-diligence.md` for the detailed spike gates and mapping.

**Recommendation:** do not implement a bespoke internal multi-agent company runtime until Paperclip fails a hands-on compatibility gate.

---

## 3.2 Activepieces — **ADAPTER (retain current direction)**

Activepieces solves deterministic/business automation and connector execution, a different layer from Paperclip.

Use it for:

- triggers/actions/integrations;
- deterministic business workflows;
- MCP-exposed automation tools where appropriate;
- external SaaS connectivity.

Do not turn Activepieces flow definitions into Workflow OS canonical truth. WIR remains authoritative.

Paperclip and Activepieces are complementary:

```text
WorkItem needs AI engineering/research
  -> Internal Workforce Adapter -> Paperclip

WorkItem needs business automation execution
  -> Engine Adapter -> Activepieces
```

---

## 3.3 Agentic Factory — **ADOPT AS ENGINEERING HARNESS / fallback candidate**

Repository: https://github.com/jddelia/agentic-factory

Strengths:

- SQLite append-first event store;
- durable baton/handoff state;
- review and verification records;
- pause/resume checkpoints;
- doctor checks;
- local dashboard;
- Codex-native orchestration;
- Claude background-session bridge.

Most important lesson:

> database/event state is authoritative; Markdown is a rendered view.

This aligns strongly with Workflow OS.

Why not use it as the main Workflow OS workforce backend now:

- project-local software-factory orientation;
- Codex-centric operational model;
- narrower company/tenant/budget/security product surface than Paperclip;
- would still need broader business delivery abstractions.

**Recommendation:** use/borrow it as an engineering harness when useful and keep it as a fallback/reference if Paperclip proves too broad or unstable.

---

## 3.4 10Legs Freelance Developer Harness — **ADOPT PATTERNS, not runtime dependency**

Repository: https://github.com/10Legs/freelance-developer-harness

High-value patterns:

- multi-client workspace structure;
- explicit session client lock;
- pre-tool write guards that prevent cross-client edits;
- PM routes work; PM does not implement;
- per-project sprint history;
- verified session handoff snapshots;
- human-only merge decision.

Why not make it Workflow OS runtime:

- primarily Markdown/hooks/Claude Code conventions;
- no durable cross-system Project control plane;
- not designed as a provider-neutral business delivery backend.

**Recommendation:** copy the mechanism, not the product. In particular, enforce client/repository boundaries mechanically at the tool layer.

---

## 3.5 BeckyOS — **ADOPT VERIFICATION PATTERNS / optional dev harness**

Site: https://beckyos.com/

High-value concepts:

- independent verifier;
- no self-grading;
- runtime evidence required for DONE;
- cross-runtime builder/verifier possibility;
- compiled rules for Claude/Codex-compatible environments.

Workflow OS already incorporated these ideas into its verification ladder. Do not build a second council system merely because Becky has one.

**Recommendation:** use as reference/harness where it accelerates Workflow OS development; no core runtime dependency.

---

## 3.6 Handoff — **DEFER / client-portal design reference**

Site: https://handoff.click/

Useful capabilities:

- client portals;
- milestones/deliverables;
- client comments/approvals;
- cross-project Kanban;
- daily AI briefings;
- SOW/proposal generation;
- risk/stall detection.

These address the **client delivery communication** layer, not autonomous technical delivery.

**Recommendation:** do not add to Phase 1. Revisit when real clients create repeated portal/status/approval communication burden.

---

## 3.7 AgentDeck — **DEFER / remote operator integration**

AppBuildersPH listing: https://www.appbuildersph.com/apps/agentdeck

Useful for:

- mobile monitoring of coding-agent sessions;
- remote prompts;
- terminal access;
- Git diff inspection;
- destructive-action approvals;
- multiple workstation control.

Workflow OS should not become a remote-desktop/terminal product.

**Recommendation:** future deep-link/integration candidate, not core.

---

# 4. What Foundation v2 got right

The post-merge research does **not** justify reverting Foundation v2.

The following decisions are strengthened by external evidence:

1. **Project above workflow.** Paperclip also needs a Project abstraction above tasks and workspaces; Workflow OS needs an even richer one.
2. **Canonical state outside agent memory.** Agentic Factory and Paperclip both use durable state rather than chat as sole truth.
3. **Command Center.** Paperclip Decisions/Dashboard and Handoff's cross-project dashboard validate the operator-attention model.
4. **Internal vs client-facing agents.** Paperclip-like internal workers are operational infrastructure; client AI Employees are deliverables/business roles.
5. **Adapter architecture.** Both Paperclip and Activepieces are specialized execution systems best placed beneath Workflow OS contracts.
6. **Verification-first completion.** Becky/Paperclip execution policy/Agentic Factory all reinforce independent evidence.
7. **Dependency-safe parallelism.** Paperclip workspaces and 10Legs isolation support our gate against uncontrolled swarms.

The problem is therefore not the Foundation v2 direction.

The problem would be **implementing every box in Foundation v2 ourselves.**

---

# 5. Gaps exposed by the review

## Gap 1 — no explicit Internal Workforce Adapter contract

Foundation v2 defines internal roles but not a provider-neutral workforce-manager boundary comparable to the existing workflow engine adapter.

This should be added before implementing internal agent scheduling.

## Gap 2 — WorkItem execution vs acceptance state needs clarification

External systems may report execution `done` before Workflow OS has enough evidence to accept canonical completion.

We need explicit semantics equivalent to:

```text
execution finished
    !=
accepted complete
```

This may be represented through separate assignment/run state, verification state, and WorkItem acceptance state rather than multiplying ambiguous WorkItem statuses.

## Gap 3 — mirrored-state reconciliation contract

Any Paperclip adapter needs:

- stable external IDs;
- idempotent create/update;
- incremental event cursor;
- conflict handling;
- duplicate-event suppression;
- last-reconciled checkpoints;
- orphan detection;
- recovery after outage.

## Gap 4 — external control-plane outage behavior

Workflow OS must remain understandable when Paperclip, Activepieces, GitHub, or another adapter is unavailable.

Canonical Project state cannot disappear merely because an execution system is down.

## Gap 5 — cost normalization

Paperclip handles LLM/agent spend; Activepieces/cloud providers produce other costs. Workflow OS needs one normalized Project/WorkItem cost ledger without pretending every source has identical fidelity.

## Gap 6 — tool-level client isolation

Workspace authorization at the database/API layer is necessary but internal coding tools also need path/repository/environment guards similar to 10Legs.

## Gap 7 — operator UI should avoid duplicating specialist UIs

Command Center should initially answer:

- status;
- next task;
- blocker;
- attention required;
- evidence;
- deployment/incident state.

Deep specialist inspection can link to Paperclip/GitHub/Activepieces rather than recreating every detailed screen.

---

# 6. Revised target architecture

```text
                         HUMAN OPERATOR
                               |
                               v
                         WORKFLOW OS
                 canonical delivery control plane
                               |
      +------------------------+-------------------------+
      |                        |                         |
      v                        v                         v
 Project/WorkItem        Policy/Evidence            Command Center
 Decision/Event          Risk/Approval              Portfolio/Attention
 WIR/Deployment          Incident/Maintenance       ROI/Cost
      |
      +------------------------+-------------------------+
                               |
          replaceable adapter / integration plane
                               |
         +---------------------+--------------------+
         |                     |                    |
         v                     v                    v
  Internal Workforce      Workflow Engine       Source/Delivery
      Adapter                 Adapter             Integrations
         |                     |                    |
         v                     v                    v
     Paperclip            Activepieces            GitHub
     (candidate)          (current candidate)      deploy providers
         |
         v
 Codex / Claude / Cursor / other agent runtimes
```

The critical boundary is:

> External systems execute and report. Workflow OS interprets, governs, and preserves canonical delivery state.

---

# 7. Phase impact

## Phase 1

Do **not** add Paperclip runtime to the Phase 1 acceptance criteria.

Phase 1 should still prove:

- Workspace;
- Project;
- Project Brief;
- minimal WorkItems/events;
- Workflow Brief/WIR;
- one execution engine;
- evidence;
- Command Center;
- deployment/maintenance attribution.

This proves Workflow OS meaning independently of any future agent-company product.

### Explicit Phase 1 non-goals reinforced by this review

Do not build:

- agent org chart;
- heartbeat scheduler;
- persistent coding-agent sessions;
- worktree manager;
- per-agent budget subsystem;
- agent transcript UI;
- autonomous CEO hierarchy.

Those are exactly the capabilities a future Paperclip adapter may supply.

## Post-Phase-1 / internal-workforce gate

Before building an internal agent runtime, execute the Paperclip hands-on gates in `paperclip-due-diligence.md`.

Only after the spike:

- PASS -> implement Paperclip Internal Workforce Adapter;
- CONDITIONAL -> use only proven subset + direct-runtime fallback;
- FAIL -> compare Agentic Factory/direct Codex adapter and build the minimum missing layer.

---

# 8. What we should build ourselves first

The minimum proprietary/core value of Workflow OS is now clearer:

```text
1. Project/Workspace meaning
2. WorkItem + dependency/acceptance semantics
3. Decision/Artifact/Evidence/Event model
4. Project lifecycle and phase gates
5. WIR + workflow engine portability
6. risk/authorization/reliability policy
7. cross-provider reconciliation
8. Command Center aggregation
9. deployment/incident/maintenance ownership
10. reusable project/workflow/role patterns + ROI
```

Everything else should earn a BUILD decision.

---

# 9. Risks if we ignore this review

## Risk A — accidental Paperclip clone

Months spent rebuilding mature agent-company mechanics before Workflow OS handles one real client Project.

## Risk B — two sources of truth

Workflow OS and an external agent system both claim task/project authority.

## Risk C — product becomes infrastructure collection

Workflow OS accumulates org charts, remote terminals, CRM, invoicing, CI viewers, workflow builders, dashboards, and runtimes without a clear differentiator.

## Risk D — scope prevents income/usefulness

The operator waits for a perfect AI company OS instead of using a small reliable system to deliver real work.

## Risk E — agent theater

Large role roster without evidence that specialized agents improve output over one capable worker + independent verifier.

---

# 10. Recommended decision set

### BUILD now / Phase 1

- canonical Project/WorkItem/Event/Evidence semantics;
- Project Command Center minimum view;
- WIR workflow control plane;
- Activepieces adapter spike and thin workflow slice;
- canonical risk/reliability/approval;
- deployment/incident/maintenance attribution;
- agent-operability harness for Workflow OS's own development.

### ADAPTER later after proof

- **Paperclip** for internal AI workforce;
- direct Codex/Claude/Cursor fallback adapters;
- GitHub;
- deployment/monitoring providers.

### ADOPT as development practice/tooling

- Agentic Factory patterns/tool when helpful;
- Becky-style independent verification;
- 10Legs-style client write guards.

### DEFER

- client portal;
- CRM/invoicing/tax/business admin;
- mobile remote control;
- full autonomous executive hierarchy;
- large agent marketplace.

### REJECT unless future evidence reverses it

- duplicate Paperclip-like workforce control plane built from scratch;
- duplicate Activepieces-like connector/workflow engine;
- chat as canonical Project state;
- provider-specific schema as Workflow OS source of truth;
- agent self-approval for high-impact actions.

---

# 11. Recommended next non-coding artifacts

Before implementation expands beyond the already-planned Activepieces spike:

1. define a **proposed Internal Workforce Adapter Contract**;
2. clarify **execution-finished vs accepted-complete semantics**;
3. define **external state mapping/reconciliation rules**;
4. add a **Build/Adopt/Adapter decision gate** to future architecture reviews;
5. keep Paperclip adoption behind the hands-on spike in `paperclip-due-diligence.md`.

Do not yet modify Phase 1 into an agent-company implementation project.

---

# 12. Overall verdict

Foundation v2 should remain.

The architecture becomes stronger if we interpret it this way:

> **Workflow OS is not the place where every technical capability must be implemented. It is the canonical operating layer that knows what the business/project is trying to accomplish, what is allowed, what evidence is required, what state the work is truly in, and which specialized engine should execute the next piece.**

Paperclip is therefore not a reason to abandon Workflow OS.

It is evidence that **internal workforce orchestration should be treated as an adapter boundary rather than automatically becoming another large subsystem we build ourselves.**
