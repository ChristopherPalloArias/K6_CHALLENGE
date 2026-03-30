````markdown
---
id: PERF-001
status: DRAFT
feature: fakestore-login-load-test
created: 2026-03-30
updated: 2026-03-30
author: spec-generator
version: "1.0"
---

# Technical Specification: FakeStore Login Load Test

> **State:** `DRAFT` → change to `APPROVED` before generating implementation assets and the final k6 script.

---

## 1. REQUIREMENTS

### Description

This specification defines the performance-testing solution for the FakeStore login challenge using **k6**. The goal is to execute a reproducible load test against the login endpoint, using credentials parameterized from a `.csv` file, and validate whether the tested scenario reaches the required throughput while staying within the allowed response-time and error-rate limits.

### Business Requirement

The challenge requires:

1. Using **k6** or JMeter. This specification follows the **k6** path.
2. Testing the FakeStore login service with a request equivalent to:

```bash
curl --location --max-time 60 'https://fakestoreapi.com/auth/login' \
--header 'Content-Type: application/json' \
--data '{
    "username": "user",
    "password": "passwd"
}'
````

3. Parameterizing input data from a `.csv` file with the following records:

```csv
user,passwd
donero,ewedon
kevinryan,key02937@
johnd,m38rmF$
derek,jklg*_56
mor_2314,83r5^_
```

4. Designing a load scenario that achieves at least **20 TPS**.
5. Validating:

   * **Response time:** maximum allowed `1.5 seconds`
   * **Error rate:** less than `3%`
6. Delivering a **public GitHub repository** that includes scripts, supporting assets, reports or execution evidence, `readme.txt`, and `conclusiones.txt`.

### User Stories

#### HU-01: Execute a reproducible load test for the login service

```text
As a reviewer
I want a reproducible k6-based load test for the FakeStore login endpoint
So that I can verify how the service behaves under the required load scenario.
```

#### HU-02: Validate throughput, latency, and error rate

```text
As a reviewer
I want the test to measure throughput, response time, and error rate
So that I can determine whether the scenario satisfies the challenge thresholds.
```

#### HU-03: Deliver the exercise in a public repository

```text
As a reviewer
I want the repository to contain scripts, evidence, and execution instructions
So that I can reproduce the solution without depending on undocumented steps.
```

### Acceptance Criteria

#### AC-01 — Parameterized input data

```gherkin
Given the challenge-provided CSV data
When the k6 script executes login requests
Then the request body must map CSV values to "username" and "password"
And the dataset must be externalized in a .csv file
```

#### AC-02 — Throughput target

```gherkin
Given the defined load scenario
When the test is executed
Then the observed throughput must reach at least 20 TPS
```

#### AC-03 — Response-time target

```gherkin
Given the executed load scenario
When response-time metrics are collected
Then the implementation must evaluate the 1.5-second response-time limit
And the selected threshold expression must be clearly documented in the solution
```

#### AC-04 — Error-rate target

```gherkin
Given the executed load scenario
When failed requests are measured
Then the error rate must remain below 3%
```

#### AC-05 — Reproducible delivery

```gherkin
Given the final public repository
When a reviewer opens the project
Then the repository must contain scripts, supporting files, execution evidence, readme.txt, and conclusiones.txt
```

### Rules and Constraints

1. This specification covers **Exercise 1 only**: the login load test.
2. **Exercise 2** (analysis of `textSummary.txt` and creation of `InformeResultados.doc`) is a separate downstream deliverable and is **not** part of this feature specification.
3. The solution must remain conservative:

   * do not invent undocumented API behavior
   * do not invent success status codes as facts unless validated during execution
   * do not invent dashboards, CI/CD, GitHub Pages, or hosted reporting solutions
4. The target environment is a **public third-party API**, so results may vary across runs.
5. The implementation must be reviewer-friendly and locally reproducible.

---

## 2. PERFORMANCE TEST DESIGN

### Target System

* **System under test:** FakeStore API
* **Base URL:** `https://fakestoreapi.com`
* **Protocol:** HTTPS
* **Target endpoint:** `POST /auth/login`
* **Environment type:** public third-party service

### Request Design

* **Method:** `POST`
* **Path:** `/auth/login`
* **Headers:**

  * `Content-Type: application/json`
* **Body template:**

```json
{
  "username": "<csv user>",
  "password": "<csv passwd>"
}
```

