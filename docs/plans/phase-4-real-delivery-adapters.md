# Phase 4 — Real Delivery Adapters

## Goal

Phase 4 extends Workflow OS from the Phase 3 synthetic/local golden path into **governed real external delivery** without weakening canonical authority, provider independence, or evidence requirements.

Phase 3 proved that Workflow OS can understand a request, generate strategy-specific work, execute a real local artifact, exercise the actual local flow, independently reconcile evidence, and close the Project. Phase 4 asks a narrower next question:

> Can Workflow OS safely cross from verified local state into a durable shared/external system, prove what happened, and stop when authority or external state is uncertain?

## Challenge outcome

Do **not** start Phase 4 by integrating every imaginable provider.

The first real capability gap exposed by a normal custom-build freelance Project is source-control delivery:

```text
verified local artifact
  -> branch / commit / pull request
  -> remote checks / reconciliation
```

Therefore the first coding sequence is **Phase 4.0 + 4.1**, not workflow-engine adoption, deployment, Paperclip, CRM integrations, or a generic integration marketplace.

A dual-business local website Project such as a water-refilling-station + rice-retail system is a valid representative future Project, but it must remain a Project input, not become Workflow OS product scope. Its discovery may still choose `custom_build`, `configure`, `integrate`, or another strategy. Phase 4 must not hard-code that scenario into canonical product meaning.

## Loop engineering model

Every external action follows a bounded evidence loop:

```text
OBSERVE
  inspect canonical + external starting state

COMPILE
  create exact immutable ExternalActionPlan

AUTHORIZE
  resolve exact current authority / spend bounds

PREFLIGHT
  re-check versions, hashes, target, capability, credential scope, drift

ACT
  execute one bounded adapter effect

RECONCILE
  read external state; classify confirmed / not-applied / drifted / uncertain

VERIFY
  compare observed state against exact plan + verification contract

DECIDE
  complete / bounded repair / new plan / escalate
```

A loop terminates when the exact goal predicate is proven, authority becomes stale, retry/repair budget is exhausted, external state is uncertain, or operator action is required.

## Phase 4.0 — External Action Contract

Implement the canonical substrate described in `docs/architecture/external-action-contract.md`.

### Required implementation

- migration for external action plans/attempts/reconciliation/resource bindings;
- exact Workspace/Project/WorkItem version capture;
- immutable authority-bearing plan identity/content;
- Approval subject support for exact external action plans;
- resolve-time and use-time freshness guards;
- deterministic action/target/input hashing;
- idempotency key support;
- attempt evidence and normalized outcome classes;
- explicit `uncertain` state;
- reconciliation-before-retry enforcement;
- optional SpendEnvelope binding;
- Needs My Attention derivation for blocked/uncertain/stale actions;
- Command Center visibility;
- HTTP/domain API sufficient for Phase 4.1 to consume the contract.

### Non-goals

- arbitrary network access;
- provider-specific source-control behavior;
- deployment;
- external communication;
- production authority;
- automatic approval;
- background execution host.

### Exit gate

A deterministic fixture action can prove the full chain:

```text
plan -> approval -> use-time check -> attempt -> reconcile -> verify
```

and adversarial tests prove stale/cross-scope/unapproved/uncertain actions cannot bypass it.

## Phase 4.1 — Governed Source Control

Implement `docs/architecture/source-control-adapter-contract.md` on top of Phase 4.0.

### Required implementation

- provider-neutral SourceControlAdapter interface;
- deterministic fixture/fake adapter for normal CI;
- first GitHub implementation behind the adapter boundary;
- source-control delivery plan compiler bound to verified artifact manifest/hash;
- exact existing repository + base-ref inspection;
- bounded non-default branch creation;
- exact commit/tree projection from verified local artifact;
- pull-request creation with exact pre-approved title/body;
- remote branch/commit/PR/check read-back;
- idempotent duplicate detection;
- stale-base and unexpected-remote-change rejection;
- uncertain mutation reconciliation before retry;
- normalized provider errors/evidence;
- explicit exclusion of merge, force push, settings, secrets, releases and production effects.

