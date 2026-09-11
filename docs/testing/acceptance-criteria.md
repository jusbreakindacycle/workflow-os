# Phase 1 Acceptance Criteria

Phase 1 proves the local canonical control plane, not full autonomous delivery.

All criteria below have reproducible implementation/test evidence in the current Phase 1 completion PR. The gate is formally exited when that PR is green and merged. See `docs/reviews/phase-1-completion-report.md` for the evidence map.

## Local startup / persistence

- [x] application starts locally using documented steps;
- [x] canonical state survives restart;
- [x] core UI/state remains usable with external AI providers disconnected;
- [x] backup/export path for development data is documented.

## Isolation / hierarchy

- [x] Workspace is present on every relevant canonical record;
- [x] an operation scoped to synthetic Workspace A cannot accidentally read/mutate/reference Workspace B records unless the operator intentionally switches/uses B scope;
- [x] Client/Engagement/Project relationships are explicit;
- [x] internal Project works without Client/Engagement.

## New Project / discovery / strategy

- [x] operator can create Project from raw text without repository;
- [x] `I don't know` remains explicit unknown state;
- [x] question/answer/proposal/accepted fact are distinguishable;
- [x] requested solution is stored separately from recommendation;
- [x] a working delivery strategy is explicitly selected before Project Pack generation;
- [x] operator approval creates accepted problem/outcome/working-scope version.

## Goal revision

- [x] material revision creates new ProjectBrief/ProjectRevision rather than rewriting history;
- [x] impact analysis marks affected WorkItems/approvals/Pack/Assignments stale/superseded/attention-required;
- [x] unaffected work remains valid when basis is unchanged;
- [x] stale approved work cannot continue silently.

## Work graph

- [x] dependencies/readiness are explainable;
- [x] blocked/failed/needs-attention/stale states are explicit;
- [x] narrative cannot make ineligible work ready;
- [x] WorkItem Proposal cannot silently become canonical work.

## Commercial foundation

- [x] client Project references enough Engagement scope/price/deadline/maintenance context without requiring a full ERP schema;
- [x] `proposed_to_client` and `client_accepted` are distinguishable;
- [x] operator approval alone cannot fabricate client acceptance;
- [x] material scope-change proposal creates Needs My Attention.

## Project Pack / Context Slice

- [x] Project Pack validates against meaningful schema;
- [x] malformed requirement/delivery-strategy/work-graph/policy objects are rejected;
- [x] same canonical versions/config regenerate equivalent Pack;
- [x] Pack contains no raw reusable secrets;
- [x] provenance/version visible; material accepted change creates new version/diff;
- [x] Context Slice contains only authorized WorkItem-relevant fields/refs;
- [x] mock worker cannot read unrelated client/commercial data through normal Assignment context.

## Assignment / evidence

- [x] Assignment validates exact WorkItem version, Context Slice, budgets, evidence, side-effect policy, stop/escalation;
- [x] one mock/manual Assignment transitions created -> running -> execution_finished;
- [x] Assignment finish does not directly complete WorkItem;
- [x] evidence/verification can complete/reject WorkItem;
- [x] failed verification keeps/reopens incomplete state.

## Spend

- [x] synthetic metered route/action cannot start without approved SpendEnvelope;
- [x] envelope has bounded purpose/amount;
- [x] expansion requires new approval;
- [x] unknown cost is not silently zero.

## Command Center

- [x] portfolio derives phase/status/health from canonical data;
- [x] Needs My Attention shows unresolved decision/approval/spend/scope/failure/stale items;
- [x] Activity Feed derives from events/source records;
- [x] next-ready work is dependency/version/policy aware;
- [x] operator understands state without worker transcript.

## Provider independence

- [x] no specific provider identifier is required in core Project semantics;
- [x] provider mappings/connections are separate from Project meaning;
- [x] provider outage/unconfigured state does not corrupt Project state.

Operational portability across two real providers is a later-phase test, not a Phase 1 claim.

## Security / reliability

- [x] untrusted content cannot grant scope/tool/spend/approval authority in fixtures;
- [x] raw secrets are rejected/redacted from Pack/Context fixtures;
- [x] mutations use version/idempotency controls where applicable;
- [x] restart/recovery does not falsely complete in-flight Assignment;
- [x] public fixtures contain synthetic data only.

## Exit evidence

`docs/reviews/phase-1-completion-report.md` links these criteria to reproducible machine-checkable evidence. Screenshot-only evidence is not used where a test or deterministic command is feasible.
