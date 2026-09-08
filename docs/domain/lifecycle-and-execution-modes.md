# Workflow Lifecycle and Execution Modes

## Lifecycle

```text
Idea
 -> Discovery
 -> Brief
 -> Feasibility/Risk
 -> Draft WIR
 -> Validate
 -> Test
 -> Review
 -> Deploy
 -> Active
 -> Observe
 -> Revise
 -> Supersede/Retire
```

Published production workflow versions are immutable. A change creates a new version.

## Execution-mode router

| Workflow characteristic | Preferred execution class |
|---|---|
| simple SaaS/API integration | low-code/iPaaS engine |
| Microsoft-heavy process | Power Automate-class engine |
| legacy desktop/no stable API | RPA adapter |
| governed BPMN/long-running process | process orchestrator |
| code-first durable workflow | durable execution runtime |
| stateful reasoning | agent runtime behind policy |
| isolated custom logic | sandboxed function/container |
| judgment/approval | human task |

## Deterministic-first rule

If valid inputs plus business rules can define the action precisely, use deterministic logic.

Use AI for bounded transformations. Use an agent only when choosing the next action genuinely requires contextual/semantic reasoning that cannot reasonably be represented as stable rules.

## Long-running processes

Wait states, timers, external callbacks, approvals, and resumptions must be represented explicitly. They must not rely on an LLM remembering to continue.
