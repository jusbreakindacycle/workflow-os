# Model / Runtime Broker

## Purpose

Select an eligible **model + runtime** for a WorkItem/Assignment without making the product dependent on one vendor.

## Distinction

### Model

Provides intelligence/capabilities: reasoning, coding, vision, long context, structured output, tool calling, etc.

### Runtime

Provides an execution environment: repository editing, terminal, browser, session persistence, tool access, sandbox/worktree, remote/cloud/local execution, etc.

One model may be usable through several runtimes; one runtime may support several models.

## Input: Work Requirement Profile

A route request should describe hard/soft requirements such as:

- task class;
- minimum capability levels;
- required modalities/context length;
- required tools/filesystem/browser/terminal;
- privacy/data residency constraints;
- local-only or remote-allowed;
- risk tier;
- latency target;
- budget/spend status;
- session persistence need;
- verification requirements;
- provider availability/health.

## Provider capability profiles

Model/runtime profiles are versioned and declare:

- capabilities;
- tool/runtime support;
- local/remote;
- pricing/cost estimation;
- context limits;
- privacy/retention characteristics known to configuration;
- authentication/availability;
- supported structured-output/tool modes;
- historical eval/success metrics where available;
- known limitations.

Marketing claims alone are not capability evidence.

## Routing algorithm

1. eliminate routes violating hard constraints;
2. eliminate paid routes without an approved SpendEnvelope;
3. score remaining routes by expected quality, cost, latency, privacy, reliability, and observed task-specific success;
4. prefer the least costly route that clears the quality/risk threshold rather than always cheapest or always strongest;
5. record RouteDecision and rationale/features used;
6. if no route qualifies, create Needs My Attention rather than silently degrading.

## Dynamic balance policy

Default intent:

- cheap/local for low-risk commodity work when proven sufficient;
- stronger models for hard architecture/debugging/reasoning when needed;
- independent verifier may use a different model/runtime for material work;
- retrying with a more expensive model is allowed only inside approved spend/loop policy.

## Fallback

A route may fail due to outage, rate limit, auth, context/tool mismatch, or verification failure.

Fallback must re-run eligibility/risk/spend checks. Never silently switch from free/local to paid.

## No provider identity in canonical semantics

Canonical WorkItem/Project state should describe required capabilities, not `use model X` unless the operator/ADR explicitly pins one for evidence/reproducibility.

Execution evidence records the actual provider/model/runtime/version used.
