# Reliability & Circuit Breaker Test Suite

## Purpose
This document specifies the automated unit test suite for verifying sliding-window circuit breaker state transitions in `gateway/app/tests/test_circuit_breaker.py`.

---

## Test Suite Design (`test_circuit_breaker.py`)

The test suite validates `ResilientHttpClient` and `FailureStore` against specific failure scenarios using an in-memory or local Redis instance.

```mermaid
sequenceDiagram
    autonumber
    participant Test as Pytest Runner
    participant Client as ResilientHttpClient
    participant Store as FailureStore (Redis)

    Test->>Store: Set state CLOSED & reset counters
    
    rect rgb(240, 255, 240)
        Test->>Client: Call 1: HTTP 200 (Success)
        Test->>Client: Call 2: HTTP 200 (Success)
        Store-->>Test: Assert Circuit State == CLOSED
    end

    rect rgb(255, 240, 240)
        Test->>Client: Call 3: HTTP 500 (Fails, retries 1x = 2 failures)
        Test->>Client: Call 4: HTTP 500 (Fails, retries 1x = 2 failures)
        Note over Store: Total calls: 6 (2 success + 4 failures). Failure rate = 66.7% >= 50%
        Store-->>Test: Assert Circuit State == OPEN
    end

    rect rgb(255, 220, 220)
        Test->>Client: Call 5: HTTP Request while OPEN
        Client-->>Test: Immediate HTTP 503 (message: "circuit_open")
    end
```

---

## Running Reliability Tests

Execute pytest against the test suite:

```bash
cd gateway/app
pytest tests/test_circuit_breaker.py -v
```
