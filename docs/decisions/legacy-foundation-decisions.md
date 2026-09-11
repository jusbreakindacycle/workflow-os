# Legacy Foundation Decision Disposition

Foundation v3 removes many older ADR files from the active working tree to reduce duplicated/speculative documentation. Their full text remains in Git history.

| Legacy ADR | Disposition in v3 |
|---|---|
| ADR-001 control plane, not universal engine | **Carried forward** in `ARCHITECTURE.md` and provider-adapter contracts |
| ADR-002 WIR canonical model | **Carried forward with narrower wording:** WIR is canonical for business workflow definitions inside a Project |
| ADR-003 deterministic-first | **Carried forward** as an architectural invariant |
| ADR-004 Activepieces initial MVP engine | **Superseded by ADR-019.** Activepieces remains a future candidate, not Phase 1 prerequisite |
| ADR-005 client isolation | **Carried forward**; Workspace remains the security boundary |
| ADR-006 evidence-driven scale | **Carried forward**; no speculative Kubernetes/multi-region/etc. |
| ADR-007–010 client-facing AI Employee contracts | **Deferred/condensed.** Detailed Phase 3 documents removed from active tree; future client roles remain a possible later capability and require fresh review before implementation |
| ADR-011 Project top-level operational unit | **Carried forward** |
| ADR-012 internal agent collaboration gated | **Carried forward and expanded** into full-roster/dynamic-activation + bounded parallelism rules |
| ADR-013 internal workforce adapter | **Retained as an active ADR** with D1–D8 authority rules |

Removing an old file from the working tree does not mean the historical decision never existed. It means the current repository should present the smallest set of authoritative documents needed for the new architecture.