### Normal CI

Credential-free fixture tests must prove semantics and authority. CI must not create remote GitHub state.

### Optional live certification

A separate explicit opt-in harness may use one exact allowlisted disposable/non-production repository. It must create canonical operator-approval evidence, refuse the default branch, avoid production effects, and report the created remote references.

Live certification is evidence for the GitHub implementation only. It does not make GitHub canonical.

### Exit gate

Workflow OS can take a verified local artifact and, with exact current R2 authority, produce and reconcile one branch + commit + pull request in a real non-production remote repository without unrestricted Git access.

## Phase 4.2 — Deployment Adapter

Start only after 4.1 is stable or a concrete Project requires deployment first.

Target one deployment provider initially. Required contract direction:

- exact environment/target;
- artifact/source version binding;
- preview/staging before production where applicable;
- R2/R3 authority separation;
- health evidence;
- rollback/recovery evidence;
- provider resource mapping;
- cost/spend handling;
- uncertain deployment reconciliation.

Do not implement many hosting providers at once.

## Phase 4.3 — Workflow Engine / WIR Execution

Use only when a real `automate`/`integrate` Project requires executable business workflow orchestration.

Workflow OS keeps WIR canonical. Activepieces or another engine is evaluated as a replaceable execution provider, not adopted as canonical workflow truth.

Required direction:

- compile accepted WIR to provider projection;
- exact external action authority for deployment/config changes;
- version mapping;
- controlled test execution;
- evidence/exception/dead-letter semantics;
- cost/credential bounds;
- provider replacement test.

## Phase 4.4 — Configure / Integrate External Systems

Add only the adapter classes exposed by measured Projects: forms, spreadsheets, databases, CRM, email, storage, APIs, etc.

Do not create a generic connector marketplace prematurely. Each new adapter must justify:

- concrete Project demand;
- normalized capability/action semantics;
- authority boundary;
- credential/data classification;
- idempotency/reconciliation;
- evidence and recovery path.

## Phase 4.5 — Real Delivery Certification

Certify one representative Project across a real external boundary.

For a custom-build path, the target chain is:

```text
raw request
 -> accepted Brief / strategy
 -> strategy-specific Work Graph
 -> governed local implementation
 -> local L2/L3 verification
 -> exact source-control delivery plan
 -> operator authority
 -> real remote branch / commit / PR
 -> external reconciliation / checks
 -> verified delivery evidence
```

If a later Project is better represented by `automate`, `configure`, or `integrate`, Phase 4.5 may certify that strategy instead. Do not force custom software merely to satisfy a test.

## Phase 4 exit criteria

Phase 4 is complete when Workflow OS has proven at least one real external delivery path with:

- canonical authority outside provider reasoning;
- exact version/hash/target binding;
- no blind retry of uncertain mutations;
- read-after-write reconciliation;
- provider-neutral adapter semantics;
- actual external evidence;
- no silent paid fallback;
- recoverable/observable failure;
- regression coverage for Phase 1–3 invariants.

## What remains intentionally later

Phase 4 does not automatically include:

- commercial quoting/invoicing/client portal (Phase 5);
- Paperclip/internal workforce provider adoption (Phase 6);
- packaged client-facing AI workers (Phase 7);
- unattended always-on ExecutionHost (future phase when demanded);
- production-scale infrastructure without measured need.

## Documentation exit condition

After the Phase 4 specification PR containing this plan, the External Action Contract, Source Control Adapter Contract, and Phase 4.0–4.1 acceptance criteria is merged, **no additional pre-coding planning phase is required** for Phase 4.0/4.1.

Implementation should begin. New documentation is added only when implementation reveals a contradiction, a material architecture decision, or a genuinely new provider/action boundary.