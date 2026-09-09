# Phase 1 Gate 2B — Activepieces Adapter Spike

Use this as the **first coding prompt** after the Gate 2 due-diligence PR is merged.

---

You are executing the first hands-on implementation task for Workflow OS.

## Mandatory reading

Read, in order:

1. `AGENTS.md`
2. `docs/product/goal.md`
3. `docs/product/scope-mvp.md`
4. `ARCHITECTURE.md`
5. `docs/decisions/ADR-004-initial-execution-engine.md`
6. `docs/research/activepieces-gate-2.md`
7. `docs/architecture/engine-adapter-contract.md`
8. `docs/architecture/activepieces-adapter-profile.md`
9. `docs/workflow-ir/wir-v0-spec.md`
10. `docs/reliability/reliability-model.md`
11. `docs/security/security-model.md`
12. `docs/testing/testing-strategy.md`
13. `docs/plans/phase-1-mvp.md`

Repository contracts are authoritative.

## Goal

Prove the **smallest supported Activepieces control path** that can back the Workflow OS engine adapter.

This is a capability spike, not broad product implementation.

## First decision: transport

Before building adapter abstractions, verify the exact Activepieces deployment/version/edition being used.

Attempt the supported official REST/API-key path first **only if API access is actually available** for the selected deployment.

If official REST is unavailable or commercially unsuitable, evaluate the built-in official MCP path.

Never:

- use undocumented/private endpoints;
- write directly to Activepieces PostgreSQL;
- scrape the Activepieces UI as a production control API;
- modify Activepieces source merely to bypass a plan/license boundary.

## Required spike capabilities

Using synthetic data only, prove or disprove:

1. create a flow;
2. configure a supported trigger;
3. add/update a deterministic action;
4. add a condition/router if supported by the chosen transport;
5. validate the flow;
6. publish/lock and activate it;
7. execute/test it through a supported path;
8. retrieve run id/status;
9. retrieve exact engine flow-version id;
10. inspect step-level result/failure evidence;
11. retry or replay a failed synthetic run safely;
12. list/resolve a connection reference without exposing the underlying secret;
13. identify cancel-run capability or document its absence;
14. identify wait/resume/human-approval transport capability;
15. record engine/runtime behavior after an interrupted or failed action if practical in the spike.

## Required outputs

Do not proceed to the product UI until these outputs exist:

### 1. Adapter capability manifest

Machine-readable or structured document containing:

- Activepieces version/deployment mode;
- edition/plan assumption;
- selected control transport;
- authentication mechanism;
- supported WIR v0 nodes;
- unsupported/deferred semantics;
- run-status mapping;
- runtime guarantee/replay notes;
- workspace-to-instance/project isolation mapping.

### 2. Sanitized fixtures

Keep synthetic, secret-free request/response fixtures sufficient to test parsing and normalization.

### 3. Minimal adapter boundary

Implement only enough code to demonstrate the engine-neutral adapter contract for the proven capabilities.

Do not build the whole Workflow OS.

### 4. Tests

At minimum test:

- capability validation;
- run-status normalization;
- exact workflow-version attribution;
- unsupported capability rejection;
- no sensitive values in stored fixtures/logs;
- failure normalization.

### 5. Decision report

Return one of:

- **PASS — REST**
- **PASS — MCP**
- **CONDITIONAL PASS** with exact unsupported/deferred items
- **FAIL** and proposed superseding ADR

## Stop conditions

Stop and request architectural review if:

- the selected transport requires undocumented APIs;
- WIR semantics would be silently weakened;
- real workspace isolation assumptions leak into the synthetic MVP;
- secrets must be copied into WIR;
- exact version/run attribution cannot be recovered;
- an engine limitation would require expanding MVP scope.

## Review chain

Use the repository reviewer contracts:

`Scope -> Architecture -> Security + Reliability -> QA -> Adversarial -> Documentation`

## Completion evidence

Report:

- files changed;
- exact Activepieces deployment/version;
- transport chosen and why;
- commands/tests run;
- capabilities proven;
- capabilities not proven;
- acceptance criteria affected;
- ADR-004 status;
- whether Gate 3 may begin.

Do **not** claim Workflow OS MVP completion. This task only closes Gate 2B.
