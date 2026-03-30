# Performance Analysis Plan: FakeStore Login Load Test

**Feature ID:** PERF-001
**Test Name:** FakeStore Login Load Test
**Generated:** 2026-03-30
**Specification Status:** APPROVED
**Plan Version:** 1.0

---

## Executive Summary

This performance analysis plan converts the approved specification into an execution strategy for the FakeStore login service using k6.

**Test Classification:** Load test with pre-check validation
**Load Profile Duration:** 240 seconds total
**Target Throughput:** At least 20 TPS
**Operational Latency Threshold:** p95 of `http_req_duration` less than or equal to 1.5 seconds
**Error-Rate Threshold:** less than 3%
**Environment Type:** Public third-party API (`https://fakestoreapi.com`)

> **Important interpretation note:** The original challenge states that the allowed response time is a maximum of 1.5 seconds. For the automated load script, the operational threshold will be enforced using **p95 ≤ 1.5s**, while p50, p90, p99, and max will also be captured and reported for analysis.

---

## 1. Test Type Analysis

### Primary Test Type: Load Test

**Definition:**
A controlled load test that validates whether the login endpoint can sustain the required throughput while remaining inside the allowed latency and error-rate bounds.

**Applicability:**

* Validate the `POST /auth/login` endpoint under sustained demand.
* Prove the scenario can achieve at least 20 TPS.
* Measure whether the service remains within the defined thresholds.

**Rationale:**
The exercise asks for a reproducible load test that reaches at least 20 TPS and validates response time and error rate.

---

### Supporting Pre-Check: Smoke Validation

**Definition:**
A lightweight connectivity and contract confirmation step performed before the full load execution.

**Purpose:**

* Confirm the endpoint is reachable.
* Confirm the request format is accepted.
* Observe the initial response shape and status code.
* Reduce the risk of invalidating the full run because of script or endpoint issues.

**Rationale:**
The endpoint is public and third-party. A short pre-check is useful because the exact success contract must be validated empirically before the main run.

---

### Test Types Not Included

* **Stress Test:** Out of scope. The challenge requests a target load, not a breaking-point analysis.
* **Spike Test:** Out of scope. The challenge does not require sudden burst behavior.
* **Soak / Endurance Test:** Out of scope. The required scenario is short and SLA-focused.

---

## 2. Metric Families and Collection Strategy

### A. Latency Metrics

**Primary Metric:** `http_req_duration`

This metric represents the end-to-end HTTP response time as observed by the k6 client.

| Metric | Usage           | Target / Action |
| ------ | --------------- | --------------- |
| p50    | Diagnostic      | Report          |
| p90    | Diagnostic      | Report          |
| p95    | Operational SLA | `<= 1.5s`       |
| p99    | Diagnostic      | Report          |
| max    | Diagnostic      | Report          |

**Interpretation:**

* If **p95 ≤ 1.5s**, the latency threshold is considered met.
* If **p95 > 1.5s**, the latency threshold is considered breached.
* The **max** value will be reported but will not be used as the primary automated SLA gate.

---

### B. Error Metrics

**Primary Metric:** `http_req_failed`

This metric captures failed HTTP requests.

| Metric                        | Usage      | Target / Action |
| ----------------------------- | ---------- | --------------- |
| Overall failure rate          | SLA        | `< 3%`          |
| 4xx responses                 | Diagnostic | Report          |
| 5xx responses                 | Diagnostic | Report          |
| Timeouts / transport failures | Diagnostic | Report          |

**Interpretation:**

* If **error rate < 3%**, the reliability threshold is met.
* If **error rate ≥ 3%**, the reliability threshold is breached.

---

### C. Throughput Metrics

**Primary Metric:** `http_reqs`

This metric will be used to confirm achieved request rate.

| Metric              | Usage      | Target / Action |
| ------------------- | ---------- | --------------- |
| Achieved TPS / RPS  | SLA        | `>= 20 TPS`     |
| Total request count | Diagnostic | Report          |
| Iteration rate      | Diagnostic | Report          |

**Interpretation:**

* The load design will target at least **20 requests per second**.
* Final validation must confirm the observed request rate in the summary is at or above the target.

> Throughput will be validated from the observed execution summary rather than by an overly rigid request-count threshold, because staged profiles can make fixed-count assertions unnecessarily brittle.

---

### D. Supporting Diagnostic Metrics

