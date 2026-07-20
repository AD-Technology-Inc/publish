# Deployment Guide & Operations Manual

## Purpose
This document provides step-by-step instructions for building, launching, and managing the **AD. Publish** stack using Docker Compose and Traefik.

---

## Prerequisites
- Docker Engine v24.0+
- Docker Compose v2.20+
- `git` version control client

---

## Deployment Steps (`infrastructure/`)

### 1. Clone Repository & Navigate to Infrastructure Directory
```bash
git clone https://github.com/AD-Technology-Inc/publish.git
cd publish/infrastructure
```

### 2. Build & Launch Container Stack
```bash
docker-compose up --build -d
```

### 3. Verify Container Status
```bash
docker-compose ps
```

Expected output should show running containers for `traefik`, `client`, `gateway`, `identity-service`, `identity-db`, and `redis`.

---

## Accessing Local Deployment Endpoints

| Service / Interface | Local URL | Description |
| :--- | :--- | :--- |
| **Web UI Dashboard** | `http://app.localhost` | React/Vite web interface. |
| **API Gateway Proxy** | `http://gateway.localhost` | Public FastAPI Gateway ingestion entrypoint. |
| **Traefik Dashboard** | `http://localhost:8080` | Proxy routing status & entrypoint metrics. |
| **Grafana Telemetry** | `http://localhost:3000` | Pre-provisioned metrics, logs, and traces. |
| **Gateway Health API** | `http://gateway.localhost/health` | Health check endpoint. |

---

## Operational Commands

### Stopping the Stack
```bash
docker-compose down
```

### Stopping Stack & Removing Named Volumes
> [!CAUTION]
> This command deletes all persistent database files (`identity-db-data`) and Redis stream data (`redis-data`).
```bash
docker-compose down -v
```

### Viewing Container Logs
```bash
# View all container logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f gateway
docker-compose logs -f identity-service
```
