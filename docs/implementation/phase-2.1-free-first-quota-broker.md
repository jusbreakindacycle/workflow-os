# Phase 2.1 Implementation — Free-First Provider & Quota Broker

## Runtime shape

```text
ready WorkItem
  -> Free Routing Policy (zero-spend lock)
  -> refresh/sync quota observations
  -> classify task
  -> rerank eligible zero-incremental routes
  -> Phase 2 Broker
  -> bounded worker
  -> independent free verifier
  -> evidence / canonical verification
  -> update usage counters + quota snapshots
  -> next WorkItem or Needs My Attention
```

Phase 2.1 deliberately reuses Phase 2's Assignment, Broker, execution-attempt, verification, and portability contracts.

## Persistence

Migration `0007_phase21_free_first_quota_broker.sql` adds:

- `free_routing_policies`;
- `quota_snapshots`;
- `provider_usage_counters`;
- `provider_usage_accounted_attempts`.

These are Workspace-scoped operational records. They do not change the accepted Project problem/outcome, Project Brief, WorkItem objective, or Project Pack semantics.

## Zero-spend lock

`FreeFirstBroker.runFreeFirstWorkItem()` always invokes Phase 2 with:

- `maxIncrementalCostMinor = 0`;
- no SpendEnvelope;
- independent verification required.

Free-First routes are configured as `zero_incremental`. The broker refuses to run if an unmanaged included/zero-incremental route is present that could bypass Free-First policy selection.

A separate paid/metered Phase 2 route can still exist in another Workspace/configuration, but Free-First mode never treats it as a fallback.

## Antigravity bridge

`src/runtime/antigravity-bridge.js` wraps the installed official `agy` CLI.

### Discovery

`agy models` is parsed into runtime route candidates. Model slugs are not hard-coded as canonical product state.

### Quota

`agy -p /usage --output-format text` supplies a best-effort quota report. The parser stores the raw bounded preview plus normalized remaining fraction when recognizable. Unknown formats stay `unknown` rather than inventing availability.

### Execution

The bridge starts on loopback only and translates a normalized Responses request to:

```text
agy -p <prompt>
  --model <discovered-slug>
  --output-format json
  --sandbox
  --print-timeout <bounded-value>
```

The bridge does not pass `--dangerously-skip-permissions`.

Each run receives a disposable temporary working directory, limiting accidental workspace mutation during model-only certification tasks.

## Groq

Groq uses the existing OpenAI-compatible Responses adapter with:

```text
https://api.groq.com/openai/v1/responses
```

The adapter retains request/token rate-limit headers in `execution_attempts.usage_json` so the Free-First broker can create quota snapshots. The generic Responses payload omits OpenAI-only `store` for non-OpenAI providers.

The connection is considered Free-First only after the operator asserts the key belongs to a Groq Free Plan account. Workflow OS cannot independently guarantee that the external account will never later be upgraded.

## OpenRouter

OpenRouter is constrained to:

```text
model = openrouter/free
endpoint = https://openrouter.ai/api/v1/responses
```

Local request counters conservatively enforce the configured free daily request allowance when the provider does not return a compatible remaining-request header.

## Quota bands

Default policy:

| Remaining | State | Routing effect |
|---|---|---|
| >= 40% | `healthy` | normal preference |
| 15–40% | `conserve` | score penalty |
| 10–15% | `reserved` | strongly deprioritized for ordinary worker use; capacity retained for verification/fallback |
| < 10% | `exhausted` | route disabled from ordinary free routing |
| unknown | `unknown` | controlled fallback, configurable |

These numbers are Workflow OS policy, not claims about provider-owned thresholds.

## Task classes

WorkItems map to `routine`, `standard`, `complex`, or `critical` routing classes. Current risk tier provides the default mapping, while callers may explicitly supply a class.

The score adjustment intentionally favors economy models for routine work and stronger models for complex/critical work when quota remains available.

## Usage accounting

After successful Free-First attempts:

1. each `ExecutionAttempt` is accounted once;
2. local daily request/token counters are incremented;
3. provider rate-limit headers are normalized when present;
4. OpenRouter/Groq can fall back to conservative local request counters;
5. the next Free-First run re-applies policy using the latest observations.

No quota record grants execution authority.

## API

Phase 2.1 exposes:

- `GET /api/phase21/free-first?workspaceId=...`
- `POST /api/phase21/workspaces/:workspaceId/policy`
- `POST /api/phase21/workspaces/:workspaceId/sync-usage`
- `POST /api/phase21/workspaces/:workspaceId/apply-policy`
- `POST /api/phase21/projects/:projectId/work-items/:workItemId/run`

Provider account authentication and initial secret binding remain local operator actions.

## Operator scripts

```text
npm run phase21:preflight
npm run phase21:certify
```

Preflight does not execute a Project WorkItem. It checks Antigravity readiness/quota and whether a second independent free route is locally configured.

Certification is intentionally consequential even though monetary spend is locked to zero: it consumes real provider quota. It therefore refuses to run unless `WORKFLOW_OS_FREE_FIRST_RUN=yes` is explicitly present.

## Evidence boundary

CI proves implementation semantics with fixtures/fake HTTP responses. CI never authenticates to Antigravity, Groq, or OpenRouter.

A live zero-spend claim requires persisted evidence from the local certification harness. Do not infer live-provider success from unit tests.
