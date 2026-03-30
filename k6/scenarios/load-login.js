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
 * Run:
 *   k6 run k6/scenarios/load-login.js
 *
 * Override environment:
 *   k6 run k6/scenarios/load-login.js --env BASE_URL=https://staging.fakestoreapi.com --env DEBUG_MODE=true
 */

import { loadOptions } from '../config/options.js';
import { ENV } from '../config/env.js';
import { httpClient } from '../lib/http-client.js';
import { assertLoginSuccess, assertResponseTime } from '../lib/checks.js';
import {
  loadCredentialsFromCSV,
  getCredentialsForVU,
  getNextCredential,
  logCredentialUsage,
  formatLoginPayload,
} from '../lib/utils.js';

// ── Options ────────────────────────────────────────────────────────────────────
// Centrally managed. Never define stages/thresholds here — always import.
export const options = loadOptions;

// ── Setup ─────────────────────────────────────────────────────────────────────
// Executes once before all VUs start iterating.
export function setup() {
  console.log('\n=== FakeStore Login Load Test Setup ===');

  try {
    const allCredentials = loadCredentialsFromCSV();
    console.log(`✓ Loaded ${allCredentials.length} credentials from ${ENV.CSV_PATH}`);

    // Distribute credentials across VUs so each VU cycles its own subset.
    const vuCredentials = getCredentialsForVU(allCredentials, loadOptions.scenarios.main_load.maxVUs);
    console.log('✓ VU credential distribution: each VU will cycle through assigned credentials');

    return {
      allCredentials,
      vuCredentials,
      startTime: new Date().toISOString(),
      executionConfig: {
        baseURL: ENV.BASE_URL,
        endpoint: ENV.LOGIN_ENDPOINT,
        timeout: ENV.REQUEST_TIMEOUT,
        totalCredentials: allCredentials.length,
        maxVUs: loadOptions.scenarios.main_load.maxVUs,
      },
    };
  } catch (err) {
    console.error(`✗ Setup failed: ${err.message}`);
    throw err; // Fail fast — abort the test run
  }
}

// ── Default (Main VU Iteration Loop) ──────────────────────────────────────────
// k6 calls this function repeatedly for each VU, at the rate governed by the executor.
export default function (data) {
  // 1. Pick next credential (round-robin within this VU's assigned pool)
  const credential = getNextCredential(data.vuCredentials, __ITER);

  if (ENV.DEBUG_MODE) {
    logCredentialUsage(credential, __ITER);
  }

  // 2. Build request payload
  const loginPayload = formatLoginPayload(credential);

  // 3. POST /auth/login
  const response = httpClient.loginPost(loginPayload);

  // 4. Validate response (conservative — no undocumented API assumptions)
  assertLoginSuccess(response, 200);         // status == 200 + body is JSON
  assertResponseTime(response, 5000);        // hard-ceiling for individual VU

  // 5. Opportunistic JSON field check (only if request succeeded)
  if (response.status >= 200 && response.status < 300) {
    try {
      response.json(); // ensure body is parseable
    } catch (parseErr) {
      if (ENV.DEBUG_MODE) {
        console.error(`[VU ${__VU}] Failed to parse response JSON: ${parseErr.message}`);
      }
    }
  }
}

// ── Teardown ──────────────────────────────────────────────────────────────────
// Executes once after all VUs complete. No cleanup needed for stateless login endpoint.
export function teardown(data) {
  const endTime = new Date().toISOString();
  console.log('\n=== Test Execution Completed ===');
  console.log(`Start : ${data.startTime}`);
  console.log(`End   : ${endTime}`);
  console.log(`Config: ${JSON.stringify(data.executionConfig, null, 2)}`);
  console.log('\nRefer to k6 summary output above for detailed SLA results.');
  console.log('Check conclusiones.txt for final performance findings.');
}
