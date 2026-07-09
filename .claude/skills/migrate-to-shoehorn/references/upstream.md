---
source_name: mattpocock/skills (migrate-to-shoehorn)
source_url: https://github.com/mattpocock/skills
source_type: github
upstream_path: skills/misc/migrate-to-shoehorn/SKILL.md
skills_lock_hash: 67fdd18f8f4f7c89b3003eb944220679272738c1deb680719fd2e282495d87f4
last_reviewed: 2026-07-09
---

# Upstream: migrate-to-shoehorn

Canonical copy in this repo: `docs/ai/skills/migrate-to-shoehorn/` (mirrored to `.agents/skills/`, `.cursor/skills/`, and `.claude/skills/` via `bun run skills:sync`).

- **Repository:** https://github.com/mattpocock/skills
- **Upstream path:** `skills/misc/migrate-to-shoehorn/SKILL.md`
- **Install via Skills CLI:** `npx skills add mattpocock/skills -y`

## Refresh from ecosystem

1. `npx skills add mattpocock/skills -y` updates `.agents/skills/*` and `skills-lock.json`.
2. Copy the relevant skill tree from `.agents/skills/migrate-to-shoehorn/` into `docs/ai/skills/migrate-to-shoehorn/` if this canonical copy needs updating.
3. Preserve or regenerate this `references/upstream.md` file with the current lock hash.
4. Run `bun run skills:sync` and `bun run skills:verify`.

This skill is **not** updated by `bun run skills:refresh-upstream` today.
