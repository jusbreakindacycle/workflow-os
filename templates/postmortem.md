# Postmortem Template

## Incident

Link the incident report.

## Impact

What users/business processes were affected and for how long?

## Root and contributing causes

Separate technical trigger, system-design contributors, operational contributors, and detection gaps.

Avoid attributing the cause merely to “human error.”

## What worked

Controls that limited impact or accelerated recovery.

## What failed

Controls/assumptions that did not behave as expected.

## Reliability lessons

Review:
- timeouts
- retries
- idempotency
- concurrency
- integration changes
- approval policy
- monitoring/alerts
- recovery procedures

## Corrective actions

| Action | Owner | Priority | Verification |
|---|---|---|---|

## Specification changes

Which tests, ADRs, WIR rules, risk policies, or docs must change so the lesson becomes part of the engineering system?