| Metric                     | Purpose                                       |
| -------------------------- | --------------------------------------------- |
| `data_sent`                | Confirm request volume and bandwidth context  |
| `data_received`            | Confirm response volume and bandwidth context |
| `vus`                      | Monitor active virtual users                  |
| `vus_max`                  | Confirm configured upper bound                |
| `iteration_duration`       | Diagnostic for iteration pacing               |
| `http_req_connecting`      | Network connection overhead                   |
| `http_req_tls_handshaking` | TLS overhead                                  |
| `http_req_waiting`         | Server-side wait / backend processing time    |
| `http_req_receiving`       | Response receive overhead                     |
| `http_req_sending`         | Request send overhead                         |

---

## 3. Confirmed Threshold Mapping

### Confirmed Targets from the Challenge

| Requirement             | Metric              | Validation Strategy                                                     |
| ----------------------- | ------------------- | ----------------------------------------------------------------------- |
| At least 20 TPS         | `http_reqs`         | Validate observed request rate in summary                               |
| Response time max 1.5s  | `http_req_duration` | Operational script threshold: `p(95) <= 1500 ms`; report max separately |
| Error rate less than 3% | `http_req_failed`   | Threshold: `rate < 0.03`                                                |

---

### Candidate Supporting Controls

These are not the primary acceptance gates, but they improve diagnosis:

| Metric                  | Control     | Purpose                      |
| ----------------------- | ----------- | ---------------------------- |
| `http_req_duration` p50 | Report only | Baseline latency             |
| `http_req_duration` p90 | Report only | High-percentile behavior     |
| `http_req_duration` p99 | Report only | Outlier detection            |
| `http_req_duration` max | Report only | Worst observed response      |
| 4xx count               | Report only | Client/auth patterns         |
| 5xx count               | Report only | Service instability patterns |
| `http_req_waiting`      | Report only | Backend wait behavior        |

---

## 4. Workload Model

### Recommended Execution Model

**Executor Type:** `ramping-arrival-rate`

**Reason:**
This executor is the most appropriate for a throughput-based objective because the challenge is expressed in TPS, not in virtual-user count.

---

### Recommended Traffic Profile

| Phase          | Duration | Rate         | Purpose                       |
| -------------- | -------- | ------------ | ----------------------------- |
| Warm-up        | 30s      | 5 req/s      | Stabilize connection behavior |
| Ramp-up        | 60s      | 5 → 20 req/s | Reach target progressively    |
| Sustained Load | 120s     | 20 req/s     | Main validation window        |
| Cool-down      | 30s      | 20 → 0 req/s | Graceful wind-down            |

**Total Load Profile Duration:** **240 seconds**

---

### VU Strategy

| Parameter         | Value   | Notes                                       |
| ----------------- | ------- | ------------------------------------------- |
| Pre-allocated VUs | 10      | Enough to begin warm-up                     |
| Max VUs           | 50      | Conservative ceiling for 20 TPS             |
| VU Allocation     | Dynamic | k6 scales as needed to sustain arrival rate |

**Rationale:**
The VU ceiling is intentionally conservative so the test is not artificially limited by client-side concurrency.

---

## 5. Test Data Strategy

### Source

**File:** `k6/data/credentials.csv`

```csv
user,passwd
donero,ewedon
kevinryan,key02937@
johnd,m38rmF$
derek,jklg*_56
mor_2314,83r5^_
```

### Data Usage Rules

* Credentials must be loaded from CSV.
* The mapping must be:

  * `user` → `username`
  * `passwd` → `password`
* Records may be reused cyclically during the test.
* The strategy must be deterministic and documented in the implementation.

### Request Body Format

```json
{
  "username": "<user>",
  "password": "<passwd>"
}
```

---

## 6. Environment and Bounds Validation

### Execution Context

| Element             | Assessment                 |
| ------------------- | -------------------------- |
| Target API          | Public third-party service |
| Network             | Public internet; variable  |
| Payload size        | Small                      |
| Data set            | Small and static           |
| Auth flow           | Simple login POST          |
| Expected complexity | Low request complexity     |

### Adequacy Statement

The environment is **acceptable for a moderate load validation at 20 TPS**, but conclusions must remain conservative because:

* the service is public and externally controlled,
* undocumented throttling may exist,
* results may vary between runs.

No absolute infrastructure-capacity claim should be made from a single execution.

---

## 7. SLA Evaluation Matrix

