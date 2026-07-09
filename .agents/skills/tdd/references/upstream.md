---
source_name: mattpocock/skills (tdd)
source_url: https://github.com/mattpocock/skills
source_type: github
upstream_path: skills/engineering/tdd/SKILL.md
skills_lock_hash: f23403cf05c3a4b0dec9983f7818cf1b53ebddd9cc406593fa46d9694b8c259a
last_reviewed: 2026-07-09
---

# Upstream: tdd

Canonical copy in this repo: `docs/ai/skills/tdd/` (mirrored to `.agents/skills/`, `.cursor/skills/`, and `.claude/skills/` via `bun run skills:sync`).

- **Repository:** https://github.com/mattpocock/skills
- **Upstream path:** `skills/engineering/tdd/SKILL.md`
- **Install via Skills CLI:** `npx skills add mattpocock/skills -y`

## Refresh from ecosystem

1. `npx skills add mattpocock/skills -y` updates `.agents/skills/*` and `skills-lock.json`.
2. Reconcile the freshly installed upstream copy from `.agents/skills/tdd/` into canonical `docs/ai/skills/tdd/` if this canonical copy needs updating. Treat `.agents/skills/tdd/` as a temporary Skills CLI import at this point; after `bun run skills:sync`, it is generated mirror output again.
3. Preserve or regenerate this `references/upstream.md` file with the current lock hash.
4. Run `bun run skills:sync` and `bun run skills:verify`.

This skill is **not** updated by `bun run skills:refresh-upstream`.
