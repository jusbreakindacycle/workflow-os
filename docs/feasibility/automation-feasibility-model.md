# Automation Feasibility and ROI Model

## Purpose

Workflow OS should decide **whether automation is appropriate before building it**.

Feasibility and risk are separate. A workflow can be highly feasible and highly risky.

## Feasibility score (0–100)

| Dimension | Weight |
|---|---:|
| frequency / volume | 15 |
| time per manual run | 15 |
| rule clarity | 15 |
| stable interface/API availability | 15 |
| data quality | 10 |
| exception rate | 10 |
| reversibility/verifiability | 10 |
| business value | 10 |

Each dimension is scored proportionally to its weight with evidence and notes.

## Recommendation bands

- **80–100:** strong automation candidate
- **60–79:** likely candidate; resolve identified constraints
- **40–59:** pilot only after redesign/clarification
- **0–39:** do not automate yet; improve process/interface first

These bands are guidance, not an automatic decision.

## Red flags that can override score

- the process itself is undefined or changes constantly
- critical rules are undocumented and disputed
- required access is prohibited/unavailable
- target interface explicitly disallows or cannot safely support automation
- physical-world/manual judgment dominates
- exception rates overwhelm the happy path
- outcome cannot be verified and side effects are high impact

## ROI baseline

At minimum capture:

- manual runs/month
- manual minutes/run
- loaded labor cost/hour when available
- automated success rate
- human-review minutes/automated run
- platform/API/AI cost
- expected maintenance allocation
- error/rework savings when supportable

### Simple monthly time saved

`manual_runs * manual_minutes - automated_runs * residual_human_minutes`

### Simple monthly economic value

`time_saved_hours * loaded_hourly_cost + measurable_error_savings - recurring_automation_cost`

Do not fabricate monetary ROI when reliable labor or error-cost data is unavailable. Report time saved separately.

## Pilot measurement

Before production, define:

- current baseline
- target
- measurement window
- what counts as an automated success
- what counts as human intervention
- failure/rework definition
- data source
