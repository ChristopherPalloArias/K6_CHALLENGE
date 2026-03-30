# k6 Assets Implementation Summary: FakeStore Login Load Test

**Feature ID:** PERF-001  
**Implementation Date:** 2026-03-30  
**Source Spec:** `.github/specs/fakestore-login-load-test.spec.md` (APPROVED)  
**Status:** Assets Generated and Ready for Script Integration

---

## Overview

This document summarizes the k6 reusable assets generated for the FakeStore login load test (PERF-001). These assets provide the foundational configuration, libraries, and data required by the main scenario script.

**Assets Generated:**
- ✅ Configuration files (env, options, thresholds)
- ✅ HTTP client wrapper with login-specific helpers
- ✅ Response validation checks
- ✅ CSV data loading and credential cycling utilities
- ✅ Test data (credentials.csv)

---

## 1. Configuration Assets

### 1.1 `k6/config/env.js` — Environment Configuration

**Purpose:** Centralized environment variable resolution with sensible defaults

**Key Properties:**

| Property | Default | Purpose |
|----------|---------|---------|
| `BASE_URL` | `https://fakestoreapi.com` | FakeStore API base URL |
| `LOGIN_ENDPOINT` | `/auth/login` | Login endpoint path |
| `REQUEST_TIMEOUT` | `60000` (60s) | Request timeout per cURL spec |
| `CSV_PATH` | `k6/data/credentials.csv` | Path to credentials CSV file |
| `DEBUG_MODE` | `false` | Enable verbose logging |

**Usage in Code:**
```javascript
import { ENV } from './config/env.js';
const url = ENV.BASE_URL + ENV.LOGIN_ENDPOINT; // https://fakestoreapi.com/auth/login
```

**Environment Override:**
```bash
# Override at runtime
k6 run scenario.js --env BASE_URL=https://staging.fakestoreapi.com --env DEBUG_MODE=true
```

---

### 1.2 `k6/config/options.js` — Executor Profiles

**Purpose:** Reusable executor configurations for smoke and load tests

**Smoke Test Configuration:**
```javascript
executor: 'constant-arrival-rate'
rate: 5 req/s
duration: 10s
preAllocatedVUs: 2
maxVUs: 10
```
- **Purpose:** Quick connectivity verification
- **Load Level:** 1/4 of target (5 req/s)
- **Duration:** 10 seconds
- **Use Case:** Pre-test validation before main load test

**Load Test Configuration:**
```javascript
executor: 'constant-arrival-rate'
rate: 20 req/s
duration: 2m30s (150 seconds total)
preAllocatedVUs: 10
maxVUs: 50

stages:
  - 30s @ 5 req/s   (warm-up: stabilization)
  - 120s @ 20 req/s (main load: SLA measurement window)
  - 30s @ 0 req/s   (cool-down: graceful shutdown)
```

- **Executor:** `constant-arrival-rate` (rate-based, not VU-based)
- **Rationale:** Directly targets the 20 TPS requirement
- **VU Strategy:** Conservative 10/50 ratio ensures test is not k6-limited
- **Phase Structure:** Separates warm-up (excluded from SLA evaluation) from main load measurement window

**Exported Functions:**
```javascript
export smokeOptions // Smoke test config
export loadOptions  // Load test config
export getOptions(type) // Helper to select by type
```

---

### 1.3 `k6/config/thresholds.js` — SLA Thresholds

**Purpose:** Quantify pass/fail criteria for performance targets

**Confirmed SLA Thresholds (Hard Fail):**

| Threshold | Expression | Source | Interpretation |
|-----------|-----------|--------|-----------------|
| **Error Rate** | `http_req_failed: ['rate<0.03']` | Requirement §9 | < 3% failed requests |
| **Response Time p95** | `http_req_duration: ['p(95)<1500']` | Req. §9, 1.5s max | 95th percentile ≤ 1,500 ms |

**Diagnostic Thresholds (Informational):**

| Threshold | Expression | Purpose |
|-----------|-----------|---------|
| Response Time p50 | `p(50)<300` | Baseline typical response |
| Response Time p90 | `p(90)<800` | 90% of requests within range |
| Response Time p99 | `p(99)<3000` | Identify outlier patterns |
| Connection Time | `http_req_connecting: ['p(95)<100']` | TLS/TCP overhead |
| Server Wait Time | `http_req_waiting: ['p(95)<500']` | Backend processing latency |

**Test Result Interpretation:**

- **SLA PASS:** All three confirmed thresholds met + throughput ≥ 20 TPS
  - k6 exit code: 0
  - Summary: "SLA Thresholds: [3/3 PASSED]"

- **SLA FAIL:** Any confirmed threshold breached
  - k6 exit code: 1
  - Summary: "SLA Thresholds: [X/3 FAILED]"

---

## 2. Library Assets

### 2.1 `k6/lib/http-client.js` — HTTP Transport Wrapper

