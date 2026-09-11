# PR #7 Adversarial Review — Foundation v3

**Review target:** PR #7, `foundation/v3-autonomous-delivery-os`

**Method:** attempt to disprove the proposed Foundation v3 against the operator's stated North Star rather than defend the rewrite.

## North-star test

The intended operator loop is:

```text
give / revise goal
  -> provide context / credentials when required
  -> approve / reject / revise consequential decisions and new spend
  -> system coordinates the rest until verified outcome or genuine human authority is required
```

The system must be local-first, provider-independent, case-specific, commercially aware for client work, and usable across software, automation, integration, process/configuration, research/pilot, and maintenance Projects.

## Material findings and dispositions

### F1 — Agent operability/harness was accidentally over-deleted — FIXED

The first v3 reset removed the stronger contract requiring coding/automation workers to bootstrap/start/readiness-check/navigate/inspect/test/execute real flows/capture evidence/cleanup/escalate without using the operator as their terminal.

Restored as `docs/engineering/agent-operability.md` and linked into AGENTS/testing/review rules.

### F2 — AI-specific threat/data controls were over-deleted — FIXED

Generic security did not sufficiently cover prompt/instruction injection, tool/Skill poisoning, memory poisoning, privilege amplification, exfiltration, hallucinated state, provider substitution, or data-class routing.

Restored/consolidated in `docs/security/agent-threat-and-data-policy.md`.

### F3 — Data classification/retention semantics were missing — FIXED

Public/Internal/Confidential/Restricted now have active definitions and provider-route compatibility/retention rules.

### F4 — `give/revise goal` lacked real change semantics — FIXED

Material goal/scope revisions are now versioned and impact-propagated. A revision can stale/supersede affected WorkItems, approvals, Project Packs, Assignments, architecture, and commercial commitments without rewriting history or invalidating unaffected work unnecessarily.

### F5 — Broker modeled models/runtimes but not actual access — FIXED

Added `ProviderConnection`/entitlement semantics and schema: connection type, secure credential ref, billing mode, health/status, Workspace scope/blast radius, data-class constraints, and host/locality.

A known model is not considered usable merely because its profile exists.

### F6 — Local-first was being confused with always-on — FIXED

The architecture now states that autonomous background work cannot run while its coordinator host is off/asleep. Work waits visibly. A replaceable always-on host is a later option, not a hidden cloud dependency.

### F7 — Project Pack could expose/churn too much context — FIXED

Project Pack is now a stable accepted execution contract with versioned work-graph references. Each Assignment receives a minimum-authorized `ContextSlice`; the full client/commercial record is not automatically sent to a model/provider.

### F8 — Project Pack / Assignment schemas were too permissive — FIXED

Schemas now constrain WorkItem versions, delivery strategy, work graph, policy, verification, budgets, side-effect authority, SpendEnvelope linkage, Context Slice, and stop/escalation semantics.

### F9 — Client acceptance and operator approval were conflated — FIXED

Operator authorization and actual external client acceptance are separate facts. `client_accepted` requires evidence/reference; clicking an internal approval cannot fabricate client agreement.

### F10 — Spend Gate was too AI-specific — FIXED

The Spend Gate now covers new metered/variable-cost external actions generally, including later API/cloud/workflow/deployment/SMS-like costs. Fixed/included subscriptions may be zero-incremental only when configured connection evidence says so.

### F11 — Provider independence was architectural but not testable — FIXED

A portability/replacement drill is now required before claiming operational provider independence. The same representative work must survive routing through a second independently configured eligible route/provider without changing canonical Project/Assignment/evidence meaning.

### F12 — Legacy accepted ADRs were compressed too aggressively — FIXED

`legacy-foundation-decisions.md` now restates carried-forward normative invariants for ADR-001/002/003/005/006/011/012 so future shallow checkouts do not require Git archaeology.

### F13 — Logical workforce omitted product/UX design — FIXED

Added UX/Product Design as a capability role while retaining dynamic activation.

### F14 — The architecture still subtly assumed every problem becomes software — FIXED

Discovery now requires a case-specific delivery strategy: process change, adopt/configure/integrate existing systems, automate, custom build, hybrid, pilot/research, or defer/decline. Repository/deployment steps are conditional rather than universal.

### F15 — Phase 1 risked becoming a local PM/CRM product — FIXED

Phase 1 now has an explicit anti-PM-suite stop rule. Commercial concepts stay shallow; provider execution remains deferred; the goal is to prove canonical/version/authority/context semantics and then move to Phase 2 real execution.

### F16 — Routing capability names could become provider-specific — FIXED

Added a normalized capability vocabulary + evidence model. Provider-specific detail remains under extensions rather than leaking into canonical WorkItems.

## Findings that are intentionally deferred, not defects

- exact local web/API/database framework;
- exact first real model/runtime ProviderConnection;
- Paperclip adoption decision;
- Activepieces adoption decision;
- exact always-on ExecutionHost topology;
- client portal/payment integrations;
- client-facing AI Employee product;
- production-scale infrastructure.

These are deliberately downstream of Phase 1 evidence.

## Over-engineering check

The active Phase 1 remains larger than a CRUD toy but is intentionally bounded to one golden path. It does **not** require real AI, workflow engine, workforce manager, Git provider, autonomous coding, deployment, payment system, client portal, or production loop. Separate commercial subsystems are explicitly deferred unless evidence justifies them.

## Vendor-lock-in check

No currently named provider is canonical. Project/WorkItem/Engagement/Decision/Approval/Evidence/Project Pack/Context Slice/Spend semantics survive provider removal. Provider identities live in connection/profile/mapping/evidence records.

GitHub, Paperclip, Activepieces, Codex, Claude Code, Copilot, OpenCode, hosted model vendors, and local models are adapter/route candidates only.

## Final review verdict

**PASS after amendments.**

I do not see a remaining Foundation-level contradiction that should block PR #7 on product architecture grounds.

Important limitation: this is a specification pass, not proof that provider portability/autonomous execution works in practice. Phase 1 must prove the control-plane invariants; Phase 2 must produce the first real route and later the provider-replacement drill before operational independence is claimed.

Do not add more foundation scope merely to make the architecture look comprehensive. After PR #7 is accepted, the next task is Phase 1 Gate 1 implementation.
