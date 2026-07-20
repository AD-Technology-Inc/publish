# ADR-0006: Isolated PostgreSQL Databases Per-Service

## Context
Microservices (Identity, Social Account, Social Post, Social Publish) require domain database storage for user entities, account credentials, and state logs.

## Problem
Shared monolithic databases couple microservices at the database schema layer, leading to schema migration locks, un-isolated failure domains, and performance interference.

## Decision
Provision isolated PostgreSQL database instances per service domain (`identity_db`, `social_post_db`, `social_account_db`, `social_publish_db`) with distinct credentials and schemas.

## Alternatives Considered
- **Shared Monolithic Database**: Shared tables across microservices. (Rejected due to database-level coupling and migration conflicts).
- **Single PostgreSQL Instance with Multiple Schemas**: Logical isolation within one database process. (Acceptable intermediate, but full container separation provides cleaner failure isolation).

## Consequences
- Clean microservice domain boundaries: microservices interact exclusively through Gateway REST calls and Redis Stream events.
- Independent database migrations via Alembic.

## Tradeoffs
- Multiplies persistent storage volume overhead and container resource reservations.
