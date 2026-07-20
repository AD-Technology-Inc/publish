# Testing Strategy & Quality Assurance

## Purpose
This document provides an overview of the multi-layered testing strategy used to ensure reliability, resilience, and operational correctness in **AD. Publish**.

---

## Multi-Layered Testing Pyramid

```mermaid
graph TD;
    Unit["Layer 1: Unit Tests (Pytest)<br>Circuit Breaker, Idempotency, Rate Limiter"] --> Integration["Layer 2: Integration Tests<br>Gateway HTTP forwarder & OpenAPI merger"]
    Integration --> Chaos["Layer 3: Chaos & Failure Injection<br>FailureSimulator Latency & 5xx injection"]
    Chaos --> Load["Layer 4: Load & Smoke Performance<br>k6 smoke-test.js scenario suite"]
```

---

## Testing Level Breakdown

1. **Unit Testing (Pytest)**:
   - Tests individual component behavior in isolation (e.g., sliding window circuit breaker algorithms, idempotency key generation).
   - Executed via `pytest gateway/app/tests/test_circuit_breaker.py`.
2. **Integration Testing**:
   - Validates multi-service communication via Traefik and Gateway proxies.
3. **Chaos & Failure Injection**:
   - Uses `FailureSimulator` to randomly inject simulated latency (1–5s), 500 server errors, and 400 validation failures into worker loops.
4. **Performance & Smoke Testing (k6)**:
   - Automated performance checks validating HTTP response latencies and enqueue speeds.
