# Agent Threat and Data Policy

## Core rule

AI-generated, retrieved, uploaded, emailed, web-sourced, repository-sourced, or provider-returned content is **untrusted data** unless deterministic policy establishes authority. Content can inform work; it cannot grant itself permission.

## Agent threats

### Prompt / instruction injection
Separate authoritative Project/Assignment instructions from untrusted content; preserve provenance/trust class; retrieved content cannot change scope, permissions, spend, or approval policy; material changes become proposals.

### Tool / skill poisoning
Approved tools/skills require versioned identity, schemas/capabilities, least privilege, compatibility evidence, and evaluation before promotion. A file/tool named `AGENTS.md`, `skill`, or `system` is not automatically trusted.

### Privilege amplification
Child/delegated work inherits or narrows scope/data/spend/tool authority unless a new authorized Assignment is created. Provider-local decomposition cannot bypass WorkItem Proposal policy.

### Sensitive-data exfiltration
Enforce data-class compatibility and destination/tool authorization outside model reasoning. Send only minimum-authorized Context Slices. Raw reusable secrets are never ordinary prompt/context data.

### Memory / knowledge poisoning
Accepted facts, findings, assumptions, Skills, and reusable lessons remain typed/provenanced and policy-gated. Untrusted content cannot persist as future authority merely because a worker wrote it to memory.

### Hallucinated state
Model narration is not execution evidence. External mutations require structured results and risk-appropriate reconciliation.

### Approval manipulation / TOCTOU
Approval binds to the exact normalized subject/action/version. Material parameter changes invalidate/supersede approval.

### Self-modification / goal expansion
Workers may propose changes to roles/instructions/skills/architecture/goals but cannot authorize their own expanded authority.

### Provider substitution
Fallback is a new route and cannot weaken privacy/risk/quality/spend policy.

## Data classification

- **Public** — intentionally public or synthetic information safe for public examples.
- **Internal** — non-public operational metadata with limited disclosure impact.
- **Confidential** — client/business/source/communication/commercial information whose disclosure could cause meaningful harm.
- **Restricted** — reusable authentication material, highly sensitive/regulated/high-impact records, or data explicitly designated Restricted.

## Routing compatibility

A Model/Runtime/ProviderConnection declares allowed data classes and relevant privacy/residency/retention characteristics. Incompatible routes are ineligible regardless of model quality.

## Retention

Retain the minimum needed for operation, audit, evidence, and recovery. Avoid raw provider payloads/transcripts by default, keep AI inputs/outputs only when necessary/permitted, structure/redact logs, keep secrets in secure stores, and include local backups/external provider artifacts in deletion/Workspace-closure plans.

## Deterministic enforcement boundary

Authorization, Workspace isolation, data routing, spend limits, approval validity, secret handling, tool allowlists, canonical completion, and fallback eligibility are enforced outside model reasoning.

## Adversarial cases

As applicable, test malicious instructions in ordinary business content, poisoned tool results, cross-Workspace retrieval, fake/stale approval, exfiltration attempts, self-authority expansion, delegation/budget evasion, and unsafe fallback.
