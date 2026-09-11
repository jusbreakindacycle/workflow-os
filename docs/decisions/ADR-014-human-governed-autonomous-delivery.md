# ADR-014: Human-governed Autonomous Delivery North Star

**Status:** Accepted

## Context

The original repository emphasized workflow automation and later expanded into a solo AI business delivery control plane. The operator's clarified goal is stronger: they should not remain the manual dispatcher/prompt engineer between ChatGPT, Codex, Claude Code, Copilot, Kimi, OpenCode, or future tools.

## Decision

The product North Star is a **human-governed autonomous delivery operating system for a solo builder**.

The operator primarily gives/revises goals, supplies credentials when necessary, and approves/rejects/revises consequential decisions. The system coordinates discovery, planning, execution, verification, deployment, and maintenance as far as approved authority/evidence/capability permit.

Human governance remains mandatory for commercial commitments, material scope/risk changes, unapproved spend, credentials, and high-impact production actions.

## Consequences

- prompt engineering becomes an internal system capability rather than the operator's daily job;
- autonomy requires explicit loops, state, budgets, verification, and escalation;
- agent chat is not the primary UX;
- full automation is never permission to bypass human authority.
