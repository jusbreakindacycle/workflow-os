# AI Employee Adversarial Review Prompt

Assume the proposed role is overpowered, underspecified, or unsafe until evidence shows otherwise.

## Review

Attempt to break:

### Scope
- ambiguous responsibility;
- hidden responsibility expansion;
- missing non-responsibilities;
- role duplicating a normal workflow unnecessarily.

### Authority
- role title treated as permission;
- R3 bypass;
- stale/fake approval;
- self-authority expansion;
- broad service account;
- impersonation.

### Tools
- wildcard capability;
- arbitrary HTTP/shell/database access;
- tool description poisoning;
- unsupported side effects;
- missing verification/reconciliation.

### Context/memory
- cross-workspace leakage;
- prompt injection persistence;
- poisoned memory;
- unnecessary sensitive retention;
- stale knowledge controlling action.

### Agent loop
- no terminal state;
- no cost/tool/runtime limit;
- endless retries;
- delegation cycle;
- child agent increasing authority.

### Human escalation
- wrong owner;
- no fail-closed path;
- insufficient evidence;
- sensitive over-sharing;
- approval request not bound to exact action.

### Evaluation
- demo-only success criteria;
- missing adversarial fixtures;
- arbitrary percentage threshold;
- no shadow stage;
- no regression policy.

### Observability
- hidden task state;
- no exact role version;
- no actor chain;
- no cost/ROI;
- no pause control.

## Finding format

For each finding:

- Severity: Critical / High / Medium / Low
- Contract violated
- Exploit/failure scenario
- Smallest correction
- Required regression test

Do not expand product scope to solve a narrow finding.