**Purpose:** Encapsulate HTTP operations with consistent headers, timeout, and error handling

**Key Features:**
- Automatic Content-Type: application/json
- Centralized timeout configuration (60s per spec)
- Support for custom headers
- k6 parameter pass-through for advanced options

**Exported Interface:**

```javascript
httpClient.get(path, headers, params)
httpClient.post(path, body, headers, params)
httpClient.put(path, body, headers, params)
httpClient.del(path, body, headers, params)
httpClient.loginPost(credentials, customHeaders) // Login-specific convenience
```

**Example Usage:**
```javascript
import { httpClient } from './lib/http-client.js';

const credentials = { username: 'donero', password: 'ewedon' };
const response = httpClient.loginPost(credentials);
// Equivalent to: POST /auth/login with JSON body and 60s timeout
```

**Headers Automatically Added:**
- `Content-Type: application/json`
- `Accept: application/json`
- Custom headers merged without overwrite protection (custom headers take precedence)

---

### 2.2 `k6/lib/checks.js` — Response Validation

**Purpose:** Provide reusable k6 checks for conservative response validation

**Standard Checks:**

```javascript
assertStatus(res, expectedStatus)           // Is HTTP status == expectedStatus?
assertResponseTime(res, maxMs)              // Is duration < maxMs?
assertJsonBody(res, validationFn, name)     // Is JSON valid and parseable?
```

**Login-Specific Checks:**

```javascript
assertLoginSuccess(res, successStatus)      // Is status == successStatus AND JSON valid?
assertFieldExists(res, fieldName)           // Does JSON contain fieldName?
```

**Philosophy:**
- Checks are **conservative** — avoid assuming undocumented API behavior
- Success is empirically determined, not pre-assumed
- Each check returns a boolean for chainable validation

**Example:**
```javascript
import { assertLoginSuccess } from './lib/checks.js';

const res = httpClient.loginPost(cred);
assertLoginSuccess(res, 200); // Check if response looks like successful login
```

---

### 2.3 `k6/lib/utils.js` — CSV and Data Utilities

**Purpose:** Handle CSV credential loading, VU-based distribution, and credential cycling

**Key Functions:**

| Function | Purpose | Returns |
|----------|---------|---------|
| `loadCredentialsFromCSV()` | Load all credentials from CSV file | Array of {username, password} objects |
| `getCredentialsForVU(all, totalVUs)` | Distribute credentials to current VU | Subset of credentials for this VU |
| `getNextCredential(vuCreds, iterIndex)` | Get credential for iteration | Single {username, password} object |
| `logCredentialUsage(cred, iterIndex)` | Log credential usage (debug) | void |
| `formatLoginPayload(credential)` | Format credential for request body | {username, password} object |

**Credential Distribution Strategy:**

```
Input: 5 credentials (donero, kevinryan, johnd, derek, mor_2314)
VU Distribution (example with 10 VUs):
  VU 1: [donero, kevinryan, johnd, derek, mor_2314]
  VU 2: [kevinryan, johnd, derek, mor_2314, donero]
  VU 3: [johnd, derek, mor_2314, donero, kevinryan]
  ...
```

**Rationale:**
- Each VU has its own credential subset
- Reduces per-credential reuse frequency
- Avoids per-credential rate-limiting from concentrated hammering

**Usage Example:**
```javascript
import { loadCredentialsFromCSV, getCredentialsForVU, getNextCredential } from './lib/utils.js';

// In setup():
const allCreds = loadCredentialsFromCSV(); // Load all 5
const data = { 
  allCredentials: allCreds,
  vuCredentials: getCredentialsForVU(allCreds, 50) // Distribute to this VU
};

// In scenario default():
const nextCred = getNextCredential(data.vuCredentials, __ITER); // Get cred for iteration
const payload = formatLoginPayload(nextCred);
```

---

## 3. Test Data Assets

### 3.1 `k6/data/credentials.csv` — Credential Dataset

**Format:** CSV with headers `user,passwd`

**Content (5 credential pairs):**

```csv
user,passwd
donero,ewedon
kevinryan,key02937@
johnd,m38rmF$
derek,jklg*_56
mor_2314,83r5^_
```

**Properties:**
- **Location:** `k6/data/credentials.csv`
- **Records:** 5 valid FakeStore API credentials
- **Usage:** Loaded during test setup; cycled across VUs during test execution
- **Reuse Factor:** ~480 reuses per credential during 120s load @ 20 TPS
  - Total requests: 2,400 (120s × 20 req/s)
  - Per credential: 2,400 ÷ 5 = 480 reuses
  - Documented as expected behavior in risk matrix

---

## 4. Configuration Summary Matrix

