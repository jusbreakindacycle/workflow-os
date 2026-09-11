# Phase 1 Acceptance Criteria

Phase 1 proves the local canonical control plane, not full autonomous delivery.

## Local startup / persistence

- [ ] application starts locally using documented steps;
- [ ] canonical state survives restart;
- [ ] core UI/state remains usable with external AI providers disconnected;
- [ ] backup/export path for development data is documented.

## Isolation / hierarchy

- [ ] Workspace is present on every relevant canonical record;
- [ ] an operation scoped to synthetic Workspace A cannot accidentally read/mutate/reference Workspace B records unless the operator intentionally switches/uses B scope;
- [ ] Client/Engagement/Project relationships are explicit;
- [ ] internal Project works without Client/Engagement.

## New Project / discovery / strategy

- [ ] operator can create Project from raw text without repository;
- [ ] `I don't know` remains explicit unknown state;
- [ ] question/answer/proposal/accepted fact are distinguishable;
- [ ] requested solution is stored separately from recommendation;
- [ ] a working delivery strategy is explicitly selected before Project Pack generation;
- [ ] operator approval creates accepted problem/outcome/working-scope version.

## Goal revision

- [ ] material revision creates new ProjectBrief/ProjectRevision rather than rewriting history;
- [ ] impact analysis marks affected WorkItems/approvals/Pack/Assignments stale/superseded/attention-required;
- [ ] unaffected work remains valid when basis is unchanged;
- [ ] stale approved work cannot continue silently.

## Work graph

- [ ] dependencies/readiness are explainable;
- [ ] blocked/failed/needs-attention/stale states are explicit;
- [ ] narrative cannot make ineligible work ready;
- [ ] WorkItem Proposal cannot silently become canonical work.

## Commercial foundation

- [ ] client Project references enough Engagement scope/price/deadline/maintenance context without requiring a full ERP schema;
- [ ] `proposed_to_client` and `client_accepted` are distinguishable;
- [ ] operator approval alone cannot fabricate client acceptance;
- [ ] material scope-change proposal creates Needs My Attention.

## Project Pack / Context Slice

- [ ] Project Pack validates against meaningful schema;
- [ ] malformed requirement/delivery-strategy/work-graph/policy objects are rejected;
- [ ] same canonical versions/config regenerate equivalent Pack;
- [ ] Pack contains no raw reusable secrets;
- [ ] provenance/version visible; material accepted change creates new version/diff;
- [ ] Context Slice contains only authorized WorkItem-relevant fields/refs;
- [ ] mock worker cannot read unrelated client/commercial data through normal Assignment context.

## Assignment / evidence

- [ ] Assignment validates exact WorkItem version, Context Slice, budgets, evidence, side-effect policy, stop/escalation;
- [ ] one mock/manual Assignment transitions created -> running -> execution_finished;
- [ ] Assignment finish does not directly complete WorkItem;
- [ ] evidence/verification can complete/reject WorkItem;
- [ ] failed verification keeps/reopens incomplete state.

## Spend

- [ ] synthetic metered route/action cannot start without approved SpendEnvelope;
- [ ] envelope has bounded purpose/amount;
- [ ] expansion requires new approval;
- [ ] unknown cost is not silently zero.

## Command Center

- [ ] portfolio derives phase/status/health from canonical data;
- [ ] Needs My Attention shows unresolved decision/approval/spend/scope/failure/stale items;
- [ ] Activity Feed derives from events/source records;
- [ ] next-ready work is dependency/version/policy aware;
- [ ] operator understands state without worker transcript.

## Provider independence

- [ ] no specific provider identifier is required in core Project semantics;
- [ ] provider mappings/connections are separate from Project meaning;
- [ ] provider outage/unconfigured state does not corrupt Project state.

Operational portability across two real providers is a later-phase test, not a Phase 1 claim.

## Security / reliability

- [ ] untrusted content cannot grant scope/tool/spend/approval authority in fixtures;
- [ ] raw secrets are rejected/redacted from Pack/Context fixtures;
- [ ] mutations use version/idempotency controls where applicable;
- [ ] restart/recovery does not falsely complete in-flight Assignment;
- [ ] public fixtures contain synthetic data only.

## Exit evidence

A Phase 1 completion report links every criterion to reproducible evidence. Screenshot alone is insufficient when machine-checkable proof is feasible.
