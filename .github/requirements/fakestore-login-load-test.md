````markdown
# FakeStore Login Load Test Requirement

## 1. Metadata

- **Feature name:** fakestore-login-load-test
- **Document type:** Requirement
- **Status:** Ready for Specification
- **Source:** User-provided challenge instructions
- **Preferred tool:** k6
- **Version:** 1.0
- **Date:** 2026-03-30

---

## 2. Objective

Design and execute a load test for the FakeStore login service using **k6**, with request data parameterized from a `.csv` file, and validate whether the tested scenario can achieve the required throughput and performance thresholds.

The final solution must be reproducible and delivered in a **public GitHub repository**, including scripts, supporting assets, execution instructions, findings, and execution evidence.

---

## 3. Challenge Context

The challenge requires performing a load test against the FakeStore login endpoint using the following request pattern as the source input:

```bash
curl --location --max-time 60 'https://fakestoreapi.com/auth/login' \
--header 'Content-Type: application/json' \
--data '{
    "username": "user",
    "password": "passwd"
}'
````

The login request data must be parameterized from a `.csv` file using the following credentials:

```csv
user,passwd
donero,ewedon
kevinryan,key02937@
johnd,m38rmF$
derek,jklg*_56
mor_2314,83r5^_
```

The load scenario must satisfy these required validation targets:

* **Minimum throughput:** at least `20 TPS`
* **Maximum allowed response time:** `1.5 seconds`
* **Acceptable error rate:** less than `3%` of total requests

The repository deliverable must also include:

* `readme.txt` with step-by-step execution instructions and explicit technology versions
* `conclusiones.txt` with findings and conclusions from the exercise

---

## 4. Scope

### In Scope

* Performance testing of the FakeStore login endpoint
* Parameterized test data loaded from a `.csv` file
* k6 script implementation
* Performance validation against throughput, latency, and error-rate targets
* Generation or capture of execution evidence
* Inclusion of reproducibility documentation in the repository
* Inclusion of findings and conclusions in a dedicated text file

### Out of Scope

* Testing of endpoints other than the login endpoint
* UI or frontend performance testing
* Security testing
* CI/CD pipeline implementation
* Cloud dashboard setup
* GitHub Actions, GitHub Pages, or hosted reporting solutions
* Functional expansion beyond the required login load scenario

---

## 5. Assumptions

* The target environment is reachable during test execution.
* The FakeStore login endpoint accepts JSON payloads containing `username` and `password`.
* The provided `.csv` credentials are intended to be used as the input dataset for the load test.
* The test can be executed locally using k6.
* Since the challenge does not define a fixed duration, duration and executor strategy must be finalized conservatively during specification and implementation.

---

## 6. Constraints

* The solution must be implemented using **k6** or JMeter; this requirement is prepared for the **k6** path.
* The final solution must be uploaded to a **public GitHub repository**.
* The repository must include scripts, reports or execution evidence, `readme.txt`, and `conclusiones.txt`.
* The implementation must remain conservative and avoid undocumented assumptions about server behavior.
* The requirement must not invent response contracts, status codes, or undocumented validation rules.

---

## 7. Target System and Endpoint

* **System under test:** FakeStore API
* **Base URL:** `https://fakestoreapi.com`
* **Target endpoint:** `/auth/login`
* **HTTP method:** `POST`
* **Protocol:** HTTPS
* **Authentication for test execution:** [Not provided]
* **Environment type:** Public third-party environment

### Request Characteristics

* **Headers:**

  * `Content-Type: application/json`
* **Payload structure:**

```json
{
  "username": "<csv user>",
  "password": "<csv passwd>"
}
```

### Endpoint Intent

The request submits a username and password pair to the FakeStore login service. Exact response contract, exact success status code, and exact failure behaviors are **to validate during implementation** unless directly supported by execution evidence.

---

## 8. Input Data Strategy

### Required External Test Data Source

The test must use a `.csv` file as the source for login credentials.

### Required CSV Structure

```csv
user,passwd
donero,ewedon
kevinryan,key02937@
johnd,m38rmF$
derek,jklg*_56
mor_2314,83r5^_
```

### Data Handling Rules

* The script must read the credential data from CSV.
* The request payload must map:

  * `user` -> `username`
  * `passwd` -> `password`
* The implementation may iterate or cycle through the provided records.
* Whether the dataset is consumed sequentially, cyclically, or by another controlled strategy is **to be finalized during implementation**.

---

## 9. Workload Model Expectations

### Confirmed Expectations

* The scenario must achieve **at least 20 TPS**
* The scenario must validate:

  * response time <= `1.5s`
  * error rate < `3%`

### Workload Model Details Not Explicitly Provided

The following elements are not explicitly defined in the challenge and must therefore remain open for specification:

