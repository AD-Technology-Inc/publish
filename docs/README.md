# AD. Publish Infrastructure Documentation

Welcome to the internal engineering documentation for **AD. Publish**, a distributed asynchronous job execution and state coordination engine designed for fault-tolerant publishing operations under failure conditions.

This documentation serves as an authoritative technical reference for backend, infrastructure, and SRE teams. All content is derived directly from the current Python codebase, Redis Streams architecture, and PostgreSQL state persistence model.

---

## 📚 Documentation Directory

### 🏛️ [Architecture](architecture/system-overview.md)
* [System Overview](architecture/system-overview.md) — High-level system architecture and component boundaries.
* [Component Diagram](architecture/component-diagram.md) — Component interactions between Gateway, Redis, PostgreSQL, and Workers.
* [Deployment Topology](architecture/deployment-topology.md) — Container topology, networking, proxy configuration, and limits.
* [Request Flow](architecture/request-flow.md) — Synchronous ingestion to asynchronous job execution and recovery flow.
* [Scaling Model](architecture/scaling.md) — Horizontal consumer scaling, partition mechanics, and concurrency dynamics.

### ⚡ [Distributed Systems Engine](distributed-systems/delivery-semantics.md)
* [Delivery Semantics](distributed-systems/delivery-semantics.md) — At-least-once delivery via Redis Streams consumer groups and XACK.
* [Consistency Model](distributed-systems/consistency-model.md) — Eventual consistency and state synchronization.
* [Idempotency Model](distributed-systems/idempotency.md) — `IdempotencyMiddleware` implementation using Redis `SET NX EX`.
* [Worker Leasing](distributed-systems/leasing.md) — Active heartbeats, 120s TTL leases, and split-brain prevention.
* [State Checkpointing](distributed-systems/checkpointing.md) — `StateManager` milestone persistence (`job_execution_state`) in PostgreSQL/Redis.
* [Retry Strategy](distributed-systems/retry-strategy.md) — Exponential backoff (1s -> 5s -> 25s -> 125s) with Redis ZSET.
* [Backpressure](distributed-systems/backpressure.md) — Queue length monitoring, rate limiting, and HTTP client circuit breaking.
* [Failure Model](distributed-systems/failure-model.md) — Exception hierarchy (`NonRetryableError` vs retryable exceptions).
* [Recovery Behavior](distributed-systems/recovery.md) — Autobreaker recovery via `XAUTOCLAIM` for crashed workers.
* [System Invariants](distributed-systems/invariants.md) — Safety invariants, delivery guarantees, and state boundary rules.

### 📨 [Messaging Pipeline](messaging/redis-streams.md)
* [Redis Streams](messaging/redis-streams.md) — Stream topology, key structure, and capping strategies (`maxlen=10000`).
* [Consumer Groups](messaging/consumer-groups.md) — Group initialization, message distribution, and worker allocation.
* [Pending Entry List (PEL)](messaging/pending-entry-list.md) — Message pending states, acknowledgement cycles, and memory bounds.
* [XAUTOCLAIM Mechanics](messaging/xautoclaim.md) — Automatic claim interval, min-idle thresholds, and lease checks.
* [Dead Letter Queue (DLQ)](messaging/dead-letter-queue.md) — Poison message isolation, DLQ stream layout, and manual replay endpoints.
* [Message Lifecycle](messaging/message-lifecycle.md) — Complete state transitions from `XADD` enqueue to `XACK` & `XDEL`.

### 💾 [Storage Architecture](storage/database-schema.md)
* [Database Schemas](storage/database-schema.md) — PostgreSQL relational schema (`users`, `email_verifications`, `job_execution_state`) and Redis key schemas.
* [State Manager](storage/state-manager.md) — `StateManager` design, psycopg2 connection management, and Redis fallback.
* [Transactions](storage/transactions.md) — Transaction boundaries in SQLAlchemy 2.0 and psycopg2 auto-commits.
* [Indexing Strategy](storage/indexing.md) — Primary key indexes, lookup paths, and performance characteristics.
* [Persistence](storage/persistence.md) — Redis persistence policies and PostgreSQL storage configuration.

### 📊 [Observability Stack](observability/metrics.md)
* [Metrics](observability/metrics.md) — k6 custom metrics, Prometheus telemetry, and job execution counters.
* [Tracing](observability/tracing.md) — OpenTelemetry tracing pipeline, span creation in workers, and tracer shims.
* [Logging](observability/logging.md) — Structlog JSON structured log formatting and context variables.
* [Dashboards](observability/dashboards.md) — Grafana pre-provisioned dashboards (`publish-overview.json`).
* [Alerting](observability/alerts.md) — Prometheus alert thresholds for stream lag and circuit breaker status.

