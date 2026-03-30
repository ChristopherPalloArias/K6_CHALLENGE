/**
 * FakeStore Login Load Test (PERF-001)
 *
 * Primary load test for the FakeStore login endpoint using CSV-parameterized credentials.
 *
 * SLA targets:
 *   - Minimum throughput: 20 TPS
 *   - Maximum response time p95: <= 1500 ms
 *   - Error rate: < 3%
 *
 * Executor strategy: constant-arrival-rate (3 scenarios via options.js)
 *   - warm_up:   30s  @ 5 req/s   (stabilization)
 *   - main_load: 120s @ 20 req/s  (SLA measurement window)
 *   - cool_down: 30s  @ 5 req/s   (graceful shutdown)
 *
 * ARCHITECTURE NOTE:
 * SharedArray (used by utils.js) cannot be passed through setup() → default() via `data`
 * because k6 serializes `data` to JSON when crossing the setup/VU boundary, losing the
 * SharedArray wrapper. Instead, credentials are accessed directly from the module-level
 * import, which remains valid in all VU contexts.
 *
 * Run:
 *   k6 run k6/scenarios/load-login.js
 *
 * Override environment:
 *   k6 run k6/scenarios/load-login.js --env DEBUG_MODE=true
 */

import { SharedArray } from 'k6/data';
import { loadOptions } from '../config/options.js';
import { ENV } from '../config/env.js';
import http from 'k6/http';
import { check } from 'k6';

// ── Credentials (init context) ─────────────────────────────────────────────────
// SharedArray is parsed once and shared across all VUs via the init context.
// Access this module-level constant directly from default() — do NOT pass via setup().
const credentials = new SharedArray('login-credentials', function () {
  const raw = open('../data/credentials.csv');
  const lines = raw.split('\n').filter(line => line.trim() !== '');

  // Skip header row (user,passwd)
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].split(',');
    if (parts.length === 2) {
      rows.push({ username: parts[0].trim(), password: parts[1].trim() });
    }
  }

  if (rows.length === 0) {
    throw new Error('credentials.csv has no data rows.');
  }

  return rows;
});

// ── Options ────────────────────────────────────────────────────────────────────
export const options = loadOptions;

// ── Setup ─────────────────────────────────────────────────────────────────────
// Only logs execution metadata. Does NOT pass credentials — access them from the
// module-level SharedArray instead.
export function setup() {
  console.log('\n=== FakeStore Login Load Test ===');
  console.log(`✓ Credentials: ${credentials.length} entries loaded from CSV`);
  console.log(`✓ Base URL   : ${ENV.BASE_URL}`);
  console.log(`✓ Endpoint   : ${ENV.LOGIN_ENDPOINT}`);
  console.log('Starting scenarios...\n');

  return {
    startTime: new Date().toISOString(),
    totalCredentials: credentials.length,
  };
}

// ── Default (Main VU Iteration Loop) ──────────────────────────────────────────
export default function (data) {
  // Global round-robin: offset by VU index so different VUs use different credentials
  const cred = credentials[(__VU - 1 + __ITER) % credentials.length];

  if (ENV.DEBUG_MODE) {
    console.log(`[VU ${__VU} | Iter ${__ITER}] user: ${cred.username}`);
  }

  // POST /auth/login
  const res = http.post(
    `${ENV.BASE_URL}${ENV.LOGIN_ENDPOINT}`,
    JSON.stringify({ username: cred.username, password: cred.password }),
    {
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      timeout: `${ENV.REQUEST_TIMEOUT}ms`,
    }
  );

  // Validate response
  check(res, {
    'status is 200': (r) => r.status === 200,
    'response is json': (r) => {
      try { r.json(); return true; } catch (_) { return false; }
    },
    'responds within 5s': (r) => r.timings.duration < 5000,
  });
}

// ── Teardown ──────────────────────────────────────────────────────────────────
export function teardown(data) {
  console.log('\n=== Test Completed ===');
  console.log(`Start : ${data.startTime}`);
  console.log(`End   : ${new Date().toISOString()}`);
  console.log('Review k6 summary above for SLA results.');
}
