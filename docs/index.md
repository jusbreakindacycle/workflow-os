# Documentation Index

## Product

- [Goal](product/goal.md)
- [Product Brief](product/product-brief.md)
- [Phase 1 / MVP Scope](product/scope-mvp.md)
- [Operator Experience](product/operator-experience.md)
- [Intake and Discovery](product/intake-and-discovery.md)
- [Commercial Engagement](product/commercial-engagement.md)
- [Project Operating Model](product/project-operating-model.md)
- [Project Command Center](product/project-command-center.md)

## Architecture

- [Root Architecture](../ARCHITECTURE.md)
- [System Context](architecture/system-context.md)
- [Data and Event Model](architecture/data-and-event-model.md)
- [Local-first Control Plane](architecture/local-first-control-plane.md)
- [Model / Runtime Broker](architecture/model-runtime-broker.md)
- [Capability Vocabulary](architecture/capability-vocabulary.md)
- [Project Bootstrapper and Instruction Compiler](architecture/project-bootstrapper-and-instruction-compiler.md)
- [Loop / Routine Engine](architecture/loop-routine-engine.md)
- [Skill Registry](architecture/skill-registry.md)
- [Spend Gate](architecture/spend-gate.md)
- [Provider Adapter Contract](architecture/provider-adapter-contract.md)
- [Internal Workforce Adapter](architecture/internal-workforce-adapter-contract.md)
- [Workflow Engine Adapter](architecture/workflow-engine-adapter-contract.md)

## Internal workforce / engineering harness

- [Internal Workforce](agents/internal-workforce.md)
- [Agent Assignment Contract](agents/assignment-contract.md)
- [Verification and Review](agents/verification-and-review.md)
- [Agent Operability](engineering/agent-operability.md)

## Workflow automation

- [WIR v0](workflow-ir/wir-v0-spec.md)
- [WIR v0 Schema](workflow-ir/wir-v0.schema.json)

## Safety / testing / operations

- [Security Model](security/security-model.md)
- [Agent Threat and Data Policy](security/agent-threat-and-data-policy.md)
- [Risk and Approval Policy](security/risk-and-approval-policy.md)
- [Reliability Model](reliability/reliability-model.md)
- [Testing Strategy](testing/testing-strategy.md)
- [Verification Ladder](testing/verification-ladder.md)
- [Phase 1 Acceptance Criteria](testing/acceptance-criteria.md)
- [Phase 2 Acceptance Criteria](testing/phase-2-acceptance-criteria.md)
- [Phase 2.1 Free-First Acceptance Criteria](testing/phase-2.1-acceptance-criteria.md)
- [Production and Maintenance](operations/production-maintenance.md)
- [Windows Free-First Provider Setup](operations/free-first-provider-setup-windows.md)

## Implementation

- [Local Development — Phase 1 Gate 1](implementation/local-development.md)
- [Canonical Entities — Phase 1 Gate 2](implementation/gate-2-canonical-entities.md)
- [New Project / Discovery / Delivery Strategy — Phase 1 Gate 3](implementation/gate-3-new-project-discovery.md)
- [Work Graph / Needs My Attention / Activity Feed — Phase 1 Gate 4](implementation/gate-4-work-graph-attention.md)
- [Project Pack / Context Slice — Phase 1 Gate 5](implementation/gate-5-project-pack-context-slice.md)
- [Goal Revision / Impact Propagation — Phase 1 Gate 6](implementation/gate-6-goal-revision-impact.md)
- [Optional Repository Approval — Phase 1 Gate 7](implementation/gate-7-repository-approval.md)
- [Mock Assignment / Verification — Phase 1 Gate 8](implementation/gate-8-mock-assignment-verification.md)
- [Spend Gate — Phase 1 Gate 9](implementation/gate-9-spend-gate.md)
- [Restart / Recovery / Command Center — Phase 1 Gate 10](implementation/gate-10-command-center-recovery.md)
- [Phase 2 Autonomy Kernel](implementation/phase-2-autonomy-kernel.md)
- [Phase 2.1 Free-First Provider & Quota Broker](implementation/phase-2.1-free-first-quota-broker.md)

## Providers

- [Provider Strategy](providers/strategy.md)
- [Paperclip Candidate](providers/paperclip.md)
- [Activepieces Candidate](providers/activepieces.md)

## Decisions, reviews, and plans

- [Decision Index](decisions/index.md)
- [Legacy Decision Disposition](decisions/legacy-foundation-decisions.md)
- [PR #7 Adversarial Review](reviews/pr-7-adversarial-review.md)
- [Phase 1 Completion Report](reviews/phase-1-completion-report.md)
- [Phase 2 Implementation Report](reviews/phase-2-implementation-report.md)
- [Phase 2.1 Live Certification Report](reviews/phase-2.1-live-certification-report.md)
- [Roadmap](plans/roadmap.md)
- [Phase 1 Core Control Plane](plans/phase-1-core-control-plane.md)
- [Phase 2 Autonomy Kernel](plans/phase-2-autonomy-kernel.md)
- [Phase 2.1 Free-First Provider & Quota Broker](plans/phase-2.1-free-first-quota-broker.md)

## Templates / schemas

Templates are scaffolds used to generate case-specific records. They are not generic prompts and are not canonical until instantiated into Project state.

- `templates/project-intake.md`
- `templates/commercial-engagement.md`
- `templates/project-pack.example.yaml`
- `templates/agent-assignment.example.yaml`
- `templates/work-item-proposal.md`
- `schemas/project-pack.schema.json`
- `schemas/context-slice.schema.json`
- `schemas/agent-assignment.schema.json`
- `schemas/model-runtime-profile.schema.json`
- `schemas/provider-connection.schema.json`
- `schemas/execution-route.schema.json`
- `schemas/route-decision.schema.json`
- `schemas/skill-definition.schema.json`
- `schemas/loop-run.schema.json`
