# Security Model

## Security objective

Workflow OS may coordinate access to high-value client systems. Security and workspace isolation are MVP requirements, not later-scale features.

## Core principles

1. least privilege
2. workspace isolation
3. explicit tool/action authorization
4. sensitive-value redaction
5. minimal retained third-party data
6. standard authentication and cryptographic libraries
7. verifiable inbound events
8. safe outbound-network policy
9. audited high-impact actions
10. humans authorize the highest-risk actions

## Integration material

Workflow definitions store logical integration references rather than secret values.

Runtime integrations should use engine-managed or dedicated secret storage. An agent or prompt should receive an authorized tool abstraction, not reusable secret material.

## Workspace isolation

Every security-relevant entity must be scoped to a workspace, including:

- workflows and versions
- deployments
- run metadata
- integration references
- templates before sanitization
- approvals
- logs/traces
- incident records

Authorization checks must be server-side at the data/action boundary.

## Tool permissions

A tool registration declares:

- read/write classification
- risk tier
- allowed workspace(s)
- allowed data classes
- required approval policy
- rate/concurrency limits
- audit requirements

AI agents receive an allowlist of tools. No wildcard access by default.

## Inbound webhooks

Where provider support exists:

- verify signature/authenticity
- enforce replay/time-window protections when available
- validate content type and schema
- cap request size
- use idempotent event identifiers

## Outbound HTTP / SSRF defense

A generic HTTP action is powerful and dangerous. Implementation must constrain destination resolution and block access to internal metadata/control endpoints unless explicitly allowed.

## Application security baseline

Implementation must account for:

- broken object-level/function authorization
- injection
- unsafe output rendering
- CSRF when cookie-based browser sessions are used
- CORS policy
- rate/resource limits
- dependency vulnerabilities
- secure headers/TLS
- secure session/token rotation
- migration/backup confidentiality

Use OWASP API Security and relevant OWASP application guidance as implementation checklists.

## Logging

Never rely on “developers will remember not to log it.” Redaction and structured-field allowlisting must be designed.

## Public repository

While this repository is public, all examples remain synthetic. Client-specific architecture may only be added after a deliberate confidentiality decision.
