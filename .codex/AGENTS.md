# ECC for Codex CLI

This supplements the root `AGENTS.md` with a repo-local ECC baseline.

## Repo Skill

- Repo-generated Codex skill: `.agents/skills/rankllms/SKILL.md`
- Claude-facing companion skill: `.claude/skills/rankllms/SKILL.md`
- Keep user-specific credentials and private MCPs in `~/.codex/config.toml`, not in this repo.

## MCP Baseline

Treat `.codex/config.toml` as the default ECC-safe baseline for work in this repository.
The generated baseline enables GitHub, Context7, Exa, Memory, Playwright, and Sequential Thinking.

## Multi-Agent Support

- Explorer: read-only evidence gathering
- Reviewer: correctness, security, and regression review
- Docs researcher: API and release-note verification

## Workflow Files

- `.claude/commands/frontend-feature-development.md`
- `.claude/commands/backend-api-update-and-test.md`
- `.claude/commands/test-report-generation.md`

Use these workflow files as reusable task scaffolds when the detected repository workflows recur.