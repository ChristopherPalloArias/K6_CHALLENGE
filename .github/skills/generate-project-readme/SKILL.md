---
name: generate-project-readme
description: Generates or updates the root README.md using strict evidence-driven documentation based on the implemented k6 scripts and assets.
argument-hint: "[optional: update-scope]"
---

# `generate-project-readme` [Documentation]

## Purpose
Automates the creation and maintenance of a professional, evidence-driven project `README.md` that strictly reflects the current state of the performance test repository.

## Rules & Anti-Hallucination
- **Strict Scope Limits:** Document ONLY what physically exists in the `k6/` folder.
- **No Fabricated Behavior:** Do not invent metrics, unexecuted scenarios, or CI/CD pipelines that are not present.
- **Honesty:** Explicitly state if the repository is a scaffold or if tests exist but lack CI execution.

## Style Preferences & Required Structure
- Use centered main headers and skill icons (e.g., 🚀, 📊, 🛡️).
- Default Author: Agent Spec-Driven Development (ASDD) Framework.
- Include a Table of Contents (Index).
- Use collapsible `<details>` blocks for verbose outputs, like scenario configuration JSONs or long environment variable lists.

## Required Sections
1. **Header & Badges:** Project title, subtitle, and technology badges (k6, JS).
2. **Project Context:** Brief explanation of the target system load testing parameters.
3. **Implemented Scenarios:** A table listing implemented scenarios (e.g., `smoke.js`, `load.js`), their target VUs, and duration.
4. **Environment Setup:** Required variables defined in `k6/config/env.js`.
5. **Thresholds & SLAs:** Documented SLAs mapping to `k6/config/thresholds.js`.
6. **Execution Commands:** Copy-paste usable `k6 run` commands.

## Inputs
- Process the `k6/config/`, `k6/scenarios/`, and `.github/specs/` directories.

## Expected Deliverable
- Overwrite or update `/README.md`.
- Return a summary of the sections updated to the user in the prompt interface.
