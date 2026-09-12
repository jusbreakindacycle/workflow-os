# Phase 3.0 — Golden Path Contract Acceptance Criteria

Phase 3.0 is a specification gate. Passing this phase means the first Phase 3 end-to-end Project has an explicit, testable contract before an implementation worker receives real local filesystem or command authority.

## A. Canonical test case

- [ ] The repository contains one canonical synthetic client request for the first end-to-end certification.
- [ ] The request preserves the client's requested website/contact-form solution without treating that solution as canonical truth.
- [ ] `custom_build` is documented as the expected strategy only if discovery/challenge evidence supports it; it is not hard-coded as an input to strategy selection.
- [ ] The final synthetic outcome is specific enough to verify locally.
- [ ] The case requires no real client/customer data, production environment, ad spend, messaging, or external business side effect.

## B. Discovery and unknown handling

- [ ] The contract defines what makes a discovery question material.
- [ ] Material questions are tied to outcome, strategy, scope, acceptance, architecture/integration, privacy/data, risk/authority, spend, deadline/commitment, or verification.
- [ ] The system is explicitly forbidden from asking questions merely because a static role/template contains them.
- [ ] `I don't know` remains a valid response.
- [ ] Unknowns remain explicit and cannot be silently converted into facts.
- [ ] Bounded assumptions are permitted only when they do not create material scope/client/risk/spend/production commitments.

## C. Research and challenge

- [ ] Research is conditional on a material external factual dependency.
- [ ] The contract permits an explicit `research_not_required`/equivalent outcome with rationale.
- [ ] Challenge behavior preserves requested solution separately from inferred problem/outcome.
- [ ] Challenge behavior tests whether a simpler/non-code strategy can satisfy the outcome.
- [ ] Delivery strategy is justified by evidence and accepted canonical state rather than coding-agent availability.

## D. Dynamic workforce

- [ ] Logical roles are defined as capabilities rather than permanent AI employees.
- [ ] Role/capability activation is WorkItem-driven.
- [ ] The contract forbids activating all roles by default.
- [ ] One eligible worker may satisfy multiple compatible capabilities when independence is not required.
- [ ] Independent verification remains an explicit route/evidence property and cannot be inferred from different prompt names.

## E. Work graph

- [ ] WorkItems are generated from the accepted Project Brief and selected delivery strategy rather than a universal software template.
- [ ] Every generated WorkItem must define outcome, dependencies, accepted inputs, acceptance condition, evidence, risk/action class, authority requirement, capability requirement, verification requirement, and stop/escalation conditions.
- [ ] The custom-build path covers definition/planning, local execution workspace, implementation, deterministic verification, actual local user flow, independent review, repair where needed, and delivery reconciliation unless evidence justifies combining/omitting a step.
- [ ] Material newly discovered work becomes a proposal according to existing canonical rules rather than silently expanding the graph.

## F. Project Pack and Context Slice

- [ ] The Project Pack contract includes accepted outcome, strategy/rationale, requirements/non-goals, architecture/plan refs, work graph/version, verification, authority constraints, execution-workspace policy, and escalation.
- [ ] Context Slices remain minimum-authorized Assignment projections.
- [ ] Synthetic/project/repository text is explicitly treated as untrusted data and cannot grant tool/authority rights.
- [ ] Raw reusable secrets remain excluded.

## G. Governed Execution Workspace isolation

- [ ] A dedicated per-Project local execution workspace is defined.
- [ ] Its root is selected/configured by Workflow OS/operator policy rather than arbitrary model choice.
- [ ] File operations must remain under the authorized workspace root.
- [ ] Path traversal is rejected.
- [ ] Symlink/junction/realpath escape is rejected.
- [ ] Parent-directory/absolute-path escape is rejected.
- [ ] Unrelated repositories, home directories, credential stores, Workflow OS secrets, and external mounted locations are outside the authorized filesystem surface.
- [ ] Workspace reset/recovery is defined before deletion/mutation authority is enabled.

## H. Local authority vs shared-remote authority

- [ ] Bounded local workspace writes are classified separately from shared-remote repository mutation.
- [ ] The contract allows an explicit bounded Project/Assignment policy to pre-authorize ordinary R1 local edits/test commands so the operator is not asked for every file mutation.
- [ ] Local workspace authority cannot authorize GitHub repository creation, push, merge, or other shared-remote mutation.
- [ ] Shared-remote mutation remains subject to exact Phase 2.2 subject/version/bounds authority and use-time revalidation.
- [ ] Production/deployment authority remains out of scope for the first golden path.

## I. Command/tool authority

- [ ] Command execution is deny-by-default.
- [ ] Allowed commands are represented as explicit capability/classes, not unrestricted shell authority.
- [ ] Initial allowed classes cover only the project bootstrap/runtime/test/local-flow/cleanup actions needed by the case.
- [ ] Privilege elevation is explicitly forbidden.
- [ ] Host/system configuration mutation is explicitly forbidden.
- [ ] Shell-profile edits and credential-store access are explicitly forbidden.
- [ ] Package publishing and git push/remote mutation are explicitly forbidden.
- [ ] Production/cloud deployment and external messaging are explicitly forbidden.
- [ ] Destructive recursive deletion outside the workspace is explicitly forbidden.
- [ ] Tool/command failure cannot cause automatic authority widening.

