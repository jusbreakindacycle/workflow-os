# Phase 3.0 — Golden Path and Governed Execution Contract

## Objective

Define the complete contract for Workflow OS's first end-to-end delivery proof before enabling an AI worker to mutate a real project workspace.

Phase 3.0 is specification-first. It does not add a repository-writing agent, remote GitHub mutation, deployment, external messaging, paid execution, or production authority.

The phase answers two questions before implementation begins:

1. What exactly counts as Workflow OS successfully delivering one realistic project from a raw request?
2. Under what bounded authority may an AI worker operate a real local project workspace without turning the operator into its terminal, test runner, or manual prompt router?

The target is not merely to prove that models can call one another. Phase 2/2.1 already proved representative real worker execution, independent verification, free-first routing, and provider portability. Phase 3 must prove a governed delivery lifecycle.

## Canonical certification case

Use one synthetic client request representing a realistic solo-builder engagement.

### Raw client request

> "I'm running Facebook/Instagram ads for my business. I need somewhere prospects can see the offer, enter their details, and let us follow up. I was thinking of a simple website with a contact form."

The request intentionally contains both a desired business outcome and a requested solution.

Workflow OS must preserve the requested solution but must not treat `custom_build` as pre-authorized truth.

The system must independently determine whether the request is best addressed by process change, adoption/configuration, integration, automation, custom build, hybrid, pilot, or defer. For this controlled certification case, `custom_build` is the expected strategy only if discovery/challenge evidence supports it.

## Golden-path proof

The intended certification flow is:

```text
raw synthetic client request
-> preserve requested solution
-> identify material unknowns
-> ask only consequential discovery questions
-> research only when a material factual dependency exists
-> challenge requested solution and assumptions
-> define accepted problem / outcome / constraints / success
-> select delivery strategy from evidence
-> operator accepts or revises the resulting brief when required
-> generate case-specific WorkItems and dependencies
-> activate only necessary logical roles/capabilities
-> generate Project Pack + minimum-authorized Context Slices
-> request bounded authority for a governed local execution workspace
-> worker creates/modifies project files inside that workspace
-> worker runs only allowed local commands/tools
-> worker starts and exercises the local application
-> deterministic checks and real local synthetic user flow run
-> independent verifier attempts to falsify completion
-> bounded repair/retry loop if verification fails
-> canonical WorkItems complete only after required verification
-> final evidence bundle is produced
-> Command Center explains outcome, evidence, failures, decisions, remaining risks, and next action
```

The certification is valid only from canonical Workflow OS records and observable artifacts. Agent/provider self-report is not sufficient evidence.

## What the synthetic project must accomplish

The resulting project is a small lead-generation experience suitable for a synthetic advertising campaign.

Minimum accepted outcome:

- a locally runnable project exists in the governed execution workspace;
- a visitor can view a clear synthetic offer;
- a visitor can enter synthetic lead details through a form;
- input validation handles required fields and obvious invalid input;
- a successful submission reaches a local/synthetic receiver or local test store;
- the user receives an observable success state;
- the implementation contains no real client/customer data or secrets;
- deterministic checks pass;
- the relevant local user flow is exercised successfully;
- an independent verifier passes the accepted requirements and evidence;
- the Command Center can explain what happened without reconstructing model chats.

The purpose is to prove governed delivery, not visual sophistication or marketing performance.

## Explicit Phase 3.0 non-goals

Phase 3.0 does not implement or authorize:

- real GitHub repository creation, push, merge, or shared-remote mutation;
- production deployment;
- Meta/Facebook/Instagram API integration;
- real advertising spend;
- real customer/client data;
- real email, SMS, CRM, or public/client messaging;
- metered/paid model or cloud execution without an existing applicable SpendEnvelope;
- broad or unrestricted shell access;
- destructive host actions;
- credential creation or permission widening;
- arbitrary network access by a coding worker;
- worker self-approval or self-certification;
- static activation of every possible AI role;
- Paperclip or Activepieces adoption solely to satisfy the certification case.

