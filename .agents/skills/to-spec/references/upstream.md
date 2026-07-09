---
source_name: mattpocock/skills (to-spec)
source_url: https://github.com/mattpocock/skills
source_type: github
upstream_path: skills/engineering/to-spec/SKILL.md
skills_lock_hash: 71b6e4dd625e894073e11e1e8057fe473d93d32956d9ada2370259c6497f4fcd
last_reviewed: 2026-07-09
---

# Upstream: to-spec

Canonical copy in this repo: `docs/ai/skills/to-spec/` (mirrored to `.agents/skills/`, `.cursor/skills/`, and `.claude/skills/` via `bun run skills:sync`).

- **Repository:** https://github.com/mattpocock/skills
- **Upstream path:** `skills/engineering/to-spec/SKILL.md`
- **Install via Skills CLI:** `npx skills add mattpocock/skills -y`

## Refresh from ecosystem

1. `npx skills add mattpocock/skills -y` updates `.agents/skills/*` and `skills-lock.json`.
2. Reconcile the freshly installed upstream copy from `.agents/skills/to-spec/` into canonical `docs/ai/skills/to-spec/` if this canonical copy needs updating. Treat `.agents/skills/to-spec/` as a temporary Skills CLI import at this point; after `bun run skills:sync`, it is generated mirror output again.
3. Preserve or regenerate this `references/upstream.md` file with the current lock hash.
4. Run `bun run skills:sync` and `bun run skills:verify`.

This skill is **not** updated by `bun run skills:refresh-upstream`.
