# Phase 0 Adversarial Review

## Result

**Status: MERGE-READY FOR HUMAN REVIEW**

This review evaluates the specification foundation, not runtime implementation.

## Checks performed

### Product/scope
- Goal is explicit.
- MVP is bounded to one operator, multiple isolated workspaces, WIR v0, one engine adapter, reliability/policy/observability, templates, and ROI.
- Universal executor, large connector catalog, RPA recorder, Kubernetes, sharding, multi-region, billing, mobile, and unrestricted multi-agent scope are explicitly deferred.

### Architecture
- Control plane vs execution plane boundary is explicit.
- WIR is canonical; engine-specific definitions are derived.
- Engine adapter has capability and failure-normalization contracts.
- Engine routing criteria are explicit.
- Connector/tool capability and side-effect contracts are explicit.

### Workflow semantics
- Deterministic-first policy is explicit.
- WIR v0 node types match MVP.
- Action nodes require tool, timeout, retry, idempotency, and risk metadata at schema level.
- Human approval binds to exact workflow/run/action context and protects against material changes after approval.

### Security
- Workspace isolation is an MVP invariant.
- WIR stores integration references, not reusable secret values.
- Data classification and retention policy exists.
- AI prompt injection, tool poisoning, excessive agency, exfiltration, approval manipulation, hallucinated execution state, and unbounded loops are explicitly modeled.
- Public repository is restricted to synthetic examples.

### Reliability
- Failure classes distinguish permanent, transient, rate-limited, business rejection, and uncertain side-effect outcomes.
- Retries are bounded and tied to idempotency/reconciliation.
- Failed/dead-letter state and recovery are explicit.
- Compensation/Saga behavior is documented without pretending external SaaS systems support atomic distributed transactions.

### Testing/observability
- MVP acceptance criteria are testable.
- Testing includes failure paths, idempotency, approvals, adapter contracts, AI evaluations, and adversarial cases.
- Run/node status, errors, attempts, latency, approvals, costs, and recovery evidence are part of the observability contract.

### Scale-list coverage
The scale-trigger matrix was mechanically checked against the original checklist: **111/111 concepts are present**.

### WIR validation
The synthetic lead-qualification example was parsed and validated against the WIR v0 JSON Schema using JSON Schema Draft 2020-12 semantics: **PASS**.

## Findings resolved during review

1. **Connector/tool semantics were under-specified.** Added `docs/architecture/connector-tool-contract.md`.
2. **Future engine selection/routing could have been improvised.** Added `docs/architecture/engine-routing-policy.md`.
3. **Human approval was defined conceptually but not bound to the exact proposed side effect.** Added `docs/domain/human-approval-semantics.md`.
4. **Client data classification/retention was too implicit.** Added `docs/security/data-classification-and-retention.md`.
5. **AI prompt-injection/tool-poisoning threats were not explicit enough.** Added `docs/security/ai-threat-model.md`.
6. **WIR schema allowed nodes without risk metadata and action nodes without explicit reliability metadata.** Tightened the schema and revalidated the example.

## Known intentional unknowns

These are Phase 1 implementation decisions/spikes, not Phase 0 blockers:

- concrete application framework and repository code layout
- database access library/ORM
- UI framework
- deployment/cloud provider
- exact Activepieces API integration mechanics in the then-current version

ADR-004 requires the first Phase 1 engine task to verify Activepieces against current licensing and adapter requirements. If evidence shows a blocker, propose a superseding ADR before building around it.

## Merge recommendation

The specification foundation is internally coherent enough to become the repository source of truth. The human owner should review the PR and merge it before implementation begins.
