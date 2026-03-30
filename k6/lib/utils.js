import { SharedArray } from 'k6/data';
import { ENV } from '../config/env.js';

/**
 * Utility functions for FakeStore login load test (PERF-001).
 *
 * CSV LOADING STRATEGY:
 * k6 v1.x requires that file I/O happens in the INIT CONTEXT (module top-level).
 * SharedArray is the idiomatic k6 way to load CSV/JSON data efficiently:
 *   - The parsing function runs once during init.
 *   - The resulting array is shared (read-only) across all VUs with minimal memory.
 *
 * PATH RESOLUTION:
 * open() resolves paths relative to the SCRIPT FILE that calls it, not the
 * process CWD. utils.js is at k6/lib/utils.js, so the CSV is at ../data/credentials.csv.
 */

// ── Shared credential dataset (init-context) ───────────────────────────────────
// SharedArray runs its factory function ONCE and shares the result across VUs.
const _credentials = new SharedArray('login-credentials', function () {
  // open() is valid here because SharedArray's factory is an init-context function.
  const raw = open('../data/credentials.csv');

  const lines = raw.split('\n').filter(line => line.trim() !== '');

  if (lines.length < 2) {
    throw new Error(
      `CSV must have a header and at least one data row. Found ${lines.length} lines.`
    );
  }

  // Validate header: must be exactly "user,passwd"
  const headers = lines[0].split(',').map(h => h.trim());
  if (headers.length !== 2 || headers[0] !== 'user' || headers[1] !== 'passwd') {
    throw new Error(`CSV header must be "user,passwd". Found: "${lines[0]}"`);
  }

  // Parse data rows into credential objects
  const credentials = [];
  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].split(',');
    if (parts.length === 2) {
      credentials.push({
        username: parts[0].trim(),
        password: parts[1].trim(),
      });
    }
  }

  if (credentials.length === 0) {
    throw new Error('CSV has no valid credential rows.');
  }

  return credentials;
});

// ── Public API ─────────────────────────────────────────────────────────────────

/**
 * Return the full shared credential array.
 * Safe to call anywhere (setup, default, teardown) — data was parsed at init.
 * @returns {Array<{username: string, password: string}>}
 */
export function loadCredentialsFromCSV() {
  if (ENV.DEBUG_MODE) {
    console.log(`Using ${_credentials.length} shared credentials from CSV`);
  }
  return _credentials;
}

/**
 * Distribute credentials across virtual users so each VU cycles its own subset.
 * Reduces per-credential reuse frequency when many VUs run in parallel.
 * @param {Array} allCredentials - Full credential array
 * @param {number} totalVUs - Max VUs expected (use maxVUs from scenario config)
 * @returns {Array} Subset assigned to the current __VU
 */
export function getCredentialsForVU(allCredentials, totalVUs = 50) {
  const vuIndex = __VU - 1; // __VU is 1-indexed in k6
  const credentialsPerVU = Math.ceil(allCredentials.length / Math.max(totalVUs, 1));
  const startIdx = vuIndex % allCredentials.length;

  const assigned = [];
  for (let i = 0; i < credentialsPerVU; i++) {
    assigned.push(allCredentials[(startIdx + i) % allCredentials.length]);
  }

  return assigned;
}

/**
 * Return the next credential for this iteration using round-robin cycling.
 * @param {Array} vuCredentials - Credentials assigned to this VU
 * @param {number} iterationIndex - __ITER value (0-indexed per VU)
 * @returns {{username: string, password: string}}
 */
export function getNextCredential(vuCredentials, iterationIndex) {
  if (!vuCredentials || vuCredentials.length === 0) {
    throw new Error('No credentials available for this VU.');
  }
  return vuCredentials[iterationIndex % vuCredentials.length];
}

/**
 * Log credential usage — only when DEBUG_MODE=true.
 * @param {{username: string, password: string}} credential
 * @param {number} iterationIndex
 */
export function logCredentialUsage(credential, iterationIndex) {
  if (ENV.DEBUG_MODE) {
    console.log(`[VU ${__VU}, Iter ${iterationIndex}] Using: ${credential.username}`);
  }
}

/**
 * Build the JSON payload expected by POST /auth/login.
 * @param {{username: string, password: string}} credential
 * @returns {{username: string, password: string}}
 */
export function formatLoginPayload(credential) {
  return {
    username: credential.username,
    password: credential.password,
  };
}
