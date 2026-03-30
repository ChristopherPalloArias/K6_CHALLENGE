---
description: 'Generates reusable configuration and foundation assets (env, options, thresholds, helpers) for k6 tests based on the approved spec.'
agent: qa-agent
---

# `implement-k6-assets`

Generates the foundation assets required to execute k6 scripts from an `APPROVED` technical specification.

## Objective
Analyze the technical specification and generate reusable implementations such as data, configurations, and helper libraries, without writing the actual test iteration logic yet.

## Tasks

1. Read the specification in `.github/specs/*.spec.md` that is currently `APPROVED`.
2. Analyze the thresholds, environment variables, target API structure or database, and any preconditions.
3. Generate or update the following under the `k6/` folder:
   - `k6/config/env.js`: Module for safely extracting environment variables and base values (e.g., `BASE_URL`).
   - `k6/config/options.js`: Definition of stages, scenarios (smoke, load, stress) according to the spec.
   - `k6/config/thresholds.js`: Strict SLA rules extracted from the spec.
   - `k6/lib/http-client.js` or helpers: Pre-configured clients for target APIs or fundamental interactions.
   - `k6/lib/checks.js`: Reusable module for standard response validations.
   - `k6/data/test-data.json`: Static data defined explicitly in the specification, without inventing real credentials.
4. Do NOT generate the final execution script in this step, only the supporting assets.

## Constraints
- Only use information explicit in the spec. Do not invent credentials, undocumented endpoints, or unspecified SLAs.
- Separate configuration from functional or test logic.
- Keep it generic. If something does not apply to the current spec, do not generate it.
- Export all workflows and data using ESModules (`export const`).

## Output
List of files created or updated under the `k6/` directory and a brief explanation of their functionality.
