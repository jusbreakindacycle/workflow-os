# Phase 2 Implementation — Autonomy Kernel

## Status

The repository implements the Phase 2 autonomy kernel behind Phase 1's canonical contracts. Offline/fixture evidence proves the orchestration behavior. Live provider certification remains a separate evidence step and is never inferred from CI.

## Runtime path

```text
ready WorkItem
  -> current Project Pack
  -> minimum Context Slice
  -> Project Bootstrap / instruction bundle
  -> capability requirements
  -> Broker candidate filtering/scoring
  -> RouteDecision
  -> bounded Assignment
  -> worker ExecutionAttempt
  -> independent verifier ExecutionAttempt
      -> pass -> evidence -> Phase 1 canonical verification -> complete
      -> fail -> verifier feedback -> bounded retry
      -> provider/runtime failure -> eligible fallback or block
```

## Capability registry

`Phase2AutonomyKernel.seedCapabilityRegistry()` installs provider-neutral capability keys such as reasoning, planning, coding, verification, structured output, tool use, and long context.

A provider/model name is not a capability. Routes advertise normalized capabilities; WorkItems request capabilities.

## ProviderConnection and routes

`provider_connections` represent configured access/entitlement/health. They persist only a credential reference such as an environment-variable name, never the secret value.

`execution_routes` describe one selectable model/runtime/adapter configuration plus capability, data-class, locality, independence, quality/reliability/latency and cost characteristics.

Configuration health inspection does not spend money. A live API-key connection with a present credential is considered configured/degraded until a successful real execution demonstrates availability.

## Broker

`selectRoute()` applies hard eligibility before scoring:

- connection enabled/status;
- required capabilities;
- data classification;
- local-only constraint;
- route/independence exclusions;
- SpendEnvelope requirement for metered/unknown routes.

It stores the candidate snapshot, selected route and rationale in `route_decisions`. If no route qualifies, Workflow OS creates an open Decision so the condition appears in Needs My Attention.

## Spend enforcement

Zero-incremental/included-subscription routes do not consume an incremental SpendEnvelope.

Metered or unknown-billing routes require:

- explicit route cost estimate;
- approved matching SpendEnvelope;
- matching WorkItem when scoped;
- matching purpose/currency;
- sufficient remaining balance.

When an adapter cannot return authoritative actual price at call time, Phase 2 debits the approved conservative estimate and marks the CostRecord basis accordingly rather than pretending cost was zero.

## Project Bootstrapper and instruction compiler

`bootstrapProject()` creates deterministic derived projections from the current Project Pack:

- `PROJECT.md`;
- `POLICY.md`;
- `WORKGRAPH.json`.

`compileInstructions()` combines the exact WorkItem, Context Slice and selected Skills into Assignment-scoped instructions and derived `AGENTS.md` / assignment projections.

The compiler explicitly treats client/request/file/web/model/tool content as untrusted data. It cannot grant authority beyond canonical approvals, side-effect policy or spend bounds.

## Skill Registry

The first built-in skills are intentionally small:

- `core.execute_bounded_work`;
- `core.verify_evidence`;
- `core.escalate_safely`.

Each skill is Workspace-scoped, versioned and content-hashed. Skills remain instructions/capability declarations, not authorities.

## Provider adapters

`src/runtime/provider-adapters.js` implements one normalized call boundary:

- `fixture` for deterministic CI and failure injection;
- `openai_responses`;
- `anthropic_messages`.

The direct remote adapters use Node's built-in `fetch`; there is still no runtime npm SDK dependency. Model IDs are supplied by route configuration.

Normal tests use fake HTTP responses. CI never needs provider credentials.

## Bounded Loop Engine

`runWorkItem()` creates a routed Assignment and records a `loop_run` with explicit max iterations/time. Each worker/verifier call becomes an immutable `execution_attempt`.

A verifier failure returns feedback for another bounded worker iteration. A worker or verifier route failure can re-run the Broker excluding the failed route. All fallback routes must still pass capability/data/spend constraints.

If the budget expires, no eligible route exists, or independent verification is unavailable, execution stops/blocks and becomes explainable canonical state.

## Independent verification

When independent verification is required, worker and verifier routes must come from different `independence_group` values. Workflow OS does not let a lone route silently verify itself.

Provider execution only supplies evidence. Phase 1's verification path remains the only method that can transition a WorkItem to `complete`.

## Portability drill

`runPortabilityDrill()` executes the same compiled Assignment projection through two distinct routes backed by distinct ProviderConnections and independence groups. The drill does not complete the WorkItem.

Fixture drills prove the adapter/rerouting harness. Operational provider portability is not certified until the same pattern passes using two non-fixture real connections.

## Live certification harness

Run only after intentionally configuring credentials and spend:

```bash
WORKFLOW_OS_LIVE_APPROVE_SPEND=yes \
WORKFLOW_OS_LIVE_MAX_MINOR=100 \
WORKFLOW_OS_OPENAI_API_KEY='...' \
WORKFLOW_OS_OPENAI_MODEL='operator-selected-model' \
npm run phase2:live
```

Optional second route:

```bash
WORKFLOW_OS_ANTHROPIC_API_KEY='...' \
WORKFLOW_OS_ANTHROPIC_MODEL='operator-selected-model'
```

Do not put the key values in `.env.example`, repository files, Project records, logs, screenshots, issues or PR comments.

The live harness creates a separate local synthetic database under `.local/phase2-live/` by default and persists certification evidence there.

## Deliberate limits

Phase 2 does not yet provide filesystem/repository editing runtimes, browser/computer-use execution, AI-assisted discovery, production deployment, Activepieces/Paperclip adoption, or unattended high-risk operation. Those require later delivery adapters/Phase 3 work.
