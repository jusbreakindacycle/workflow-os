# Paperclip Capability Decision Matrix

**Status:** Research summary aligned with Accepted ADR-013

This compact matrix is the decision aid for the deeper `paperclip-due-diligence.md` review.

| Capability | Paperclip strength | Workflow OS decision |
|---|---|---|
| Agent/company registry | Strong | ADAPTER — do not rebuild before spike |
| Agent hierarchy/reporting lines | Strong | DEFER to provider; not core Workflow OS semantics |
| Heartbeats/wakeups | Strong | ADAPTER |
| Persistent coding-agent sessions | Strong | ADAPTER; non-authoritative context only |
| Codex/Claude runtime integration | Strong | ADAPTER / direct-runtime fallback |
| Task checkout/dependencies | Strong | ADAPTER for mirrored AI assignments; canonical WorkItem stays in Workflow OS |
| Provider-created child tasks | Strong/provider-native | Keep provider-local when in scope; material new work becomes WorkItem Proposal |
| Worktree/workspace isolation | Useful but advanced | ADAPTER only after advanced parallel-engineering gates pass |
| Per-agent token/cost accounting | Strong | ADAPTER + normalize into Workflow OS cost records |
| Worker-level review/approval stages | Strong | ADAPTER as execution evidence; not canonical consequential approval |
| Agent secrets/grants | Strong | ADAPTER for runtime delivery; Workflow OS retains canonical refs/policy |
| Agent dashboard/run inspection | Strong | ADOPT/deep-link initially; avoid duplicate specialist UI |
| Human decision queue | Strong | Provider worker decisions may exist; consequential cross-domain approvals live in Workflow OS |
| Company/tenant boundary | Strong candidate | Default mapping: one Workflow OS Workspace -> one Paperclip Company |
| Adapter/control credential isolation | Must be proven | Require acceptable Workspace-bounded blast radius or stronger per-Workspace instance boundary |
| Project model | Useful but simpler | Mirror/reference only; Workflow OS Project remains canonical |
| Provider-side priority/status edits | Possible | Drift/proposal/conflict only; never silent canonical mutation |
| Provider `done` | Provider terminal execution state | Map to `execution_finished`; Workflow OS verifies before `complete` |
| Business/project lifecycle | Limited for Workflow OS needs | BUILD in Workflow OS |
| Universal WorkItem semantics | Agent-task oriented | BUILD minimal canonical WorkItem in Workflow OS |
| Workflow IR / business automation semantics | Not core | BUILD WIR in Workflow OS |
| Deterministic workflow execution | Not core | Activepieces/other Engine Adapter |
| Business risk/side-effect policy | Not equivalent | BUILD in Workflow OS |
| Cross-provider evidence ledger | Not equivalent | BUILD in Workflow OS |
| Consequential human approval | Provider support is narrower | BUILD/authorize in Workflow OS |
| Deployment/incident/maintenance lifecycle | Not first-class equivalent | BUILD in Workflow OS |
| Client-facing AI Employee role model | Not equivalent | BUILD Workflow OS contracts + runtime adapter |
| Portfolio across clients/engines | Partial/company scoped | BUILD Command Center in Workflow OS |

## Approved authority decisions

ADR-013 locks in:

- D1 — Workflow OS is sole canonical Project/WorkItem authority.
- D2 — provider-created material work becomes a proposal, not automatic canonical work.
- D3 — Workspace -> Paperclip Company is the default mapping, with credential blast radius tested separately.
- D4 — synchronization is asymmetric; provider UI changes cannot silently mutate canonical state.
- D5 — provider `done` means execution finished/evidence available, not canonical completion.
- D6 — consequential human approvals are authoritative in Workflow OS.
- D7 — worktree/parallel coding is an advanced capability with separate gates.
- D8 — Paperclip remains outside Phase 1 acceptance criteria.

## Decision

Paperclip should be tested as a **replaceable Internal Workforce Adapter**, not adopted as the canonical Workflow OS product/data model and not cloned wholesale.

Paperclip receives two independent capability outcomes:

- **CORE PASS** for bounded/sequential internal workforce execution;
- **ADVANCED PARALLEL-ENGINEERING PASS** for isolated concurrent coding.

A failed advanced pass does not automatically invalidate a valid core provider.