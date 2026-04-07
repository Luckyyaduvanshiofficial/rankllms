---
name: backend-api-update-and-test
description: Workflow command scaffold for backend-api-update-and-test in rankllms.
allowed_tools: ["Bash", "Read", "Write", "Grep", "Glob"]
---

# /backend-api-update-and-test

Use this workflow when working on **backend-api-update-and-test** in `rankllms`.

## Goal

Updates backend server code and corresponding API tests, often with requirements or compiled files.

## Common Files

- `backend/server.py`
- `backend/requirements.txt`
- `backend/tests/test_api.py`
- `backend/tests/__pycache__/*`
- `backend/__pycache__/*`

## Suggested Sequence

1. Understand the current state and failure mode before editing.
2. Make the smallest coherent change that satisfies the workflow goal.
3. Run the most relevant verification for touched files.
4. Summarize what changed and what still needs review.

## Typical Commit Signals

- Edit backend/server.py to implement or update API logic
- Update backend/requirements.txt if dependencies change
- Edit or add backend/tests/test_api.py for test coverage
- Update backend/tests/__pycache__/* for test artifacts
- Update backend/__pycache__/* for compiled server code

## Notes

- Treat this as a scaffold, not a hard-coded script.
- Update the command if the workflow evolves materially.