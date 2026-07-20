# System Invariants & Safety Guarantees

## Purpose
This document specifies the core distributed invariants, safety properties, and boundary rules enforced across **AD. Publish**.

---

## Distributed Invariants Matrix

| Category | Invariant Statement | Implementation Mechanism | Violation Prevention |
| :--- | :--- | :--- | :--- |
| **Delivery Guarantee** | Every accepted job payload MUST be executed to completion or routed to the DLQ. No message is silently dropped. | At-least-once Redis Streams queueing (`XADD`, `XACK`), PEL tracking, and DLQ routing (`jobs:{service}:dlq`). | Unacknowledged messages remain in PEL until acknowledged or reclaimed by `XAUTOCLAIM`. |
| **Side-Effect Isolation** | Side-effect operations (e.g. publishing to Facebook) MUST NOT be executed more than once per `idempotency_key`. | `IdempotencyMiddleware` (`SET idempotency:{key} 1 NX EX 86400`) and `StateManager` progress checks. | Concurrent or duplicate attempts fail `SET NX` or read existing step, skipping side-effects. |
| **Concurrency Lock Safety**| A job MUST NOT be executed concurrently by multiple worker processes. | Active worker lease heartbeat thread (`job_lease:{id}`) and Redis Stream PEL allocation. | Peer workers verify lease existence prior to executing `XAUTOCLAIM`. |
| **State Progression Monotonicity**| Job execution steps MUST move strictly forward in sequence (`started` $\to$ `db_stored` $\to$ `published_event` $\to$ `completed`). | `StateManager` relational table `job_execution_state` and Redis step updates. | Step resume logic checks `get_last_step()` and bypasses completed milestones. |
| **Backpressure Integrity**| Ingestion queues MUST NOT exceed storage limits, threatening Redis availability. | `Social Post Service` stream length guard (`XLEN > 10000`) returning `HTTP 429`. | Rejects incoming API ingestion when stream memory cap is reached. |
| **Circuit Protection** | Gateway MUST NOT continue forwarding traffic to failing microservices. | `ResilientHttpClient` sliding-window failure store (`FailureStore`) tripping circuit to `OPEN`. | Converts downstream failures into immediate `HTTP 503` responses. |

---

## Safety Property Verification & Chaos Testing

These invariants are validated in the codebase via:
1. **Unit Testing**: `gateway/app/tests/test_circuit_breaker.py` verifies sliding-window circuit breaker state transitions under simulated error rates.
2. **Chaos Simulation**: `FailureSimulator.simulate_failure()` randomly injects 500 retryable errors, 400 non-retryable errors, and latency delays to verify fallback and DLQ isolation pathways.
3. **Smoke & Load Testing**: `infrastructure/k6/smoke-test.js` measures p(95) latency and error thresholds under load.
