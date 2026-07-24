# Skill: .agent/engineering-standards/logging-and-monitoring/metrics-and-alerts.md

## 📌 Core Philosophy & Constraints
- **RED Metrics**: Standardize API monitoring on **R**ate (req/sec), **E**rrors (failed/sec), and **D**uration (latency histogram).
- **Mandatory Health Probe**: Applications MUST expose `/healthz` (liveness) and `/readyz` (readiness) endpoints.
- **Actionable Alerts**: Alerts MUST be tied to customer-impacting SLOs, not transient CPU spikes.

## ⚡ Production Boilerplate / Standard Pattern

### FastAPI Prometheus & Health Check Setup
```python
from fastapi import FastAPI, Response, status
from prometheus_client import Counter, Histogram, generate_latest, CONTENT_TYPE_LATEST

app = FastAPI()

REQUEST_COUNT = Counter('http_requests_total', 'Total HTTP Requests', ['method', 'endpoint', 'status'])
REQUEST_LATENCY = Histogram('http_request_duration_seconds', 'HTTP Latency', ['endpoint'])

@app.get("/healthz", status_code=status.HTTP_200_OK)
async def liveness_probe():
    return {"status": "healthy"}

@app.get("/readyz")
async def readiness_probe(db_healthy: bool = True):
    if not db_healthy:
        return Response(content='{"status":"unhealthy"}', status_code=status.HTTP_503_SERVICE_UNAVAILABLE)
    return {"status": "ready"}

@app.get("/metrics")
async def metrics_endpoint():
    return Response(content=generate_latest(), media_type=CONTENT_TYPE_LATEST)
```

## 🚫 Forbidden Anti-Patterns
- ❌ **Missing Database Check in Readiness**: Returning HTTP 200 on `/readyz` when backend database connections are down.
- ❌ **High-Cardinality Metric Labels**: Adding unique IDs or emails as Prometheus label values.
- ❌ **Alerting on Warnings**: Triggering PagerDuty alerts for non-critical warning logs.

## 🔍 Verification & Testing
- **Probe Test**: Execute `curl -i http://localhost:8000/readyz` expecting status 200 when dependencies are healthy.
- **Metrics Scraping Test**: Verify `/metrics` exposes `http_requests_total` counter.
