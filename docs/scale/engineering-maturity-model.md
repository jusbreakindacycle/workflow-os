# Engineering Maturity Model

The large production-engineering checklist is a **maturity map**, not an MVP backlog.

## M0 — Correctness and safe MVP

Use from the first production-capable version where applicable:

- timeouts, bounded retries, exponential backoff/jitter
- idempotency/reconciliation
- rate/resource limits
- webhook safety
- database indexing/query review/connection management
- schema migrations/versioning
- race/deadlock awareness
- health checks
- structured logging, metrics, actionable alerts
- secrets/integration security, authorization, TLS, encryption
- common web/API vulnerability defenses
- backups and rollback
- CI/CD and containerized reproducibility
- latency/throughput measurement including tail latency
- dependency/version discipline

## M1 — Freelancer production / growing workload

Introduce when multiple client workflows create operational pressure:

- explicit queues and dead-letter handling
- caching with invalidation rules
- reverse proxy/API gateway where topology warrants it
- circuit breakers for repeatedly failing dependencies
- pub/sub or event-driven internal architecture where decoupling is measurable
- horizontal worker scaling and backpressure
- feature flags
- staged deployment strategies
- stronger observability/distributed traces
- formal SLIs/SLOs/error budgets
- WAF/provider DDoS controls when exposed surface warrants it
- documented disaster recovery/failover
- cost optimization
- incident and postmortem discipline

## M2 — Evidence-driven scale

Only after measurements show the need:

- dedicated load-balancing topology beyond managed defaults
- Kubernetes
- service discovery
- read replicas
- partitioning/sharding
- replication/leader-election architecture
- multi-region deployment
- advanced edge caching
- high-scale WebSockets
- gRPC or protocol tuning
- chaos engineering
- infrastructure-as-code platform standardization

## M3 — Concepts always understood, sometimes never implemented directly

- CAP theorem
- eventual consistency
- network partitions
- clock skew
- TCP/UDP trade-offs
- thread safety / garbage collection / memory behavior
- distributed transaction trade-offs
- dependency graph complexity

## Adoption rule

A technology moves into the active architecture only when:

1. a measured problem exists;
2. the proposed capability directly addresses it;
3. operational complexity/cost is compared with simpler alternatives;
4. an ADR records the decision and rollback/decommission plan.

“Enterprise-looking” is not a valid trigger.
