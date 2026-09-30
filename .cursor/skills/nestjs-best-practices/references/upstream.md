---
source_name: Kadajett/agent-nestjs-skills
source_url: https://github.com/Kadajett/agent-nestjs-skills
source_type: github
upstream_path: skills/nestjs-best-practices/SKILL.md
skills_lock_hash: 9af2b33ca5b428637fe98e9b91e9f3ae064ddd359e96cdda7dc199d490b0a102
last_reviewed: 2026-09-16
---

# Upstream: nestjs-best-practices

Canonical copy in this repo: `docs/ai/skills/nestjs-best-practices/` (mirrored to `.cursor/skills/` and `.agents/skills/` via `bun run skills:sync`).

- **Repository:** https://github.com/Kadajett/agent-nestjs-skills
- **Upstream path:** `skills/nestjs-best-practices/SKILL.md` plus `rules/`
- **Install via Skills CLI:** `npx skills add Kadajett/agent-nestjs-skills --skill nestjs-best-practices -y`

Do **not** copy the upstream repository root (`AGENTS.md`, `.github/`, `scripts/`). Those files are pack build machinery, not the skill.

## Refresh from ecosystem

1. `npx skills add Kadajett/agent-nestjs-skills --skill nestjs-best-practices -y` updates `.agents/skills/nestjs-best-practices/` and `skills-lock.json`.
2. Copy `SKILL.md` and `rules/` into `docs/ai/skills/nestjs-best-practices/` if the canonical copy needs updating.
3. Restore the Core overlay in `SKILL.md` and preserve this `references/upstream.md` file.
4. Run `bun run skills:sync` and `bun run skills:verify`.

Core is **not** a NestJS application. This skill is NestJS reference only and must not introduce NestJS, TypeORM, or Nest modules into the monorepo.

This skill is **not** updated by `bun run skills:refresh-upstream` today.
