# k6 Scenario Scripts Implementation Summary: FakeStore Login Load Test

**Feature ID:** PERF-001  
**Implementation Date:** 2026-03-30  
**Source Spec:** `.github/specs/fakestore-login-load-test.spec.md` (APPROVED)  
**Status:** Scenario Scripts Generated and Ready for Execution

---

## Overview

Two complementary scenario scripts have been implemented:

1. **`k6/scenarios/smoke-login.js`** — Connectivity verification (quick pre-test)
2. **`k6/scenarios/load-login.js`** — Primary SLA validation (main test)

Both scripts leverage the reusable assets from `k6/config/` and `k6/lib/` to minimize duplication and maintain configuration centrality.

---

## 1. Smoke Test Scenario

**File:** `k6/scenarios/smoke-login.js`

**Purpose:** Quick pre-test validation to confirm endpoint accessibility and script correctness before committing to full load test.

### Execution Profile
```javascript
executor: 'constant-arrival-rate'
rate: 5 req/s
duration: 10s
preAllocatedVUs: 2
maxVUs: 10
```

### Lifecycle

#### Setup Phase
- Load credentials from CSV
- Distribute credentials to VUs
- Log startup info

#### Default Function (Iteration Loop)
- Get next credential for iteration
- Format as login payload
- Send POST request to `/auth/login`
- Validate response status and response time
- Log first response (iteration 0) for inspection
- Each iteration is independent; no inter-request think time

#### Teardown Phase
- Log test completion status
- Confirm readiness for main load test

### Validation Checks (Permissive for Smoke)
```javascript
assertLoginSuccess(response, 200)      // Status == 200
assertResponseTime(response, 2000)     // Duration < 2 seconds (permissive)
```

### Expected Behavior
- ✅ **Pass:** All requests return status 200 with valid JSON
- ✅ **Pass:** Response times reasonable (<2 seconds)
- ❌ **Fail:** Connection errors (endpoint unreachable)
- ❌ **Fail:** Response parsing errors (invalid JSON)

### Execution Command
```bash
k6 run k6/scenarios/smoke-login.js
```

**Expected Output:**
```
✓ Loaded 5 credentials from k6/data/credentials.csv
✓ Credentials prepared for VU distribution

[SMOKE] First Response Details:
  Status: 200
  Duration: XXXms
  Body (first 200 chars): {...}

=== Smoke Test Completed ===
Status: Ready for main load test
```

---

## 2. Load Test Scenario

**File:** `k6/scenarios/load-login.js`

**Purpose:** Primary SLA validation test. Proves the system sustains required throughput while maintaining latency and error-rate targets.

### Execution Profile
```javascript
executor: 'constant-arrival-rate'
rate: 20 req/s (target throughput)
duration: 2m30s (total)

stages: [
  { duration: '30s', target: 5 }  // Warm-up @ 5 req/s
  { duration: '120s', target: 20 } // Main Load @ 20 req/s (MEASUREMENT WINDOW)
  { duration: '30s', target: 0 }   // Cool-down ramp to 0
]

preAllocatedVUs: 10
maxVUs: 50
```

### Lifecycle

#### Setup Phase
- Load all 5 credentials from CSV
- Distribute credentials to VUs (per-VU cycling to reduce reuse)
- Log configuration and execution metadata

#### Default Function (Iteration Loop)
- Get next credential from VU's credential pool (round-robin cycling)
- Format credential as login payload: `{ username: ..., password: ... }`
- Send POST request to `https://fakestoreapi.com/auth/login`
  - Automatically includes: JSON headers, 60-second timeout
- Validate response:
  - Status code == 200 (empirically determined)
  - Response is valid JSON
  - Duration < 5 seconds (sanity check)
- Metrics captured:
  - `http_req_duration` (latency)
  - `http_req_failed` (errors)
  - `http_reqs` (throughput)

#### Teardown Phase
- Log test completion time
- Output execution configuration summary
- Reference final SLA results and conclusions document

### Validation Checks (Strict for Main Load)
```javascript
assertLoginSuccess(response, 200)      // Status == 200
assertResponseTime(response, 5000)     // Duration < 5s (sanity)
// Additional JSON validation for response structure
```

### Credential Distribution Strategy

**Goal:** Reduce per-credential reuse frequency to avoid rate-limiting per credential.

