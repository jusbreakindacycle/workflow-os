# Phase 0 Definition

## Purpose

Phase 0 creates the engineering contract before application code exists.

## Required artifacts

- [x] product goal
- [x] MVP scope/non-goals
- [x] product/user problem brief
- [x] freelancer funnel
- [x] workflow taxonomy and lifecycle
- [x] WIR v0 specification
- [x] WIR v0 machine-readable schema and synthetic example
- [x] architecture/control-plane boundary
- [x] execution-engine adapter contract
- [x] engine-routing policy
- [x] connector/tool contract
- [x] data/event model
- [x] nested loop-engineering model
- [x] workflow risk and approval model
- [x] bound human-approval semantics
- [x] automation feasibility/ROI model
- [x] reliability contract
- [x] security/workspace-isolation contract
- [x] data classification/retention model
- [x] AI/agent threat model
- [x] testing strategy
- [x] MVP acceptance criteria
- [x] observability model
- [x] engineering maturity and scale-trigger matrix
- [x] competitive/technology landscape and source inventory
- [x] ADR system
- [x] reviewer/subagent contracts
- [x] Codex master prompt and task/review prompts
- [x] reusable discovery/handoff/incident templates
- [x] adversarial Phase 0 review record

## Phase 0 exit criteria

Phase 0 is complete when:

1. all required artifacts exist;
2. cross-document terms and decisions are consistent;
3. WIR example conforms to WIR schema intent;
4. MVP acceptance criteria are concrete enough to test;
5. no implementation/runtime code has been added;
6. no unresolved decision blocks the first Phase 1 spike;
7. adversarial review finds no critical contradiction;
8. the Phase 0 PR is approved/merged by the human owner.

## What Phase 0 does not prove

Phase 0 does not prove that Activepieces satisfies every adapter requirement. Phase 1 begins with a narrow engine spike and may supersede ADR-004 if evidence requires it.