## J. Network boundary

- [ ] Local loopback traffic for exercising the generated application is explicitly permitted when required.
- [ ] External network access is network-minimal and separately governed.
- [ ] Dependency installation, if required later, must be bounded, observable, and subject to package-source policy.
- [ ] The certification application is forbidden from contacting real Meta/ads, CRM, email, SMS, analytics, or client endpoints.
- [ ] No network response is allowed to grant new authority.

## K. Process lifecycle

- [ ] Spawned processes are attributable to an Assignment/execution run.
- [ ] Process records/evidence include command class, working directory, start time, timeout/lease where applicable, logs/output reference, exit/stop state, and cleanup behavior.
- [ ] The worker cannot kill unrelated host processes.
- [ ] Hidden orphan/long-running processes are not accepted as successful cleanup.

## L. Synthetic project implementation outcome

The later end-to-end certification must prove all of the following observable behavior:

- [ ] locally runnable project artifact/files exist;
- [ ] synthetic offer can be viewed;
- [ ] synthetic lead form can be completed;
- [ ] required-field/obvious-invalid-input validation works;
- [ ] valid synthetic submission reaches a local/synthetic receiver or store;
- [ ] user receives an observable success state;
- [ ] no real customer/client data or secrets are present;
- [ ] deterministic checks pass;
- [ ] actual local lead-submission flow passes;
- [ ] independent verifier passes the accepted criteria.

## M. Verification evidence

- [ ] Agent/provider `success` is explicitly insufficient for completion.
- [ ] L1 structural/static evidence is required where applicable.
- [ ] L2 automated behavior evidence is required.
- [ ] L3 actual local user-flow evidence is required.
- [ ] Independent verifier review is required for final certification.
- [ ] L4 external-business reconciliation is explicitly not required for this synthetic/local first path.
- [ ] Verification evidence references exact Project/Brief/WorkItem/Assignment/Project Pack versions as applicable.
- [ ] Worker output cannot claim independent verification already passed.

## N. Retry and escalation

- [ ] Retry is bounded by iteration/time/tool/cost limits.
- [ ] Retry addresses classified failure instead of blindly repeating the same prompt.
- [ ] Missing/stale authority stops execution.
- [ ] Material scope change becomes a proposal/decision instead of autonomous repair.
- [ ] No eligible independent verifier causes a visible stop/escalation.
- [ ] Harness/environment insufficiency produces a harness-improvement item rather than infinite prompt expansion.
- [ ] Paid execution without valid SpendEnvelope stops.
- [ ] External/production action outside Phase 3 bounds stops.

## O. Final delivery definition

- [ ] Delivery requires an accepted Project Brief/version.
- [ ] Delivery includes selected strategy and rationale.
- [ ] Delivery includes final work graph/completion state.
- [ ] Delivery includes governed execution workspace identity/reference.
- [ ] Delivery includes locally runnable artifact/files.
- [ ] Delivery includes deterministic verification evidence.
- [ ] Delivery includes successful local synthetic flow evidence.
- [ ] Delivery includes independent verifier pass.
- [ ] Delivery includes repair history when applicable.
- [ ] Delivery includes known limitations/non-goals and remaining human action.
- [ ] Command Center can explain the outcome/evidence/next action from canonical state.
- [ ] GitHub URL, production deployment URL, real lead delivery, or ad-performance evidence are explicitly not required for the first certification.

## P. Phase decomposition and scope control

- [ ] Phase 3.0 remains contract/spec work only.
- [ ] Phase 3.1 is reserved for adaptive discovery/challenge/strategy implementation.
- [ ] Phase 3.2 is reserved for dynamic workforce/work-graph implementation.
- [ ] Phase 3.3 is reserved for governed local execution workspace implementation.
- [ ] Phase 3.4 is reserved for verification/repair/delivery implementation.
- [ ] Phase 3.5 is reserved for full end-to-end certification.
- [ ] No empty Phase 3.1–3.5 placeholder plan/review documents are required during Phase 3.0.
- [ ] Phase 3.0 does not introduce Paperclip, Activepieces, production deployment, remote GitHub mutation, or broad tool authority.

## Q. Canonical documentation consistency

- [ ] `README.md`, `AGENTS.md`, `ARCHITECTURE.md`, roadmap, and Phase 3.0 plan do not contradict the fact that Phase 2.1 has already passed representative live provider certification and Phase 2.2 is complete.
- [ ] Documentation identifies Phase 3 as the current product phase after Phase 2.2.
- [ ] Phase 3.0 is linked from the documentation index.

## Phase 3.0 exit gate

Phase 3.0 passes when reviewers can answer, without relying on hidden chat context:

1. what raw request starts the first certification;
2. how strategy is derived rather than preselected;
3. what the AI may ask/research/challenge;
4. how work/roles are generated;
5. what exact local files/commands/network/processes an implementation worker may touch;
6. how that authority differs from GitHub/shared-remote authority;
7. what observable evidence proves implementation;
8. what the verifier receives and how repair is bounded;
9. what counts as delivered;
10. what remains explicitly out of scope.

Only after this gate is accepted should Phase 3.1 implementation begin.
