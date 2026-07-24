# Skill: .agent/cloud-devops/docker/SKILL.md

# Docker Containerization & Orchestration Skill Registry

This document serves as the containerization decision matrix and Dockerfile specification reference for AI agents building production multi-stage images and local compose environments.

---

## 🛠️ Tech Stack & Base Image Manifest

- **Container Engine**: Docker Engine 26+ / Docker Compose v2
- **Frontend Base Image**: Node 25 Alpine (`node:25-alpine`)
- **FastAPI Base Image**: Python 3.12 UV Slim (`ghcr.io/astral-sh/uv:python3.12-trixie-slim`)
- **Laravel Base Image**: PHP 8.3 FPM Alpine (`php:8.3-fpm-alpine`)
- **Database Image**: PostgreSQL 18 Alpine (`postgres:18-alpine`)
- **Cache & Queue Image**: Redis 8.6 Alpine (`redis:8.6-alpine`)
- **Ingress Proxy**: Traefik v3.0

---

## 🔗 Sub-Skill Deep Dive References

- 🏗️ **Multi-Stage Builds**: [multi-stage-builds.md](./containerization/multi-stage-builds.md)
- 🛡️ **Non-Root Security**: [security-and-non-root.md](./containerization/security-and-non-root.md)
- 🖥️ **Frontend Dockerfile**: [frontend-dockerfile.md](./containerization/framework-images/frontend-dockerfile.md)
- 🐍 **FastAPI Dockerfile**: [fastapi-dockerfile.md](./containerization/framework-images/fastapi-dockerfile.md)
- 🐳 **Compose Dev Environment**: [docker-compose-dev.md](./orchestration/docker-compose-dev.md)
- 🚦 **Traefik Stack**: [compose-traefik-postgres-redis.md](./orchestration/compose-traefik-postgres-redis.md)
- 🩺 **Healthchecks & Networks**: [healthchecks-and-networks.md](./orchestration/healthchecks-and-networks.md)

---

## 🧭 1. Docker Architectural Decision Matrix

| Domain / Responsibility | Standard Pattern | Architectural Rule |
| :--- | :--- | :--- |
| **Image Size Optimization** | Multi-Stage Builds | Separate build toolchains from final runtime stage. Max size < 200MB. |
| **Container Hardening** | Non-Root User Execution | Create dedicated app user (`USER appuser`) avoiding root privilege escalation. |
| **Service Discovery** | Internal Compose Networks | Communicate via service names (`db`, `redis`); isolate frontend and backend networks. |
| **Container Health** | Native Healthchecks | Declare `healthcheck:` with test commands (`pg_isready`, `redis-cli ping`). |
| **Development Workflow** | Docker Compose Dev | Mount host directories via bind mounts with auto-reload flags enabled. |

---

## 🛠️ 2. Production Code Standard Pattern

```dockerfile
# Multi-stage Dockerfile for FastAPI (ghcr.io/astral-sh/uv)
FROM ghcr.io/astral-sh/uv:python3.12-trixie-slim AS builder

WORKDIR /app
COPY pyproject.toml uv.lock /app/
RUN uv sync --frozen --no-dev --no-install-project

FROM python:3.12-slim AS runner

WORKDIR /app
RUN groupadd -g 10001 appgroup && \
    useradd -u 10001 -g appgroup -s /bin/bash -m appuser

COPY --from=builder /app/.venv /app/.venv
COPY ./app /app/app

ENV PATH="/app/.venv/bin:$PATH"
USER appuser:appgroup

EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

---

## 🚫 Forbidden Anti-Patterns

- ❌ **Running as Root**: Leaving default `root` user active in production container instances.
- ❌ **Single-Stage Heavy Images**: Packaging build compilers (gcc, g++, npm cache) into final runner images.
- ❌ **Exposing Databases Publicly**: Mapping database ports (`5432:5432`) to `0.0.0.0` in production stacks.
- ❌ **Missing Healthcheck Configurations**: Deploying services without `healthcheck` declarations in Compose files.

---

## 🔍 Verification & Quality Assurance

- **Image Lint Assertion**: Run `hadolint Dockerfile` verifying zero security warnings.
- **Runtime Health Check**: Run `docker compose ps` asserting all services reach `healthy` status.
