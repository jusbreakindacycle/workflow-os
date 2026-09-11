# Adversarial Review Wrapper

Review the proposed change as if its completion claim may be wrong.

Check:

- contradiction with goal/scope/ADRs;
- hidden provider lock-in;
- canonical vs derived state confusion;
- Workspace/client isolation;
- unapproved spend/authority;
- scope/commercial drift;
- retry/idempotency/reconciliation;
- loop termination/budgets;
- evidence quality;
- provider `done` incorrectly mapped to canonical complete;
- missing failure/restart/recovery path;
- unnecessary future-phase complexity.

Return concrete findings ordered by severity, required fixes, and evidence needed to close each finding. Do not silently change product scope.
