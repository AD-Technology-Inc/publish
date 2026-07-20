# Integration Testing & Inter-Service Verification

## Purpose
This document details integration testing practices across Gateway proxies, microservice routers, and Redis Streams.

---

## Integration Test Flow

Integration tests verify that HTTP requests submitted to Gateway correctly pass through `ResilientHttpClient`, hit downstream microservice routers, write payloads to Redis Streams, and persist state.

```mermaid
sequenceDiagram
    autonumber
    participant TestRunner as Test Runner / Pytest
    participant Gateway
    participant IdentityService
    participant Redis

    TestRunner->>Gateway: POST /identity/register
    Gateway->>IdentityService: Forward to http://identity-service:3001/users
    IdentityService->>Redis: XADD jobs:identity
    IdentityService-->>Gateway: HTTP 200 {"user": "..."}
    Gateway-->>TestRunner: HTTP 200 {"user": "..."}
```

---

## Test Execution Commands

Run pytest inside the gateway container or local venv:

```bash
cd gateway/app
pytest
```
