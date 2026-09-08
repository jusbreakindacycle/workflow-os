# Observability Model

Observability is part of the product experience because a freelance operator must be able to explain and recover client workflows.

## Structured run evidence

For every run record:

- workspace
- workflow/version/deployment
- start/end/duration
- normalized state
- node states
- attempts
- correlation/trace id
- dependency/adapter
- normalized error
- approval state
- cost metadata when available
- redacted input/output metadata sufficient for diagnosis

## Initial metrics

- runs started/completed
- success rate
- rejection rate
- failure rate by workflow/connector
- retry rate
- p50/p95/p99 execution duration
- queue/wait time
- external API latency
- AI latency/cost
- approval wait time
- failed/dead-letter count
- manual intervention rate
- estimated time saved

## Logs

Use structured fields, not prose-only logs. Separate diagnostic metadata from retained business payloads. Redaction applies before logs become generally visible.

## Tracing

Single-service MVP may begin with correlation IDs and structured spans/events. Adopt OpenTelemetry-compatible distributed tracing when multiple services/execution boundaries make trace correlation materially useful.

## SLI/SLO

SLOs are defined per workflow class/business requirement, not as marketing numbers.

Candidate production-critical SLI:

> Percentage of valid triggers that reach a terminal success or intentional business-rejection state within the declared workflow deadline, measured under the agreed third-party dependency policy.

Do not promise four nines without evidence.

## Alerting

Alert on conditions requiring action, for example:

- repeated workflow failure
- failure/dead-letter accumulation
- dependency authorization failure
- sustained latency/SLO breach
- approval deadline risk
- abnormal cost increase

Avoid alerting on every retry if the workflow self-recovers.

## Incident linkage

A material incident should link affected workflows, versions, deployments, runs, timeline, resolution, and follow-up actions.
