# ADR-013 Adversarial Acceptance Review

**Reviewed:** 2026-09-12  
**Outcome:** PASS WITH AMENDMENTS -> ADR-013 accepted after amendments

## Question

Should Workflow OS accept a provider-neutral Internal Workforce Adapter boundary after Foundation v2, and if so, what authority/isolation rules must be fixed before acceptance?

## Baseline

Foundation v2 already establishes:

- Workflow OS as the canonical Project/WorkItem control plane;
- internal agents as bounded workers rather than state owners;
- WIR as canonical for business workflows;
- deployment/incident/maintenance as Project state;
- multi-agent parallelism as dependency/isolation/verification gated.

The post-merge research identified Paperclip as the strongest current external candidate for the internal AI-workforce runtime layer.

## Adversarial challenge

The initial proposed ADR correctly separated canonical Workflow OS state from provider runtime state, but four gaps were material enough to block acceptance without amendment:

1. provider-created child tasks could silently expand Project scope;
2. tenant/company isolation did not sufficiently address integration/control credential blast radius;
3. reconciliation wording risked implying peer/bidirectional authority between Workflow OS and the provider;
4. Paperclip workspace/worktree capability risked becoming a hard adoption dependency despite parallel coding being an advanced/fast-moving capability.

## Approved decisions

### D1 — canonical authority

Workflow OS remains the sole canonical Project/WorkItem authority.

### D2 — provider-created work

Provider-created child tasks remain provider-local execution detail when they stay inside accepted assignment scope. Material new work becomes a WorkItem Proposal and requires explicit Workflow OS promotion.

### D3 — client isolation

Default Paperclip mapping is:

```text
Workflow OS Workspace -> Paperclip Company
```

Production acceptance also requires acceptable Workspace-bounded adapter/control credential blast radius. Stronger per-Workspace provider-instance isolation is the fallback when needed.

### D4 — synchronization authority

Synchronization is asymmetric. Workflow OS sends commands/constraints; the provider returns runtime facts, evidence, failures, costs, and proposals. Provider UI edits cannot silently mutate canonical Workflow OS state.

### D5 — completion semantics

Provider `done`/success maps to `execution_finished` / evidence available, not canonical WorkItem `complete`.

### D6 — human approvals

Consequential human approvals remain authoritative in Workflow OS. Provider-native review/approval may govern worker execution and contribute evidence.

### D7 — parallel engineering

Worktree/workspace isolation is an advanced capability. It is not required for the initial bounded single-worker provider pass. Parallel coding requires separate advanced gates.

### D8 — phase boundary

Paperclip/internal-workforce integration remains outside Phase 1 acceptance criteria. Phase 1 first proves Workflow OS canonical Project/WorkItem/WIR/evidence/Command Center semantics independently.

## Resulting architecture

```text
                        Workflow OS
                canonical business/delivery state
                           |
                           | bounded assignment
                           v
                Internal Workforce Adapter
                           |
                           v
                    provider runtime
                (Paperclip candidate)
                           |
                           v
                 Codex / Claude / etc.

provider returns:
  progress + runtime state + artifacts + evidence + cost + proposals

Workflow OS decides:
  readiness + canonical state + acceptance + policy + approval + next work
```

## Provider selection remains separate

Acceptance of ADR-013 does **not** select Paperclip.

Paperclip must pass the core hands-on gates in `paperclip-due-diligence.md`. Parallel coding additionally requires the advanced parallel-engineering gates.

If Paperclip becomes an architectural dependency after the spike, provider selection should be recorded separately rather than hidden inside ADR-013.

## Consistency result

The amended decision is consistent with:

- ADR-001 control plane not universal executor;
- ADR-003 deterministic-first;
- ADR-005 Workspace/client isolation;
- ADR-011 Project top-level operational unit;
- ADR-012 work-graph and verification-gated internal collaboration;
- Foundation v2's Phase 1 rule that no persistent self-organizing agent fleet is required;
- the verification rule that an agent/provider success assertion is not completion evidence.

## Final verdict

**ACCEPT ADR-013 with D1-D8 embedded as normative rules.**

Paperclip remains **candidate provider #1**, not an accepted runtime dependency.