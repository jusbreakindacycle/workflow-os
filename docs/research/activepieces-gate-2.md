# Activepieces Gate 2 Due Diligence

## Decision

**Verdict: CONDITIONAL PASS**

Activepieces remains the Phase 1 MVP execution target, subject to explicit transport, licensing, workspace-isolation, and runtime-verification gates.

This is a desk-research decision based on current official documentation and source-code inspection. It does not replace the first hands-on adapter spike.

## Why Activepieces remains the preferred first target

Activepieces is a strong semantic fit for Workflow OS because it provides:

- a permissively licensed open-source automation core;
- self-hosting;
- flow creation/editing/versioning;
- webhook and schedule triggers;
- action/branch/delay building blocks;
- durable execution and replay;
- run history with exact flow-version references;
- MCP-based flow management and testing;
- project-scoped integrations/connections;
- PostgreSQL/Redis/worker scaling for production deployments.

The architecture lets Workflow OS remain a control plane while Activepieces owns physical execution.

## The conditions

### C1 — Supported control transport must be proven

Workflow OS must not depend on undocumented Activepieces endpoints, direct database writes, or internal implementation details as its production control API.

Preferred order:

1. **Official REST API** when the selected Activepieces deployment/plan exposes supported API access.
2. **Built-in MCP server** as a supported alternative/research transport for flow management, testing, and run inspection where REST API access is unavailable.
3. Stop and propose a superseding ADR if neither transport can preserve the required WIR semantics.

The adapter may support multiple control transports internally, but WIR and the engine-adapter contract remain unchanged.

### C2 — Documentation conflict around API access must be resolved hands-on

Current pricing says API access is included in the Free, Plus, Team, and Ultimate plan table.

The same pricing page says the self-hosted Community Edition excludes API access.

The current API overview separately says API keys are generated from the Platform Dashboard and are available only in Platform/Enterprise editions.

These statements are not fully aligned. Therefore the first Phase 1 spike must verify the actual API-key capability of the exact deployment chosen for development before implementation commits to REST.

Do not code around this uncertainty.

### C3 — Real client isolation needs an explicit engine mapping

Current pricing places separate/unlimited **Projects** on Team and Ultimate, while Free/Plus do not include Projects. Community self-hosting also excludes Projects.

Workflow OS itself requires workspace/client isolation from MVP.

Therefore:

- the synthetic single-workspace MVP may use one Activepieces project;
- real client production on a shared Activepieces installation requires project-level isolation on a plan that supports it; or
- each client receives a separate Activepieces instance; or
- a later ADR selects an execution engine/deployment model with equivalent isolation.

A Workflow OS workspace must never be mapped casually into a shared unpartitioned Activepieces project.

### C4 — Activepieces does not replace Workflow OS reliability semantics

Activepieces durable execution checkpoints completed steps and replays after worker failure. The in-flight step at the time of interruption can execute again.

Therefore Workflow OS still requires:

- action-level idempotency;
- reconcile-before-retry for uncertain mutations;
- explicit retry classification;
- duplicate-event protection;
- compensation where business semantics require it.

Activepieces durable replay is a runtime safety mechanism, not proof of exactly-once business effects.

### C5 — Workflow OS owns high-risk approval semantics

Activepieces has wait/pause mechanisms and approval-related capabilities, but Workflow OS R3 policy is stricter:

- approval binds to exact workspace/workflow version/run/node/action parameters;
- material changes invalidate approval;
- model confidence is not authorization;
- high-risk side effects cannot be silently bypassed by the engine.

Activepieces may implement the wait/resume mechanism. Workflow OS owns the authorization decision and audit binding.

### C6 — Do not make MVP depend on enterprise-only features

Phase 1 must not require:

- separate Projects for the synthetic MVP;
- enterprise Flow Approvals;
- audit logs;
- secret managers;
- Git Sync/releases;
- dedicated workers;
- enterprise Agents/Chat capabilities.

These may become later deployment choices, not hidden MVP dependencies.

## License and product-boundary findings

### Open-source core

The official license documentation states that the Activepieces core is MIT-licensed. The repository root license applies MIT outside the enterprise directories, while `packages/ee/` and `packages/server/api/src/app/ee/` are commercially licensed.

Implication: using and integrating the MIT core is compatible with the Workflow OS direction, but enterprise-directory capabilities cannot be assumed available on a Community deployment.

### Current plan boundary

At the time of this review:

- Free: $0
- Plus: $16/month billed yearly
- Team: $166/month billed yearly
- Ultimate: custom