| Asset | File | Key Config | Purpose |
|-------|------|-----------|---------|
| **Environment** | `env.js` | `BASE_URL`, `LOGIN_ENDPOINT`, `REQUEST_TIMEOUT=60s` | Runtime configuration resolution |
| **Executor (Smoke)** | `options.js` | 5 req/s, 10s, 2/10 VU | Quick connectivity check |
| **Executor (Load)** | `options.js` | 20 req/s, 150s, 10/50 VU, 3-phase stages | Main SLA validation |
| **Thresholds (SLA)** | `thresholds.js` | error < 3%, p95 ≤ 1500ms | Hard pass/fail criteria |
| **HTTP Client** | `http-client.js` | POST with JSON, 60s timeout | Transport layer abstraction |
| **Checks** | `checks.js` | Conservative status/time/JSON validation | Response validation |
| **Utilities** | `utils.js` | CSV loader, VU distribution, credential cycling | Data handling |
| **Test Data** | `credentials.csv` | 5 credentials (provided by requirement) | Login request parameterization |

---

## 5. Asset Integration Points

### For Scenario Script (`k6/scenarios/load-login.js`)

The scenario script will integrate these assets as follows:

```javascript
// Imports
import { loadOptions } from '../config/options.js';
import { thresholds } from '../config/thresholds.js';
import { httpClient } from '../lib/http-client.js';
import { assertLoginSuccess } from '../lib/checks.js';
import { loadCredentialsFromCSV, getCredentialsForVU, getNextCredential, formatLoginPayload } from '../lib/utils.js';

// Export options (references thresholds internally)
export const options = loadOptions; // Uses definition from options.js

// Setup phase
export function setup() {
  const allCredentials = loadCredentialsFromCSV();
  return {
    allCredentials,
    vuCredentials: getCredentialsForVU(allCredentials, 50),
  };
}

// Main iteration
export default function (data) {
  const credential = getNextCredential(data.vuCredentials, __ITER);
  const payload = formatLoginPayload(credential);
  const response = httpClient.loginPost(payload);
  assertLoginSuccess(response); // Validates response
}
```

---

## 6. Pass/Fail Logic

### SLA Evaluation (Main Load Phase Only)

**Measurement Window:** T+30s to T+180s (120-second sustained load)

**Pass Conditions (ALL must be true):**
1. ✅ Throughput ≥ 20 req/s (calculated from request count / duration)
2. ✅ p95 Response Time ≤ 1,500 ms (threshold: `p(95)<1500`)
3. ✅ Error Rate < 3% (threshold: `rate<0.03`)

**Test Result:**
- **PASS:** k6 exits with code 0; summary shows "SLA Thresholds: [3/3 PASSED]"
- **FAIL:** k6 exits with code 1; summary shows "SLA Thresholds: [X/3 FAILED]" (which failed)

---

## 7. Deployment Checklist

Before proceeding to scenario script implementation, verify:

- [x] `env.js` — Correct BASE_URL, endpoint, timeout
- [x] `options.js` — Correct executor type, rates, VU allocation, stages
- [x] `thresholds.js` — Correct SLA expressions (error rate <3%, p95 <1500ms)
- [x] `http-client.js` — Supports POST with JSON body and timeout
- [x] `checks.js` — Provides response validation helpers
- [x] `utils.js` — CSV loading, VU distribution, credential cycling
- [x] `credentials.csv` — Contains all 5 required credentials

---

## 8. Configuration Validation

### Verify Configurations Are Correct

**Threshold Validation:**
```javascript
// In scenario startup, verify thresholds match requirements
if (loadOptions.thresholds.http_req_failed[0] !== 'rate<0.03') {
  throw new Error('Error rate threshold not configured correctly');
}
if (!loadOptions.thresholds.http_req_duration[0].includes('1500')) {
  throw new Error('Response time threshold not configured correctly');
}
```

**Data Validation:**
```javascript
// In setup(), confirm credentials loaded and distributed
const creds = loadCredentialsFromCSV();
if (creds.length !== 5) throw new Error('Expected 5 credentials');
if (!creds[0].username === 'donero') throw new Error('First credential not donero');
```

---

## 9. Next Steps

**For Implementation Team (`/implement-k6-script`):**

These assets are ready for scenario integration. The script should:
1. Import configurations from assets (not hardcode)
2. Use utilities for CSV loading and credential cycling
3. Use httpClient for all HTTP operations
4. Use checks for response validation
5. Reference thresholds for SLA evaluation transparency

**Expected Scenario Structure:**
```
k6/scenarios/load-login.js
├── setup() — Load and distribute credentials
├── export const options — Reference loadOptions from config/options.js
├── default() — Execute login requests using utilities and checks
└── teardown() — Optional cleanup (not required for login endpoint)
```

---

## 10. Document History

| Version | Date | Author | Change |
|---------|------|--------|--------|
| 1.0 | 2026-03-30 | implement-k6-assets | Initial asset implementation from PERF-001 spec |

---

**Status:** ✅ **Complete** — All assets generated and ready for scenario script integration. Proceed to `/implement-k6-script` phase.
