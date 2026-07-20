# Indexing Strategy & Lookup Optimization

## Purpose
This document details the PostgreSQL indexing strategy and Redis key lookup patterns used to optimize performance in **AD. Publish**.

---

## PostgreSQL Index Design

### `identity_db` Indexing Strategy (`services/identity-service/alembic`)

| Table Name | Indexed Column | Index Type | Purpose / Query Optimization |
| :--- | :--- | :--- | :--- |
| `users` | `id` | B-Tree (PRIMARY KEY) | Direct user lookup (`GET /users/{user_id}`). |
| `users` | `email` | B-Tree (UNIQUE INDEX) | Fast authentication check (`ix_users_email`). |
| `users` | `username` | B-Tree (UNIQUE INDEX) | Fast username uniqueness check (`ix_users_username`). |
| `email_verifications` | `id` | B-Tree (PRIMARY KEY) | Verification record primary key lookup. |
| `email_verifications` | `token` | B-Tree (UNIQUE INDEX) | Fast token validation (`GET /auth/verify-email?token=...`). |
| `email_verifications` | `user_id` | Foreign Key Index | Cascade deletion cleanup on user removal. |
| `job_execution_state` | `job_id` | B-Tree (PRIMARY KEY) | Sub-millisecond step milestone lookup (`get_last_step`). |

---

## Redis Key Lookup & Time Complexity

| Key Pattern | Data Structure | Operation | Complexity | Optimization Rationale |
| :--- | :--- | :--- | :--- | :--- |
| `idempotency:{key}` | String | `SET key 1 NX EX` | `O(1)` | Sub-millisecond atomic lock assertion. |
| `job_lease:{message_id}`| String | `SET key 1 EX 120` | `O(1)` | Rapid heartbeat lease update every 30s. |
| `jobs:{service}` | Stream | `XREADGROUP` / `XADD` | `O(1)` per read | Efficient stream append and group iteration. |
| `jobs:{service}:delayed`| Sorted Set (ZSET)| `ZRANGEBYSCORE 0 now`| `O(log(N) + M)` | Fast range query for ready retries. |
| `accounts:all` | JSON String Array| `GET` / `SET` | `O(N)` | In-memory account list lookup. |
| `token:{provider}:{page_id}`| String | `GET` | `O(1)` | Fast internal access token retrieval. |
