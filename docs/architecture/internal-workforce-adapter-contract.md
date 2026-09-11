# Internal Workforce Adapter Contract

**Status:** Accepted boundary contract — provider selection pending

## Purpose

Workflow OS needs a provider-neutral boundary for systems that coordinate and execute the operator's **internal AI delivery workforce**.

An internal workforce manager is not the same thing as:

- a business workflow execution engine;
- one client-facing AI Employee runtime;
- one direct model call;
- the canonical Workflow OS Project/WorkItem state machine.

Candidate implementations may include Paperclip or a smaller direct-runtime implementation.

## Architectural rule

> Workflow OS owns canonical delivery state. An Internal Workforce Adapter executes bounded internal AgentAssignments and reports normalized runtime facts, artifacts, evidence, costs, failures, and proposals back.

The provider is an execution subsystem and projection, not a peer source of truth.

The adapter must never silently become authoritative for:

- Workspace/client identity or isolation policy;
- Project lifecycle/status;
- WorkItem meaning, priority, readiness, dependencies, acceptance, or completion;
- WIR;
- business risk/authorization;
- consequential human approval;
- production deployment/incident/maintenance state;
- client-facing AI Employee role semantics.

## Authority direction

Synchronization is intentionally asymmetric:

```text
Workflow OS -> provider
  assignment
  allowed scope/capabilities
  context/artifact references
  budgets/stop conditions
  policy-derived constraints

provider -> Workflow OS
  progress/runtime state
  artifacts/evidence
  costs
  errors/failures
  provider-local task details
  proposals/escalations
```

A provider-side edit cannot silently change canonical Workflow OS scope, priority, lifecycle, authorization, or completion.

## Conceptual operations

An adapter should expose logical operations equivalent to:

```text
health()
capabilities()

ensureTenant(workspaceRef)
ensureProject(projectRef)
ensureWorker(roleVersionRef)

createAssignment(workItemRef, assignmentContract)
startAssignment(assignmentRef)
getAssignment(assignmentRef)
cancelAssignment(assignmentRef)

listAssignmentEvents(assignmentRef, cursor)
listArtifacts(assignmentRef)
listCosts(assignmentRef)
listProposals(assignmentRef)
reconcile(assignmentRef)

pauseWorker(workerRef)
resumeWorker(workerRef)
```

Names are conceptual; implementation language/API shape is deferred.

## Assignment contract

Workflow OS sends an assignment containing references equivalent to:

- Workspace ID;
- Project ID;
- WorkItem ID;
- internal role / role version;
- exact objective;
- authoritative artifact/context references;
- in-scope/out-of-scope boundaries;
- allowed capabilities/tools;
- repository/environment/workspace reference;
- dependency state;
- time/cost/tool/iteration budgets;
- verification/evidence requirements;
- side-effect approval policy;
- stop/escalation conditions.

The adapter must not broaden authority merely because the external worker/runtime supports more capabilities.

## Provider-created tasks and WorkItem Proposals

A provider may create child tasks or execution steps internally.

Provider-local child work may remain provider-local only when it is fully inside the accepted Assignment scope and does not materially alter Project semantics.

If provider-created work would materially change any of the following, the adapter must surface a **WorkItem Proposal** rather than silently creating/changing a canonical WorkItem:

- scope or deliverable;
- architecture;
- priority/dependency graph;
- cost/budget expectation;
- security/risk/authority;
- external side effects;
- deployment/release plan;
- maintenance/incident obligation;
- acceptance criteria.

A proposal should contain fields equivalent to:

- proposal ID;
- Workspace/Project/WorkItem/Assignment references;
- proposed title/outcome;
- reason/evidence;
- impact classification;
- suggested dependencies/priority;
- estimated risk/cost when known;
- provider/worker source;
- timestamp.

Workflow OS validates and explicitly promotes/rejects a proposal. Provider creation alone is not a canonical state transition.

## Normalized assignment state

Keep workforce execution state distinct from canonical WorkItem acceptance.

Suggested assignment states:

- `created`
- `queued`
- `running`
- `waiting`
- `blocked`
- `failed`
- `cancelled`
- `execution_finished`
- `unknown`

