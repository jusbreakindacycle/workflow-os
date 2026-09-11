# Capability Vocabulary

## Purpose

The Broker cannot route provider-independently if every provider invents different capability names. Use a small normalized vocabulary for route eligibility and keep provider-specific detail under extensions.

## Capability record

A normalized capability should have:

- stable capability id;
- level `0..5` or explicit boolean where appropriate;
- evidence references / evaluation source;
- optional limits/notes;
- last-verified time/version when relevant.

A provider claim without evidence may be recorded but should not be treated the same as a measured capability.

## Initial capability ids

This list is intentionally extensible, not exhaustive:

### Intelligence

- `reasoning_general`
- `coding_generation`
- `coding_debugging`
- `long_context`
- `vision_image`
- `document_understanding`
- `structured_output`
- `tool_calling`
- `research_web`

### Runtime / execution

- `repository_read`
- `repository_write`
- `terminal`
- `browser_interaction`
- `filesystem_local`
- `session_persistence`
- `background_execution`
- `isolated_workspace`
- `parallel_workspace`

### Verification

- `test_execution`
- `ui_real_flow`
- `api_real_flow`
- `artifact_capture`

## Hard vs scored requirements

Work Requirement Profiles mark capabilities as:

- hard requirement — route is ineligible below threshold;
- soft preference — contributes to route score.

## Extensions

Provider/runtime-specific features may live under `extensions`, but canonical WorkItems must not require an opaque vendor-specific capability unless an explicit Project/ADR decision pins that provider.

## Evolution

Adding a normalized capability id does not require a product redesign. Renaming/changing semantics of an existing id requires vocabulary-version handling and routing regression tests.
