---
source_name: mattpocock/skills (implement)
source_url: https://github.com/mattpocock/skills
source_type: github
upstream_path: skills/engineering/implement/SKILL.md
skills_lock_hash: 21d7160a81a70def69c3b2b6394943ea978f60b5b4658a4ac4a5b79799ae5597
last_reviewed: 2026-07-09
---

# Upstream: implement

Canonical copy in this repo: `docs/ai/skills/implement/` (mirrored to `.agents/skills/`, `.cursor/skills/`, and `.claude/skills/` via `bun run skills:sync`).

- **Repository:** https://github.com/mattpocock/skills
- **Upstream path:** `skills/engineering/implement/SKILL.md`
- **Install via Skills CLI:** `npx skills add mattpocock/skills -y`

## Refresh from ecosystem

1. `npx skills add mattpocock/skills -y` updates `.agents/skills/*` and `skills-lock.json`.
2. Reconcile the freshly installed upstream copy from `.agents/skills/implement/` into canonical `docs/ai/skills/implement/` if this canonical copy needs updating. Treat `.agents/skills/implement/` as a temporary Skills CLI import at this point; after `bun run skills:sync`, it is generated mirror output again.
3. Preserve or regenerate this `references/upstream.md` file with the current lock hash.
4. Run `bun run skills:sync` and `bun run skills:verify`.

This skill is **not** updated by `bun run skills:refresh-upstream`.
