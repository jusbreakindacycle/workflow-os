# Model / Runtime Broker

## Purpose

Select an eligible **model + runtime + configured provider connection** for a WorkItem/Assignment without making the product dependent on one vendor.

## Distinction

### Model
Provides intelligence/capabilities: reasoning, coding, vision, long context, structured output, tool calling, etc.

### Runtime
Provides an execution environment: repository editing, terminal, browser, session persistence, tool access, sandbox/worktree, remote/cloud/local execution, etc.

### ProviderConnection
Represents what the operator has actually configured and can use. A model/runtime profile does not prove access.

A connection declares/reference equivalents of:

- provider/adapter id + version bounds;
- connection type: `api_key`, `oauth`, `subscription_cli`, `local_service`, `self_hosted`, or future supported type;
- secure credential/config reference, never raw secret in Project state;
- billing mode: `zero_incremental`, `included_subscription`, `metered`, `unknown`;
- enabled/status/health;
- allowed Workspace(s) / credential blast radius;
- allowed data classes and known privacy/residency/retention constraints;
- quota/rate/context limits when known;
- execution host/locality constraints.

Cancelling a subscription, revoking credentials, exhausting quota, or disabling a local server changes ProviderConnection eligibility without redefining the Project.

## Input: Work Requirement Profile

A route request describes hard/soft requirements such as task class, minimum capability levels, modalities/context, tools/filesystem/browser/terminal, privacy/data residency, local-only/remote-allowed, risk tier, latency target, budget/spend status, session persistence, verification needs, and provider availability/health.

## Model/runtime capability profiles

Profiles are versioned and declare capabilities, tool/runtime support, locality, price characteristics, context limits, known privacy characteristics, structured-output/tool modes, historical eval/success metrics where available, and limitations. Marketing claims alone are not capability evidence.

## Routing algorithm

1. eliminate routes violating hard capability/risk/data constraints;
2. eliminate routes lacking an enabled compatible ProviderConnection;
3. eliminate metered routes without an applicable approved SpendEnvelope;
4. score remaining routes by expected quality, incremental cost, latency, privacy, reliability, and observed task-specific success;
5. prefer the least costly route that clears the quality/risk threshold rather than always cheapest or always strongest;
6. record RouteDecision and evidence/rationale;
7. if no route qualifies, create Needs My Attention rather than silently degrading.

## Dynamic balance policy

Prefer cheap/local/zero-incremental routes for low-risk commodity work when proven sufficient; stronger models for hard architecture/debugging/reasoning when needed; and independent verification through a different route where material and justified.

## Fallback

A route may fail due to outage, rate limit, auth/subscription change, quota, context/tool mismatch, privacy incompatibility, or verification failure. Fallback re-runs all eligibility/risk/data/spend checks. Never silently switch from zero-incremental to metered spend.

## No provider identity in canonical semantics

Canonical WorkItem/Project state describes required capabilities, not `use model X` unless the operator/ADR explicitly pins a route for reproducibility. Evidence records the actual connection/provider/model/runtime/version used.

## Portability proof

Provider independence is an architectural goal until tested. Before claiming operational portability, run a replacement/rerouting drill for representative WorkItems using a second independently configured eligible route and confirm Project meaning, Assignment/evidence semantics, and operator state do not change.
