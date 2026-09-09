# AI Employee Design Loop

AI Employee design extends Workflow OS loop engineering.

## Loop A — Role discovery

```text
Business outcome
 -> role responsibilities
 -> task inventory
 -> systems/data
 -> decisions/exceptions
 -> authority
 -> baseline metrics
 -> repeat until role boundary is clear
```

## Loop B — Work decomposition

For every task:

```text
Can exact rules solve it?
  yes -> deterministic workflow
  no
    ↓
Does it only need semantic transformation?
  yes -> AI transform
  no
    ↓
Does dynamic tool/step selection add value?
  yes -> bounded agent session
  no/unsafe -> human task
```

## Loop C — Capability design

```text
Responsibility
 -> Skill
 -> Workflow/Tool
 -> permission
 -> risk
 -> verification
 -> recovery
```

Avoid granting a broad tool simply because the role has a broad title.

## Loop D — Evaluation

```text
Spec
 -> synthetic cases
 -> adversarial cases
 -> shadow cases
 -> compare/correct
 -> version
 -> re-evaluate
```

## Loop E — Autonomy promotion

```text
Test
 -> Shadow
 -> Supervised
 -> Active
```

Each transition requires evidence and human-owner approval.

## Loop F — Production improvement

```text
Observe
 -> identify repeated failure/correction
 -> root cause
 -> change role/workflow/tool/knowledge
 -> new version
 -> regression evaluation
 -> staged rollout
```

## Loop G — Productization

```text
Client role
 -> sanitize
 -> extract reusable pattern
 -> Role Template
 -> reusable Skill/Workflow Template
 -> new client discovery
```

Never template secrets or confidential client-specific assumptions.
