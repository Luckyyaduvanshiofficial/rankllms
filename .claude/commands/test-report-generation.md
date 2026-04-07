---
name: test-report-generation
description: Workflow command scaffold for test-report-generation in rankllms.
allowed_tools: ["Bash", "Read", "Write", "Grep", "Glob"]
---

# /test-report-generation

Use this workflow when working on **test-report-generation** in `rankllms`.

## Goal

Generates and updates test reports after running tests, including JSON and XML outputs.

## Common Files

- `test_reports/iteration_*.json`
- `test_reports/pytest/pytest_results.xml`

## Suggested Sequence

1. Understand the current state and failure mode before editing.
2. Make the smallest coherent change that satisfies the workflow goal.
3. Run the most relevant verification for touched files.
4. Summarize what changed and what still needs review.

## Typical Commit Signals

- Run tests (pytest, etc.)
- Generate or update test_reports/iteration_*.json
- Generate or update test_reports/pytest/pytest_results.xml

## Notes

- Treat this as a scaffold, not a hard-coded script.
- Update the command if the workflow evolves materially.