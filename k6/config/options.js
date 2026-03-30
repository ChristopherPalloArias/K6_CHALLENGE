import { thresholds } from './thresholds.js';

/**
 * Executor configurations for FakeStore login load test (PERF-001).
 *
 * Uses constant-arrival-rate executor to directly prove the minimum 20 TPS requirement.
 * Note: constant-arrival-rate does NOT support stages; rate is fixed for the full duration.
 * Three-phase behavior is simulated via separate scenario entries in the scenarios block.
 */

/**
 * SMOKE TEST: Quick connectivity verification
 * - Duration: 10s @ 5 req/s
 * - Purpose: Confirm endpoint accessibility before main load test
 */
export const smokeOptions = {
  scenarios: {
    smoke: {
      executor: 'constant-arrival-rate',
      rate: 5,
      timeUnit: '1s',
      duration: '10s',
      preAllocatedVUs: 2,
      maxVUs: 10,
    },
  },
  thresholds: thresholds.smoke,
};

/**
 * LOAD TEST: Primary SLA validation
 * Three consecutive scenarios chained by startTime offset:
 *   - warm_up:   30s @ 5 req/s  (stabilization, metrics expected but not primary SLA)
 *   - main_load: 120s @ 20 req/s (SLA measurement window)
 *   - cool_down: 30s @ 5 req/s  (graceful shutdown)
 *
 * maxVUs = 50 gives k6 enough headroom if the target API is slow.
 */
export const loadOptions = {
  scenarios: {
    warm_up: {
      executor: 'constant-arrival-rate',
      rate: 5,
      timeUnit: '1s',
      duration: '30s',
      preAllocatedVUs: 5,
      maxVUs: 20,
      startTime: '0s',
    },
    main_load: {
      executor: 'constant-arrival-rate',
      rate: 20,
      timeUnit: '1s',
      duration: '120s',
      preAllocatedVUs: 10,
      maxVUs: 50,
      startTime: '30s',
    },
    cool_down: {
      executor: 'constant-arrival-rate',
      rate: 5,
      timeUnit: '1s',
      duration: '30s',
      preAllocatedVUs: 5,
      maxVUs: 20,
      startTime: '150s',
    },
  },
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
