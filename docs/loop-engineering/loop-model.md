# Loop Engineering Model

Workflow OS uses **nested bounded loops**. “Keep trying until done” is not an acceptable production control strategy.

## Loop 0 — Node execution

```text
Validate -> Authorize -> Execute -> Verify -> Record
```

Every node validates its input, verifies permission/policy, executes through a governed interface, verifies the result where possible, and records normalized evidence.

## Loop 1 — Reliability

```text
Failure -> Classify -> Retry/Backoff -> Reconcile
       -> Compensate or Circuit-Break -> Escalate -> Replay
```

Rules:

- permanent/business-rule failures are not blindly retried
- transient failures use bounded retries
- retry delay uses provider guidance or exponential backoff with jitter
- uncertain side effects require reconciliation before another mutation
- exhausted failures become visible resolvable states
- compensation is explicit, not assumed

## Loop 2 — Agent reasoning

```text
Goal -> Observe -> Select Allowed Tool/Action -> Execute
     -> Observe Result -> Verify -> Continue/Stop/Escalate
```

Agent loops require:

- allowed-tool list
- forbidden actions
- maximum iterations
- maximum tool calls
- maximum wall-clock time
- maximum cost
- explicit stop conditions
- approval rules for side effects
- an escalation outcome

MVP does not require a general agent node; these contracts constrain future work.

## Loop 3 — Workflow improvement

```text
Observe -> Measure -> Detect Bottleneck/Failure -> Hypothesis
        -> Change -> Test -> Deploy -> Compare
```

Changes must create a new workflow version.

## Loop 4 — Consulting/productization

```text
Discover -> Score -> Pilot -> Measure ROI -> Document
         -> Sanitize -> Template -> Reuse -> Expand
```

A client-specific workflow only becomes a reusable template after confidential/specific material is removed.

## Loop safety invariant

Any loop capable of causing external side effects must combine explicit budgets, idempotency/reconciliation strategy, and policy enforcement.
