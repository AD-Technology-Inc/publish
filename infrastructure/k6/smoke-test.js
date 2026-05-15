import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');
const jobEnqueueTrend = new Trend('job_enqueue_duration', true);

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

const BASE_URL = __ENV.BASE_URL || 'http://gateway.localhost';

export default function () {
  // 1. Health check
  const healthRes = http.get(`${BASE_URL}/health`, {
    tags: { endpoint: 'health' },
  });
  check(healthRes, {
    'health: status 200': (r) => r.status === 200,
    'health: body ok': (r) => r.json('status') === 'ok',
  }) || errorRate.add(1);

  // 2. List accounts
  const accountsRes = http.get(`${BASE_URL}/accounts`, {
    tags: { endpoint: 'list-accounts' },
  });
  check(accountsRes, {
    'accounts: status 200': (r) => r.status === 200,
  }) || errorRate.add(1);

  // 3. Enqueue a post job (mock page_id — won't hit Facebook)
  const payload = JSON.stringify({
    page_id: 'k6-test-page',
    provider: 'facebook',
    message: `k6 smoke test message ${Date.now()}`,
  });

  const startEnqueue = Date.now();
  const postRes = http.post(`${BASE_URL}/social/posts`, payload, {
    headers: { 'Content-Type': 'application/json' },
    tags: { endpoint: 'create-post' },
  });
  jobEnqueueTrend.add(Date.now() - startEnqueue);

  const postOk = check(postRes, {
    'post: status 200': (r) => r.status === 200,
    'post: has job_id': (r) => r.json('job_id') !== null,
  });
  if (!postOk) errorRate.add(1);

  // 4. Poll job status once (not a full poll loop — just validate the endpoint)
  if (postOk) {
    const jobId = postRes.json('job_id');
    if (jobId) {
      const statusRes = http.get(`${BASE_URL}/jobs/${jobId}`, {
        tags: { endpoint: 'job-status' },
      });
      check(statusRes, {
        'job status: 200': (r) => r.status === 200,
        'job status: has status field': (r) => r.json('status') !== null,
      }) || errorRate.add(1);
    }
  }

  sleep(1);
}

export function handleSummary(data) {
  return {
    'stdout': textSummary(data, { indent: ' ', enableColors: true }),
    '/tmp/k6-results.json': JSON.stringify(data),
  };
}

// Minimal textSummary polyfill (k6 >= 0.38 has this built-in)
function textSummary(data, _opts) {
  return `
Posexei Smoke Test Results
==========================
Requests: ${data.metrics.http_reqs ? data.metrics.http_reqs.values.count : 'n/a'}
p95 latency: ${data.metrics.http_req_duration ? data.metrics.http_req_duration.values['p(95)'].toFixed(2) : 'n/a'}ms
Error rate: ${data.metrics.errors ? (data.metrics.errors.values.rate * 100).toFixed(2) : 'n/a'}%
`;
}
