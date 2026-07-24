# Skill: .agent/cloud-devops/docker/orchestration/docker-compose-dev.md

## 📌 Core Philosophy & Constraints
- **Hot-Reloading Volume Mounts**: Mount local source directories into development containers (`./:/app`).
- **Development Service Dependencies**: Spin up PostgreSQL, Redis, and Mailpit services automatically alongside app containers.
- **Environment Isolation**: Use `.env.development` files for local container variable bindings.

## ⚡ Production Boilerplate / Standard Pattern

```yaml
# docker-compose.yml (Local Development Setup)
services:
  api:
    build:
      context: .
      dockerfile: Dockerfile.dev
    ports:
      - "8000:8000"
    volumes:
      - .:/app
      - /app/.venv
    environment:
      - DATABASE_URL=postgresql+asyncpg://postgres:postgres@db:5432/dev_db
      - REDIS_URL=redis://redis:6379/0
    depends_on:
      db:
        condition: service_healthy
      redis:
        condition: service_started

  db:
    image: postgres:18-alpine
    environment:
      POSTGRES_DB: dev_db
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 5s
      retries: 5

  redis:
    image: redis:8.6-alpine
    ports:
      - "6379:6379"

volumes:
  postgres_data:
```

## 🚫 Forbidden Anti-Patterns
- ❌ **Production Dockerfiles for Dev**: Re-building full multi-stage production images on every minor local code edit.
- ❌ **Missing Persistence Volumes**: Failing to map persistent volumes for PostgreSQL/MySQL dev container data.
- ❌ **Hardcoded Machine IPs**: Connecting to `localhost` inside container networks instead of service names (`db`, `redis`).

## 🔍 Verification & Testing
- **Local Compose Test**: `docker compose up -d` verifying all containers start and PostgreSQL health check turns `healthy`.
