# Product Goal

## North Star

Build a **human-governed autonomous delivery operating system for a solo builder**.

The operator should be able to start with an incomplete statement such as:

> “I have a new client. They want an ordering app because their current process is messy.”

The system should convert that raw intent into a governed delivery process without requiring the operator to manually prompt, route, remind, or synchronize multiple AI products.

## Operator job

The long-term operator responsibility is intentionally small:

- give or revise the goal;
- provide known context/files/voice/screenshots/messages;
- answer important discovery questions, including `I don't know`;
- provide credentials when needed;
- approve/reject/revise consequential decisions;
- approve any paid AI/runtime execution before spend;
- accept commercial/production commitments that require human authority.

## System job

Subject to policy, evidence, available capability, and approved budgets, the system should coordinate:

1. intake;
2. adaptive interview;
3. research;
4. challenge of the requested solution;
5. problem/outcome definition;
6. commercial scope and constraints;
7. requirements/non-goals;
8. architecture;
9. work planning;
10. repository approval/bootstrap;
11. case-specific Project Pack generation;
12. role activation;
13. model/runtime/skill selection;
14. build/automation work;
15. verification and adversarial review;
16. deployment approval/execution;
17. observation;
18. incident/maintenance/change work;
19. lessons/reuse.

## Independence goal

Workflow OS must not require one specific AI platform to preserve or understand a Project.

Switching from Codex to Claude Code, Copilot, OpenCode, a local/open model runtime, or a future provider must not require redefining the Project from scratch.

Provider-specific prompts/instruction files are compiled projections of canonical Project state.

## Local-first goal

The operator's Project/commercial state, decisions, approvals, evidence, Activity Feed, and Command Center should remain locally usable even when external providers are unavailable.

Local-first is not a promise that every advanced AI workload runs locally. The system should route work according to capability, privacy, cost, availability, and approved policy.

## Human-governance goal

Autonomy is bounded by explicit authority.

The system may continue routine, in-scope, already-authorized work without asking the operator for every microscopic step. It must stop for material scope/price/deadline/risk/credential/production decisions and before unapproved paid execution.

## Success condition

Workflow OS succeeds when the operator can leave it working, return later, and answer from one system:

- what every Project is trying to achieve;
- what is happening now;
- what completed and with what evidence;
- what failed or is blocked;
- what needs human attention;
- what money was approved/spent;
- what was deployed;
- what production work remains;
- what the system will do next;

without reconstructing the story from AI chats or manually moving prompts between vendors.
