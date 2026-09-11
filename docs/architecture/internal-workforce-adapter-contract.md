# Internal Workforce Adapter Contract

**Status:** Proposed — research outcome, not yet an accepted runtime choice

## Purpose

Workflow OS needs a provider-neutral boundary for systems that coordinate and execute the operator's **internal AI delivery workforce**.

An internal workforce manager is not the same thing as:

- a business workflow execution engine;
- one client-facing AI Employee runtime;
- one direct model call;
- the canonical Workflow OS Project/WorkItem state machine.

Candidate implementations may include Paperclip or a smaller direct-runtime implementation.

## Architectural rule

> Workflow OS owns canonical delivery state. An Internal Workforce Adapter executes bounded internal AgentAssignments and reports normalized evidence/state back.

The adapter must never silently become the source of truth for:

- Workspace/client identity;
- Project lifecycle;
- WorkItem acceptance/completion;
- WIR;
- business risk/authorization;
- production deployment/incident state;
- client-facing AI Employee role semantics.

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

`execution_finished` means the worker claims/appears to have finished execution and evidence is ready for Workflow OS evaluation.

It does **not** mean the canonical WorkItem is accepted complete.

## Acceptance separation

```text
Agent/runtime execution
      -> execution_finished
      -> evidence collected
      -> verification / policy checks
      -> accepted OR changes required / failed / escalated
```

The canonical WorkItem transitions only according to Workflow OS rules.

An adapter may run independent review stages, but those reviews are evidence unless an explicit compatibility policy proves they satisfy the required Workflow OS acceptance contract.

## External identifier mapping

Store stable mappings equivalent to:

- provider type/version;
- external tenant/company ID;
- external project ID;
- external worker/agent ID;
- external task/issue ID;
- external run/session ID;
- external execution workspace ID when applicable;
- last reconciliation cursor/version.

Mappings are metadata. They do not replace Workflow OS identifiers.

## Idempotency and reconciliation

Every mutating operation must support or emulate idempotency.

The adapter must handle:

- create retry after timeout;
- duplicated external event;
- stale/out-of-order event;
- assignment already running;
- external task manually edited;
- external task missing/deleted;
- external worker paused/terminated;
- external system restart;
- partial result/evidence retrieval;
- unknown side effect.

Reconciliation must return a normalized result such as:

- `consistent`;
- `external_ahead`;
- `workflow_os_ahead`;
- `conflict`;
- `missing_external`;
- `unknown`.

Conflicts must become visible state, never be auto-hidden.

## Tenant isolation

The adapter must declare its tenant/isolation primitive.

For a Paperclip candidate, the default mapping to test is:

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

## Runtime capability manifest

An adapter publishes a manifest covering:

- adapter/version;
- supported worker runtimes/models;
- session persistence;
- task hierarchy/dependencies;
- isolated workspace/worktree support;
- concurrency semantics;
- review/approval support;
- cost/token reporting fidelity;
- secret-delivery model;
- schedule/wakeup support;
- cancellation semantics;
- run/event/log access;
- artifact retrieval;
- external API stability/version bounds;
- known unsupported semantics.

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

## Costs

The adapter may supply:

- provider/model;
- input/output/cached tokens;
- billed cost;
- runtime duration;
- external budget state.

Workflow OS normalizes these into Project/WorkItem cost records without assuming identical fidelity across providers.

External budget enforcement can stop the worker, but canonical Workflow OS budget/risk policy remains authoritative.

## Secrets

Prefer references and least privilege.

The adapter must declare:

- how secrets are stored/resolved;
- whether credentials are injected for the whole process or fetched run-bound/on-demand;
- whether each read is auditable;
- how worker-specific grants are enforced;
- how rotation/revocation behaves.

Raw reusable secrets must not be embedded in Project, WorkItem, WIR, or agent instruction artifacts.

## Verification and evidence

An adapter run should provide enough evidence to answer:

- what assignment was attempted;
- which worker/runtime/version performed it;
- which repository/workspace/environment was used;
- what changed;
- which tests/evals/real flows ran;
- costs/duration;
- whether the worker/reviewer reported success;
- what remains uncertain.

An agent/runtime success message is not by itself sufficient evidence.

## Failure and outage behavior

If the external workforce manager is unavailable:

- Workflow OS must still render canonical Project/WorkItem state;
- assignments may become `waiting`/`blocked`/`unknown`, not falsely `complete`;
- no new mutation is retried blindly when outcome is uncertain;
- recovery runs reconciliation before resuming execution;
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

Desk research suggests Paperclip may satisfy:

- tenant/company control plane;
- agent lifecycle/heartbeats;
- Codex/Claude adapters;
- task dependencies/checkout;
- execution workspaces/worktrees;
- session persistence;
- run logs/events;
- costs/budgets;
- secrets;
- review/approval stages;
- dashboards/decision queue.

It remains a **candidate** until the spike in `docs/research/paperclip-due-diligence.md` passes.

## Non-goals

This contract does not require Workflow OS to:

- implement a permanent agent org chart;
- expose every provider feature;
- mirror every external issue/task;
- build transcript rendering;
- build remote terminal/screen control;
- let internal agents create unrestricted canonical WorkItems;
- use Paperclip specifically.

## Exit condition for adopting a provider

A provider is acceptable only when:

> Workflow OS can replace it without losing the meaning, authorization, evidence, history, or recoverability of the Projects it helped execute.
