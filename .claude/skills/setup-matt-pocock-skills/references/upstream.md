---
source_name: mattpocock/skills (setup-matt-pocock-skills)
source_url: https://github.com/mattpocock/skills
source_type: github
upstream_path: skills/engineering/setup-matt-pocock-skills/SKILL.md
skills_lock_hash: 7c4f945086d19c8b0f8f8adcf1a705767d894efb2afac129707816fded507a64
last_reviewed: 2026-07-09
---

# Upstream: setup-matt-pocock-skills

Canonical copy in this repo: `docs/ai/skills/setup-matt-pocock-skills/` (mirrored to `.agents/skills/`, `.cursor/skills/`, and `.claude/skills/` via `bun run skills:sync`).

- **Repository:** https://github.com/mattpocock/skills
- **Upstream path:** `skills/engineering/setup-matt-pocock-skills/SKILL.md`
- **Install via Skills CLI:** `npx skills add mattpocock/skills -y`

## Refresh from ecosystem

1. `npx skills add mattpocock/skills -y` updates `.agents/skills/*` and `skills-lock.json`.
2. Reconcile the freshly installed upstream copy from `.agents/skills/setup-matt-pocock-skills/` into canonical `docs/ai/skills/setup-matt-pocock-skills/` if this canonical copy needs updating. Treat `.agents/skills/setup-matt-pocock-skills/` as a temporary Skills CLI import at this point; after `bun run skills:sync`, it is generated mirror output again.
3. Preserve or regenerate this `references/upstream.md` file with the current lock hash.
4. Run `bun run skills:sync` and `bun run skills:verify`.

This skill is **not** updated by `bun run skills:refresh-upstream`.