* exact test duration
* warm-up strategy
* ramp-up strategy
* executor selection
* number of virtual users
* iteration pacing
* think time strategy

### Conservative Direction for Next Phase

The specification phase should define a workload model that is sufficient to prove the target throughput and thresholds without introducing unnecessary aggression against a public third-party service.

---

## 10. Performance Validation Targets

### Confirmed Performance Targets

| Target                | Required Value   |
| --------------------- | ---------------- |
| Minimum Throughput    | `>= 20 TPS`      |
| Maximum Response Time | `<= 1.5 seconds` |
| Acceptable Error Rate | `< 3%`           |

### Interpretation Notes

* Throughput must be evaluated from actual executed requests during the run.
* Response-time validation must be clearly defined in the implementation using k6 metrics and thresholds.
* Error-rate validation must be clearly defined in the implementation using request failure or equivalent error metrics.

---

## 11. Metrics to Observe

The implementation must capture and evaluate, at minimum:

* requests per second / transactions per second
* request duration / response time
* request failure rate / error rate

### Candidate Supporting Metrics

These may be included if useful during implementation or reporting:

* iteration duration
* virtual users
* data sent / received
* per-stage failures, if the chosen execution model produces staged results

These are optional unless explicitly required by the final script or by execution evidence.

---

## 12. Flow Requirement

### PERF-01 - Login Load Test

The implementation must execute a performance test against the FakeStore login endpoint using the credential dataset from CSV.

**Required validation intent:**

* repeatedly submit login requests using CSV-driven credentials
* sustain a scenario capable of reaching the required TPS target
* evaluate whether the run remains within the allowed response time and error-rate limits

### Endpoint Details

* **Method:** `POST`
* **Path:** `/auth/login`
* **Headers:** `Content-Type: application/json`
* **Body source:** CSV-driven mapping
* **Body fields:**

  * `username`
  * `password`

### Success / Error Interpretation

* **Exact success status code:** [Not provided]
* **Exact response body contract:** [Not provided]
* **Exact token schema or auth response fields:** [Not provided]
* **Failure handling behavior:** to validate during implementation

The script must avoid assuming undocumented API behavior unless confirmed through actual execution evidence.

---

## 13. Deliverables

The final public GitHub repository must include, at minimum:

* k6 performance test script(s)
* supporting configuration or data files required for execution
* CSV input file used by the test
* generated reports or reproducible execution evidence
* `readme.txt` with step-by-step execution instructions and technology versions
* `conclusiones.txt` with findings and conclusions
* any additional assets required to reproduce the test locally

---

## 14. Evidence Requirements

The implementation must provide evidence that supports reproducibility and review.

### Expected Evidence

* test script(s)
* input CSV file
* execution command(s)
* performance summary output or equivalent report artifacts
* threshold evaluation results
* findings documented in `conclusiones.txt`

### Reporting Expectation

The reviewer must be able to determine:

* what endpoint was tested
* what data source was used
* what workload model was applied
* whether the target TPS was achieved
* whether the latency target was met
* whether the error-rate target was met

---

## 15. Risks and Notes

* The target API is a public third-party environment and may behave unpredictably under load.
* The service may have undocumented limits, throttling behavior, or instability outside the tester's control.
* The challenge does not define an exact test duration or ramp strategy.
* The challenge does not define exact success status codes or exact response schemas.
* Because this is a public environment, results may vary between runs.
* The implementation should avoid overreaching assumptions and document only what is actually observed.

---

## 16. Open Questions

* What exact duration should be used for the load test?
* Should the test start directly at the target TPS or ramp up progressively?
* What exact k6 executor should be selected to satisfy the target throughput most appropriately?
* What exact success-response condition should count as a non-error request if the API behavior differs from assumptions?
* Should the CSV records be consumed sequentially, cyclically, or pseudo-randomly?

---

## 17. Acceptance Criteria

* [ ] The login endpoint is covered by the load test implementation.
* [ ] Input credentials are parameterized from a `.csv` file.
* [ ] The scenario is designed to achieve at least `20 TPS`.
* [ ] The implementation validates a response time target of `<= 1.5 seconds`.
* [ ] The implementation validates an error-rate target of `< 3%`.
* [ ] The repository is public.
* [ ] `readme.txt` is included with execution steps and technology versions.
* [ ] `conclusiones.txt` is included with findings and conclusions.
* [ ] Reports or reproducible execution evidence are included.
* [ ] The solution is reproducible by a reviewer.

---

## 18. Notes for Next Phase

This requirement is intended to support the next steps in the K6 workflow:

1. Generate specification from this requirement.
2. Approve the specification.
3. Generate QA and performance analysis artifacts.
4. Generate k6 assets and k6 script.
5. Execute the test and capture evidence.
6. Produce `readme.txt`, `conclusiones.txt`, and final repository delivery artifacts.

```
```