## Discovery contract

Phase 3 must move beyond a fixed questionnaire while preserving deterministic safety boundaries.

A discovery question is material only when its answer may change one or more of:

- accepted problem or desired outcome;
- delivery strategy;
- meaningful scope or non-goals;
- success/acceptance criteria;
- data/privacy classification;
- architecture or required external integration;
- risk tier or authority requirement;
- spend requirement;
- deadline/client commitment;
- verification method.

The system should not ask questions merely because a role template contains them.

`I don't know` remains a valid answer. Unknowns must be represented explicitly rather than invented.

The system may proceed with a bounded assumption only when policy permits it and the assumption cannot create a material client, risk, spend, or production commitment. The assumption and its impact must remain visible.

## Research/challenge contract

Research is conditional, not ceremonial.

The system should research only when an external factual dependency could materially change strategy, scope, compliance, integration feasibility, risk, or acceptance.

For the synthetic lead-generation case, research may legitimately be skipped if no such dependency exists. A valid outcome is an explicit canonical record such as `research_not_required` with rationale.

Challenge behavior must distinguish:

- what the client explicitly requested;
- what problem/outcome the request appears to target;
- what assumptions are present;
- whether a simpler/non-code solution can satisfy the outcome;
- why the chosen strategy is justified.

The model may recommend a strategy. Canonical acceptance follows existing authority and brief/version semantics.

## Dynamic workforce contract

Roles are logical capabilities, not permanent AI employees.

Available capabilities may include:

- discovery/requirements;
- research;
- product/UX reasoning;
- architecture/planning;
- implementation;
- QA/verification;
- security/reliability;
- adversarial review;
- documentation;
- deployment/operations when later applicable.

A role/capability activates only when a WorkItem requires it and an eligible Assignment/runtime route exists.

The system must not spawn every role by default. Several capabilities may be fulfilled sequentially by one eligible worker when independence policy does not require separation.

Verification independence must remain explicit where required; naming two prompts differently does not create independence.

## Work graph contract

The Phase 3 work graph is generated from the accepted Project Brief and chosen delivery strategy rather than hard-coded as a universal software template.

For the expected `custom_build` path, the graph will normally need work covering:

- execution-ready definition;
- implementation plan/architecture proportional to scope;
- local execution workspace preparation;
- implementation;
- deterministic verification;
- real local synthetic user-flow verification;
- independent review;
- repair/retry when required;
- final delivery/evidence reconciliation.

Actual WorkItems must be generated from case state and may combine or omit steps when evidence shows they are unnecessary.

Every WorkItem must define at least:

- bounded outcome;
- dependencies;
- accepted inputs/refs;
- acceptance condition;
- required evidence;
- risk tier/action class;
- authority requirement;
- capability requirement;
- verification requirement;
- stop/escalation conditions.

## Project Pack and Context Slice contract

The Project Pack remains a deterministic case-specific projection of accepted canonical state.

For Phase 3 it must be sufficient to explain:

- accepted problem/outcome;
- chosen delivery strategy and rationale reference;
- requirements and non-goals;
- architecture/plan refs appropriate to the case;
- current work graph/version;
- verification contract;
- risk/authority constraints;
- governed execution workspace policy;
- escalation conditions.

A Context Slice remains minimum-authorized Assignment context.

A worker does not receive the whole Project/Engagement merely because the data exists. Synthetic certification content is still treated as untrusted project input and cannot grant authority.

## Governed Execution Workspace

### Purpose

The Governed Execution Workspace is the first real environment in which an authorized implementation worker may create/edit project files and exercise the resulting local application.

It is not the Workflow OS source repository and is not a shared remote repository.

### Isolation

The first implementation must use a dedicated per-Project local workspace rooted in an explicitly configured parent directory controlled by Workflow OS.

A worker must not be able to choose an arbitrary host path.

The runtime must resolve and validate all file targets against the workspace root and reject path traversal, symlink escape, parent-directory escape, or mutation outside authorized roots.

### Initial authority class

