import { thresholds } from './thresholds.js';

/**
 * Executor configurations for FakeStore login load test (PERF-001).
 * 
 * Uses constant-arrival-rate executor to directly prove the minimum 20 TPS requirement.
 * Three phases: warm-up (stabilization), main load (SLA measurement), cool-down (graceful shutdown).
 */

/**
 * SMOKE TEST: Quick connectivity verification
 * - Duration: 10s
 * - Rate: 5 req/s (baseline)
 * - Purpose: Confirm endpoint accessibility before main test
 */
export const smokeOptions = {
  executor: 'constant-arrival-rate',
  rate: 5, // 5 requests per second
  timeUnit: '1s',
  duration: '10s',
  preAllocatedVUs: 2,
  maxVUs: 10,
  thresholds: thresholds.smoke,
};

/**
 * LOAD TEST: Primary SLA validation
 * - Three stages: warm-up (30s @ 5 req/s), main load (120s @ 20 req/s), cool-down (30s ramp to 0)
 * - Purpose: Prove system sustains 20 TPS while meeting latency and error-rate SLAs
 * - Measurement window: main load phase only (warm-up and cool-down excluded)
 */
export const loadOptions = {
  executor: 'constant-arrival-rate',
  rate: 20, // Target: 20 requests per second
  timeUnit: '1s',
  duration: '2m30s', // 30s warm-up + 120s main load + 30s cool-down
  preAllocatedVUs: 10,
  maxVUs: 50,
  
  // Stages allow gradual load changes
  stages: [
    {
      duration: '30s',
      target: 5, // Warm-up: 5 req/s for connectivity verification
    },
    {
      duration: '120s',
      target: 20, // Main load: 20 req/s (SLA measurement window)
    },
    {
      duration: '30s',
      target: 0, // Cool-down: linear ramp to 0
    },
  ],
  
  thresholds: thresholds.load,
};

/**
 * Options helper to select configuration by test type.
 */
export const getOptions = (type = 'smoke') => {
  switch (type) {
    case 'load':
      return loadOptions;
    case 'smoke':
    default:
      return smokeOptions;
  }
};