**Mechanism:**
```
Input: 5 credentials (donero, kevinryan, johnd, derek, mor_2314)
Total requests over 120s @ 20 TPS: 2,400 requests
Per credential if global pool: 2,400 / 5 = 480 reuses

Distribution across VUs:
- VU 1 gets credentials: [donero, kevinryan, johnd, derek, mor_2314]
- VU 2 gets credentials: [kevinryan, johnd, derek, mor_2314, donero]
- VU 3 gets credentials: [johnd, derek, mor_2314, donero, kevinryan]
...
- Each VU cycles through its subset independently

Result: Credential hammering is distributed; no single credential takes full load
```

**Implementation:**
```javascript
const credential = getNextCredential(data.vuCredentials, __ITER);
// getNextCredential iterates: credential[iter % credentials.length]
```

### SLA Evaluation Window

**Measurement Period:** Main Load Phase (T+30s to T+180s)
- Warm-up phase (first 30s) excluded from SLA evaluation
- Cool-down phase (last 30s) excluded from SLA evaluation
- Only main sustained 120-second load window is evaluated

**Pass Conditions (ALL must be true):**
1. ✅ **Throughput:** >= 20 req/s (expected ~2,400 requests in 120s)
2. ✅ **Error Rate:** < 3% (threshold: `http_req_failed: ['rate<0.03']`)
3. ✅ **Response Time p95:** <= 1,500 ms (threshold: `http_req_duration: ['p(95)<1500']`)

**Result:**
- **SLA PASS:** k6 exits with code 0
  - Summary: "SLA Thresholds: [3/3 PASSED]"
  - All thresholds met

- **SLA FAIL:** k6 exits with code 1
  - Summary: "SLA Thresholds: [X/3 FAILED]"
  - One or more thresholds breached

### Execution Command
```bash
# Standard execution
k6 run k6/scenarios/load-login.js

# With environment overrides
k6 run k6/scenarios/load-login.js --env DEBUG_MODE=true

# With custom base URL (e.g., staging)
k6 run k6/scenarios/load-login.js --env BASE_URL=https://staging.fakestoreapi.com

# With output summary to file
k6 run k6/scenarios/load-login.js --summary-export=reports/summary.json
```

### Expected Output
```
          /\      |‾‾| /‾‾/‾‾/ /‾‾/‾‾/‾‾/‾ /|‾‾|‾ |
         /  \     |  |/  /  /  /  /‾‾‾‾‾‾ \/ |  | ‾
        /    \    |     (  (  (  (  ‾‾) ‾‾‾‾ \|  |
       /      \   |  |\  \  \  \  \  / ‾‾‾‾ |  |
      /        \  |__| \__\__\__\__\__\_____/ \__|

     execution: local
        output: -
        script: k6/scenarios/load-login.js

     duration: 2m30s
        VUs: 2-50 (50 max)
        iterations: ~3000 (expected at 20 TPS)

     http_reqs......................: 2400 (16 req/s)
     http_req_duration..............: avg=123.45ms, p(95)=456.78ms, p(99)=789.01ms
     http_req_failed................: 0% (0 out of 2400)
     
     ✓ is status 200
     ✓ login response is json
     ✓ responds within 5000ms
     ✓ login status is 200

     SLA Thresholds: [3/3 PASSED] ✓
       ✓ http_req_failed rate<0.03
       ✓ http_req_duration p(95)<1500
       [Additional diagnostic thresholds...]
```

---

## 3. Configuration Integration

### Import Pattern
Both scripts follow a consistent import pattern:

```javascript
// Executor and thresholds (centralized)
import { loadOptions, smokeOptions } from '../config/options.js';

// Environment variables
import { ENV } from '../config/env.js';

// HTTP transport
import { httpClient } from '../lib/http-client.js';

// Response validation
import { assertLoginSuccess, assertResponseTime } from '../lib/checks.js';

// Data and utilities
import { 
  loadCredentialsFromCSV, 
  getCredentialsForVU, 
  getNextCredential, 
  formatLoginPayload 
} from '../lib/utils.js';
```