### CSV Data Source

**Required file path:**

```text
k6/data/credentials.csv
```

**Required content:**

```csv
user,passwd
donero,ewedon
kevinryan,key02937@
johnd,m38rmF$
derek,jklg*_56
mor_2314,83r5^_
```

### Data Strategy

* Load the CSV file into memory before or during test initialization.
* Use the CSV rows as the source of request credentials.
* The implementation may cycle through the five records repeatedly during the run.
* The exact iteration pattern may be sequential or cyclic, but it must be deterministic and simple to understand.

### Success / Failure Interpretation

Because the original challenge does not define the exact response contract, the implementation must handle this conservatively:

* **Exact success status code:** to validate during implementation
* **Exact response body schema:** to validate during implementation
* **Minimal success sanity check:** a response that matches the observed successful login behavior during dry run or initial execution
* **Client-side timeout alignment:** the provided cURL includes `--max-time 60`, so the implementation should avoid exceeding a 60-second client-side wait if explicit request timeout control is added

### Confirmed Performance Targets

| Metric        | Required Target  | Notes     |
| ------------- | ---------------- | --------- |
| Throughput    | `>= 20 TPS`      | Mandatory |
| Response time | `<= 1.5 seconds` | Mandatory |
| Error rate    | `< 3%`           | Mandatory |

### Supporting Metrics to Capture

The execution should observe, at minimum:

* `http_reqs`
* `http_req_duration`
* `http_req_failed`
* `iterations`
* `vus`
* `data_sent`
* `data_received`

These supporting metrics help explain whether the target was met and provide context for conclusions.

---

### Workload Model

#### Execution Intent

The scenario must prove that the login endpoint can sustain **at least 20 TPS**. Since the challenge does not explicitly define duration, ramp-up, or VU counts, this specification defines a **conservative implementation proposal** suitable for a public API.

#### Recommended Executor

**Preferred executor:** `constant-arrival-rate`

**Rationale:**
This executor aligns directly with the challenge requirement because it targets a fixed request-start rate and is the clearest way to prove a minimum TPS objective.

#### Recommended Initial Traffic Profile

| Phase         | Duration | Target Rate | Purpose                                       |
| ------------- | -------: | ----------: | --------------------------------------------- |
| Warm-up       |      30s |     5 req/s | Confirm connectivity and stabilize the script |
| Main load     |     120s |    20 req/s | Prove the minimum throughput target           |
| Optional hold |      30s |    20 req/s | Add a short confidence window if needed       |

#### Recommended Initial Executor Settings

These are **implementation proposals**, not challenge facts:

* `rate: 20`
* `timeUnit: '1s'`
* `duration: '2m'` or `'2m30s'` if warm-up is included as a separate scenario
* `preAllocatedVUs`: to tune during dry run
* `maxVUs`: to tune during dry run

#### Tuning Rule

The implementation must tune `preAllocatedVUs` and `maxVUs` only as much as needed to sustain the target rate. The script should not introduce unnecessary aggressiveness against the public service.

### Threshold Design Guidance

To operationalize the challenge in k6, the implementation must define thresholds explicitly. The challenge states a maximum response time of 1.5 seconds, but it does not specify whether that limit applies to average, percentile, or max.

Therefore, the script must:

1. **Document the chosen threshold expression clearly**
2. **Report the main latency metrics transparently**
3. **Avoid hiding outliers**

A conservative implementation may use a percentile-based operational threshold while still reporting average, p90, p95, and max in the execution evidence.

### Non-Functional Notes

* No think time is required unless needed for technical stability.
* No cleanup action is required because the login endpoint does not create persistent test entities as part of the described challenge.
* SSL verification should remain standard unless the environment proves otherwise.

---

## 3. RISKS AND CONSTRAINTS

### Known Risks

| Risk                                     | Impact                                       | Treatment                                                |
| ---------------------------------------- | -------------------------------------------- | -------------------------------------------------------- |
| Public third-party instability           | Can distort latency and error metrics        | Document observed behavior, avoid overclaiming           |
| Undocumented rate limiting or throttling | May increase failures at target load         | Capture results and report as observed evidence          |
| Unknown success contract                 | Can affect pass/fail logic                   | Validate first-run behavior before final assertions      |
| Short credential dataset                 | Repeated reuse may influence server behavior | Keep dataset handling simple and document reuse strategy |
| Network variability outside test control | Can affect response times                    | Report results as environment-dependent evidence         |

