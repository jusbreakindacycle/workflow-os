# Context, Memory, and Knowledge

## Principle

> Context is assembled deliberately. Memory is persisted deliberately.

An AI Employee must not rely on an accidental ever-growing chat history.

## Context layers

### 1. Role context

Stable versioned information:

- purpose;
- responsibilities;
- constraints;
- terminology;
- authority;
- escalation policy.

### 2. Task context

Information specific to the current assignment:

- task input;
- current workflow/run state;
- relevant records;
- deadline;
- prior task events needed for completion.

Task context is ephemeral by default.

### 3. Knowledge

Approved read-oriented sources:

- SOPs;
- policy documents;
- product documentation;
- structured reference data;
- knowledge bases.

Knowledge sources are versioned/referenced and workspace-scoped.

### 4. Memory

Explicit persisted information derived from previous work.

Memory is optional.

## Memory types

### Working memory

Current-task scratch state.

Default: discarded or reduced to the task evidence required by retention policy.

### Episodic memory

A summarized fact about a prior task/event.

Example:

“Customer requested email-only contact on case X.”

Only persist when the role has a legitimate future need.

### Profile/state memory

Stable approved operational preferences or state.

Example:

“Weekly report destination = operations channel.”

Prefer structured fields over free-form narrative.

### Learned heuristic

A proposed rule/pattern derived from experience.

Never silently become production policy.

A learned heuristic must be reviewed, evaluated, and promoted into a role/workflow version before it controls business behavior.

## Memory write modes

- `disabled`
- `approved_fields_only`
- `reviewed_summary`
- `policy_controlled`

## Cross-workspace rule

Cross-workspace memory is forbidden by default and the v0 schema requires `cross_workspace_memory: false`.

Client A's task history must not become Client B's context.

## Memory poisoning

Retrieved content or a malicious user may attempt to create persistent false instructions.

Controls:

- memory writes pass through schema/policy;
- untrusted text cannot directly write authority/instructions;
- sensitive memory changes can require review;
- memory entries record source/provenance;
- corrections supersede rather than silently rewrite audit history where material.

## Retrieval

Context assembly should:

- retrieve only task-relevant sources;
- enforce workspace/data-class policy before model access;
- minimize sensitive data;
- include provenance/source references;
- avoid loading all historical conversations “just in case.”

## Retention

Retention depends on:

- client requirements;
- data classification;
- audit need;
- evaluation need;
- legal/privacy constraints.

Raw model prompts/responses should not automatically be retained indefinitely.

## Provider boundary

Sending context to an AI provider is a data transfer.

Provider/model selection must be compatible with the workflow/role data policy.

## Human access

Humans reviewing AI Employee memory should see:

- source;
- created time;
- role/task origin;
- classification;
- current/obsolete status;
- deletion/retention policy where appropriate.
