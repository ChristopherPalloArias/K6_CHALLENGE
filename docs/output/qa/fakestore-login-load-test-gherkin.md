# Gherkin Test Cases: FakeStore Login Load Test

**Feature ID:** PERF-001  
**Status:** Ready for QA Analysis  
**Generated:** 2026-03-30

---

## Feature: FakeStore Login Service Performance Under Load

**Background:** The FakeStore API exposes a login endpoint that must be tested under load using k6, with request data parameterized from a CSV file and validated against the challenge targets for throughput, response time, and error rate.

---

## Scenario 1: Smoke Test — Endpoint Reachability and Baseline Response

**Purpose:** Validate that the login endpoint is reachable and that a baseline response can be observed before executing the main load scenario.

**Tags:** `@smoke` `@connectivity` `@critical`

```gherkin
Scenario: Verify login endpoint is reachable before load execution

  Given the target environment is "https://fakestoreapi.com"
  And the login endpoint path is "/auth/login"
  And a credential pair is available from the CSV dataset

  When a single POST request is sent to "/auth/login"
  And the Content-Type header is "application/json"
  And the request body maps:
    | field    | source       |
    | username | csv.user     |
    | password | csv.passwd   |

  Then the HTTP response must complete within 5 seconds
  And the response status code must be captured
  And the response body must be parseable as JSON if a body is returned
  And the observed response behavior must be documented before the full load run
````

---

## Scenario Outline 2: CSV Credential Mapping Validation

**Purpose:** Validate that each provided CSV record is correctly mapped into the login request body.

**Tags:** `@data-driven` `@csv` `@parameterization`

```gherkin
Scenario Outline: Verify request payload mapping from CSV credentials

  Given the login endpoint path is "/auth/login"

  When a POST request is prepared with:
    | field    | value      |
    | username | <username> |
    | password | <password> |

  Then the request payload must preserve the exact CSV values
  And the field mapping must be:
    | csv column | request field |
    | user       | username      |
    | passwd     | password      |

Examples:
  | username  | password     |
  | donero    | ewedon       |
  | kevinryan | key02937@    |
  | johnd     | m38rmF$      |
  | derek     | jklg*_56     |
  | mor_2314  | 83r5^_       |
```

---

## Scenario 3: Main Load Scenario — Sustain Minimum Throughput

**Purpose:** Validate that the login endpoint can sustain the minimum required throughput of 20 TPS.

**Tags:** `@load-test` `@performance` `@critical` `@throughput`

```gherkin
Scenario: Sustain a minimum throughput of 20 TPS using CSV-driven login requests

  Given the target environment is "https://fakestoreapi.com"
  And the endpoint under test is "POST /auth/login"
  And credentials are loaded from "k6/data/credentials.csv"
  And the CSV contains 5 username/password pairs
  And the workload model for the test has been configured in k6

  When the load test is executed
  And requests are generated from the CSV-driven payloads
  And the test runs long enough to evaluate sustained load behavior

  Then the observed throughput must reach at least 20 requests per second
  And the achieved TPS must be captured in the execution summary
  And the execution evidence must show the measured request rate
```

---

## Scenario 4: Response-Time Target Validation

**Purpose:** Validate that the implemented test evaluates the maximum allowed response-time target of 1.5 seconds.

**Tags:** `@sla` `@latency` `@critical` `@threshold`

```gherkin
Scenario: Validate the response-time target of 1.5 seconds

  Given the load test is executing against "POST /auth/login"
  And HTTP response-time metrics are being collected

  When the execution summary is produced

  Then the implementation must explicitly evaluate the 1.5-second response-time limit
  And the chosen threshold expression must be documented in the solution
  And the execution evidence must report latency values relevant to interpretation
  And any threshold breach must be visible in the test summary
```

---

## Scenario 5: Error-Rate Target Validation

**Purpose:** Validate that the implemented test evaluates the acceptable error-rate limit of less than 3%.

**Tags:** `@sla` `@reliability` `@critical` `@threshold`

```gherkin
Scenario: Validate the acceptable error-rate limit

  Given the load test is executing against "POST /auth/login"
  And failed requests are being tracked during execution

  When the execution summary is produced

  Then the implementation must evaluate whether the error rate remains below 3%
  And the result must be based on failed requests versus total requests
  And the threshold status must be visible in the execution output