`execution_finished` means the provider/worker reports execution is finished and evidence is available for Workflow OS evaluation.

It does **not** mean the canonical WorkItem is accepted complete.

## Acceptance separation

```text
Agent/runtime execution
      -> execution_finished
      -> evidence collected
      -> verification / reconciliation / policy checks
      -> accepted OR changes required / failed / escalated
```

The canonical WorkItem transitions only according to Workflow OS rules.

An adapter may run independent review stages, but those reviews are evidence unless an explicit compatibility policy proves they satisfy the required Workflow OS acceptance contract.

Provider-native `done`, `success`, or equivalent MUST NOT map directly to canonical WorkItem `complete` by default.

## External identifier mapping

Store stable mappings equivalent to:

- provider type/version;
- external tenant/company ID;
- external project ID;
- external worker/agent ID;
- external task/issue ID;
- external run/session ID;
- external execution workspace ID when applicable;
- adapter/control identity reference;
- last reconciliation cursor/version.

Mappings are metadata. They do not replace Workflow OS identifiers.

## Drift and reconciliation

Every mutating operation must support or emulate idempotency.

The adapter must handle:

- create retry after timeout;
- duplicated external event;
- stale/out-of-order event;
- assignment already running;
- external task manually edited;
- provider-created child task;
- external task missing/deleted;
- external worker paused/terminated;
- external system restart;
- partial result/evidence retrieval;
- unknown side effect.

Reconciliation should report provider/runtime consistency, not establish peer authority.

Normalized outcomes may include:

- `consistent`;
- `provider_progress_ahead` — provider has runtime progress/events not yet ingested;
- `workflow_os_command_pending` — canonical command/state has not yet been reflected externally;
- `provider_drift` — provider-side canonical-like fields differ unexpectedly;
- `proposal_pending` — provider requested a material canonical change;
- `missing_external`;
- `conflict`;
- `unknown`.

`provider_drift` and `conflict` must become visible operator/recovery state. They are never silently resolved by allowing provider data to overwrite canonical Project/WorkItem state.

## Tenant and credential isolation

The adapter must declare its tenant/isolation primitive **and** its control-credential blast radius.

For a Paperclip candidate, the default logical mapping to test is:

```text
Workflow OS Workspace -> Paperclip Company
```

The adapter must prove that one Workspace cannot read/mutate another Workspace's:

- tasks;
- agent state;
- documents/artifacts;
- credentials;
- costs;
- execution workspaces.

This logical boundary is not enough if the adapter itself uses a broadly privileged credential that can cross unrelated Workspaces.

The provider profile must therefore declare:

- tenant isolation primitive;
- adapter/control identity used per Workspace;
- credential permissions/scope;
- whether one credential can cross multiple client tenants;
- credential rotation/revocation behavior;
- breach/blast-radius expectation.

Preferred production posture is a Workspace-bounded control identity when supported.

If the provider cannot provide acceptable credential scoping, evaluate a stronger deployment boundary such as one provider instance per Workspace before accepting real-client use.

## Runtime capability classes

An adapter publishes a manifest covering **core** and **advanced** capabilities.

### Core workforce capability

Core support may include:

- supported worker runtimes/models;
- bounded single-worker assignment execution;
- session persistence;
- provider-native task state;
- worker-level reviews if available;
- cost/token reporting fidelity;
- secret-delivery model;
- schedule/wakeup support;
- cancellation semantics;
- run/event/log access;
- artifact retrieval;
- API stability/version bounds;
- outage/recovery semantics.

### Advanced parallel-engineering capability

Declare separately:

- isolated workspace/worktree support;
- concurrency semantics;
- dependency-finalization behavior;
- branch/PR integration behavior;
- mutable-resource collision controls;
- parallel worker limits;
- independent integration/verification support.

A provider may pass the core adapter contract while advanced parallel engineering remains unsupported.

Unsupported capabilities must fail validation or require an explicit approved fallback. No silent degradation.

## Events

Normalize external worker events into Workflow OS event/evidence records with fields equivalent to:

- provider;
- external event ID/sequence;
- Workspace/Project/WorkItem/Assignment IDs;
- worker/agent reference;
- run reference;
- event type;
- external/native status;
- normalized assignment status;
- timestamp;
- cost/usage metadata when available;
- artifact/evidence refs;
- error classification;
- sensitivity classification.

