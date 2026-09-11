# Paperclip Capability Decision Matrix

**Status:** Research summary

This compact matrix is the decision aid for the deeper `paperclip-due-diligence.md` review.

| Capability | Paperclip strength | Workflow OS decision |
|---|---|---|
| Agent/company registry | Strong | ADAPTER — do not rebuild before spike |
| Agent hierarchy/reporting lines | Strong | DEFER to Paperclip; not core Workflow OS semantics |
| Heartbeats/wakeups | Strong | ADAPTER |
| Persistent coding-agent sessions | Strong | ADAPTER; non-authoritative context only |
| Codex/Claude runtime integration | Strong | ADAPTER / direct-runtime fallback |
| Task checkout/dependencies | Strong | ADAPTER for mirrored AI assignments; canonical WorkItem stays in Workflow OS |
| Worktree/workspace isolation | Strong | ADAPTER if compatibility tests pass |
| Per-agent token/cost accounting | Strong | ADAPTER + normalize into Workflow OS cost records |
| Worker-level review/approval stages | Strong | ADAPTER as execution evidence; not canonical business approval |
| Agent secrets/grants | Strong | ADAPTER for runtime delivery; Workflow OS retains canonical refs/policy |
| Agent dashboard/run inspection | Strong | ADOPT/deep-link initially; avoid duplicate specialist UI |
| Human decision queue | Strong | Integrate evidence/events; Workflow OS Command Center remains cross-domain portfolio view |
| Company/tenant boundary | Strong | Candidate mapping: one Workflow OS Workspace -> one Paperclip Company |
| Project model | Useful but simpler | Mirror/reference only; Workflow OS Project remains canonical |
| Business/project lifecycle | Limited for Workflow OS needs | BUILD in Workflow OS |
| Universal WorkItem semantics | Agent-task oriented | BUILD minimal canonical WorkItem in Workflow OS |
| Workflow IR / business automation semantics | Not core | BUILD WIR in Workflow OS |
| Deterministic workflow execution | Not core | Activepieces/other Engine Adapter |
| Business risk/side-effect policy | Not equivalent | BUILD in Workflow OS |
| Cross-provider evidence ledger | Not equivalent | BUILD in Workflow OS |
| Deployment/incident/maintenance lifecycle | Not first-class equivalent | BUILD in Workflow OS |
| Client-facing AI Employee role model | Not equivalent | BUILD Workflow OS contracts + runtime adapter |
| Portfolio across clients/engines | Partial/company scoped | BUILD Command Center in Workflow OS |

## Decision

Paperclip should be tested as a **replaceable Internal Workforce Adapter**, not adopted as the canonical Workflow OS product/data model and not cloned wholesale.