```

---

## Scenario 6: CSV Reuse Strategy Under Load

**Purpose:** Validate that the test can reuse the small CSV dataset throughout the load run without failing because of data exhaustion or malformed mapping.

**Tags:** `@data-driven` `@csv` `@load-test`

```gherkin
Scenario: Reuse CSV credentials safely throughout the load run

  Given the CSV file "k6/data/credentials.csv" contains 5 credential pairs
  And the test reuses those credentials during multiple iterations

  When the load test executes at scale

  Then each request must use a credential pair sourced from the CSV data
  And the script must not fail because the dataset contains only 5 records
  And the reuse strategy must be simple, deterministic, and documented
```

---

## Scenario 7: Reproducible Delivery

**Purpose:** Validate that the repository includes the required files and enough information for a reviewer to execute the solution.

**Tags:** `@reproducibility` `@delivery` `@documentation`

```gherkin
Scenario: Repository is reproducible for an external reviewer

  Given the final solution is stored in a public GitHub repository

  When a reviewer opens the repository

  Then the repository must include:
    | artifact                  |
    | k6 script(s)              |
    | CSV input data            |
    | execution evidence        |
    | readme.txt                |
    | conclusiones.txt          |

  And the file "readme.txt" must include:
    | section                    |
    | technology versions        |
    | prerequisites              |
    | execution steps            |
    | execution command          |
    | report or evidence path    |
```

---

## Scenario 8: Public API Risk Awareness

**Purpose:** Ensure the test design acknowledges that the target system is a third-party public API and that results may vary across runs.

**Tags:** `@risk` `@external-dependency` `@third-party`

```gherkin
Scenario: Document the risks of testing a public third-party API

  Given the target API is "https://fakestoreapi.com"
  And the target system is not owned or controlled by the tester

  When the test is executed under load

  Then the implementation must capture the observed response behavior
  And the final conclusions must distinguish observed evidence from assumptions
  And the solution must acknowledge that latency and failures may vary across runs
  And undocumented server-side limits must not be presented as verified facts unless actually observed
```

---

## Test Data Preconditions

**CSV File Requirements:**

```text
Location: k6/data/credentials.csv
Format: CSV with headers
Headers:
  - user
  - passwd
Records:
  - donero / ewedon
  - kevinryan / key02937@
  - johnd / m38rmF$
  - derek / jklg*_56
  - mor_2314 / 83r5^_
```

**Environment Requirements:**

```text
Target: https://fakestoreapi.com
Connectivity: Internet access required
Execution Tool: k6
Execution Context: Local reproducible execution
```

---

## Test Coverage Summary

| Scenario | Type       | Coverage                           | Tags                                |
| -------- | ---------- | ---------------------------------- | ----------------------------------- |
| 1        | Smoke      | Reachability and baseline response | `@smoke` `@connectivity`            |
| 2        | Data       | CSV request mapping                | `@data-driven` `@csv`               |
| 3        | Load       | Throughput target                  | `@load-test` `@performance`         |
| 4        | Validation | Response-time target               | `@sla` `@latency`                   |
| 5        | Validation | Error-rate target                  | `@sla` `@reliability`               |
| 6        | Data       | CSV reuse under load               | `@data-driven` `@load-test`         |
| 7        | Delivery   | Reproducibility                    | `@reproducibility` `@documentation` |
| 8        | Risk       | Public API constraints             | `@risk` `@third-party`              |

**Total Scenarios:** 8

---

## Notes for Next Phase

1. Run `/risk-identifier fakestore-login-load-test`
2. Run `/performance-analyzer fakestore-login-load-test`
3. Run `/automation-flow-proposer fakestore-login-load-test`
4. After QA artifacts are acceptable, continue with:

   * `/implement-k6-assets fakestore-login-load-test`
   * `/implement-k6-script fakestore-login-load-test`

---

**Document Status:** Ready for QA Analysis and Implementation Planning

````