External event ingestion must be idempotent.

Provider events that imply material scope/priority/architecture/risk changes should create a proposal/drift signal, not a canonical state mutation.

## Costs

The adapter may supply:

- provider/model;
- input/output/cached tokens;
- billed cost;
- runtime duration;
- external budget state.

Workflow OS normalizes these into Project/WorkItem cost records without assuming identical fidelity across providers.

External budget enforcement can stop the worker, but canonical Workflow OS budget/risk policy remains authoritative.

## Secrets and integration references

Prefer references and least privilege.

Workflow OS stores canonical integration/secret **references and policy**, not raw reusable secret values in Project/WorkItem/WIR/agent instruction artifacts.

The adapter may map a reference to a provider-specific secret binding for a particular worker/run.

The adapter must declare:

- how secrets are stored/resolved;
- adapter/control credential blast radius;
- whether credentials are injected for the whole process or fetched run-bound/on-demand;
- whether each read is auditable;
- how worker-specific grants are enforced;
- how rotation/revocation behaves;
- how logs/evidence are redacted.

A role name is never sufficient authorization for secret access.

## Human approval

Consequential human approval is canonical in Workflow OS.

Provider-native approval/review may be used for execution-level controls and can contribute evidence, but it does not replace Workflow OS approval for:

- production deployment;
- high-impact external side effects;
- material scope/risk acceptance;
- privilege expansion;
- client/business commitments;
- policy-governed exceptions.

Workflow OS should aggregate these consequential approvals into its operator attention/Command Center experience.

## Verification and evidence

An adapter run should provide enough evidence to answer:

- what assignment was attempted;
- which worker/runtime/version performed it;
- which repository/workspace/environment was used;
- what changed;
- which tests/evals/real flows ran;
- costs/duration;
- whether the worker/reviewer reported success;
- what remains uncertain;
- which provider-local child tasks/proposals were created.

An agent/runtime success message is not by itself sufficient evidence.

## Failure and outage behavior

If the external workforce manager is unavailable:

- Workflow OS must still render canonical Project/WorkItem state;
- assignments may become `waiting`/`blocked`/`unknown`, not falsely `complete`;
- no new mutation is retried blindly when outcome is uncertain;
- recovery runs reconciliation before resuming execution;
- provider drift/proposals remain explainable when possible;
- operator can disable/replace the adapter without losing Project truth.

## Version/upgrade policy

For fast-moving providers:

- pin supported versions/ranges;
- run contract tests against the exact deployment;
- require compatibility check before upgrade;
- use only documented supported API/SDK surfaces;
- record adapter and provider versions on runs/evidence;
- fail closed on unknown breaking semantics.

## Initial Paperclip profile to test

Desk research suggests Paperclip may satisfy many core workforce concerns, including:

- tenant/company control plane;
- agent lifecycle/heartbeats;
- Codex/Claude adapters;
- task dependencies/checkout;
- session persistence;
- run logs/events;
- costs/budgets;
- secrets;
- review/approval stages;
- dashboards/decision queue.

Paperclip execution workspaces/worktrees are treated as an **advanced capability** that must be separately proven before parallel coding is enabled.

Paperclip remains a **candidate** until the core spike in `docs/research/paperclip-due-diligence.md` passes. Provider selection is separate from this contract.

## Phase boundary

Phase 1 remains provider-independent.

Phase 1 must prove the canonical Project/WorkItem/WIR/evidence/Command Center slice without requiring Paperclip or another persistent internal-workforce manager.

## Non-goals

This contract does not require Workflow OS to:

- implement a permanent agent org chart;
- expose every provider feature;
- mirror every external issue/task;
- build transcript rendering;
- build remote terminal/screen control;
- let internal agents create unrestricted canonical WorkItems;
- support bidirectional peer-authority synchronization;
- require worktrees before a single bounded worker can be useful;
- use Paperclip specifically.

## Exit condition for adopting a provider

A provider is acceptable only when:

> Workflow OS can replace it without losing the meaning, authorization, evidence, history, or recoverability of the Projects it helped execute.

Parallel engineering additionally requires the advanced capability gates to pass.