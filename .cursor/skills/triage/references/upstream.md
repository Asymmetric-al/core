---
source_name: mattpocock/skills (triage)
source_url: https://github.com/mattpocock/skills
source_type: github
upstream_path: skills/engineering/triage/SKILL.md
skills_lock_hash: 7caa274494d702d8c668d1ff17267b4a69b6d58e34a00c20b2df9de67ef6edc9
last_reviewed: 2026-07-09
---

# Upstream: triage

Canonical copy in this repo: `docs/ai/skills/triage/` (mirrored to `.agents/skills/`, `.cursor/skills/`, and `.claude/skills/` via `bun run skills:sync`).

- **Repository:** https://github.com/mattpocock/skills
- **Upstream path:** `skills/engineering/triage/SKILL.md`
- **Install via Skills CLI:** `npx skills add mattpocock/skills -y`

## Refresh from ecosystem

1. `npx skills add mattpocock/skills -y` updates `.agents/skills/*` and `skills-lock.json`.
2. Reconcile the freshly installed upstream copy from `.agents/skills/triage/` into canonical `docs/ai/skills/triage/` if this canonical copy needs updating. Treat `.agents/skills/triage/` as a temporary Skills CLI import at this point; after `bun run skills:sync`, it is generated mirror output again.
3. Preserve or regenerate this `references/upstream.md` file with the current lock hash.
4. Run `bun run skills:sync` and `bun run skills:verify`.

This skill is **not** updated by `bun run skills:refresh-upstream`.
