# ADR-019: Core Control Plane Before Provider Spikes

**Status:** Accepted

**Supersedes:** ADR-004's implementation-order requirement that Activepieces be the first coding task.

## Context

The clarified North Star centers Project intake, commercial context, Project Pack, operator attention, model/runtime independence, and autonomous coordination. Building an execution-engine adapter first would optimize a lower layer before the canonical product semantics exist.

## Decision

Phase 1 builds the local provider-independent control plane first.

Paperclip, Activepieces, real model APIs, coding runtimes, and automatic GitHub repository creation are later gates behind stable canonical contracts.

Activepieces remains a workflow engine candidate; Paperclip remains an internal workforce candidate.

## Consequences

- Phase 1 can be developed/tested without paid AI/provider dependencies;
- provider spikes gain concrete contracts to test against;
- early demo value is the actual operator/control product, not an isolated adapter;
- real autonomous execution is delayed until state/authority/evidence semantics are trustworthy.
