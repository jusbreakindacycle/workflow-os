# System Context

## Boundary

Workflow OS is the canonical control plane between the operator and replaceable execution systems.

```text
                         Human Operator
                               |
                               v
                    Local-first Command Center
                               |
                               v
                    Canonical Control Plane
         Workspace / Client / Engagement / Project / WorkItem
        Decisions / Approvals / Project Pack / Events / Evidence
                               |
             +-----------------+-----------------+
             |                 |                 |
             v                 v                 v
      Autonomy Kernel    Model/Runtime Broker   Workflow Router
             |                 |                 |
             v                 v                 v
      Workforce Adapter     AI providers     Workflow engines
             |                 |                 |
             v                 v                 v
      worker runtimes      models/APIs       Activepieces/etc.
             |
             +-----------------+-------------------+
                               |
                     Source / Deploy / Observe
                    GitHub / clouds / monitoring
```

## Actors

### Human operator

Final authority for goals, commercial commitments, consequential risk, credentials, paid execution, and high-impact production decisions.

### Internal specialist worker

Bounded executor for one AgentAssignment. May be backed by any eligible model/runtime/provider.

### External provider

Replaceable execution/detail system. It may report state/evidence but cannot silently become canonical Project truth.

### Client

Commercial stakeholder. Client-facing access/portal is future scope; Client records exist earlier for operator context.

## Trust boundaries

- Workspace boundary between unrelated client/internal data;
- control plane vs external provider;
- provider credential/secret boundary;
- dev/test vs production environment;
- model/runtime/tool permissions;
- operator approval boundary;
- paid spend boundary.

## Failure assumption

Any provider can be unavailable, rate-limited, change API semantics, lose session context, report incomplete status, or be removed entirely.

Workflow OS must preserve enough canonical state to explain and safely resume/re-route the Project.