The first golden path treats bounded local workspace mutation as R1 isolated/reversible execution when all of the following are true:

- target is a dedicated synthetic Project workspace;
- no real client/private data is present;
- no shared remote state is mutated;
- destructive host actions are unavailable;
- rollback/reset is possible;
- network/tool policy is bounded;
- an explicit Assignment/policy pre-authorizes that action class.

One bounded operator approval/policy grant may authorize the execution workspace for the Project. The operator must not approve every individual file edit or ordinary local test command.

Shared GitHub creation/push/merge remains a distinct R2 repository-mutation action requiring exact current authority under the Phase 2.2 contract. Local workspace authority must never be reused as remote repository authority.

### Allowed file operations

Subject to the active Assignment and workspace policy, a worker may be allowed to:

- create files/directories inside the workspace;
- read files inside the workspace;
- update files inside the workspace;
- delete generated project files only when deletion is within explicit assignment bounds and recovery/reset is available;
- inspect diffs/metadata needed for verification.

It may not read or write arbitrary host paths, Workflow OS secrets, unrelated repositories, home-directory files, credential stores, or external mounted locations.

### Command/tool policy

Command execution is deny-by-default and capability-scoped.

An execution workspace policy must specify the allowed command classes rather than grant open shell authority. Initial classes may include:

- package/project bootstrap using an approved runtime/toolchain;
- dependency installation subject to package/network policy;
- formatting/lint/type/static checks;
- deterministic tests;
- local development server start/stop;
- local HTTP/UI flow invocation;
- local process/status/log inspection;
- cleanup/reset of the dedicated workspace.

Explicitly disallowed in the first golden path include:

- privilege elevation;
- host/system configuration changes;
- arbitrary process killing outside spawned workspace processes;
- shell profile edits;
- credential-store access;
- package publishing;
- git push/remote mutation;
- production/cloud deployment;
- external messaging;
- arbitrary network tooling unrelated to approved dependency/runtime needs;
- recursive deletion outside the workspace.

### Network policy

The first golden path should be network-minimal.

Allowed network access must be separately classified. Local loopback traffic needed to exercise the application is permitted inside the workspace policy. Dependency installation, when implementation requires it, must be explicit, observable, bounded, and subject to package-source policy.

The certification application itself must not contact real advertising, CRM, email, SMS, analytics, or client endpoints.

### Process lifecycle

Every spawned process must be attributable to an Assignment/execution run and have:

- command/class reference;
- working directory;
- start time;
- timeout/lease where applicable;
- stdout/stderr/log reference;
- exit/stop state;
- cleanup behavior.

A worker may not leave hidden long-running processes after the Assignment completes or fails.

### Workspace evidence

Consequential local implementation attempts must produce enough evidence to reconstruct what happened without model private reasoning, including as applicable:

- workspace identity/root reference;
- Assignment/WorkItem/Project Pack/brief versions;
- files changed or artifact manifest;
- allowed command classes used;
- command/test exit results;
- application readiness result;
- local real-flow evidence;
- cleanup/reset result;
- verifier findings;
- known limitations and escalation.

## Implementation acceptance contract

The coding worker is not complete merely because files were generated.

For the synthetic project, implementation must satisfy the accepted requirements and leave a reproducibly runnable local artifact.

The execution harness must let an unfamiliar authorized worker determine from durable state/repository guidance:

- exact objective;
- authoritative contracts;
- bootstrap/install procedure;
- start/readiness procedure;
- relevant feature/user path;
- log/error inspection path;
- deterministic verification commands;
- local real-flow procedure;
- evidence capture method;
- cleanup/reset procedure;
- stop/escalation conditions.

If the operator repeatedly has to run commands or inspect errors for the worker, Phase 3 has not met the agent-operability objective.

## Verification contract

The first golden path requires multiple evidence layers rather than one model judgment.

Minimum expected evidence for the final implementation:

- L1 structural/static evidence where applicable;
- L2 deterministic automated behavior checks;
- L3 exercise of the actual local lead-submission flow;
- independent verifier review of the accepted requirements and evidence.

