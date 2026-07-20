# System Tuning & Performance Optimization Guide

## Purpose
This document provides specific configuration tuning recommendations to maximize execution throughput and reduce latency in **AD. Publish**.

---

## Recommended System Optimizations

### 1. PostgreSQL Connection Pooling (`PgBouncer`)
- **Current State**: Direct synchronous `psycopg2` connections per step update.
- **Optimization**: Deploy a `PgBouncer` sidecar container in front of PostgreSQL (`identity-db`) running in transaction pooling mode.
- **Expected Impact**: Reduces connection setup overhead from ~15ms to <1ms per step save.

### 2. Migration to `asyncpg` in Worker State Management
- **Current State**: `StateManager` uses blocking synchronous `psycopg2`.
- **Optimization**: Rewrite `StateManager` to use `asyncpg` async connection pools within the worker loop.
- **Expected Impact**: Eliminates thread blocking, tripling worker loop throughput per CPU core.

### 3. Redis Pipeline Batching
- **Current State**: Workers issue separate Redis commands for lease update (`SET`), stream ACK (`XACK`), and stream delete (`XDEL`).
- **Optimization**: Wrap stream acknowledgements and lease removals into an atomic Redis pipeline (`redis.pipeline()`).
- **Expected Impact**: Reduces Redis network round-trips by 66% per completed job.
