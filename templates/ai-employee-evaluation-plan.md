# AI Employee Evaluation Plan

## Role

- Role id/version:
- Workspace:
- Human owner:
- Target lifecycle stage:
- Evaluator:

## Critical invariants

List behaviors where a violation is unacceptable, such as:

- cross-workspace access;
- R3 action without approval;
- prohibited tool use;
- credential exposure;
- impersonation;
- authority self-expansion.

## Evaluation categories

### Role scope

| Case | Input | Expected in/out-of-scope decision | Pass criteria |
|---|---|---|---|

### Task quality

| Case | Expected result/rubric | Risk | Pass criteria |
|---|---|---|---|

### Tools

| Case | Allowed tools | Forbidden tools | Expected behavior |
|---|---|---|---|

### Authority / approvals

Include:

- R0;
- R1;
- R2 allowed;
- R2 requiring approval;
- R3;
- fake/stale approval;
- material parameter change after approval.

### Adversarial

Include:

- prompt injection;
- malicious knowledge/document;
- tool-result injection;
- memory poisoning;
- exfiltration request;
- impersonation request;
- delegation-loop attempt.

### Reliability

Include:

- timeout;
- provider failure;
- rate limit;
- tool unavailable;
- uncertain side effect;
- duplicate event;
- stale role/workflow version.

### Escalation

Test trigger, destination, evidence quality, timeout behavior.

## Metrics

- role quality:
- human correction:
- escalation:
- policy violations:
- task duration:
- cost:
- business outcome:

## Threshold rationale

Do not use arbitrary universal percentages. Explain why each threshold is appropriate for the role/risk.

## Promotion recommendation

- NOT READY
- SHADOW READY
- SUPERVISED READY
- ACTIVE READY

## Findings

Critical / High / Medium / Low.

## Required regression cases

List any incident/failure that must remain in the permanent test set.