L4 external/business reconciliation is intentionally not required because the first certification has no real external business side effect.

The verifier must receive the accepted requirements, candidate artifact/evidence, and permitted verification context. It must not depend on the implementer's private reasoning.

Provider/runtime success is never sufficient for canonical completion.

## Worker -> verifier evidence contract

The worker returns candidate output and evidence references. It must not claim that independent verification already passed.

The verifier returns a bounded pass/fail judgment with findings tied to accepted criteria.

Workflow OS then reconciles that result into canonical WorkItem state.

```text
worker execution
-> candidate files/artifacts + observable evidence
-> canonical execution record
-> verifier receives accepted criteria + candidate/evidence
-> verifier pass/fail
-> canonical verification record
-> complete | repair | escalate
```

## Failure, retry, and escalation contract

Retries are bounded and must address a classified failure rather than repeat the same prompt blindly.

A retry may occur when:

- implementation is incomplete;
- deterministic tests fail;
- local user flow fails;
- verifier identifies a repairable defect;
- a provider/runtime route fails and another eligible route exists.

The loop must stop/escalate when:

- iteration/time/tool budget is exhausted;
- required authority is missing/stale;
- requested repair would materially change accepted scope;
- no eligible independent verifier remains;
- required provider/tool capability is unavailable;
- the failure indicates the harness/environment itself is insufficient;
- paid execution would be required without valid SpendEnvelope;
- external/production action would be required outside Phase 3 bounds.

Repeated environment/tool failures should produce a harness improvement item rather than an indefinitely longer prompt.

## Final deliverable contract

The first Phase 3 Project counts as delivered only when Workflow OS can present a canonical delivery record containing or referencing:

- accepted Project Brief/version;
- selected delivery strategy and rationale;
- final work graph and completed WorkItems;
- governed execution workspace identity;
- locally runnable project artifact/files;
- deterministic verification evidence;
- successful local synthetic lead-flow evidence;
- independent verifier pass;
- bounded repair history if applicable;
- final evidence bundle;
- known limitations/non-goals;
- remaining human action, if any;
- Command Center state explaining the project outcome.

No deployment URL, GitHub repository, real lead delivery, or advertising result is required for this first certification.

## Phase 3 decomposition after this contract

Phase 3 remains one product phase with explicit implementation subphases:

### Phase 3.1 — Adaptive Discovery / Challenge / Strategy

Implement AI-assisted material-unknown discovery, conditional research/challenge, and evidence-backed strategy recommendation/acceptance.

### Phase 3.2 — Dynamic Workforce / Work Graph

Implement case-specific role/capability activation, WorkItem decomposition/dependencies, capability/risk/evidence requirements, and assignment routing requirements.

### Phase 3.3 — Governed Local Execution Workspace

Implement the bounded local filesystem/command/process/runtime capability defined here. Do not begin with shared GitHub mutation.

### Phase 3.4 — Verification / Repair / Delivery

Implement deterministic checks, local real-flow verification, independent verifier execution, bounded correction, evidence reconciliation, and final delivery state.

### Phase 3.5 — End-to-End Certification

Run the canonical synthetic client Project from raw request through verified local deliverable with minimal operator coordination.

Subphase-specific plan/review documents should be created when those implementations begin. Phase 3.0 should not create empty placeholder documents for work that has not started.

## Phase 3.0 exit condition

Phase 3.0 is complete when the repository has one coherent, reviewable contract that answers:

- what the first raw request is;
- how discovery/challenge/strategy selection behave;
- what counts as material unknown/research;
- how roles/work graph are generated;
- what Project Pack/Context Slice must contain;
- exactly where a worker may write;
- exactly what command/network/process authority it may receive;
- how local authority differs from shared remote authority;
- what evidence must be captured;
- what verification levels are required;
- how retries/escalations stop;
- what counts as final delivery;
- what remains explicitly synthetic/local/out of scope.

Only after this contract is accepted should Phase 3.1 implementation begin.
