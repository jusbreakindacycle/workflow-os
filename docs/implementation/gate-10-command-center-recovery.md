# Phase 1 Gate 10 — Restart/Recovery and Command Center

## Purpose

Finish the Phase 1 local control-plane proof by showing that canonical state remains understandable across process restart and that the operator can see the portfolio without reading worker transcripts.

## Restart semantics

SQLite remains the canonical local persistence layer. Restart does not infer success from a process disappearing.

A persisted Assignment that was `running` before restart remains `running`; the Project Command Center derives:

`in_flight_requires_reconciliation_after_restart`

This is intentionally conservative. Phase 1 does not pretend the work finished, retry automatically, or mark its WorkItem complete.

## Command Center

The local UI/API derives:

- Project phase, operational status, and explainable health;
- current accepted Brief version;
- Work graph and next-ready work;
- Needs My Attention;
- Activity Feed from ProjectEvents;
- active/in-flight Assignments and recovery state;
- repository proposals;
- Project Pack versions;
- Spend Envelopes.

Portfolio health uses only explainable state:

- `blocked` when canonical blocked/failed conditions exist;
- `at_risk` when unresolved attention exists;
- `healthy` when accepted Project state has no attention condition;
- `unknown` before enough accepted state exists.

No AI-generated completion percentage is used.

## Operator UI

The Phase 1 screen now combines:

- Command Center portfolio;
- Needs My Attention;
- Activity Feed;
- New Project/Discovery flow;
- strategy-conditional mock repository approval;
- inspection of next-ready work;
- one-click bounded mock Assignment + evidence + verification for the next eligible WorkItem.

The UI remains intentionally simple and local; it is evidence for the golden-path semantics, not a polished PM suite.

## Evidence

`test/phase1-control-plane.test.js` closes and reopens the SQLite database while an Assignment is running, then proves the Assignment remains in-flight and the WorkItem is not falsely complete. `test/phase1-api.test.js` proves the HTTP golden path and Command Center. `test/server.test.js` proves Gate 10 health/UI startup. GitHub Actions also executes migration and backup commands on Node 24.15.

## Phase 1 stop rule

With Gate 10 and the acceptance report passing, Phase 1 stops. The next meaningful work is Phase 2 real execution behind the existing provider-neutral boundaries, not more generic project-management features.