The pricing page states Team introduces unlimited separate Projects. It also explicitly states that Community Edition is free with no run/user/flow cap but excludes API access, Projects, Agents/Chat, and the team/admin layer.

Pricing can change. Re-check before any client commercial deployment.

## Self-host architecture

The recommended production-shaped self-host path uses Docker Compose with:

- app
- worker
- PostgreSQL
- Redis

The production architecture separates API/UI coordination from stateless workers and uses queue-backed execution. Workers can be scaled horizontally later.

The simple hobbyist single-container PGLite/in-memory setup is acceptable only for local experiments. It cannot scale/migrate cleanly to the enterprise deployment shape, so Workflow OS should not treat it as the canonical long-lived development environment if production self-hosting is expected.

## Durable execution

Activepieces persists a run log/checkpoint and reuses outputs of finished steps after interruption.

Important guarantee boundary:

- already checkpointed completed steps are skipped on replay;
- the single step that was executing during a crash can run again.

This is compatible with Workflow OS's at-least-once-aware action contract.

## Waitpoints

Activepieces waitpoints model durable paused execution. Current docs describe DELAY, WEBHOOK, and BARRIER waitpoints.

This is promising for:

- delays;
- external callbacks;
- human approval waits;
- future barrier/fan-in behavior.

Exact WIR lowering remains an adapter responsibility.

## Flow versioning

Activepieces supports draft versus published flow versions. Published versions are locked, and editing a published flow produces a new draft.

This maps well to Workflow OS's immutable published WorkflowVersion rule.

## Run normalization fit

The official Flow Run API exposes fields including:

- run id;
- project id;
- flow id;
- `flowVersionId`;
- status;
- production/testing environment;
- timestamps;
- steps;
- failed step;
- log file id;
- step count.

Current statuses include:

- FAILED
- QUOTA_EXCEEDED
- INTERNAL_ERROR
- PAUSED
- QUEUED
- RUNNING
- SUCCEEDED
- MEMORY_LIMIT_EXCEEDED
- TIMEOUT
- CANCELED
- LOG_SIZE_EXCEEDED

This is sufficient for a strong normalized Run Ledger mapping if the chosen transport exposes equivalent fidelity.

## MCP findings

Activepieces includes a built-in MCP server. Official documentation says it can:

- list and inspect flows;
- create/manage flows;
- build/update steps and triggers;
- manage router branches;
- validate;
- publish/enable/disable;
- test flows/steps;
- list/get/retry runs;
- inspect connections without returning credentials.

MCP uses OAuth and operations are project-scoped.

Source-code inspection confirms that the MCP module and flow-management tools live outside the enterprise directories covered by the repository's commercial-license exception.

### MCP limitation for a control-plane backend

MCP is excellent for development/tooling and may be viable as an adapter transport, but its OAuth flow is interactive on first authorization. Current source code also uses short-lived access tokens with refresh-token lifecycle constraints.

Therefore REST remains the preferred server-to-server control transport when officially available. MCP is not a reason to bypass supported product boundaries.

## Connection and secret handling

The MCP documentation says credentials are never returned through MCP and setup directs the user to configure connections in the UI.

This fits Workflow OS's invariant:

> WIR stores integration references, never raw reusable secrets.

For self-hosting, the Activepieces encryption key and related instance secrets are operationally critical and must be backed up with the database.

## Network/security fit

Current worker documentation treats sandbox execution mode and network mode as separate security decisions and explicitly calls execution mode important for multi-tenant deployments.

This aligns with Workflow OS's future client-isolation requirements. A real multi-client deployment needs a deliberate sandbox/network configuration review rather than default settings.

## WIR v0 compatibility matrix

| WIR v0 primitive | Desk-research result | Notes |
|---|---|---|
| trigger.manual | CONDITIONAL | Verify exact supported manual/test trigger path in spike |
| trigger.webhook | PASS | Native webhook/event pattern |
| trigger.schedule | PASS | Scheduled/cron flow support |
| action | PASS | Piece actions/HTTP and MCP flow-building support |
| transform | CONDITIONAL PASS | Lower via deterministic utility/code/data actions; define supported subset |
| condition | PASS | Router/branch capability |
| delay | PASS | Durable waitpoint/delay |
| ai_transform | CONDITIONAL PASS | Supported AI building blocks exist; do not depend on general Agent product |
| human_approval | CONDITIONAL PASS | Use engine wait/resume only; Workflow OS owns approval semantics |
| end | PASS | Terminal flow completion maps naturally |

No WIR primitive identified in desk research requires replacing Activepieces before the hands-on spike.

## Engine adapter contract mapping

