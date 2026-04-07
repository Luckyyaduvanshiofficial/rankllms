---
name: frontend-feature-development
description: Workflow command scaffold for frontend-feature-development in rankllms.
allowed_tools: ["Bash", "Read", "Write", "Grep", "Glob"]
---

# /frontend-feature-development

Use this workflow when working on **frontend-feature-development** in `rankllms`.

## Goal

Implements or updates frontend features, often involving React components, Astro pages/layouts, global styles, and configuration files.

## Common Files

- `frontend/src/components/*.tsx`
- `frontend/src/pages/**/*.astro`
- `frontend/src/layouts/*.astro`
- `frontend/src/styles/global.css`
- `frontend/astro.config.mjs`
- `frontend/package.json`

## Suggested Sequence

1. Understand the current state and failure mode before editing.
2. Make the smallest coherent change that satisfies the workflow goal.
3. Run the most relevant verification for touched files.
4. Summarize what changed and what still needs review.

## Typical Commit Signals

- Edit or create React components in frontend/src/components/
- Edit or create Astro pages/layouts in frontend/src/pages/ and frontend/src/layouts/
- Update global styles in frontend/src/styles/global.css
- Update configuration in frontend/astro.config.mjs, frontend/package.json, or frontend/tsconfig.json
- Update lock files (frontend/yarn.lock) if dependencies changed

## Notes

- Treat this as a scaffold, not a hard-coded script.
- Update the command if the workflow evolves materially.