### Configuration Traceability
- **Executor & Stages:** `k6/config/options.js` → `export const loadOptions`
- **Thresholds & SLAs:** `k6/config/thresholds.js` → `export const thresholds`
- **Environment:** `k6/config/env.js` → `export const ENV`
- **HTTP Logic:** `k6/lib/http-client.js` → `export const httpClient`
- **Validation:** `k6/lib/checks.js` → Reusable checks
- **Data:** `k6/lib/utils.js` → CSV loading, cycling
- **Test Data:** `k6/data/credentials.csv` → 5 credentials

---

## 4. Error Handling and Robustness

### Handled Scenarios

**Setup Failures:**
```javascript
try {
  const allCredentials = loadCredentialsFromCSV();
} catch (err) {
  console.error(`Setup failed: ${err.message}`);
  throw err; // Fail immediately
}
```
- If CSV cannot be read → Test fails immediately
- If credentials invalid → Test fails with clear message

**Response Validation:**
```javascript
if (response.status >= 200 && response.status < 300) {
  try {
    const json = response.json();
  } catch (parseErr) {
    if (ENV.DEBUG_MODE) {
      console.error(`Failed to parse response JSON: ${parseErr.message}`);
    }
  }
}
```
- Invalid JSON responses logged but don't crash VU
- k6 check system tracks failures automatically

**Credential Cycling:**
```javascript
const credential = getNextCredential(data.vuCredentials, __ITER);
// Automatically cycles: credential[iter % credentials.length]
// Always safe; never runs out of credentials
```

---

## 5. Deployment Checklist

Before execution, verify:

- [x] `k6/scenarios/load-login.js` created
- [x] `k6/scenarios/smoke-login.js` created
- [x] Imports reference correct asset paths
- [x] `options` exported (not hardcoded)
- [x] `setup()` loads and validates credentials
- [x] `default()` uses credential cycling
- [x] `teardown()` logs completion
- [x] No hardcoded endpoints (uses ENV.LOGIN_ENDPOINT)
- [x] Response validation conservative (not over-assuming API contract)
- [x] No think time (per spec: "not required")

---

## 6. Execution Workflow

### Step 1: Pre-Test Validation (Smoke)
```bash
k6 run k6/scenarios/smoke-login.js
# Expected: Quick 10s test confirming endpoint reachable
# Output: First response details logged
# Next: Proceed to load test if smoke passes
```

### Step 2: Main Load Test
```bash
k6 run k6/scenarios/load-login.js
# Expected: 2m30s test (30s warm-up + 120s main + 30s cool-down)
# Output: SLA results with pass/fail status
# Next: Review results and generate conclusiones.txt
```

### Step 3: Interpret Results
```
If SLA PASS:
  ✓ Error rate < 3%
  ✓ p95 latency <= 1.5s
  ✓ Throughput >= 20 TPS
  → Endpoint meets requirements

If SLA FAIL:
  ✗ One or more thresholds breached
  → Analyze k6 output for specific cause
  → Re-run if transient (public API variability)
  → Document findings in conclusiones.txt
```

---

## 7. Advanced Execution Options

### Debug Mode (Verbose Logging)
```bash
k6 run k6/scenarios/load-login.js --env DEBUG_MODE=true
# Output: Per-VU credential usage, detailed response logs
```

### Custom Base URL
```bash
k6 run k6/scenarios/load-login.js --env BASE_URL=https://staging.fakestoreapi.com
# Useful for testing against staging environment
```

### Export Results
```bash
k6 run k6/scenarios/load-login.js --summary-export=reports/summary.json
# Saves machine-readable summary for post-processing
```

### Combine with Cloud Output (Optional)
```bash
k6 run k6/scenarios/load-login.js --out cloud
# Streams results to k6 Cloud (requires account, not required for this exercise)
```

---

## 8. Document History

| Version | Date | Author | Change |
|---------|------|--------|--------|
| 1.0 | 2026-03-30 | implement-k6-script | Scenario scripts generated from PERF-001 APPROVED spec |

---

## 9. Next Steps

### Immediate Actions
1. ✅ Execute smoke test: `k6 run k6/scenarios/smoke-login.js`
2. ✅ Execute load test: `k6 run k6/scenarios/load-login.js`
3. ✅ Capture output and results to `reports/`

### Post-Execution
1. Analyze SLA results
2. Create `conclusiones.txt` with findings
3. Create `readme.txt` with execution instructions
4. Commit all assets to GitHub
5. Verify repository is public

---

**Status:** ✅ **Complete** — Scenario scripts ready for execution. Proceed to test execution phase.