| Workflow OS adapter capability | Desk-research result |
|---|---|
| validateCapability | PASS conceptually via capability profile + AP validation tools/API |
| planDeployment | Workflow OS responsibility |
| deploy | PASS conditionally; transport must be verified |
| activate/deactivate | PASS |
| startRun | CONDITIONAL; depends on trigger/control path selected |
| getRun | PASS via official API and MCP tooling |
| cancelRun | VERIFY in spike |
| normalizeRunEvents | PASS for polling/snapshot model; push/event-streaming not required for MVP |
| reconcile | Workflow OS + connector-specific logic |
| health | PASS for self-host/API health; verify selected deployment |
| version attribution | PASS; flowVersionId is exposed |
| wait/human task | CONDITIONAL PASS |
| connection references | PASS |

## Recommended Phase 1 development modes

### Mode A — Preferred: official REST development target

Use an Activepieces deployment/account whose supported API access is verified.

For the first synthetic MVP, one project is sufficient.

Advantages:

- straightforward service-to-service adapter;
- clean request/response contracts;
- direct run/flow mapping.

### Mode B — Community research fallback: self-host + MCP

Use self-hosted Community and MCP to prove whether flow creation/build/publish/run inspection can satisfy the adapter without paid API access.

Rules:

- supported MCP tools only;
- no undocumented REST endpoints;
- no direct database manipulation;
- document OAuth reauthorization burden;
- do not assume one Community project is acceptable for multiple real clients.

### Mode C — Real client production

Before onboarding a real client, satisfy the **Client Engine Isolation Gate**:

- Team/appropriate plan with project isolation; or
- one Activepieces instance per client; or
- superseding execution-engine/deployment ADR.

This gate is mandatory even if Workflow OS's own database has perfect workspace isolation.

## Comparison with n8n

n8n remains a capable technical alternative, but its published licensing guidance states that centrally hosting and managing clients' workflows and credentials on your own n8n instance requires a commercial/Enterprise arrangement, while consulting on client-owned instances is treated differently.

That makes n8n less attractive as the default central execution substrate for this specific Workflow OS direction.

## Gate 2 decision

### Result: CONDITIONAL PASS

Keep Activepieces as the first execution target.

Proceed to coding only with these Phase 1 rules:

1. Begin with a **transport/capability spike**, not the application UI.
2. Verify the actual REST API-key behavior for the exact selected deployment.
3. If REST is unavailable without an unacceptable plan, test the supported MCP route before changing engines.
4. Do not use undocumented/internal endpoints.
5. Keep WIR and the adapter contract engine-neutral.
6. Preserve Workflow OS idempotency/reconciliation regardless of Activepieces replay.
7. Keep R3 approval authorization in Workflow OS.
8. Do not place real clients into one unisolated Activepieces project.
9. Re-check pricing/license terms before any paid client production deployment.
10. If any required semantic cannot be preserved, stop and supersede ADR-004.

## Sources

Official sources reviewed:

- Activepieces license: https://www.activepieces.com/docs/about/license
- Activepieces repository license: https://github.com/activepieces/activepieces/blob/main/LICENSE
- Activepieces pricing: https://www.activepieces.com/pricing
- API overview: https://www.activepieces.com/docs/endpoints/overview
- Create Flow API: https://www.activepieces.com/docs/endpoints/flows/create
- Get Flow Run API: https://www.activepieces.com/docs/endpoints/flow-runs/get
- List Flow Runs API: https://www.activepieces.com/docs/endpoints/flow-runs/list
- Flow versioning: https://www.activepieces.com/docs/flows/versioning
- Flow approvals: https://www.activepieces.com/docs/flows/flow-approvals
- MCP overview: https://www.activepieces.com/docs/mcp/overview
- MCP tools: https://www.activepieces.com/docs/mcp/tools
- Install options: https://www.activepieces.com/docs/install/overview
- Docker Compose self-host: https://www.activepieces.com/docs/install/options/docker-compose
- Architecture overview: https://www.activepieces.com/docs/install/architecture/overview
- Workers: https://www.activepieces.com/docs/install/architecture/workers
- Durable execution: https://www.activepieces.com/docs/install/architecture/durable-execution
- Waitpoints: https://www.activepieces.com/docs/install/architecture/waitpoints
- Changelog: https://www.activepieces.com/docs/about/changelog
- Activepieces MCP source module: https://github.com/activepieces/activepieces/tree/main/packages/server/api/src/app/mcp
- n8n licensing guidance: https://support.n8n.io/article/can-i-use-your-license-for-my-use-case