### 🛠️ [Operations & Runbook](operations/deployment.md)
* [Deployment](operations/deployment.md) — Docker Compose orchestration, Traefik reverse proxy, and resource limits.
* [Configuration](operations/configuration.md) — Environment variables, service configurations, and default parameters.
* [Disaster Recovery](operations/disaster-recovery.md) — Database backup/restore procedures and Redis stream state recovery.
* [Runbook](operations/runbook.md) — Operational procedures for node failures, consumer lag, and manual DLQ replay.
* [Troubleshooting](operations/troubleshooting.md) — Diagnostic playbooks for common failure modes.

### 📈 [Performance & Benchmarks](performance/benchmarks.md)
* [Benchmarks](performance/benchmarks.md) — Baseline throughput, latency targets, and k6 smoke test metrics.
* [Load Testing](performance/load-testing.md) — k6 test scenarios (`constant-vus`, `ramping-vus`), thresholds, and execution.
* [Bottlenecks](performance/bottlenecks.md) — Analysis of queue contention, psycopg2 connection overhead, and downstream rate limits.
* [Optimization](performance/optimization.md) — Performance tuning strategies for worker concurrency and state persistence.

### 🧪 [Testing Strategy](testing/strategy.md)
* [Testing Strategy](testing/strategy.md) — Overview of unit, integration, and performance testing methodologies.
* [Integration Testing](testing/integration.md) — Cross-service integration via Traefik gateway proxies.
* [Chaos Testing](testing/chaos-testing.md) — Controlled chaos experiments using `FailureSimulator`.
* [Failure Injection](testing/failure-injection.md) — `FailureSimulator` configuration for latency, 5xx, and 400 errors.
* [Reliability Tests](testing/reliability-tests.md) — Gateway circuit breaker unit test suite (`test_circuit_breaker.py`).

### 📝 [Architecture Decision Records (ADRs)](decisions/ADR-0001-fastapi.md)
* [ADR-0001: FastAPI Framework Selection](decisions/ADR-0001-fastapi.md)
* [ADR-0002: Redis Streams for Job Transport](decisions/ADR-0002-redis-streams.md)
* [ADR-0003: At-Least-Once Delivery Semantics](decisions/ADR-0003-at-least-once.md)
* [ADR-0004: Microservice Step Checkpointing](decisions/ADR-0004-checkpointing.md)
* [ADR-0005: Atomic Redis Idempotency Keys](decisions/ADR-0005-idempotency.md)
* [ADR-0006: Isolated PostgreSQL Databases Per-Service](decisions/ADR-0006-postgresql.md)

### 🎨 [Mermaid Diagrams](diagrams/architecture.mmd)
* Raw Mermaid source files available in [`docs/diagrams/`](diagrams/).

---

## 🛠️ Codebase Source Locations

| Component | Source Path | Description |
| :--- | :--- | :--- |
| **API Gateway** | [`gateway/app/`](file:///home/angelo/projects/publish/gateway/app) | Ingestion API, OpenAPI merger, and Resilient HTTP Client |
| **Shared Library** | [`services/shared/shared/`](file:///home/angelo/projects/publish/services/shared/shared) | `Worker`, `RedisQueue`, `StateManager`, `IdempotencyMiddleware`, `FailureSimulator` |
| **Identity Service** | [`services/identity-service/`](file:///home/angelo/projects/publish/services/identity-service) | User authentication, PostgreSQL schema, and identity worker |
| **Social Account Service** | [`services/social-account-service/`](file:///home/angelo/projects/publish/services/social-account-service) | Account linking, OAuth token validation worker, and rate limiter |
| **Social Post Service** | [`services/social-post-service/`](file:///home/angelo/projects/publish/services/social-post-service) | Post ingestion, queue backpressure check, step checkpointing, and publish event dispatch |
| **Social Publish Service** | [`services/social-publish-service/`](file:///home/angelo/projects/publish/services/social-publish-service) | Multi-platform publishing worker (`FacebookAdapter`, `LinkedInAdapter`, `InstagramAdapter`, `ThreadsAdapter`) |
| **Infrastructure Stack** | [`infrastructure/`](file:///home/angelo/projects/publish/infrastructure) | Traefik config, Docker Compose stack, Observability configs (Prometheus/Loki/Tempo/Grafana), and k6 scripts |
