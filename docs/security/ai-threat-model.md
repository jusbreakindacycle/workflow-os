# AI and Agent Threat Model

AI-generated or retrieved text is **untrusted data** unless a policy explicitly establishes otherwise.

This model applies to bounded AI workflow steps and future AI Employees.

## Main threats

### Prompt injection
Emails, web pages, documents, tickets, tool outputs, and retrieved text can contain instructions attempting to redirect the model.

Control: separate system/policy instructions from untrusted content; never treat retrieved instructions as authority.

### Tool poisoning / misleading descriptions
A tool or connector may expose inaccurate or malicious metadata.

Control: tools must come from an approved registry with explicit schemas, permissions, risk tier, and provider identity.

### Excessive agency
A model receives tools broader than the task requires.

Control: per-workflow/role allowlists, least-capability tool design, budgets, and policy checks outside the model.

### Sensitive-data exfiltration
The model may attempt or be induced to send protected information to an unrelated tool/provider.

Control: data-class compatibility checks and destination/tool authorization independent of model reasoning.

### Approval manipulation
A model may generate persuasive text that obscures what action is being approved.

Control: approval UI/state binds to exact normalized action parameters and workflow/role version, not only model-generated prose.

### Hallucinated state
A model may claim an action succeeded when it did not.

Control: execution engines/tools return structured results; verify side effects when possible. Model narration is not execution evidence.

### Infinite/expensive loops
Dynamic planning can repeat calls.

Control: iteration, tool-call, time, token/cost ceilings plus explicit terminal/escalation states.

### Memory/context contamination
Client A information may influence Client B.

Control: workspace-scoped context and explicit context assembly; cross-workspace memory is forbidden by default.

### Memory poisoning
Untrusted content attempts to persist false instructions, facts, or authority for future tasks.

Control:
- typed memory write policy
- provenance
- review where needed
- untrusted data cannot directly alter role/system instructions or authority
- learned heuristics require evaluation/version promotion.

### Identity confusion / impersonation
An AI Employee may act under an overly broad shared identity or present an action as if a human personally performed it.

Control:
- explicit identity mode
- actor chain
- least-privileged principals
- delegated-user authorization when appropriate
- no hidden human impersonation.

### Self-modification / goal expansion
A role attempts to rewrite its own responsibilities, tools, policy, or evaluation criteria.

Control: published RoleVersions are immutable; a role may propose changes but cannot publish/authorize its own expansion.

### Delegation privilege amplification
A role delegates to another agent/tool with broader authority or uses children to evade cost/loop limits.

Control:
- delegation cannot increase authority
- child tasks inherit/narrow workspace/data policy
- shared budget accounting
- max delegation depth
- default depth 0.

### Model/provider substitution
Fallback to an unevaluated provider/model weakens quality or data policy.

Control: model-policy allowlist and role-specific regression evaluation before a material model/provider change.

## Deterministic policy boundary

The following must be enforced outside model reasoning:

- authorization
- identity mapping
- risk classification
- approval requirements
- budget enforcement
- workspace isolation
- secret handling
- lifecycle promotion
- role-version integrity
- memory write policy.

## Evaluation

AI behavior requires adversarial fixtures including:

- malicious instructions embedded in ordinary business content
- tool-result injection
- memory poisoning
- fake/stale approval
- cross-workspace retrieval attempts
- identity impersonation
- self-authority expansion
- delegation cycles/budget evasion.
