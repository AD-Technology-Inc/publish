# System Benchmarks & Performance Targets

## Purpose
This document specifies baseline performance metrics, response latency targets, and throughput expectations for **AD. Publish**.

---

## Baseline Performance Targets

```mermaid
graph LR;
    HealthCheck["GET /health"] -->|Target: < 200ms p95| Target1["FastAPI Ingestion Pass"]
    JobEnqueue["POST /social/posts"] -->|Target: < 300ms p95| Target2["Redis Stream XADD"]
    JobExecution["Worker Processing Loop"] -->|Target: 1.0s - 1.5s per job| Target3["Platform API Publish"]
```

---

## Benchmark Metrics Table

| Endpoint / Component | Target Metric | Metric Type | Validation Method |
| :--- | :--- | :--- | :--- |
| **`GET /health`** | < 200ms | p(95) Response Latency | k6 Smoke Test (`smoke-test.js`) |
| **`GET /accounts`** | < 200ms | p(95) Response Latency | k6 Smoke Test (`smoke-test.js`) |
| **`POST /social/posts`** | < 300ms | p(95) Enqueue Latency | k6 Smoke Test (`job_enqueue_duration`) |
| **API Ingestion Rate** | > 500 req/sec | Peak Throughput | k6 Load Test Scenario |
| **Worker Execution Latency** | 1.0s - 1.5s | Average Job Duration | OTel Span Duration (`job.publish_post`) |
| **Error Rate** | < 1.0% | Total Request Failures | k6 `errors` Rate Metric |
