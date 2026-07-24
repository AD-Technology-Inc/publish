# Skill: .agent/cloud-devops/docker/orchestration/compose-traefik-postgres-redis.md

## 📌 Core Philosophy & Constraints
- **Traefik Reverse Proxy**: Route inbound HTTP/HTTPS traffic to containers via dynamic Traefik container labels.
- **Automated SSL/TLS (Let's Encrypt)**: Generate HTTPS certificates automatically using Traefik ACME integration.
- **Isolated Overlay Network**: Route web traffic over a shared `proxy_net` bridge network.

## ⚡ Production Boilerplate / Standard Pattern

```yaml
# docker-compose.prod.yml (Traefik + Stack)
services:
  traefik:
    image: traefik:v3.0
    command:
      - "--providers.docker=true"
      - "--providers.docker.exposedbydefault=false"
      - "--entrypoints.web.address=:80"
      - "--entrypoints.websecure.address=:443"
      - "--certificatesresolvers.myresolver.acme.tlschallenge=true"
      - "--certificatesresolvers.myresolver.acme.email=admin@yourdomain.com"
      - "--certificatesresolvers.myresolver.acme.storage=/letsencrypt/acme.json"
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
      - traefik_letsencrypt:/letsencrypt
    networks:
      - proxy_net

  api:
    image: my-app:latest
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.api.rule=Host(`api.yourdomain.com`)"
      - "traefik.http.routers.api.entrypoints=websecure"
      - "traefik.http.routers.api.tls.certresolver=myresolver"
      - "traefik.http.services.api.loadbalancer.server.port=8000"
    networks:
      - proxy_net
      - backend_net

networks:
  proxy_net:
  backend_net:
    internal: true

volumes:
  traefik_letsencrypt:
```

## 🚫 Forbidden Anti-Patterns
- ❌ **Exposing Socket Read-Write**: Mounting `/var/run/docker.sock` without `:ro` read-only flag.
- ❌ **Exposing Databases Directly**: Exposing Postgres or Redis ports `5432:5432` publicly in production compose stacks.
- ❌ **Disabling ACME Certificates**: Running HTTP-only Traefik in production setups.

## 🔍 Verification & Testing
- **Traefik SSL Test**: Send `curl -I https://api.yourdomain.com` verifying valid Let's Encrypt TLS certificate return.
