# Skills, Tools, and Workflows

## Principle

AI Employees should **use** Workflow OS capabilities rather than become a parallel automation platform.

## Responsibility decomposition

For each responsibility, classify work into:

```text
Exact rule?
  -> deterministic workflow

Semantic interpretation?
  -> AI transform

Dynamic next-action reasoning?
  -> agent session

High-impact judgment?
  -> human task/approval
```

## Skill

A Skill is a client/product-facing reusable capability.

Examples:

- triage support request;
- prepare invoice reminder;
- create weekly operations summary;
- research vendor profile.

A Skill should normally reference a governed workflow/tool bundle.

It does not introduce hidden permissions.

## Tool

Tools are narrow operations.

Prefer:

- `invoice.read_overdue`
- `crm.create_internal_note`
- `email.create_draft`

over:

- `database.execute_any_sql`
- `mailbox.full_access`
- `http.call_any_url`

## Workflow

A workflow owns known process structure, state, waits, retries, approvals, and recovery.

The AI Employee may:

- initiate an approved workflow;
- receive a workflow task;
- call a workflow as a Skill;
- provide bounded input to a workflow.

It does not replace workflow state with hidden agent memory.

## Agent session

An agent session is justified when:

- the next step depends on unstructured evidence;
- multiple allowed tools may be chosen dynamically;
- deterministic branching would be brittle or impractical.

The agent still operates inside:

- role authority;
- tool allowlist;
- budgets;
- Workflow OS task state;
- escalation policy.

## Tool result verification

Tool success messages are not always proof of business outcome.

For material actions, define:

- provider confirmation;
- read-after-write check;
- business-key reconciliation;
- downstream event;
- human confirmation.

## Dynamic tool discovery

Future AI Employees may discover tools from a registry/MCP catalog, but discovery does not grant execution permission.

The role can see only tools allowed by policy, and runtime authorization is checked again at execution.

## Versioning

A role version references compatible versions/ranges of:

- skills;
- workflows;
- tool contracts;
- knowledge sources;
- evaluation suites.

Breaking tool/workflow semantics require compatibility review before role promotion.
