# Phase 2.1 Live Certification Report — Free-First Provider & Quota Broker

## Verdict

**PASS — representative zero-spend real-provider execution, independent verification, and portability are certified.**

Certification date: **2026-09-12**  
Repository baseline: main after PR #14 (`499d2d52ea4500aa7961ea551287cd5b27e0c215`)

This report records a sanitized summary only. The local certification SQLite database, API credentials, local account details, and machine-specific paths are intentionally not committed.

## What was certified

The operator intentionally ran the opt-in Phase 2.1 certification harness after:

- pulling the merged Phase 2.1.2 certification-semantics changes;
- passing `npm run verify` with 64 tests at that baseline;
- passing `npm run phase21:preflight`;
- confirming Antigravity paid-credit fallback was disabled/default-off;
- configuring OpenRouter only through the local process environment.

The live path was:

```text
Google Antigravity worker
  -> deterministic bounded JSON artifact
  -> Workflow OS persisted execution evidence
  -> OpenRouter independent verifier
  -> Workflow OS persisted L2 verification
  -> cross-provider portability drill
  -> zero-spend audit
```

## Sanitized persisted evidence

The successful certification database was manually inspected after the run.

### Certification records

- `first_real_execution` — `passed`;
- `independent_verifier` — `passed`;
- `portability_drill` — `passed`.

### Execution / verification

- worker provider: Google Antigravity;
- worker route status: `succeeded`;
- verifier provider: OpenRouter;
- verifier route status: `succeeded`;
- worker/verifier providers and independence groups: independent;
- loop final status: `passed`;
- loop stop reason: `objective_verified`;
- assignment verification status: `passed`;
- persisted verification run: `L2` / `pass`.

The accepted verifier summary stated that the candidate exactly matched the required JSON artifact and contained no unsupported execution claims or external side effects.

### Zero-spend evidence

- SpendEnvelope records: `0`;
- CostRecord records: `0`;
- Antigravity paid-credit fallback: disabled;
- no production/destructive side effect was part of the certification task.

## Artifact contract

The worker was responsible only for producing this bounded semantic artifact:

```json
{
  "authority_owner": "workflow_os",
  "paid_spend_allowed": false,
  "production_side_effects_allowed": false,
  "independent_verification_required": true,
  "scope_change_requires_approval": true
}
```

The worker was explicitly forbidden from claiming that verification had already occurred or inventing hashes, HTTP/status codes, command results, external actions, or execution evidence.

Workflow OS—not the worker—proved execution, verification, provider independence, zero spend, and portability from persisted records.

## Why earlier failed runs matter

Earlier live attempts exposed two defects that were fixed before this pass:

1. Antigravity headless mode could auto-deny a tool action, return `status: SUCCESS` with an empty response, and Workflow OS originally classified that only as empty output. Phase 2.1.1 added explicit denied-action diagnostics and clean failure unwinding without weakening sandbox permissions.
2. The original synthetic certification task mixed artifact production with proof of execution/verification, encouraging the worker to describe or fabricate evidence. The independent verifier correctly rejected that output. Phase 2.1.2 replaced the task with a dedicated deterministic artifact contract and made Workflow OS prove the real certification facts itself.

The final pass therefore demonstrates stricter semantics than simply changing the verifier until it accepted a model response.

## What this proves

For the representative Antigravity + OpenRouter zero-spend configuration, Workflow OS has evidence that:

- a real non-fixture worker can consume the canonical Assignment projection;
- a different real provider can independently verify the result;
- canonical completion still waits for verification;
- the same canonical work can run through two independent provider connections for a portability drill;
- Free-First can preserve its zero-spend invariant during certification.

## What this does not prove

This certification does not authorize or prove readiness for:

- production deployment;
- consequential repository mutation;
- external communications or transactions;
- arbitrary tool/command permissions;
- high-risk autonomous actions;
- every possible model/provider combination;
- paid provider routes.

Those require separate authority hardening and adapter-specific verification.

## Recertification policy

Do not consume provider quota by rerunning this harness as a routine smoke test. Recertify when one or more of these materially change:

- Free-First broker eligibility/scoring/zero-spend semantics;
- Antigravity bridge or permission handling;
- certification artifact/evidence contract;
- provider adapter behavior relevant to the certified path;
- provider/account configuration enough to invalidate prior evidence;
- the repository explicitly requires renewed certification evidence.

Normal code changes should continue to use credential-free CI unless live evidence is specifically required.

## Next boundary

The next engineering risk is no longer basic provider execution. It is canonical authority.

Before enabling consequential real-world capabilities, Phase 2.2 should harden WorkItem creation-state rules, approval-subject ownership/existence validation, stale-version/TOCTOU behavior, and the authority threshold for real repository/deployment/external-system mutations.