### Constraints

* The service is external and not controlled by the tester.
* The challenge requires a public repository.
* The solution must include `readme.txt` and `conclusiones.txt`.
* The implementation must be reproducible without hidden setup.
* The implementation must not fabricate performance success if the measured run does not meet the targets.

---

## 4. IMPLEMENTATION TASK LIST

### Phase 1 — QA and Performance Definition

* [ ] Generate gherkin coverage for the login load scenario
* [ ] Generate risk analysis focused on public API load behavior
* [ ] Generate performance analysis for throughput, latency, and failure metrics
* [ ] Generate automation flow proposal for the k6 implementation path

### Phase 2 — k6 Assets

* [ ] Create `k6/data/credentials.csv`
* [ ] Create `k6/config/env.js`
* [ ] Create `k6/config/options.js`
* [ ] Create `k6/config/thresholds.js`
* [ ] Create `k6/lib/http-client.js`
* [ ] Create `k6/lib/checks.js`
* [ ] Create `k6/lib/utils.js` if needed

### Phase 3 — Main k6 Script

* [ ] Create `k6/scenarios/load-login.js`
* [ ] Implement CSV-driven request construction
* [ ] Implement workload executor and options
* [ ] Implement response validation logic based on observed behavior
* [ ] Implement thresholds for throughput, latency, and error rate
* [ ] Validate that the scenario can reach at least 20 TPS

### Phase 4 — Execution and Evidence

* [ ] Run the script against `https://fakestoreapi.com/auth/login`
* [ ] Capture text summary output
* [ ] Preserve any additional report artifacts produced by the chosen setup
* [ ] Record observed success/failure behavior
* [ ] Prepare `conclusiones.txt` from actual execution evidence

### Phase 5 — Delivery

* [ ] Create `readme.txt` with step-by-step execution instructions
* [ ] Include exact technology versions actually used
* [ ] Ensure all required scripts and assets are committed
* [ ] Ensure the repository is public
* [ ] Verify that a reviewer can reproduce the run

---

## 5. EXPECTED PROJECT STRUCTURE

```text
k6/
├── config/
│   ├── env.js
│   ├── options.js
│   └── thresholds.js
├── data/
│   └── credentials.csv
├── lib/
│   ├── http-client.js
│   ├── checks.js
│   └── utils.js
└── scenarios/
    └── load-login.js

Repository Root/
├── readme.txt
├── conclusiones.txt
├── k6/
└── reports/                  # optional, only if actually generated
```

---

## 6. DEFINITION OF DONE

The implementation can be considered complete when all of the following are true:

1. The login endpoint is tested with k6.
2. The CSV file is used as the request data source.
3. The script is configured to reach at least 20 TPS.
4. The implementation evaluates the 1.5-second response-time requirement explicitly.
5. The implementation evaluates the error-rate requirement explicitly.
6. Execution evidence is available.
7. `readme.txt` is present and includes technology versions.
8. `conclusiones.txt` is present and reflects actual findings.
9. The repository is public and reproducible.

---

## 7. OUT OF SCOPE

* Other FakeStore endpoints
* Frontend performance testing
* Security testing
* CI/CD integration
* Hosted dashboards
* Exercise 2 result analysis (`textSummary.txt`) and `InformeResultados.doc` for that separate exercise

---

## 8. OPEN QUESTIONS

* What exact duration should be considered the final official run?
* Should the final script include warm-up as a separate scenario or within the same execution profile?
* What exact response signature should count as a successful login after the first dry run?
* What final `preAllocatedVUs` and `maxVUs` values are needed to sustain the required rate in the tested environment?

---

## 9. NEXT STEPS

Once this specification is reviewed, the flow should continue as follows:

1. Change `status: DRAFT` to `status: APPROVED`
2. Run:

   * `/gherkin-case-generator fakestore-login-load-test`
   * `/risk-identifier fakestore-login-load-test`
   * `/performance-analyzer fakestore-login-load-test`
   * `/automation-flow-proposer fakestore-login-load-test`
3. Run:

   * `/implement-k6-assets fakestore-login-load-test`
   * `/implement-k6-script fakestore-login-load-test`
4. Execute the k6 test
5. Produce `readme.txt`, `conclusiones.txt`, and repository evidence

```
```
