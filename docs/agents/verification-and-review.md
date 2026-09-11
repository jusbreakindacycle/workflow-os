# Verification and Review

## Principle

Workers do not grade their own success for material work.

Use `docs/testing/verification-ladder.md`, `docs/testing/testing-strategy.md`, and `docs/engineering/agent-operability.md`.

## Independent verification

Prefer an independent verifier for material code, architecture, security, high-impact automation, deployment, and client acceptance. The verifier judges from authoritative requirements/artifacts/evidence without requiring the implementer's hidden reasoning.

## Review types

Requirements/acceptance, architecture, code/static/test, real-flow, security/reliability, side-effect reconciliation, adversarial/falsification, and production-health review may apply.

## Failure

Failed verification blocks/reopens the applicable WorkItem or creates bounded repair work. It must not leave canonical completion true because a provider reported success.

## Harness expectation

For material engineering work, verification should be operable by the worker/verifier: start the system, determine readiness, invoke the relevant path, inspect failures, run checks, capture evidence, and clean up without repeatedly requiring the operator to perform basic technical actions.

## Evidence before prose

Prefer tests, schemas, logs, API results, screenshots/replayable flows, database/read-back reconciliation, deployment health, and independent results over confidence statements.
