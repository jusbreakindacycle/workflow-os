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
- [ ] internal Project works without a Client/Engagement.

## New Project / discovery

- [ ] operator can create a Project from raw text without first creating a repository;
- [ ] `I don't know` is stored as explicit unknown state, not converted into an invented fact;
- [ ] question/answer/proposal/accepted fact are distinguishable;
- [ ] operator approval creates the accepted problem/outcome/scope version.

## Work graph

- [ ] WorkItems support dependencies and explainable readiness;
- [ ] blocked/failed/needs-attention states are explicit;
- [ ] ineligible WorkItem cannot become ready through a narrative status update;
- [ ] WorkItem Proposal cannot silently become canonical work.

## Commercial foundation

- [ ] client Project can reference Engagement scope/price/deadline/maintenance placeholders;
- [ ] material scope-change proposal creates Needs My Attention;
- [ ] no agent/provider can accept commercial commitments without human authority.

## Project Pack

- [ ] Project Pack validates against schema;
- [ ] same canonical input/version/config regenerates equivalent Project Pack;
- [ ] Project Pack contains no raw reusable secrets;
- [ ] Project Pack version/provenance is visible;
- [ ] material canonical change produces a new version/diff.

## Assignment / evidence

- [ ] one mock/manual AgentAssignment can transition created -> running -> execution_finished;
- [ ] provider/assignment finish does not directly complete WorkItem;
- [ ] evidence/verification can complete or reject the WorkItem;
- [ ] failed verification keeps/reopens incomplete state.

## Spend

- [ ] synthetic paid route cannot start without approved SpendEnvelope;
- [ ] envelope has bounded purpose/amount;
- [ ] exceeding/expanding envelope requires new approval.

## Command Center

- [ ] portfolio view derives phase/status/health from canonical data;
- [ ] Needs My Attention shows unresolved decision/approval/spend/scope/failure items;
- [ ] Activity Feed derives from events and links to source records;
- [ ] next-ready WorkItem is dependency/policy aware;
- [ ] operator can understand synthetic Project state without agent transcript.

## Provider independence

- [ ] no OpenAI/Anthropic/Codex/Claude/Paperclip/Activepieces identifier is required in core Project semantics;
- [ ] provider mappings are separate metadata;
- [ ] provider outage/unconfigured state does not corrupt canonical Project state.

## Security/reliability

- [ ] raw secrets rejected/redacted from Project Pack fixtures;
- [ ] mutations use optimistic/version/idempotency controls where applicable;
- [ ] restart/recovery does not falsely complete in-flight Assignment;
- [ ] public fixtures contain synthetic data only.

## Exit evidence

A Phase 1 completion report must link each criterion to reproducible evidence. A screenshot alone is insufficient when a machine-checkable test is feasible.
