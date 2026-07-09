---
source_name: mattpocock/skills (qa)
source_url: https://github.com/mattpocock/skills
source_type: github
upstream_path: skills/deprecated/qa/SKILL.md
skills_lock_hash: a608d889794ef7f21a5dd31d96ca502b5e6f27b466ada759a3bf9846a2e6b236
last_reviewed: 2026-07-09
---

# Upstream: qa

Canonical copy in this repo: `docs/ai/skills/qa/` (mirrored to `.agents/skills/`, `.cursor/skills/`, and `.claude/skills/` via `bun run skills:sync`).

- **Repository:** https://github.com/mattpocock/skills
- **Upstream path:** `skills/deprecated/qa/SKILL.md`
- **Install via Skills CLI:** `npx skills add mattpocock/skills -y`

## Refresh from ecosystem

1. `npx skills add mattpocock/skills -y` updates `.agents/skills/*` and `skills-lock.json`.
2. Reconcile the freshly installed upstream copy from `.agents/skills/qa/` into canonical `docs/ai/skills/qa/` if this canonical copy needs updating. Treat `.agents/skills/qa/` as a temporary Skills CLI import at this point; after `bun run skills:sync`, it is generated mirror output again.
3. Preserve or regenerate this `references/upstream.md` file with the current lock hash.
4. Run `bun run skills:sync` and `bun run skills:verify`.

This skill is **not** updated by `bun run skills:refresh-upstream`.
