---
source_name: mattpocock/skills (request-refactor-plan)
source_url: https://github.com/mattpocock/skills
source_type: github
upstream_path: skills/deprecated/request-refactor-plan/SKILL.md
skills_lock_hash: 6811250488d1dafcb111e7ef0dc1124211369c5f6f47ce820b7527c255489178
last_reviewed: 2026-07-09
---

# Upstream: request-refactor-plan

Canonical copy in this repo: `docs/ai/skills/request-refactor-plan/` (mirrored to `.agents/skills/`, `.cursor/skills/`, and `.claude/skills/` via `bun run skills:sync`).

- **Repository:** https://github.com/mattpocock/skills
- **Upstream path:** `skills/deprecated/request-refactor-plan/SKILL.md`
- **Install via Skills CLI:** `npx skills add mattpocock/skills -y`

## Refresh from ecosystem

1. `npx skills add mattpocock/skills -y` updates `.agents/skills/*` and `skills-lock.json`.
2. Reconcile the freshly installed upstream copy from `.agents/skills/request-refactor-plan/` into canonical `docs/ai/skills/request-refactor-plan/` if this canonical copy needs updating. Treat `.agents/skills/request-refactor-plan/` as a temporary Skills CLI import at this point; after `bun run skills:sync`, it is generated mirror output again.
3. Preserve or regenerate this `references/upstream.md` file with the current lock hash.
4. Run `bun run skills:sync` and `bun run skills:verify`.

This skill is **not** updated by `bun run skills:refresh-upstream`.
