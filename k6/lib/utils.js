import { open } from 'k6';
import { ENV } from '../config/env.js';

/**
 * Utility functions for FakeStore login load test (PERF-001).
 * Handles CSV loading, credential distribution, and data cycling strategies.
 */

/**
 * Load credentials from CSV file.
 * CSV format: user,passwd
 * @returns {Array<{username: string, password: string}>} Array of credential objects
 * @throws {Error} If CSV file cannot be read or is malformed
 */
export function loadCredentialsFromCSV() {
  try {
    const file = open(ENV.CSV_PATH);
    const lines = file.split('\n').filter(line => line.trim() !== '');

    if (lines.length < 2) {
      throw new Error(
        `CSV file must contain header and at least one credential row. Found ${lines.length} lines.`
      );
    }

    // Parse and validate header
    const headerLine = lines[0];
    const headers = headerLine.split(',').map(h => h.trim());

    if (headers.length !== 2 || headers[0] !== 'user' || headers[1] !== 'passwd') {
      throw new Error(`CSV header must be exactly "user,passwd". Found: "${headerLine}"`);
    }

    // Parse credential rows
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
      throw new Error('CSV file contains no credential rows.');
    }

    if (ENV.DEBUG_MODE) {
      console.log(`Loaded ${credentials.length} credentials from ${ENV.CSV_PATH}`);
    }

    return credentials;
  } catch (err) {
    console.error(`Failed to load credentials from CSV: ${err.message}`);
    throw err;
  }
}

/**
 * Distribute credentials evenly across virtual users.
 * Each VU gets a subset of credentials to cycle through, reducing per-credential reuse.
 * @param {Array} allCredentials - All available credentials
 * @param {number} totalVUs - Total number of virtual users (estimate)
 * @returns {Array} Subset of credentials assigned to current VU
 */
export function getCredentialsForVU(allCredentials, totalVUs = 50) {
  const vuIndex = __VU - 1; // __VU is 1-indexed
  const credentialsPerVU = Math.ceil(allCredentials.length / totalVUs);
  const startIdx = vuIndex % allCredentials.length;

  const assigned = [];
  for (let i = 0; i < credentialsPerVU; i++) {
    assigned.push(allCredentials[(startIdx + i) % allCredentials.length]);
  }

  return assigned;
}

/**
 * Get next credential for current iteration (round-robin cycling).
 * @param {Array} vuCredentials - Credentials assigned to this VU
 * @param {number} iterationIndex - Current iteration number (0-indexed)
 * @returns {Object} Next credential {username, password}
 */
export function getNextCredential(vuCredentials, iterationIndex) {
  if (!vuCredentials || vuCredentials.length === 0) {
    throw new Error('No credentials available for VU');
  }
  const index = iterationIndex % vuCredentials.length;
  return vuCredentials[index];
}

/**
 * Log credential usage for debugging (only in debug mode).
 * @param {Object} credential - The credential being used
 * @param {number} iterationIndex - Current iteration
 */
export function logCredentialUsage(credential, iterationIndex) {
  if (ENV.DEBUG_MODE) {
    console.log(`[VU ${__VU}, Iter ${iterationIndex}] Using credential: ${credential.username}`);
  }
}

/**
 * Format credentials as JSON payload for login request body.
 * @param {Object} credential - {username, password}
 * @returns {Object} Formatted request payload
 */
export function formatLoginPayload(credential) {
  return {
    username: credential.username,
    password: credential.password,
  };
}
