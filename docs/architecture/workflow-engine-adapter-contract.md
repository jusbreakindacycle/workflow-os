# Workflow Engine Adapter Contract

## Purpose

Execute portable business workflow intent without making one automation engine canonical.

WIR remains the canonical workflow representation inside a Project.

## Conceptual operations

A Workflow Engine Adapter should support or explicitly reject equivalents of:

```text
health
capabilities
validate(WIR)
deploy/publish(WIR version)
activate/deactivate
startRun
getRun
cancelRun
resume/approval callback when supported
listRunEvents
reconcile
```

## Mapping

Store provider/engine version, external flow/deployment/run IDs, and exact WIR version. Provider workflow definitions are deployment projections.

## Requirements

- documented/supported provider surfaces only;
- no direct provider database writes;
- idempotent/reconcilable mutations;
- explicit unsupported-node reporting;
- Workspace/Project/workflow attribution;
- secret references/bindings instead of embedded values;
- normalized run/error/cost evidence;
- provider `success` does not automatically complete unrelated Project work.

## Current provider position

Activepieces remains a candidate engine, not a required Phase 1 dependency. See `docs/providers/activepieces.md`.
