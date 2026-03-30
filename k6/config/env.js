/**
 * Environment configuration for FakeStore login load test (PERF-001).
 * Resolves properties from environment variables or applies sensible defaults.
 * Do not hardcode secrets here; always read from __ENV.
 */

export const ENV = {
  // API Configuration
  BASE_URL: __ENV.BASE_URL || 'https://fakestoreapi.com',
  LOGIN_ENDPOINT: __ENV.LOGIN_ENDPOINT || '/auth/login',
  
  // Request Timeout (in milliseconds)
  REQUEST_TIMEOUT: __ENV.REQUEST_TIMEOUT ? parseInt(__ENV.REQUEST_TIMEOUT) : 60000, // 60s per cURL spec
  
  // CSV Data Source
  CSV_PATH: __ENV.CSV_PATH || 'k6/data/credentials.csv',
  
  // Execution Context
  VUS: __ENV.VUS ? parseInt(__ENV.VUS) : 1,
  DURATION: __ENV.DURATION || '5s',
  
  // Logging & Debug
  DEBUG_MODE: __ENV.DEBUG_MODE === 'true' || false,
};
