# AI Employee Lifecycle and Autonomy

## Lifecycle

AI Employees are promoted through evidence, not turned on at full autonomy.

```text
Draft
 -> Test
 -> Shadow
 -> Supervised
 -> Active
 -> Paused
 -> Retired
```

## Draft

Role definition is incomplete or changing.

No production tasks.

## Test

Synthetic/sandbox tasks only.

Required:

- role/spec validation;
- tool authorization tests;
- deterministic workflow tests;
- AI evaluation cases;
- prompt-injection/adversarial cases;
- escalation tests;
- budget/termination tests.

## Shadow

The AI Employee observes or processes real-shaped inputs but does not independently cause production side effects beyond explicitly safe read-only/internal test behavior.

Shadow outputs are compared against:

- human decision;
- known expected outcome;
- deterministic rules;
- historical baseline where appropriate.

## Supervised

The AI Employee performs bounded production work with stronger human review.

Typical pattern:

- R0 reads automatic;
- R1 mutations policy-controlled;
- R2 actions reviewed or selectively approved;
- R3 always human-approved.

## Active

The AI Employee may execute within its approved autonomy class, still subject to Workflow OS policy, budgets, monitoring, and escalation.

Active does **not** mean unrestricted.

## Paused

No new task assignments are accepted except health/recovery tasks explicitly allowed by policy.

Pause triggers may include:

- policy violation;
- cost anomaly;
- repeated failure;
- model/provider regression;
- integration change;
- security incident;
- human owner decision.

## Retired

No new work. Historical role versions and task evidence remain according to retention policy.

## Autonomy classes

### A0 — Observe

May read approved data and produce internal analysis only.

No external mutations.

### A1 — Recommend / Draft

May:

- read;
- classify;
- summarize;
- prepare drafts;
- create approved internal notes.

External or business-significant effects require separate approval/workflow policy.

### A2 — Bounded Execute

May automatically execute pre-approved R0/R1 actions and explicitly allowed R2 actions when policy permits.

Requires:

- tested tool contracts;
- deterministic guardrails where possible;
- clear verification;
- safe recovery.

R3 remains human-approved.

### A3 — Bounded Autonomous Role

May dynamically choose among approved workflows/tools for a narrow role and execute up to the role's configured automatic risk ceiling.

Requires stronger evidence:

- mature evaluation suite;
- sustained production history;
- low correction/policy-violation rate;
- proven escalation;
- explicit human owner approval.

R3 still requires human approval.

## No unrestricted class

Workflow OS intentionally defines no “A4 unrestricted autonomy.”

If an action cannot be safely bounded, authorized, observed, and recovered, it is not granted to the role.

## Promotion

Promotion must consider:

- functional quality;
- authorization correctness;
- security/adversarial results;
- side-effect correctness;
- escalation correctness;
- human correction rate;
- cost/latency;
- production failure history.

Model confidence by itself is never a promotion criterion.

## Demotion

A role can be demoted automatically or manually when safety/reliability thresholds are violated.

Examples:

- Active -> Supervised
- Supervised -> Shadow
- any state -> Paused
