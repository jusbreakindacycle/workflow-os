# ADR-024 — Governed External Action Boundary

**Status:** Accepted

## Context

Phase 3 proves real local execution inside a bounded Project workspace. The next capability class introduces durable shared/external effects such as source-control mutation, deployment, workflow-engine configuration and third-party system changes.

Existing authority rules already distinguish R1 local reversible work from R2/R3 external effects. What is missing is one provider-neutral execution boundary that preserves those rules across all external adapters.

Without that boundary, each provider adapter could invent its own approval, retry, idempotency and reconciliation semantics, making authority dependent on provider implementation details.

## Decision

All durable shared/external mutations must execute from an exact canonical `ExternalActionPlan` or equivalent versioned record.

The plan binds the canonical scope, target, operation set, exact input/artifact/content hashes, expected starting state, risk/action class, applicable Approval/SpendEnvelope, idempotency semantics, verification requirements, recovery path and stop/escalation conditions.

Provider adapters execute approved plans. They do not create authority.

Authority is checked at approval resolution and again immediately before the consequential effect.

A tightly bounded multi-step action may use one Approval only when every operation, target and material content value is fixed before approval. Widening the operation set or changing target/content requires a new plan/authority decision.

External outcomes are reconciled by observing provider state. Timeout or transport failure does not prove an effect did not occur. An uncertain mutation must be reconciled before any retry.

Provider-native IDs and payloads remain mappings/evidence rather than canonical Project meaning.

## First consumer

The first consumer is the Phase 4.1 Source Control Adapter. Its initial write path is limited to a non-default delivery branch, exact verified commit/tree projection and pull-request creation/read-back. Merge, force push, settings, permissions, secrets, releases and production deployment remain outside that certified path.

## Consequences

### Positive

- one authority/reconciliation model across external providers;
- provider adapters stay replaceable;
- shared/external side effects become inspectable from canonical state;
- uncertain network outcomes do not cause blind duplicate mutations;
- approval fatigue can be reduced with exact bounded bundles rather than one click per provider call;
- Command Center can explain proposed/executed external effects without reconstructing provider chats.

### Costs

- adapters require deterministic preflight and reconciliation logic;
- exact content/target hashing adds implementation work;
- some provider APIs may not support strong idempotency and therefore require read-after-write reconciliation;
- new external action classes must define recovery semantics before production use.

## Rejected alternatives

### Give an AI worker normal provider credentials and let it operate directly

Rejected because possession of credentials is not authority, tool narration is not evidence, and unrestricted provider access defeats the Phase 2.2/Phase 3 safety boundary.

### Put provider-specific approval logic inside each adapter

Rejected because authority would drift with provider semantics and portability would become nominal rather than operational.

### Require a human approval for every provider API call

Rejected because it creates unnecessary operator coordination. Exact bounded bundles provide equivalent authority without turning the operator into a click-through terminal.

### Automatically retry transport failures

Rejected because the provider may have already applied the side effect before the response was lost.

## Relationship to existing decisions

ADR-024 extends ADR-014 human-governed autonomous delivery, ADR-016 model/runtime/spend separation, ADR-017 minimum-authorized execution context and ADR-022 provider-independent execution/evidence semantics. It does not supersede the existing risk and approval policy.