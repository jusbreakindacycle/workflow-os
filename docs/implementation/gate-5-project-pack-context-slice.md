# Phase 1 Gate 5 — Project Pack and Context Slice

## Purpose

Compile accepted canonical Project state into a deterministic machine-execution contract while giving an Assignment only the minimum context it is authorized to receive.

## Project Pack v0.1

`Phase1ControlPlane.generateProjectPack()` compiles:

- Workspace and Project identity;
- exact accepted Project Brief version;
- problem and desired outcome;
- accepted delivery strategy and decision reference;
- minimal requirement statements;
- non-goals when recorded;
- exact WorkItem references and graph version;
- data/spend/secret policy;
- minimum verification level;
- escalation conditions.

The Pack is validated by `validateProjectPack()`, serialized using deterministic key ordering, SHA-256 hashed, versioned in `project_pack_versions`, and stored with provenance. Regenerating from equivalent canonical inputs returns the equivalent current Pack rather than generating meaningless churn.

The canonical strategy identifiers are `research_pilot` and `defer`; the JSON schema was aligned to those persisted identifiers.

## Secret rule

Reusable raw secrets are rejected before Pack or Context Slice persistence. Phase 1 includes deterministic detection for common private-key, API-key, access-token, password, and similar patterns. This is a safety guard, not a future credential-vault replacement.

## Context Slice v0.1

`createContextSlice()` binds to:

- one exact WorkItem and version;
- one Project Pack version;
- the WorkItem objective;
- only directly relevant accepted requirement/constraint context;
- explicit authorized references;
- data classification.

It deliberately does not copy client pricing, unrelated commercial notes, the raw intake transcript, or the whole Project history merely because the Assignment belongs to the Project.

## Evidence

`test/phase1-control-plane.test.js` proves deterministic Pack regeneration and that a client Engagement price note is absent from normal Assignment context. `test/phase1-contracts.test.js` adversarially rejects malformed requirements, strategy, work graph and policy objects and rejects reusable secrets in Context Slice data.

## Non-goals

No provider-specific prompt file, model call, runtime routing, or automatic coding is performed in Gate 5. Those remain projections/execution concerns, not canonical Pack semantics.
