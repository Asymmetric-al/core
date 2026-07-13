---
source_name: mattpocock/skills (wayfinder)
source_url: https://github.com/mattpocock/skills
source_type: github
upstream_path: skills/engineering/wayfinder/SKILL.md
skills_lock_hash: 71d7080cec29cd00ef8173b1aa591f57a08e2a0a5ea6b6339a6ff2cf2895ccc1
last_reviewed: 2026-07-09
---

# Upstream: wayfinder

Canonical copy in this repo: `docs/ai/skills/wayfinder/` (mirrored to `.agents/skills/`, `.cursor/skills/`, and `.claude/skills/` via `bun run skills:sync`).

- **Repository:** https://github.com/mattpocock/skills
- **Upstream path:** `skills/engineering/wayfinder/SKILL.md`
- **Install via Skills CLI:** `npx skills add mattpocock/skills -y`

## Refresh from ecosystem

1. `npx skills add mattpocock/skills -y` updates `.agents/skills/*` and `skills-lock.json`.
2. Reconcile the freshly installed upstream copy from `.agents/skills/wayfinder/` into canonical `docs/ai/skills/wayfinder/` if this canonical copy needs updating. Treat `.agents/skills/wayfinder/` as a temporary Skills CLI import at this point; after `bun run skills:sync`, it is generated mirror output again.
3. Preserve or regenerate this `references/upstream.md` file with the current lock hash.
4. Run `bun run skills:sync` and `bun run skills:verify`.

This skill is **not** updated by `bun run skills:refresh-upstream`.
