# Deployment Topology & Container Architecture

## Purpose
This document details the physical and container deployment topology of **AD. Publish**, including networking layout, volume persistence configurations, reverse proxy routing, and hardware container resource reservations.

---

## Container Deployment Topology

```mermaid
graph TD;
    subgraph Host Infrastructure
        subgraph Public Entrypoint
            Traefik["Traefik v3.6.8 Proxy<br>(Ports 80, 8080)"];
        end

        subgraph Docker Network: app
            Client["client Container<br>(Node/React, Port 3000)<br>Limit: 0.5 CPU, 512MB"]
            Gateway["gateway Container<br>(FastAPI, Port 3001)<br>Limit: 0.25 CPU, 256MB"]
            IdentityService["identity-service Container<br>(FastAPI, Port 3001)<br>Limit: 0.25 CPU, 256MB"]
            IdentityDB[("identity-db Container<br>(PostgreSQL 18)<br>Port 5432<br>Limit: 0.25 CPU, 256MB")]
            Redis[("redis Container<br>(Redis 8.6)<br>Port 6379<br>Limit: 0.25 CPU, 256MB")]
        end

        subgraph Observability Stack
            Prometheus["Prometheus"]
            Loki["Loki"]
            Tempo["Tempo"]
            Grafana["Grafana (Port 3000)"]
        end
    end

    Traefik -- "Host(app.localhost)" --> Client
    Traefik -- "Host(gateway.localhost)" --> Gateway
    Gateway -- "http://identity-service:3001" --> IdentityService
    IdentityService -- "postgresql://identity-db:5432" --> IdentityDB
    Gateway -- "redis:6379" --> Redis
```

---

## Networking & Traefik Routing Configuration

All services communicate over a single Docker bridge network (`app`).

### Traefik Proxy Rules (`infrastructure/docker-compose.yaml` & `infrastructure/traefik/`)
- **Web Entrypoint**: Port `80` (HTTP).
- **Dashboard Entrypoint**: Port `8080`.
- **Frontend App Router**:
  - Rule: `Host("app.localhost")`
  - Target: `http://client:3000`
- **API Gateway Router**:
  - Rule: `Host("gateway.localhost")`
  - Target: `http://gateway:3001`
  - Middleware: `gateway-cors@file`

---

## Service Resource Allocations (`docker-compose.yaml`)

Every container in the stack has strict resource limits and reservations configured to prevent noisy-neighbor memory saturation:

| Service | Container Name | Base Image | Memory Limit | Memory Reservation | CPU Limit |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Traefik Proxy** | `traefik` | `traefik:v3.6.8` | `256M` | `128M` | `0.25` |
| **Web Frontend** | `client` | `node:20-alpine` | `512M` | `256M` | `0.50` |
| **API Gateway** | `gateway` | `python:3.12-slim` | `256M` | `128M` | `0.25` |
| **Identity Service**| `identity-service` | `python:3.12-slim` | `256M` | `128M` | `0.25` |
| **Identity Database**| `identity-db` | `postgres:18-trixie` | `256M` | `128M` | `0.25` |
| **Redis Broker** | `redis` | `redis:8.6.0-alpine3.23` | `256M` | `128M` | `0.25` |

---

## Persistent Volumes & Data Storage

The stack provisions named Docker volumes to ensure database and cache state survive container restarts:

1. `identity-db-data`: Mounted to `/var/lib/postgresql` in `identity-db`.
2. `social-post-db-data`: Reserved for social post PostgreSQL instance.
3. `social-account-db-data`: Reserved for social account PostgreSQL instance.
4. `social-publish-db-data`: Reserved for social publish PostgreSQL instance.
5. `redis-data`: Mounted to `/data` in `redis`.

---

## Environment Variables & Configuration Matrix

```ini
# Gateway Service (.env)
REDIS_HOST=redis
REDIS_PORT=6379

# Identity Service (.env)
DATABASE_URL=postgresql+asyncpg://identity_user:identity_pass@identity-db:5432/identity_db

# Social Account Service (.env)
DATABASE_URL=postgresql://social_account_user:social_account_pass@social-account-db:5432/social_account_db

# Social Post Service (.env)
DATABASE_URL=postgresql://social_post_user:social_post_pass@social-post-db:5432/social_post_db

# Social Publish Service (.env)
GRAPH_API_BASE_URL=https://graph.facebook.com/v19.0
THREADS_API_BASE_URL=https://graph.threads.net/v1.0
FACEBOOK_PAGE_ACCESS_TOKEN=mocked_token
```

---

## Security & Isolation Considerations

1. **Network Boundaries**: Only Traefik exposes public ports (`80`, `8080`). Internal services (`identity-service`, `redis`, `identity-db`) bind exclusively to internal Docker network `app` and are unreachable directly from host interfaces except explicitly mapped debug ports.
2. **CORS Enforcement**: Traefik middleware `gateway-cors@file` strips non-whitelisted headers before forwarding to FastAPI microservices. Gateway headers filter enforces `ALLOWED_HEADERS = {"content-type", "authorization"}` in `http_client.py`.
