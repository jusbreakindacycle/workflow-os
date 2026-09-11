# Architecture Decision Index

Foundation v3 intentionally consolidates the working tree. Earlier detailed Foundation v1/v2 ADRs remain available in Git history; their current disposition is summarized in `legacy-foundation-decisions.md`.

## Active decisions

| ADR | Decision | Status |
|---|---|---|
| [ADR-013](ADR-013-internal-workforce-adapter-boundary.md) | Internal workforce providers stay behind an authority-asymmetric adapter boundary | Accepted |
| [ADR-014](ADR-014-human-governed-autonomous-delivery.md) | Product North Star is human-governed autonomous delivery, not manual AI prompting | Accepted |
| [ADR-015](ADR-015-client-engagement-project-hierarchy.md) | Separate Workspace isolation, commercial Engagement, and operational Project | Accepted |
| [ADR-016](ADR-016-model-runtime-broker-and-spend-gate.md) | Route model/runtime dynamically; paid execution requires explicit prior approval | Accepted |
| [ADR-017](ADR-017-project-pack-and-instruction-compiler.md) | Project Pack is canonical machine execution contract; provider instruction files are projections | Accepted |
| [ADR-018](ADR-018-local-first-command-center.md) | Local-first web Command Center is the initial operator surface; desktop shell is optional later | Accepted |
| [ADR-019](ADR-019-core-control-plane-before-provider-spikes.md) | Build the provider-independent core control plane before Paperclip/Activepieces/provider spikes | Accepted |

## Rules

- Accepted ADRs are authoritative until explicitly superseded.
- A provider/tool implementation choice must not silently override an ADR.
- If an implementation reveals a contradiction, propose a new ADR rather than editing history to make the implementation appear correct.
- Git history preserves removed/superseded detail.
