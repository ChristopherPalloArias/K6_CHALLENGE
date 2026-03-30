import { check } from 'k6';

/**
 * Standard reusable validation checks for FakeStore login responses (PERF-001).
 * Provides conservative checks that validate observed behavior without assuming undocumented API contracts.
 */

/**
 * Assert that response status code matches expected value
 * Note: FakeStore success code is empirically determined; this wrapper is agnostic
 * @param {Response} res - k6 response object
 * @param {number} expectedStatus - Expected HTTP status code
 * @returns {boolean} true if check passes
 */
export const assertStatus = (res, expectedStatus = 200) => {
  return check(res, {
    [`is status ${expectedStatus}`]: (r) => r.status === expectedStatus,
  });
};

/**
 * Assert that response completes within maximum time
 * @param {Response} res - k6 response object
 * @param {number} maxMs - Maximum acceptable duration in milliseconds
 * @returns {boolean} true if response time is within limit
 */
export const assertResponseTime = (res, maxMs = 500) => {
  return check(res, {
    [`responds within ${maxMs}ms`]: (r) => r.timings.duration < maxMs,
  });
};

/**
 * Assert that response is valid JSON and passes optional validation
 * @param {Response} res - k6 response object
 * @param {Function} validationFn - Optional function to validate parsed JSON (e.g., check for token field)
 * @param {string} checkName - Name of the check for reporting
 * @returns {boolean} true if JSON is valid and validation passes
 */
export const assertJsonBody = (res, validationFn = null, checkName = 'body is valid json') => {
  let isJson = false;
  let isValid = false;
  
  try {
    const json = res.json();
    isJson = true;
    isValid = validationFn ? validationFn(json) : true;
  } catch (e) {
    // Invalid JSON
  }

  return check(res, {
    [checkName]: () => isValid,
  });
};

/**
 * Login-specific check: Validate successful login response
 * Conservatively checks that:
 * 1. Response is JSON-parseable
 * 2. Response status indicates success (customizable)
 * @param {Response} res - k6 response object
 * @param {number} successStatus - HTTP status code indicating successful login (default: 200)
 * @returns {boolean} true if response appears to be a valid login response
 */
export const assertLoginSuccess = (res, successStatus = 200) => {
  let isValidJson = false;
  try {
    res.json();
    isValidJson = true;
  } catch (e) {
    isValidJson = false;
  }

  return check(res, {
    [`login status is ${successStatus}`]: (r) => r.status === successStatus,
    'login response is json': () => isValidJson,
  });
};

/**
 * Check response contains expected field (e.g., token)
 * @param {Response} res - k6 response object
 * @param {string} fieldName - Expected field in JSON response
 * @returns {boolean} true if field exists in parsed JSON
 */
export const assertFieldExists = (res, fieldName) => {
  try {
    const json = res.json();
    return check(res, {
      [`response contains '${fieldName}' field`]: () => fieldName in json,
    });
  } catch (e) {
    return check(res, {
      [`response contains '${fieldName}' field`]: () => false,
    });
  }
};
