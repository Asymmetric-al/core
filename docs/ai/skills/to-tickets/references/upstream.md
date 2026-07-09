---
source_name: mattpocock/skills (to-tickets)
source_url: https://github.com/mattpocock/skills
source_type: github
upstream_path: skills/engineering/to-tickets/SKILL.md
skills_lock_hash: 8b9330e8ecec09a21b9b32e27a2d2475366c0afd993baf2477777cb5565f8111
last_reviewed: 2026-07-09
---

# Upstream: to-tickets

Canonical copy in this repo: `docs/ai/skills/to-tickets/` (mirrored to `.agents/skills/`, `.cursor/skills/`, and `.claude/skills/` via `bun run skills:sync`).

- **Repository:** https://github.com/mattpocock/skills
- **Upstream path:** `skills/engineering/to-tickets/SKILL.md`
- **Install via Skills CLI:** `npx skills add mattpocock/skills -y`

## Refresh from ecosystem

1. `npx skills add mattpocock/skills -y` updates `.agents/skills/*` and `skills-lock.json`.
2. Reconcile the freshly installed upstream copy from `.agents/skills/to-tickets/` into canonical `docs/ai/skills/to-tickets/` if this canonical copy needs updating. Treat `.agents/skills/to-tickets/` as a temporary Skills CLI import at this point; after `bun run skills:sync`, it is generated mirror output again.
3. Preserve or regenerate this `references/upstream.md` file with the current lock hash.
4. Run `bun run skills:sync` and `bun run skills:verify`.

This skill is **not** updated by `bun run skills:refresh-upstream`.
