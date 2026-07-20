# k6 Load Testing Guide & Scenarios

## Purpose
This document details the k6 load testing suite, test scenarios (`smoke` and `load`), and command execution instructions in **AD. Publish**.

---

## k6 Test Scenarios (`infrastructure/k6/smoke-test.js`)

The k6 test script defines two distinct execution scenarios:

```javascript
export const options = {
  scenarios: {
    smoke: {
      executor: 'constant-vus',
      vus: 1,
      duration: '10s',
      tags: { test_type: 'smoke' },
    },
    load: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '30s', target: 20 },  // Ramp up to 20 users
        { duration: '1m', target: 20 },   // Sustain 20 users
        { duration: '30s', target: 0 },    // Ramp down
      ],
      startTime: '10s',
      tags: { test_type: 'load' },
    },
  },
  thresholds: {
    'http_req_duration{test_type:load}': ['p(95)<500'],
    'http_req_duration{test_type:smoke}': ['p(95)<200'],
    errors: ['rate<0.01'],
    job_enqueue_duration: ['p(95)<300'],
  },
};
```

---

## Executing Performance Tests

### Option A: Local k6 Binary
Ensure k6 is installed on host system, then execute:
```bash
k6 run infrastructure/k6/smoke-test.js
```

### Option B: Docker Container Invocation
Run k6 via Docker against the running infrastructure stack:
```bash
docker run --rm -i \
  --network infrastructure_app \
  -e BASE_URL=http://gateway:3001 \
  grafana/k6 run - < infrastructure/k6/smoke-test.js
```

---

## Interpreting Test Summary Outputs

Upon test completion, k6 exports a summary string and writes detailed JSON results to `/tmp/k6-results.json`:

```text
AD. Publish Smoke Test Results
==========================
Requests: 1420
p95 latency: 124.50ms
Error rate: 0.00%
```
