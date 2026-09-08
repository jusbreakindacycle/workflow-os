# /scope-mvp

## MVP objective

Prove that Workflow OS can transform one real business process into a governed, deployable, observable workflow using a single execution engine.

## In scope

### Operator and workspace
- one human operator
- multiple client/workspace records
- logical separation of workflow definitions, execution metadata, templates, and integration references by workspace

### Discovery
- structured process intake
- Workflow Brief
- feasibility score
- risk score
- ROI/time-saved estimate

### Workflow model
- WIR v0
- versioned definitions
- schema validation
- simple diagram/visualization derived from WIR

### WIR v0 node types
- manual trigger
- webhook trigger
- scheduled trigger
- action
- transform
- condition
- delay
- AI transform
- human approval
- end

### Execution
- exactly one primary engine adapter
- generic HTTP/API action capability
- engine deployment mapping
- run initiation and status reconciliation

### Testing and reliability
- sample fixtures
- dry-run/mocked side effects where feasible
- input/schema validation
- error-path tests
- idempotency tests for supported mutations
- AI evaluation examples for AI nodes
- timeouts
- bounded retries with exponential backoff and jitter
- concurrency/rate-limit policy
- failed-run/dead-letter state
- manual replay/reconciliation path

### Security and observability
- integration references rather than embedded secret values
- least privilege and workspace authorization
- redaction of sensitive execution values
- inbound webhook authenticity checks where supported
- input and outbound-request safety controls
- audit trail for sensitive actions
- run/node status, timestamps, attempts, error classification, approval state, and cost metadata

### Reuse
- save client-neutral templates
- generated handoff documentation

## Explicitly out of scope

- building a universal execution engine
- 1,000+ native connectors
- full drag-and-drop workflow builder
- custom RPA recorder
- public marketplace
- billing/subscriptions
- multi-user collaboration
- production Kubernetes
- sharding/read-replica architecture
- multi-region failover
- service discovery
- unrestricted autonomous multi-agent teams
- mobile application
- custom LLM training
- full process-mining platform

## Scope-change rule

Anything outside this file is not MVP by default. Scope expansion requires explicit human approval and, when architectural, an ADR.
