# ADR-014: Human-governed Autonomous Delivery North Star

**Status:** Accepted

## Context

The operator should not remain the manual dispatcher/prompt engineer between ChatGPT, Codex, Claude Code, Copilot, Kimi, OpenCode, or future tools.

## Decision

The product North Star is a **human-governed autonomous delivery operating system for a solo builder**.

The operator primarily gives/revises goals, supplies credentials when necessary, records/provides human or client decisions, and approves/rejects/revises consequential decisions/new spend. The system coordinates discovery, strategy selection, planning, execution, verification, deployment, and maintenance as far as approved authority/evidence/capability permit.

A material goal revision is versioned and impact-propagated; it does not silently rewrite the basis of already-planned/running work.

Human governance remains mandatory for commercial commitments, external client acceptance where needed, material scope/risk changes, unapproved metered spend, credentials, and high-impact production actions.

## Consequences

- prompt engineering becomes internal system capability;
- autonomy requires explicit loops/state/budgets/verification/escalation;
- agent chat is not the primary UX;
- solution strategy is case-specific, not always `custom_build`;
- full automation cannot bypass human authority.
