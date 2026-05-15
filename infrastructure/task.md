# Observability Stack Tasks

## Infrastructure Config
- [ ] `infrastructure/observability/otel-collector-config.yaml`
- [ ] `infrastructure/observability/prometheus.yml`
- [ ] `infrastructure/observability/loki-config.yaml`
- [ ] `infrastructure/observability/tempo-config.yaml`
- [ ] `infrastructure/observability/promtail-config.yaml`
- [ ] `infrastructure/grafana/provisioning/datasources/datasources.yaml`
- [ ] `infrastructure/grafana/provisioning/dashboards/dashboard-provider.yaml`
- [ ] `infrastructure/grafana/provisioning/dashboards/posexei-overview.json`
- [ ] `infrastructure/k6/smoke-test.js`
- [ ] Update `infrastructure/docker-compose.yaml`

## Shared Module
- [ ] Add OTel deps to `services/shared/pyproject.toml`
- [ ] Create `services/shared/shared/telemetry.py`
- [ ] Update `services/shared/shared/worker.py` (span wrapping)

## Gateway
- [ ] Add OTel deps to `gateway/app/pyproject.toml`
- [ ] Update `gateway/app/Dockerfile`
- [ ] Add Instrumentator to `gateway/app/main.py`

## Identity Service
- [ ] Add OTel deps to `services/identity-service/pyproject.toml`
- [ ] Update `services/identity-service/Dockerfile`
- [ ] Add Instrumentator to `services/identity-service/main.py`

## Social Account Service
- [ ] Add OTel deps to `services/social-account-service/pyproject.toml`
- [ ] Update `services/social-account-service/Dockerfile`
- [ ] Add Instrumentator to `services/social-account-service/main.py`

## Social Post Service
- [ ] Add OTel deps to `services/social-post-service/pyproject.toml`
- [ ] Update `services/social-post-service/Dockerfile`
- [ ] Add Instrumentator to `services/social-post-service/main.py`

## Social Publish Service
- [ ] Add OTel deps to `services/social-publish-service/pyproject.toml`
- [ ] Update `services/social-publish-service/Dockerfile`
- [ ] Add Instrumentator to `services/social-publish-service/main.py`
