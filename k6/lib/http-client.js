import http from 'k6/http';
import { ENV } from '../config/env.js';

/**
 * HTTP client wrapper for FakeStore login load test (PERF-001).
 * Encapsulates common headers, baseURL management, and timeout configuration.
 */

const buildHeaders = (customHeaders = {}) => {
  // Standard JSON headers; FakeStore login does not require authentication
  const defaultHeaders = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };

  return Object.assign({}, defaultHeaders, customHeaders);
};

const buildParams = (customParams = {}) => {
  const defaultParams = {
    timeout: `${ENV.REQUEST_TIMEOUT}ms`, // 60 second timeout per cURL spec
  };

  return Object.assign({}, defaultParams, customParams);
};

/**
 * HTTP Client Interface
 * Note: Business logic (endpoint paths) remains in scenarios; this wrapper handles transport.
 */
export const httpClient = {
  /**
   * Generic GET request
   * @param {string} path - Endpoint path (relative to BASE_URL)
   * @param {object} headers - Custom headers to merge with defaults
   * @param {object} params - k6 http.get options (timeout, redirects, etc.)
   */
  get: (path, headers = {}, params = {}) => {
    return http.get(`${ENV.BASE_URL}${path}`, {
      headers: buildHeaders(headers),
      ...buildParams(params),
    });
  },

  /**
   * Generic POST request
   * @param {string} path - Endpoint path (relative to BASE_URL)
   * @param {object} body - Request payload object (will be JSON stringified)
   * @param {object} headers - Custom headers to merge with defaults
   * @param {object} params - k6 http.post options
   */
  post: (path, body, headers = {}, params = {}) => {
    return http.post(`${ENV.BASE_URL}${path}`, JSON.stringify(body), {
      headers: buildHeaders(headers),
      ...buildParams(params),
    });
  },

  /**
   * Generic PUT request
   * @param {string} path - Endpoint path
   * @param {object} body - Request payload
   * @param {object} headers - Custom headers
   * @param {object} params - k6 options
   */
  put: (path, body, headers = {}, params = {}) => {
    return http.put(`${ENV.BASE_URL}${path}`, JSON.stringify(body), {
      headers: buildHeaders(headers),
      ...buildParams(params),
    });
  },

  /**
   * Generic DELETE request
   * @param {string} path - Endpoint path
   * @param {object} body - Optional request payload
   * @param {object} headers - Custom headers
   * @param {object} params - k6 options
   */
  del: (path, body = null, headers = {}, params = {}) => {
    const args = {
      headers: buildHeaders(headers),
      ...buildParams(params),
    };
    return http.del(`${ENV.BASE_URL}${path}`, null, args);
  },

  /**
   * Login-specific POST for FakeStore /auth/login endpoint
   * Convenience wrapper to reduce boilerplate in scenarios
   * @param {object} credentials - { username, password }
   * @param {object} customHeaders - Additional headers if needed
   */
  loginPost: (credentials, customHeaders = {}) => {
    return httpClient.post(ENV.LOGIN_ENDPOINT, credentials, customHeaders);
  },
};
