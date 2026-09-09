# Model and Instruction Policy

## Instructions

An AI Employee may have natural-language instructions, but instructions are **not** the sole source of authority.

Instructions define:

- role behavior;
- communication style;
- task approach;
- escalation cues;
- domain rules that legitimately require semantic reasoning.

Authorization/risk/budget/workspace enforcement stays outside the model.

## Versioning

Published RoleVersion references an immutable instruction version/ref.

Changing instructions requires:

- new role version or explicitly versioned compatible deployment;
- applicable evaluation regression;
- staged promotion for material changes.

## Model policy

Prefer a policy reference over “always use model X forever.”

A model policy can constrain:

- approved providers/models;
- minimum capability;
- data handling constraints;
- max cost;
- latency target;
- structured output requirement;
- tool-calling requirement;
- fallback policy.

## Model changes

Switching model/provider may change behavior even if instructions are identical.

Therefore material model changes require applicable role evaluations.

## Fallback

Fallback is allowed only when the fallback model:

- satisfies the data policy;
- supports required structured/tool capabilities;
- has been evaluated for the role;
- does not weaken authority/security.

Do not silently fallback to an unevaluated cheaper model during production failure.

## Prompt assembly

Separate:

1. system/policy-controlled instructions;
2. role instructions;
3. task input;
4. retrieved knowledge;
5. tool results;
6. memory.

Untrusted content stays clearly marked as data.

## Injection rule

Instructions found inside task data, websites, emails, documents, knowledge passages, or tool output do not override role/system policy.

## Output

Use structured schemas for machine-consumed decisions/results whenever practical.

Free-form prose should not itself trigger a high-impact action without deterministic parsing/policy validation.
