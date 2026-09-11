# Phase 1 Acceptance Criteria

Phase 1 proves the local canonical control plane, not full autonomous delivery.

## Local startup / persistence

- [ ] application/control plane starts locally using documented steps;
- [ ] canonical state survives restart;
- [ ] core UI/state remains usable with external AI providers disconnected;
- [ ] backup/export path for development data is documented.

## Isolation / hierarchy

- [ ] Workspace is present on every relevant canonical record;
- [ ] at least two synthetic Workspaces cannot access each other's records through application authorization;
- [ ] Client/Engagement/Project relationships are explicit;
- [ ] internal Project works without Client/Engagement.

## New Project / discovery

- [ ] operator can create Project from raw text without a repository;
- [ ] `I don't know` remains explicit unknown state;
- [ ] question/answer/proposal/accepted fact are distinguishable;
- [ ] operator approval creates an accepted problem/outcome/working-scope version.

## Goal revision

- [ ] material revision creates a new accepted ProjectBrief/ProjectRevision version instead of rewriting history;
- [ ] impact analysis marks affected WorkItems/approvals/Pack/Assignments stale/superseded/attention-required as applicable;
- [ ] unaffected work remains valid when its basis is unchanged;
- [ ] stale approved work cannot continue silently.

## Work graph

- [ ] WorkItems support dependencies/explainable readiness;
- [ ] blocked/failed/needs-attention/stale states are explicit;
- [ ] narrative status cannot make ineligible work ready;
- [ ] WorkItem Proposal cannot silently become canonical work.

## Commercial foundation

- [ ] client Project can reference Engagement scope/price/deadline/maintenance placeholders;
- [ ] `proposed_to_client` and `client_accepted` are distinguishable;
- [ ] operator approval alone cannot fabricate client acceptance;
- [ ] material scope-change proposal creates Needs My Attention.

## Project Pack / Context Slice

- [ ] Project Pack validates against a structurally meaningful schema;
- [ ] malformed requirement/work-graph/policy objects are rejected;
- [ ] same canonical input/version/config regenerates equivalent Project Pack;
- [ ] Pack contains no raw reusable secrets;
- [ ] Pack provenance/version is visible and material accepted change creates a new version/diff;
- [ ] Context Slice contains only authorized WorkItem-relevant fields/artifact refs;
- [ ] mock worker cannot read unrelated client/commercial data through normal Assignment context.

## Assignment / evidence

- [ ] AgentAssignment validates exact WorkItem version, Context Slice, budgets, evidence, side-effect policy, and stop/escalation fields;
- [ ] one mock/manual Assignment transitions created -> running -> execution_finished;
- [ ] Assignment finish does not directly complete WorkItem;
- [ ] evidence/verification can complete or reject WorkItem;
- [ ] failed verification keeps/reopens incomplete state.

## Spend

- [ ] synthetic metered route/action cannot start without approved SpendEnvelope;
- [ ] envelope has bounded purpose/amount;
- [ ] exceeding/expanding envelope requires new approval;
- [ ] unknown cost is not silently treated as zero.

## Command Center

- [ ] portfolio derives phase/status/health from canonical data;
- [ ] Needs My Attention shows unresolved decision/approval/spend/scope/failure/stale items;
- [ ] Activity Feed derives from events and links source records;
- [ ] next-ready WorkItem is dependency/policy aware;
- [ ] operator understands Project state without agent transcript.

## Provider independence

- [ ] no specific provider identifier is required in core Project semantics;
- [ ] provider mappings/connections are separate concepts from canonical Project meaning;
- [ ] provider outage/unconfigured state does not corrupt canonical Project state.

Operational portability across two real providers is a later-phase test, not a Phase 1 claim.

## Security/reliability

- [ ] untrusted content cannot grant scope/tool/spend/approval authority in fixtures;
- [ ] raw secrets are rejected/redacted from Pack/Context fixtures;
- [ ] mutations use version/idempotency controls where applicable;
- [ ] restart/recovery does not falsely complete in-flight Assignment;
- [ ] public fixtures contain synthetic data only.

## Exit evidence

A Phase 1 completion report links every criterion to reproducible evidence. A screenshot alone is insufficient when a machine-checkable test is feasible.
