# Connector and Tool Contract

## Purpose

A connector/tool is the governed capability exposed to a workflow or future agent. It is not merely a function name.

## Required metadata

Each tool/action definition should declare:

- stable `tool_ref`
- provider/system
- operation name and description
- input schema
- output schema
- read/write classification
- default risk tier
- supported data classifications
- integration/authentication reference type
- timeout limits
- provider rate-limit notes
- retryable vs non-retryable error classes
- idempotency support
- side-effect verification method
- reconciliation method
- compensation method when available
- allowed network destination/provider
- audit requirements
- engine/connector version metadata

## Authorization

Tool availability is resolved using:

`workspace + workflow version + tool + action + risk + data class + approval policy`

A model choosing a tool is not authorization to use it.

## Side-effect contract

A mutating action must specify one of:

- provider idempotency key
- Workflow OS/business idempotency key
- reconcile-before-retry
- explicitly non-idempotent with automatic retry disabled

Where possible, define how the caller verifies that the intended business outcome actually occurred.

## Error contract

Normalize provider errors into Workflow OS categories while retaining provider-specific diagnostic metadata.

The tool contract should distinguish:

- invalid input
- authorization unavailable
- rate limit
- transient transport/provider failure
- timeout
- business rejection
- uncertain mutation outcome
- unsupported provider state

## Schema discipline

Tool input/output schemas are versioned. Breaking changes must not silently alter an already-published workflow version.

## AI exposure

Tools exposed to an agent should use the narrowest operation possible. Prefer `create_draft_reply` over a generic unrestricted mailbox API; prefer `read_customer_record` over broad database access.
