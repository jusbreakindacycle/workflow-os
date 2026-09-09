# Workflow Taxonomy

Workflow OS classifies work before selecting how it should execute.

## By determinism

### Deterministic
Rules and sequence are known in advance.

Examples: data synchronization, invoice creation, exact routing rules, scheduled reporting.

### AI-assisted
The sequence is mostly known, but one or more bounded steps use semantic inference.

Examples: classification, extraction, summarization, drafting, fuzzy matching.

### Agentic
The next step cannot be completely predetermined and a model must select among explicitly allowed tools/actions based on observations.

Examples: bounded investigation, troubleshooting, research, exception resolution.

### Human-in-the-loop
A human judgment is an explicit process state.

Examples: approve a refund, sign off a proposal, review low-confidence extraction.

### Hybrid
Combines deterministic, AI-assisted, agentic, and human steps under one governed workflow.

## By participant

A process may involve:

- Workflow OS deterministic execution;
- AI transform;
- AI Employee / governed agent task;
- human operator/approver;
- RPA/robot;
- external system.

**Participant is not execution semantics.**

An “AI Employee” role may still perform most of its work through deterministic workflows.

## By duration

- synchronous/short-running
- asynchronous
- scheduled
- long-running/wait-state
- event-correlated
- bounded AI Employee task (future Phase 3)

## By interface

- API/native connector
- webhook/event
- database
- file/document
- email/messaging
- browser/desktop/RPA
- human task
- AI/MCP tool

## By impact

- R0 read-only
- R1 reversible internal mutation
- R2 externally visible or business-significant but generally reversible mutation
- R3 high-impact, irreversible, legal, financial, destructive, or otherwise sensitive action

See the risk model for policy.

## Routing question

Do not ask:

> Which single platform or AI Employee automates everything?

Ask:

> What execution mode best fits each part of the work, which participant should own it, and what governance must wrap it?
