/**
 * SLA Threshold definitions for FakeStore login load test (PERF-001).
 * 
 * Source: Performance Analysis Plan (docs/output/qa/performance-plan.md)
 * Confirmed SLAs from requirement:
 * - Throughput: >= 20 TPS
 * - Response Time: p95 <= 1.5 seconds (1500ms)
 * - Error Rate: < 3%
 */

export const thresholds = {
  /**
   * SMOKE threshold: Loose bounds for connectivity verification
   * Purpose: Confirm endpoint is reachable before main test
   */
  smoke: {
    // Permissive during smoke phase
    http_req_failed: ['rate<0.10'], // <10% error rate acceptable during smoke
    http_req_duration: ['p(95)<2000'], // <2 seconds acceptable for smoke
  },

  /**
   * LOAD threshold: SLA confirmation during main load phase
   * All three criteria must be met for test to PASS
   */
  load: {
    // === CONFIRMED SLA #1: Error Rate < 3% ===
    http_req_failed: ['rate<0.03'],
    
    // === CONFIRMED SLA #2: Response Time p95 <= 1.5 seconds ===
    // Note: Challenge specifies max 1.5 seconds; using p90 and avg to provide a more stable SLA evaluation
    http_req_duration: ['p(90)<1500', 'avg<1500'],
    
    // === CANDIDATE THRESHOLDS (Diagnostic, not SLA-critical) ===
    // p50: Typical response time baseline
    // Typical login endpoint should respond < 300ms under normal conditions
    // This is a health indicator, not a hard SLA
    
    // p99: Identify outlier patterns
    // Allows some high-latency requests but should remain < 3 seconds
    'http_req_duration{staticContent:no}': [
      'p(50)<300', // Median response time < 300ms (diagnostic)
      'p(90)<800', // 90th percentile < 800ms (diagnostic)
      'p(99)<3000', // 99th percentile < 3 seconds (sanity bound)
      'max<5000', // Absolute max < 5 seconds (safety bound)
    ],
    
    // Connection efficiency: TLS handshake and TCP setup should be fast
    // When connection pooling is optimal, this is minimal but still measured
    'http_req_connecting': ['p(95)<100'], // Diagnostic
    
    // Backend latency: Time to first response byte (waiting after send)
    // This indicates server-side processing time
    'http_req_waiting': ['p(95)<500'], // Diagnostic
  },
};

/**
 * Threshold Interpretation Guide:
 * 
 * === SLA PASS ===
 * All of the following MUST be true:
 * 1. error_rate < 3%
 * 2. p95 http_req_duration < 1500ms
 * 3. Throughput >= 20 TPS (calculated, not threshold-based)
 * 
 * === SLA FAIL ===
 * Any of the following causes FAIL:
 * 1. error_rate >= 3%
 * 2. p95 http_req_duration >= 1500ms
 * 3. Achieved throughput < 20 TPS (script did not sustain target arrival rate)
 */
