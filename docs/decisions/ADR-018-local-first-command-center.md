# ADR-018: Local-first Web Command Center First

**Status:** Accepted

## Decision

The operator starts Projects and manages the company from a local-first web Command Center.

VS Code/agent IDEs are execution environments, not the primary system of record or mandatory Project entry point.

A desktop shell may later package the same control plane for native filesystem/runtime/background/notification capabilities.

The default operator visibility is Needs My Attention + Activity Feed, with detailed agent/provider logs on drill-down.

## Consequences

- faster/portable initial implementation;
- local canonical state survives provider outages;
- desktop-specific features remain optional;
- avoids a chatroom becoming the management interface.
