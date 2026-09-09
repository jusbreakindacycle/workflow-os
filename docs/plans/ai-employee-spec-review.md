# AI Employee Specification Adversarial Review

## Result

**Status: MERGE-READY FOR HUMAN REVIEW**

This review covers the non-coding AI Employee architecture package. It does not authorize Phase 3 implementation during Phase 1.

## Core conclusion

Workflow OS can support client-facing **AI Employees / AI Workers** without changing its fundamental architecture if:

- AI Employee is modeled as a governed role;
- Workflow OS retains process/task/policy ownership;
- agent sessions remain bounded runtime components;
- deterministic workflows remain preferred for predictable work;
- responsibility and permission remain separate;
- autonomy is promoted through evidence;
- memory and delegation are explicit.

## External architecture cross-check

Current enterprise agent/orchestration patterns reviewed include:

- UiPath agents + robots + human/business orchestration;
- Workato Agent Studio + skills + governed authenticated actions;
- Microsoft autonomous agents + least privilege + human oversight guidance;
- Salesforce digital-labor framing.

Common useful pattern: agents participate inside a governed orchestration layer rather than replacing deterministic execution, identity, approvals, and audit.

See `docs/research/ai-employee-landscape.md`.

## Gaps found and resolved

### 1. “AI Employee” could have become an immortal agent process

Resolved with:

- ADR-007;
- RoleTemplate / RoleInstance / RoleVersion;
- bounded TaskAssignment;
- explicit Task/Event Model.

### 2. Role title could imply excessive authority

Resolved with:

- ADR-008;
- capability-scoped tool grants;
- explicit identity modes;
- actor chain;
- external policy enforcement.

### 3. Persistent chat memory could become hidden cross-client state

Resolved with:

- ADR-009;
- typed memory;
- explicit write modes;
- provenance/retention;
- cross-workspace memory disabled.

### 4. Multi-agent architecture could be added prematurely

Resolved with:

- ADR-010;
- default max delegation depth 0;
- bounded child-task model;
- no authority amplification.

### 5. Role instructions/model runtime could become a hidden vendor lock-in

Resolved with:

- Agent Runtime Adapter Contract;
- Model and Instruction Policy;
- versioned instruction/model-policy references;
- regression requirement on material model changes.

### 6. AI Employee business state could disappear inside model sessions

Resolved with:

- separate TaskAssignment state;
- normalized task events;
- RoleVersion attribution;
- AgentSession as ephemeral/optional.

### 7. “AI Employee” could be deployed at full autonomy after a demo

Resolved with:

- Draft -> Test -> Shadow -> Supervised -> Active lifecycle;
- role-specific evaluations;
- readiness/promotion prompt;
- human-owner signoff;
- pause/demotion.

### 8. High-stakes roles were not sufficiently distinguished from ordinary operations roles

Resolved with:

- High-Stakes Role Gate;
- required governance classification in AI Employee Spec;
- schema invariant requiring special review for any high-stakes domain;
- Phase 3 Gate 3.0;
- acceptance criteria.

### 9. “AI employee” could become a human employee surveillance feature

Resolved with explicit non-goal:

- observe digital-role/business-process outcomes;
- do not build covert human activity scoring/invasive monitoring.

## Schema validation

The final AI Employee v0 JSON Schema was checked using JSON Schema Draft 2020-12 semantics.

The synthetic `operations-assistant.yaml` example validates: **PASS**.

Negative invariant checks:

- high-stakes domain + `special_review_required: false` -> **REJECTED as expected**
- delegation disabled + `max_delegation_depth > 0` -> **REJECTED as expected**

## Scope integrity

Phase 1 `/scope-mvp` explicitly excludes:

- AI Employee Role Registry/runtime;
- AI Employee persistent memory;
- AI Employee Task Assignment product surface;
- autonomous background digital roles;
- multi-agent delegation/collaboration.

`AGENTS.md` and the master build prompt now treat `docs/ai-employees/` as **future Phase 3 contracts**, not current implementation tasks.

## No-code check

The AI Employee branch adds/modifies specification artifacts only:

- Markdown;
- JSON Schema;
- synthetic YAML example.

No application/runtime source, infrastructure, package-manager, migration, or executable implementation file is introduced.

## Known intentional future decisions

Not Phase 1 or current spec blockers:

- exact Agent Runtime Adapter/provider/framework;
- physical database schema;
- frontend experience;
- final model/provider policy;
- whether the first Phase 3 role needs memory at all;
- whether any later real use case justifies multi-agent collaboration;
- client/jurisdiction-specific controls for high-stakes roles.

## Merge recommendation

Merge the Activepieces Gate 2 PR first.

Then retarget/merge the AI Employee specification PR into `main`.

Once merged, continue **Phase 1 Gate 2B coding only**. Do not jump to Phase 3 implementation.
