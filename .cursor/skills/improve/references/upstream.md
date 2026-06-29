---
source_name: shadcn/improve (improve)
source_url: https://github.com/shadcn/improve
source_type: github
upstream_path: skills/improve/SKILL.md
skills_lock_hash: 992d71e2ed2a83e7f25d8522d069f090e2ea16286ec29ea86f84cfa05c0c2430
last_reviewed: 2026-06-10
---

# Upstream: improve

Canonical copy in this repo: `docs/ai/skills/improve/` (mirrored to `.cursor/skills/` and `.agents/skills/` via `bun run skills:sync`).

- **Repository:** https://github.com/shadcn/improve
- **Upstream path:** `skills/improve/SKILL.md` (plus `references/{audit-playbook,closing-the-loop,plan-template}.md`)
- **Install via Skills CLI:** `npx skills add shadcn/improve -y`

The skill is a strictly read-only codebase advisor: it audits, prioritizes, and writes self-contained `plans/` for other agents to execute. It never edits source code itself. See the upstream `README.md` for the full command surface (`/improve`, `quick`/`deep`, `branch`, `next`, `plan`, `review-plan`, `execute`, `reconcile`, `--issues`).

## Refresh from ecosystem

1. `npx skills add shadcn/improve -y` updates `.agents/skills/improve/` and `skills-lock.json`. On Claude Code it may also create a project-level `.claude/skills/improve` symlink — delete it; this repo routes Claude Code through `docs/ai/skills/` + `AGENTS.md`, not `.claude/skills/`.
2. Copy the skill tree (`SKILL.md` + `references/*`, excluding this file) into `docs/ai/skills/improve/` if the canonical copy needs updating.
3. Preserve this `references/upstream.md` file.
4. Run `bun run skills:sync` and `bun run skills:verify`.

This skill is **not** updated by `bun run skills:refresh-upstream` today.
