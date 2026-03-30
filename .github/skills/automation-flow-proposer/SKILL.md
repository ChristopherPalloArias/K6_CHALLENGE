---
name: automation-flow-proposer
description: Proposes which flows to automate, under what ROI criteria, to prioritize the performance automation roadmap.
argument-hint: "<feature-name | project-name>"
---

# Skill: automation-flow-proposer [QA]

Identifies which flows have the best ROI to automate and defines the roadmap.

## Selection framework

```
FOR PERFORMANCE APIs:
  k6 -> For load and stress testing
  k6 -> For checking thresholds and SLOs
```

## Deliverable: `automation-proposal.md`

Generates in `docs/output/qa/automation-proposal.md`.