| SLA        | Metric              | Success Condition         | Failure Condition        | Enforcement              |
| ---------- | ------------------- | ------------------------- | ------------------------ | ------------------------ |
| Throughput | `http_reqs`         | Observed rate `>= 20 TPS` | Observed rate `< 20 TPS` | Summary-based evaluation |
| Latency    | `http_req_duration` | `p(95) <= 1500 ms`        | `p(95) > 1500 ms`        | k6 threshold             |
| Error Rate | `http_req_failed`   | `< 3%`                    | `>= 3%`                  | k6 threshold             |

---

## 8. Threshold Configuration Guidance

### Recommended k6 Thresholds

```javascript
export const thresholds = {
  http_req_duration: ['p(95)<=1500'],
  http_req_failed: ['rate<0.03']
};
```

### Notes

* Throughput will be validated from the observed summary output.
* The script should still report p50, p90, p95, p99, and max.
* The final evidence must explicitly state whether the observed request rate met or did not meet the 20 TPS target.

---

## 9. Execution Timeline

### Planned Timeline

```text
T+0s to T+30s     → Warm-up at 5 req/s
T+30s to T+90s    → Ramp-up from 5 to 20 req/s
T+90s to T+210s   → Sustained load at 20 req/s
T+210s to T+240s  → Cool-down from 20 to 0 req/s
```

### Interpretation Window

The most important analytical window is the **sustained-load phase** at **20 req/s**.
However, because the scenario is staged, the global summary will still reflect the full scenario. The final conclusions should therefore:

1. evaluate threshold pass/fail from the full run summary, and
2. interpret the sustained phase as the primary business-relevant segment.

---

## 10. Pass / Fail Criteria

### The Test Passes When

* The observed request rate reaches or exceeds **20 TPS**.
* `http_req_duration` p95 is **less than or equal to 1.5 seconds**.
* `http_req_failed` stays **below 3%**.
* The script completes successfully and produces reproducible evidence.

### The Test Fails When

* Observed throughput is **below 20 TPS**.
* p95 latency is **above 1.5 seconds**.
* Error rate is **3% or higher**.
* The script cannot complete due to connectivity, configuration, or execution failure.

---

## 11. Interpretation Guidance

### Latency

| Outcome           | Interpretation    |
| ----------------- | ----------------- |
| p95 < 1.0s        | Strong result     |
| 1.0s ≤ p95 ≤ 1.5s | Acceptable result |
| p95 > 1.5s        | SLA breach        |

### Error Rate

| Outcome    | Interpretation         |
| ---------- | ---------------------- |
| < 1%       | Strong reliability     |
| 1% to < 3% | Acceptable reliability |
| ≥ 3%       | SLA breach             |

### Throughput

| Outcome  | Interpretation      |
| -------- | ------------------- |
| ≥ 20 TPS | Target achieved     |
| < 20 TPS | Target not achieved |

---

## 12. Risks That Affect Metric Validity

| Risk                              | Impact                         | Treatment in Analysis                |
| --------------------------------- | ------------------------------ | ------------------------------------ |
| Undocumented API success behavior | Can distort validation logic   | Confirm during smoke validation      |
| Public API instability            | Can distort latency and errors | Report as observed external behavior |
| Shared public endpoint noise      | Can inflate variance           | Avoid absolute claims from one run   |
| Small credential pool             | Can create reuse-related bias  | Document reuse explicitly            |
| Network variability               | Can inflate response time      | Report client-side observation only  |

---

## 13. Recommended Outputs and Evidence

The execution should produce at least:

* k6 console summary
* threshold pass/fail result
* observed TPS / request rate
* observed p95 latency
* observed error rate
* `readme.txt`
* `conclusiones.txt`

If available, additional artifacts may also be stored in `reports/`.

---

## 14. Implementation Handoff

This plan gives the implementation step the following fixed decisions:

* Use **k6**
* Use **CSV-driven credentials**
* Use **`ramping-arrival-rate`**
* Use the **30s / 60s / 120s / 30s** staged profile
* Enforce:

  * `http_req_duration` p95 `<= 1500 ms`
  * `http_req_failed` `< 3%`
* Validate throughput from observed summary output

---

## 15. Document History

| Version | Date       | Author               | Change                                     |
| ------- | ---------- | -------------------- | ------------------------------------------ |
| 1.0     | 2026-03-30 | performance-analyzer | Initial approved performance analysis plan |

---

**Document Status:** Complete and ready for implementation asset generation.
