# External Action Contract

## Purpose

Phase 3 proved bounded real work inside a local isolated Project workspace. Phase 4 introduces the boundary for **durable shared or external effects** without allowing a model, runtime, adapter, or provider to become authority.

The External Action Contract is provider-neutral. Source control, deployment, workflow engines, external configuration/integration, communication, and future adapters may use different provider APIs, but consequential effects must cross the same canonical authority and reconciliation boundary.

## Core rule

> No durable external effect is executed directly from model intent, tool output, or provider-local state.

The canonical chain is:

```text
accepted Project / WorkItem
  -> exact ExternalActionPlan
  -> applicable Approval / SpendEnvelope
  -> deterministic preflight
  -> use-time authority revalidation
  -> adapter execution attempt
  -> durable receipt / provider reference
  -> read-after-write reconciliation
  -> verification evidence
  -> canonical completion / repair / escalation
```

Provider success is evidence. It does not create authority and it does not by itself prove the intended side effect occurred correctly.

## ExternalActionPlan

An `ExternalActionPlan` is an immutable, version-bound description of one bounded external effect or one tightly bounded ordered effect bundle.

At minimum it identifies:

- Workspace and Project;
- optional WorkItem and Assignment;
- exact Project/WorkItem versions at plan creation;
- adapter class, such as `source_control`, `deployment`, `workflow_engine`, or `external_system`;
- normalized action kind or bounded operation set;
- exact target identity/scope;
- expected preconditions / observed starting state;
- exact input/artifact/content references and hashes;
- risk tier and action class;
- required authority and approval subject;
- optional SpendEnvelope when incremental cost may occur;
- deterministic idempotency key;
- verification and reconciliation requirements;
- rollback/recovery or compensation plan where applicable;
- expiry/revocation condition where applicable;
- stop/escalation conditions.

Changing an authority-bearing field does not edit an approved plan. It creates a new plan/version and supersedes the old one.

## Bounded bundles

A single Approval may authorize a tightly bounded ordered bundle when the complete bundle is known before approval.

Example:

```text
create exact branch
  -> create exact commit from verified artifact snapshot
  -> open exact pull request with hashed title/body
```

The bundle must bind all targets, refs, artifact/content hashes, allowed operations, and limits. An approval such as `do whatever is needed in GitHub` is invalid.

Adding a new operation, changing content, changing the target, changing the base ref, or widening permissions requires a fresh plan/authority decision.

## Lifecycle

Recommended plan states:

- `proposed` — exact effect compiled but not authorized;
- `authorized` — applicable authority resolved and still current;
- `executing` — one bounded provider attempt is in progress;
- `reconciling` — provider response exists or outcome is uncertain and external state is being inspected;
- `verified` — required external state/evidence matches the plan;
- `complete` — canonical work may consume the verified result;
- `rejected` — operator rejected authority;
- `blocked` — missing capability, credential, policy, spend, or precondition;
- `failed` — confirmed failure with no side effect requiring reconciliation;
- `uncertain` — whether an effect occurred cannot yet be proven;
- `superseded` — canonical Project/WorkItem/plan context changed.

Status transitions are deterministic and fail closed.

## Authority

Risk tier is not the only authority gate. Existing policy remains controlling:

- R0 read-only observation normally needs no approval solely because of risk;
- R1 isolated/reversible local work may use bounded pre-authorization;
- R2 durable shared/external mutation requires exact authority unless an explicit narrow policy already authorizes the class;
- R3 production/destructive/security/legal/financial actions require exact human authority plus applicable verification/recovery evidence;
- new metered execution additionally requires a valid SpendEnvelope;
- credentials/permissions require their own exact authority and are never implied by possession of a secret.

Authority is checked at plan approval **and again immediately before each consequential effect**.

## Preconditions and drift

An external effect is executable only while its preconditions remain true.

Examples:

- expected repository/base commit is still current;
- target resource still exists and is in the expected environment;
- artifact manifest/content hash still matches the verified artifact;
- Project and WorkItem versions are still current;
- approval and spend bounds remain current;
- provider capability/credential scope remains sufficient but not broader than needed.

Unexpected drift blocks execution or creates a new plan. The adapter does not silently rebase, retarget, overwrite, or widen scope.

## Idempotency and uncertain outcomes

External calls can time out after a provider has already applied the effect. Therefore a retry is never justified merely because the caller did not receive a success response.

Every mutation path must have a deterministic idempotency/reconciliation strategy using one or more of:

- provider idempotency key;
- deterministic resource name/ref;
- content/tree/hash comparison;
- provider operation ID;
- read-after-write lookup;
- exact expected-state comparison.

When outcome is uncertain:

```text
stop new mutation
  -> inspect external state
  -> classify confirmed / not-applied / drifted / still-uncertain
  -> only then continue, retry, repair, or escalate
```

Blind retry of an uncertain consequential mutation is prohibited.

## Attempts and receipts

Each provider call becomes an `ExternalActionAttempt`/equivalent evidence record that is attributable to the exact plan and records:

- attempt number;
- adapter/provider identity/version;
- operation kind;
- request/input hash, not reusable raw secrets;
- start/finish timestamps;
- normalized result/error class;
- provider operation/resource references;
- usage/cost evidence when applicable;
- reconciliation status.

Provider-native objects remain mappings/evidence. They do not replace canonical Workflow OS identities.

## Credentials

Canonical state stores credential references/bindings and expected scopes, never raw reusable secret values.

A credential being technically capable of a wider action does not authorize that action. Adapter code must enforce the narrower current plan/policy even when the provider token could do more.

## Verification

Mutation verification must observe the external state after execution. Depending on consequence, evidence can include:

- exact branch/ref/commit identity;
- pull-request state and checks;
- deployment URL/release ID plus health and rollback evidence;
- workflow deployment/version plus controlled execution result;
- remote configuration read-back;
- provider-side audit/receipt reference.

Model narration is not reconciliation evidence.

## Recovery

Every mutable adapter class defines failure and recovery semantics before production use. Recovery may be rollback, compensating mutation, superseding change, or human escalation. `delete it and try again` is not an assumed recovery strategy.

## Provider independence

Canonical plans use normalized adapter/action semantics. Provider-specific request payloads are compiled projections.

Replacing GitHub with another source-control provider, or one deployment/workflow provider with another, must not rewrite Project meaning or authority semantics.

## Phase 4.0 boundary

Phase 4.0 implements the generic canonical action/authority/reconciliation substrate. It does **not** itself grant arbitrary network, source-control, deployment, messaging, production, or credential permissions.

The first consuming adapter is Phase 4.1 governed source control.