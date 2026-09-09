# Evaluation and Readiness

## Goal

An AI Employee is evaluated as a **business role with actions**, not only as a chatbot.

## Evaluation layers

### 1. Role comprehension

Can the system:

- identify in-scope tasks;
- reject/outsource out-of-scope tasks;
- follow non-responsibilities;
- escalate ambiguous requests?

### 2. Task quality

Role-specific outcome quality.

Examples:

- classification accuracy;
- extraction correctness;
- research completeness;
- draft quality;
- routing correctness.

### 3. Tool selection

- chooses only allowed tools;
- chooses the correct narrow operation;
- avoids unnecessary calls;
- handles tool failure safely.

### 4. Authority correctness

Critical metric.

Test that it:

- refuses prohibited actions;
- requests approval when required;
- cannot escalate its own authority;
- respects delegated identity scope;
- keeps clients/workspaces isolated.

### 5. Side-effect correctness

- no duplicate mutation;
- correct target;
- correct parameters;
- correct version;
- verifies/reconciles uncertain outcome.

### 6. Adversarial/security

Include:

- prompt injection in email/docs/web content;
- malicious tool output;
- memory poisoning attempt;
- data exfiltration request;
- authority-manipulation request;
- fake approval;
- identity impersonation;
- delegation loop.

### 7. Reliability

- timeout;
- transient provider failure;
- rate limit;
- partial workflow failure;
- model unavailable;
- tool schema change;
- stale knowledge.

### 8. Escalation

- correct trigger;
- useful evidence;
- correct human target;
- no sensitive over-sharing;
- safe behavior on human timeout.

### 9. Business outcome

Measure against baseline:

- time saved;
- cycle time;
- error/rework;
- backlog;
- response time;
- business KPI relevant to role.

## Evaluation sets

Maintain:

- core deterministic fixtures;
- role-specific semantic examples;
- known edge cases;
- adversarial suite;
- production-derived sanitized regressions.

A production incident should normally add a regression case.

## Readiness gates

### Test -> Shadow

Requires:

- schema/spec valid;
- no Critical/High security/authority findings;
- core evaluation suite passes defined thresholds;
- all high-impact actions blocked/simulated.

### Shadow -> Supervised

Requires:

- sufficient representative cases;
- acceptable human disagreement/correction pattern;
- no unresolved authority breach;
- cost/latency within role budget;
- escalation works.

### Supervised -> Active

Requires:

- sustained evidence under production-shaped load;
- explicit human-owner signoff;
- rollback/pause path tested;
- observability and alerts working;
- no unresolved Critical/High findings.

## Thresholds

Do not invent universal percentages such as “95% = safe.”

Each role defines metrics and acceptable thresholds according to:

- task consequence;
- risk;
- baseline quality;
- business tolerance.

Authorization/security tests may require effectively zero tolerated breaches even when task-quality metrics allow error.

## Regression

Re-run applicable evaluations when changing:

- model/provider;
- prompt/instructions;
- tool contract;
- knowledge;
- role authority;
- workflow;
- memory policy.

Promotion is version-specific.
