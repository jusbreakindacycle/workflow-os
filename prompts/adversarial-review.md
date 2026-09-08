# Adversarial Review Prompt

Assume the change is subtly wrong. Do not redesign the product. Try to prove a violation.

Review specifically for:

- hidden scope expansion
- contradiction with ADRs
- WIR/engine semantic loss
- unsafe or duplicate retries
- missing idempotency/reconciliation
- race conditions around runs/approvals
- workspace isolation failures
- sensitive-value leakage
- approval bypass
- unsupported adapter capabilities
- stale workflow-version attribution
- unbounded AI/agent loops or cost
- misleading dry-run behavior
- failed states with no recovery
- missing failure-path tests
- premature scale infrastructure

Classify findings as Critical / High / Medium / Low. For every finding, point to the repository contract it violates and the smallest correction.
