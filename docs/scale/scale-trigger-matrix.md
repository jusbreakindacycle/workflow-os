# Scale Trigger Matrix

This matrix preserves the full production-engineering checklist while preventing premature implementation.

**Stages:** M0 = MVP correctness/security; M1 = growing production; M2 = scale-triggered; K = knowledge/design concern that may never become a standalone component.

| Concept | Stage | Adoption/handling trigger |
|---|---|---|
| Rate Limiting | M0 | Enforce connector/API resource policy from first production use. |
| Caching | M1 | Repeated expensive reads materially affect latency/cost. |
| Load Balancing | M2 | Multiple service/worker replicas require explicit traffic distribution beyond managed defaults. |
| Reverse Proxies | M1 | Needed for TLS termination, routing, ingress controls, or deployment topology. |
| API Gateways | M1 | Multiple APIs/services need centralized auth, policy, quotas, version routing, or observability. |
| CI/CD | M0 | Required once implementation begins; tests/spec checks gate promotion. |
| Docker | M0 | Use for reproducible local/deployment packaging when implementation begins. |
| Kubernetes | M2 | Multiple independently scaled services/workers and operational burden justify an orchestrator. |
| Service Discovery | M2 | Dynamic service replicas make static/managed discovery insufficient. |
| Circuit Breakers | M1 | A dependency repeatedly fails and retries amplify harm. |
| Timeouts | M0 | Every external operation needs a deadline. |
| Retries | M0 | Only for classified transient failures. |
| Exponential Backoff | M0 | Default retry-delay strategy with jitter where provider guidance is absent. |
| Idempotency | M0 | Required/reconciled for retryable mutations. |
| Message Queues | M1 | Work must be buffered, decoupled, or independently scaled; an engine may already provide this. |
| Pub/Sub | M1 | Multiple consumers need independent reaction to the same event. |
| Event-Driven Architecture | M1 | Event decoupling reduces measured coupling/latency or supports external event semantics. |
| Distributed Transactions | K | Avoid across SaaS systems; understand trade-offs before attempting atomic cross-service writes. |
| Saga Pattern | M1 | Multi-system business workflow needs explicit compensation/recovery. |
| Dead Letter Queues | M0/M1 | MVP needs a visible failed-run/dead-letter state; dedicated broker DLQ appears when queues do. |
| Cron Jobs | M0 | Scheduled trigger is an MVP node type. |
| WebSockets | M2 | Persistent bidirectional real-time interaction is actually needed. |
| Long Polling | K | Compatibility fallback where push/SSE/WebSocket is unavailable. |
| Server-Sent Events | M1 | One-way live run updates materially improve operator experience. |
| Database Indexing | M0 | Index access paths driven by actual query patterns. |
| Query Optimization | M0 | Review slow/high-frequency queries from the beginning. |
| N+1 Queries | M0 | Prevent/detect in data-access implementation. |
| Connection Pooling | M0 | Use standard database/provider pooling appropriate to deployment. |
| Read Replicas | M2 | Read load demonstrably exceeds primary capacity or reporting isolation is needed. |
| Sharding | M2 | Dataset/write scale exceeds simpler vertical/partitioning options. |
| Partitioning | M2 | Large tables/time-series/run data need bounded maintenance/query performance. |
| Replication | M2 | Availability/read-scale requirements exceed managed default capabilities. |
| Leader Election | M2 | Multiple active instances need exactly-one coordinator and simpler designs fail. |
| CAP Theorem | K | Use to reason about behavior during network partitions. |
| Eventual Consistency | K/M1 | Explicitly document when asynchronous state may lag and business semantics tolerate it. |
| Optimistic Locking | M0 | Default candidate for competing edits/versioned control-plane records. |
| Pessimistic Locking | M1 | Only when conflicts are frequent/costly enough to justify blocking. |
| Distributed Locks | M2 | Only when cross-instance coordination cannot be achieved with idempotency/transactions/queues. |
| Race Conditions | M0 | Design/test competing workflow and approval transitions. |
| Deadlocks | M0 | Understand/prevent at database/concurrency boundaries. |
| Memory Leaks | M0 | Standard runtime hygiene/monitoring once code exists. |
| Garbage Collection | K | Understand runtime pause/memory behavior before tuning. |
| Thread Safety | K/M0 | Relevant to chosen runtime/concurrency model; avoid unsafe shared state. |
| Backpressure | M0/M1 | Bound concurrency/queues when arrivals can exceed execution capacity. |
| Autoscaling | M2 | Repeatable load patterns and metrics justify dynamic replica counts. |
| Horizontal Scaling | M1/M2 | Worker/service saturation cannot be solved more simply. |
| Vertical Scaling | M1 | First simple response when a service needs more CPU/memory and economics are acceptable. |
| CDN | M1 | Public/static assets or geographically distributed downloads justify it. |
| Edge Caching | M2 | Global read latency/origin load justifies edge policy. |
| Cache Invalidation | M1 | Mandatory design whenever mutable data is cached. |
| Feature Flags | M1 | Need controlled rollout, emergency disable, or client-specific capability exposure. |
| Blue-Green Deployments | M1/M2 | Release risk/downtime justifies parallel environments. |
| Canary Releases | M2 | Sufficient traffic/telemetry exists to compare small rollout cohorts safely. |
| Rolling Deployments | M1/M2 | Multiple replicas require incremental replacement. |
| Rollbacks | M0 | Every deployment/migration plan needs a recovery strategy. |
| Health Checks | M0 | Basic service/dependency health begins with implementation. |
| Liveness & Readiness Probes | M2 | Container orchestrator/managed platform needs separate restart vs traffic-readiness signals. |
| Monitoring | M0 | Core run/service health is visible from first production use. |
| Logging | M0 | Structured, redacted logs. |
| Distributed Tracing | M1 | Multiple boundaries make correlation IDs alone insufficient. |
| Metrics | M0 | Success/failure/retry/latency/cost metrics. |
| Alerting | M0 | Alert only on conditions requiring action. |
| SLOs | M1 | Production-critical workflows need explicit reliability targets. |
| SLIs | M1 | Define measurable indicators before SLO promises. |
| Error Budgets | M1 | Enough operational history exists to balance reliability vs change velocity. |
| Observability | M0/M1 | Run explainability starts at MVP; deeper tracing matures with architecture. |
| Secrets Management | M0 | Use dedicated/engine-managed secret storage; WIR stores references only. |
| IAM | M0 | Least-privilege identity/authorization at workspace and integration boundaries. |
| OAuth | M0 | Use standard provider flows where connector authorization requires them. |
| JWT Rotation | M0/M1 | If JWTs are chosen, key/session rotation must be designed; do not invent crypto. |
| TLS | M0 | Required for network transport in production. |
| Encryption at Rest | M0 | Use platform/database/object-store capabilities appropriate to data classification. |
| Encryption in Transit | M0 | TLS or equivalent for network boundaries. |
| WAF | M1 | Internet-facing attack surface/risk justifies managed application filtering. |
| DDoS Protection | M1/M2 | Use provider/network controls according to exposure and risk, not custom mitigation first. |
| CORS | M0 | Explicit browser-origin policy where applicable. |
| CSRF | M0 | Required defense where browser cookie/session architecture makes it relevant. |
| SQL Injection | M0 | Parameterized queries/ORM safety and validation from first implementation. |
| XSS | M0 | Safe rendering/output encoding and content policy in UI. |
| SSRF | M0 | Critical because generic HTTP/connectors may accept destinations. |
| Database Migrations | M0 | Schema changes are versioned, tested, reversible/forward-recoverable. |
| Schema Versioning | M0 | WIR/API/data schemas have explicit compatibility rules. |
| Disaster Recovery | M1 | Define RPO/RTO once production/client dependency warrants it. |
| Backups | M0 | Restore-tested backups for persistent production state. |
| Failover | M1/M2 | Availability requirement exceeds acceptable manual recovery. |
| Multi-Region Deployments | M2 | Geographic/availability requirements justify substantial consistency/ops complexity. |
| Chaos Engineering | M2 | Mature observability/recovery exists and deliberate fault injection can improve confidence. |
| Cost Optimization | M0/M1 | Measure external/AI/platform cost early; optimize materially significant spend. |
| Cold Starts | K/M1 | Relevant only if chosen serverless/runtime model causes user/SLO impact. |
| Serverless Limits | K/M1 | Account for runtime, payload, concurrency, connection, and cost limits if serverless is chosen. |
| Latency | M0 | Measure end-to-end and dependency latency. |
| Throughput | M0 | Measure workflow/run volume and capacity. |
| P99 Latency | M0/M1 | Track tail performance once sample volume supports it. |
| Tail Latency | M0/M1 | Diagnose worst-user/workflow experience, not averages alone. |
| Network Partitions | K | Design distributed behavior assuming links can fail. |
| Clock Skew | K | Avoid relying on perfectly synchronized clocks for correctness/security windows. |
| DNS | K/M0 | Understand resolution/caching/failure behavior for external dependencies. |
| TCP vs UDP | K | Networking design knowledge; use application protocol requirements. |
| HTTP/2 & HTTP/3 | K/M2 | Prefer platform defaults; tune only when transport measurements justify it. |
| gRPC | M2 | Internal typed streaming/low-latency RPC need outweighs HTTP/JSON simplicity. |
| Webhooks | M0 | First-class trigger with authenticity, replay, and idempotency controls. |
| API Versioning | M0/M1 | External/public or adapter APIs need compatibility strategy before breaking changes. |
| Semantic Versioning | M0 | Use for published specs/packages/interfaces where SemVer semantics fit. |
| Infrastructure as Code | M1 | Deployment resources are numerous/important enough that repeatable reviewable provisioning beats manual setup. |
| Terraform | M1/M2 | Candidate IaC tool only after cloud/provider architecture is selected. |
| Helm Charts | M2 | Only if Kubernetes is adopted and package/release management benefits. |
| Build Caching | M1 | Build time materially slows local/CI feedback. |
| Dependency Hell | K/M0 | Pin/lock dependencies, minimize needless packages, automate update testing. |
| Production Incidents | M1 | Define incident classification, ownership, timeline, recovery, and follow-up as client production use begins. |
| On-call | M1/M2 | Only if paid service/SLO requires after-hours response; define boundaries commercially and technically. |
| Postmortems | M1 | Blameless learning artifact for material incidents; track corrective actions. |

## Rule for Codex

Seeing a term in this matrix is **not authorization to implement it**. Codex must verify the current maturity stage, measurable trigger, MVP scope, and applicable ADR before introducing the capability.
