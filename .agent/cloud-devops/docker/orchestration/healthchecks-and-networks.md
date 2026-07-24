# Skill: .agent/cloud-devops/docker/orchestration/healthchecks-and-networks.md

## 📌 Core Philosophy & Constraints
- **Explicit Health Checks**: Define explicit `healthcheck` directives for database, cache, and app containers.
- **Dependency Sequencing**: Use `depends_on: { service: { condition: service_healthy } }` to prevent startup race conditions.
- **Isolated Custom Networks**: Isolate internal databases on `internal: true` bridge networks.

## ⚡ Production Boilerplate / Standard Pattern

```yaml
services:
  app:
    image: my-app:latest
    depends_on:
      db:
        condition: service_healthy
      redis:
        condition: service_healthy
    networks:
      - frontend_net
      - backend_net

  db:
    image: postgres:18-alpine
    environment:
      POSTGRES_DB: app_db
      POSTGRES_PASSWORD: secret_pass
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres -d app_db"]
      interval: 5s
      timeout: 3s
      retries: 5
      start_period: 10s
    networks:
      - backend_net

  redis:
    image: redis:8.6-alpine
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      timeout: 3s
      retries: 3
    networks:
      - backend_net

networks:
  frontend_net:
  backend_net:
    internal: true # Block external internet access to backend network
```

## 🚫 Forbidden Anti-Patterns
- ❌ **Simple `depends_on` Lists**: Writing `depends_on: [db]` without `condition: service_healthy` causing premature app startup.
- ❌ **Missing Health Checks**: Omitting `healthcheck` specs on database containers leading to connection refusals.
- ❌ **Single Default Network**: Placing edge web servers and internal database containers on a single default network.

## 🔍 Verification & Testing
- **Container Health Assertion**: `docker ps` verifying container status displays `(healthy)`.
