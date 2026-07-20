# Metrics Pipeline & Performance Indicators

## Purpose
This document specifies the metrics collection pipeline, Prometheus configuration, custom k6 performance metrics, and telemetry shims in **AD. Publish**.

---

## Observability Infrastructure Layout

```mermaid
graph TD;
    App[FastAPI Gateway / Microservices] -->|Log Stdout (JSON)| Promtail
    App -->|Prometheus Metrics| Prometheus
    Promtail --> Loki
    App -->|OTel Traces| OTelCollector["OTel Collector"]
    OTelCollector --> Tempo
    
    Prometheus --> Grafana
    Loki --> Grafana
    Tempo --> Grafana
```

---

## Prometheus Telemetry Configuration (`infrastructure/observability/prometheus.yml`)

Prometheus scrapes metrics from services and exporter targets configured in `prometheus.yml`:

```yaml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']

  - job_name: 'gateway'
    static_configs:
      - targets: ['gateway:3001']

  - job_name: 'identity-service'
    static_configs:
      - targets: ['identity-service:3001']

  - job_name: 'social-account-service'
    static_configs:
      - targets: ['social-account-service:3001']

  - job_name: 'social-post-service'
    static_configs:
      - targets: ['social-post-service:3001']

  - job_name: 'social-publish-service'
    static_configs:
      - targets: ['social-publish-service:3001']
```

---

## Performance Test Metrics (`infrastructure/k6/smoke-test.js`)

The k6 performance suite defines custom metrics to measure enqueue latency and system error rates:

```javascript
// Custom Metrics
const errorRate = new Rate('errors');
const jobEnqueueTrend = new Trend('job_enqueue_duration', true);
```

### Performance Threshold Targets:
- **`http_req_duration{test_type:smoke}`**: p(95) < 200ms for health check endpoints.
- **`http_req_duration{test_type:load}`**: p(95) < 500ms under ramping VUs (20 concurrent virtual users).
- **`job_enqueue_duration`**: p(95) < 300ms for POST requests to `/social/posts`.
- **`errors`**: Total error rate < 1.0%.

---

## Shared Telemetry Shims (`services/shared/shared/telemetry.py`)

In Python worker daemons, metrics functions (`record_job_success`, `record_job_failure`) are currently wrapped with no-op shims to maintain zero runtime dependency overhead when OpenTelemetry collectors are inactive:

```python
def record_job_success(job_type: str, duration_s: float):
    """No-op metrics recording."""
    pass

def record_job_failure(job_type: str, duration_s: float, retryable: bool):
    """No-op metrics recording."""
    pass
```
