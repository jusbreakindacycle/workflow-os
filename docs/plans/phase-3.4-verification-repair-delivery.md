# Phase 3.4 — Verification / Repair / Delivery

## Status

Implemented and CI-verified as part of the Phase 3 end-to-end golden path.

## Objective

Make completion depend on observable evidence rather than worker/provider self-report.

Phase 3.4 preserves the canonical chain:

```text
Assignment
-> execution finished
-> evidence
-> verification
-> WorkItem completion or failure
-> bounded repair/escalation when needed
-> independently reconciled delivery record
```

Authority and verification remain separate. Passing a test never grants missing permission for an external or production action.

## Phase 3 Assignment contract

Before a Phase 3 WorkItem executes, its Work Spec is projected into:

- a Phase 3 Project Pack containing role/capability/evidence/risk/action/authority/verification requirements;
- a minimum-authorized Context Slice;
- a bounded Assignment contract.

The Assignment explicitly excludes material scope change, shared-remote mutation, production deployment, external messaging and unapproved paid execution.

## Deterministic verification

For the first `custom_build` certification path, Phase 3.4 executes real local commands through Phase 3.3:

- Node syntax validation;
- Node automated behavior tests.

Their process output and exit codes are recorded as execution evidence. A worker text response claiming tests passed is not accepted as a substitute.

## Actual local flow verification

The certification starts the generated application over loopback and performs an actual synthetic lead flow:

1. `GET /` must return the synthetic offer/lead form;
2. invalid lead input must be rejected with HTTP 400;
3. a valid synthetic lead must return HTTP 201;
4. the local receiver/store count must become exactly one;
5. the success response must be observable.

This produces L3 evidence because the real locally running application is exercised rather than inferred from source code.

## Independent review

The final review is a separate deterministic reconciler over observable Project artifacts and canonical evidence. It does not trust the implementation worker's self-report and does not call the same artifact successful merely because a second prompt says so.

The review checks:

- L2 automated-test evidence exists;
- L3 local-flow evidence exists;
- required generated files exist in the hashed workspace manifest;
- an actual successful test process record exists;
- a local server process record exists and was stopped/exited;
- implementation and independent-review Assignments are distinct;
- workspace networking is still loopback-only.

The review records its independence basis explicitly.

## Repair model

Repair attempts are classified records, not blind prompt repetition.

`phase3_repair_attempts` records:

- affected WorkItem;
- attempt number;
- failure class;
- repair/escalation action summary;
- status.

The first implementation allows at most two repair attempts for one WorkItem. A third attempt fails with `phase3_repair_budget_exhausted` rather than creating an unbounded loop.

Material scope change, missing/stale authority, unexpected side effects, and blocked verification remain escalation conditions rather than autonomous repair opportunities.

## Delivery record

A Phase 3 delivery record cannot be created until L3-or-higher `independent_verification` evidence exists.

The record captures/references:

- exact accepted Brief version;
- selected strategy;
- planner version and work graph;
- governed execution-workspace identity and manifest;
- deterministic evidence;
- actual local-flow evidence;
- verification records;
- independent review result;
- known limitations/non-goals;
- remaining human/next action.

No GitHub URL, production deployment URL, real customer lead, ad performance, CRM delivery, email or SMS effect is claimed by this phase.

## Tests

Automated coverage proves:

- repair attempts stop after the bounded budget;
- the full Phase 3.5 flow cannot deliver without independent L3 evidence;
- generated deterministic and actual local-flow evidence is present;
- the independent review does not trust worker self-report.

## Exit condition

Phase 3.4 is complete when Workflow OS can distinguish generated code from verified behavior, can reconcile a real local outcome into canonical evidence, and can stop rather than fabricate success when verification or authority is insufficient.

The next dependency is Phase 3.5: run the complete golden path from the raw synthetic request and certify the resulting evidence chain end to end.
