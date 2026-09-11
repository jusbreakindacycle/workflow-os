# Activepieces Candidate

**Decision:** candidate Workflow Engine Adapter for business automations. It is no longer the first Phase 1 coding gate.

## Why it is interesting

Activepieces may provide triggers/actions/connectors, deterministic SaaS automation, waits/approvals, and MCP/API surfaces useful for WIR execution.

## Boundary

WIR remains canonical. Activepieces flow definitions are deployment projections.

## Future hands-on gates

Before real adapter adoption:

1. pin exact version/edition/deployment;
2. confirm documented supported control API/MCP surface;
3. create/update/validate/publish synthetic flow through supported surface;
4. map triggers/actions/waits/approvals required by supported WIR subset;
5. initiate/observe/reconcile runs;
6. test connection/secret references;
7. test retry/replay/unknown outcome behavior;
8. test tenant/client isolation strategy;
9. record unsupported WIR semantics;
10. prove removal/replacement does not erase canonical workflow meaning.

No direct database writes or undocumented APIs.

## Timing

Evaluate after the core Project control plane is stable and when a real Project needs business workflow automation.
