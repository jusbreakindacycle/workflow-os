# Provider Strategy

## Principle

Build canonical semantics; adapt specialized execution.

## BUILD in Workflow OS

Workspace/Client/Engagement/Project semantics; WorkItems/dependencies/readiness; Decisions/Approvals/Needs My Attention; Project Pack + Context Slice semantics; Activity/Event/Evidence model; risk/spend/authority policy; Model/Runtime/ProviderConnection routing semantics; loop/routine semantics; Command Center; production/maintenance ownership.

## ADAPTER / INTEGRATE

Model APIs/local model servers; coding/agent runtimes; internal workforce managers; workflow engines; Git/source control; deployment platforms; observability systems; communication channels.

## ProviderConnection

A provider name/profile is not usable merely because it is known. Actual configured access is represented separately by ProviderConnection/entitlement state: auth/config reference, connection type, billing mode, health/enabled state, Workspace/credential scope, data-class/privacy constraints, quota/limits, and locality/host constraints.

## Current candidates

- Paperclip — internal workforce provider candidate, not selected;
- Activepieces — workflow engine candidate, not Phase 1 prerequisite;
- GitHub — likely source-control adapter target when repository bootstrap activates;
- Codex / Claude Code / Copilot / OpenCode / local/open/other runtimes — candidates with no canonical preference.

## Selection test

A provider is acceptable only if its capability fits a provider-neutral contract; canonical Project meaning survives removal; security/data/credential isolation is acceptable; failure/reconciliation is understandable; version/API surface is supportable; and cost/benefit beats building the minimal missing layer.

## Anti-lock-in test

If a provider disappeared tomorrow, the operator must still understand Project commitments, decisions, evidence, pending work, and production state.

## Portability drill

Before calling a capability operationally provider-independent, execute representative synthetic work through a second independently configured eligible route/provider and prove that canonical Project/Assignment/evidence semantics remain intact. Abstraction alone is not proof of portability.
