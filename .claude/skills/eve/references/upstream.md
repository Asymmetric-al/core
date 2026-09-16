---
source_name: vercel/eve
source_url: https://github.com/vercel/eve
source_type: github
upstream_path: skills/eve/SKILL.md
skills_lock_hash: 35a7c82f96e20871ff91e9a3a0054ac110f341d35050ed72cd79f441fb9be8a6
last_reviewed: 2026-09-16
---

# Upstream: eve

Canonical copy in this repo: `docs/ai/skills/eve/` (mirrored to `.cursor/skills/` and `.agents/skills/` via `bun run skills:sync`).

- **Repository:** https://github.com/vercel/eve
- **Upstream path:** `skills/eve/SKILL.md`
- **Install via Skills CLI:** `npx skills add vercel/eve --skill eve -y`

## Refresh from ecosystem

1. `npx skills add vercel/eve --skill eve -y` updates `.agents/skills/eve/` and `skills-lock.json`.
2. Copy the skill tree into `docs/ai/skills/eve/` if the canonical copy needs updating.
3. Preserve this `references/upstream.md` file.
4. Run `bun run skills:sync` and `bun run skills:verify`.

This skill is **not** updated by `bun run skills:refresh-upstream` today. Upstream moved the skill from repo-root `SKILL.md` to `skills/eve/SKILL.md`.
