# Production and Maintenance

## Principle

Deployment is not Project completion when the delivered system continues operating.

## Production records

A production-capable Project should retain:

- environment;
- deployment/version/commit/WIR refs;
- health/observability refs;
- rollback/recovery capability;
- current incidents;
- maintenance obligations;
- owner/escalation;
- latest health/recovery evidence.

## Incident flow

```text
signal/event
  -> Incident record
  -> classify severity/uncertainty
  -> bounded investigation WorkItem
  -> proposed/authorized repair
  -> verify
  -> deploy/rollback with policy
  -> confirm recovery
  -> incident closure + lesson
```

High-impact remediation cannot become autonomous merely because an agent can perform it.

## Maintenance

Sources include:

- dependency/security updates;
- provider/API deprecations;
- client change requests;
- recurring operational checks;
- drift/config changes;
- reliability findings;
- cost optimization.

Material maintenance creates canonical WorkItems and evidence.

## Feedback loop

Production findings may create reusable skills/tests/guards only after confidential client context is sanitized and the generalized improvement is verified.
