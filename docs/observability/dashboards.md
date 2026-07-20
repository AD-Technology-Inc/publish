# Grafana Dashboards & Telemetry Visualization

## Purpose
This document specifies the pre-provisioned Grafana telemetry dashboards and datasource configurations in **AD. Publish**.

---

## Datasource Provisioning (`infrastructure/grafana/provisioning/datasources/datasources.yaml`)

Grafana is pre-configured with three unified telemetry datasources upon stack launch:

1. **Prometheus**: Metric time series (`http://prometheus:9090`).
2. **Loki**: Aggregated container logs (`http://loki:3100`).
3. **Tempo**: OpenTelemetry trace visualizer (`http://tempo:3200`).

---

## Pre-Provisioned Dashboard: `publish-overview.json`

Located in `infrastructure/grafana/provisioning/dashboards/publish-overview.json`.

### Dashboard Visual Panels:

1. **System Ingestion Throughput**:
   - Query: `sum(rate(http_requests_total{job="gateway"}[1m]))`
   - Description: Measures HTTP request rate handled by the Gateway proxy.
2. **Worker Stream Consumer Lag**:
   - Query: `redis_stream_consumer_group_pending{group="workers"}`
   - Description: Tracks total pending unacknowledged messages in stream PELs.
3. **Circuit Breaker Status**:
   - Query: `resilience_circuit_breaker_state`
   - Description: Displays circuit state (`0=CLOSED`, `1=OPEN`, `2=HALF_OPEN`) per service.
4. **Job Execution Duration**:
   - Query: `histogram_quantile(0.95, sum(rate(job_execution_duration_seconds_bucket[5m])) by (le))`
   - Description: Displays 95th percentile worker execution latency.
5. **DLQ Exception Volume**:
   - Query: `sum(increase(dlq_messages_total[1h])) by (service)`
   - Description: Counts total dead-lettered poison messages grouped by microservice.
