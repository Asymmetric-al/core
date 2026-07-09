---
source_name: mattpocock/skills (grill-me)
source_url: https://github.com/mattpocock/skills
source_type: github
upstream_path: skills/productivity/grill-me/SKILL.md
skills_lock_hash: 67e31b63e6e9e454cc2f51cd85b9cf1396ee46379a87c07a1450f33c47c1276a
last_reviewed: 2026-07-09
---

# Upstream: grill-me

Canonical copy in this repo: `docs/ai/skills/grill-me/` (mirrored to `.agents/skills/`, `.cursor/skills/`, and `.claude/skills/` via `bun run skills:sync`).

- **Repository:** https://github.com/mattpocock/skills
- **Upstream path:** `skills/productivity/grill-me/SKILL.md`
- **Install via Skills CLI:** `npx skills add mattpocock/skills -y`

## Refresh from ecosystem

1. `npx skills add mattpocock/skills -y` updates `.agents/skills/*` and `skills-lock.json`.
2. Reconcile the freshly installed upstream copy from `.agents/skills/grill-me/` into canonical `docs/ai/skills/grill-me/` if this canonical copy needs updating. Treat `.agents/skills/grill-me/` as a temporary Skills CLI import at this point; after `bun run skills:sync`, it is generated mirror output again.
3. Preserve or regenerate this `references/upstream.md` file with the current lock hash.
4. Run `bun run skills:sync` and `bun run skills:verify`.

This skill is **not** updated by `bun run skills:refresh-upstream`.
