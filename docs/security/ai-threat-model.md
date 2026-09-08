# AI and Agent Threat Model

AI-generated or retrieved text is **untrusted data** unless a policy explicitly establishes otherwise.

## Main threats

### Prompt injection
Emails, web pages, documents, tickets, tool outputs, and retrieved text can contain instructions attempting to redirect the model.

Control: separate system/policy instructions from untrusted content; never treat retrieved instructions as authority.

### Tool poisoning / misleading descriptions
A tool or connector may expose inaccurate or malicious metadata.

Control: tools must come from an approved registry with explicit schemas, permissions, risk tier, and provider identity.

### Excessive agency
A model receives tools broader than the task requires.

Control: per-workflow allowlists, least-capability tool design, budgets, and policy checks outside the model.

### Sensitive-data exfiltration
The model may attempt or be induced to send protected information to an unrelated tool/provider.

Control: data-class compatibility checks and destination/tool authorization independent of model reasoning.

### Approval manipulation
A model may generate persuasive text that obscures what action is being approved.

Control: approval UI/state binds to exact normalized action parameters and workflow version, not only model-generated prose.

### Hallucinated state
A model may claim an action succeeded when it did not.

Control: execution engines/tools return structured results; verify side effects when possible. Model narration is not execution evidence.

### Infinite/expensive loops
Dynamic planning can repeat calls.

Control: iteration, tool-call, time, token/cost ceilings plus explicit terminal/escalation states.

### Memory/context contamination
Client A information may influence Client B.

Control: workspace-scoped context and explicit context assembly; no cross-workspace memory by default.

## Deterministic policy boundary

Authorization, risk classification, approval requirements, budget enforcement, workspace isolation, and secret handling must be enforced outside the model.

## Evaluation

AI behavior requires adversarial fixtures including malicious instructions embedded in ordinary business content.
