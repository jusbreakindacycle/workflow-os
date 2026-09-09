# AI Employee Role Design Prompt

Use this during future AI Employee discovery/specification work.

## Required reading

Read:

- `AGENTS.md`
- `docs/ai-employees/overview.md`
- `docs/ai-employees/terminology.md`
- `docs/ai-employees/product-brief.md`
- `docs/ai-employees/role-model.md`
- `docs/ai-employees/authority-identity-and-permissions.md`
- `docs/ai-employees/context-memory-and-knowledge.md`
- `docs/ai-employees/skills-tools-and-workflows.md`
- applicable risk/security/Workflow OS docs.

## Task

Turn the requested business role into an **AI Employee Blueprint**, not an unrestricted agent prompt.

## Procedure

1. Define the measurable business outcome.
2. List responsibilities and explicit non-responsibilities.
3. Inventory actual tasks.
4. Classify every task:
   - deterministic workflow;
   - AI transform;
   - agentic reasoning;
   - human task.
5. Identify systems/data/interfaces.
6. Define narrow Skills/Tools.
7. Define identity and authority.
8. Define approvals and prohibited actions.
9. Define knowledge and whether memory is truly needed.
10. Define budgets and escalation.
11. Define evaluation and shadow-mode plan.
12. Define baseline/ROI measures.

## Challenge requirements

Explicitly challenge:

- whether an AI Employee is needed at all;
- whether a normal workflow is enough;
- whether the role is too broad;
- whether proposed tools are overprivileged;
- whether memory is unnecessary;
- whether an agent could be replaced by deterministic logic;
- whether the client is trying to automate an undefined/broken process;
- whether the role creates unsafe/legal/financial authority.

## Output

Produce or update:

- Role Brief;
- task decomposition;
- proposed AI Employee Spec;
- capability/authority matrix;
- evaluation plan;
- deployment lifecycle recommendation;
- unresolved questions.

Do not write runtime implementation code unless the active phase explicitly authorizes it.
