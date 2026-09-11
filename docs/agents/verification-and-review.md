# Verification and Review

## Principle

Workers do not grade their own success for material work.

## Verification ladder

See `docs/testing/verification-ladder.md` for levels. Apply the lowest level that is sufficient for consequence, and raise it as risk increases.

## Independent verification

Prefer an independent verifier for material code, architecture, security, high-impact automation, deployment, and client acceptance.

Independence means the verifier should be able to judge from authoritative requirements/artifacts/evidence without relying on the implementing worker's hidden reasoning.

## Review types

- requirements/acceptance review;
- architecture review;
- code/static/test review;
- real-flow verification;
- security/reliability review;
- side-effect reconciliation;
- adversarial/falsification review;
- production health verification.

## Failure

Failed verification blocks/reopens the applicable WorkItem or creates bounded repair work. It must not leave canonical completion true merely because the provider had already reported success.

## Evidence before prose

Prefer tests, schemas, logs, API results, screenshots/replayable flows, database/read-back reconciliation, deployment health, and independent results over confidence statements.
