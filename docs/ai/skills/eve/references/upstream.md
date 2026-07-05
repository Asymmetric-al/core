---
source_name: vercel/eve
source_url: https://github.com/vercel/eve
source_type: github
upstream_path: SKILL.md
skills_lock_hash: 79a1e606ecf33eed33c1f3adc1cc266de391e19aa9237ca37e4f3aa3fba6b228
last_reviewed: 2026-06-28
---

# Upstream: eve

Canonical copy in this repo: `docs/ai/skills/eve/` (mirrored to `.cursor/skills/` and `.agents/skills/` via `bun run skills:sync`).

- **Repository:** https://github.com/vercel/eve
- **Upstream path:** `SKILL.md`
- **Install via Skills CLI:** `npx skills add https://github.com/vercel/eve --skill eve -y`

## Refresh from ecosystem

1. `npx skills add https://github.com/vercel/eve --skill eve -y` updates `.agents/skills/eve/` and `skills-lock.json`.
2. Copy the skill tree into `docs/ai/skills/eve/` if the canonical copy needs updating.
3. Preserve this `references/upstream.md` file.
4. Run `bun run skills:sync` and `bun run skills:verify`.

This skill is **not** updated by `bun run skills:refresh-upstream` today.
