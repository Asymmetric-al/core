---
source_name: pbakaus/impeccable
source_url: https://github.com/pbakaus/impeccable
source_type: github
upstream_path: .agents/skills/impeccable/SKILL.md
skills_lock_hash: fa0cb3ef01a25b9094266109a63c1d01d4b2d4973f75b324f5c4ad7e568d148f
last_reviewed: 2026-09-16
---

# Upstream: impeccable

Canonical copy in this repo: `docs/ai/skills/impeccable/` (mirrored to `.cursor/skills/` and `.agents/skills/` via `bun run skills:sync`).

- **Repository:** https://github.com/pbakaus/impeccable
- **Skills CLI skill id:** `impeccable` (there is no separate `critique` id upstream)
- **Install via Skills CLI:** `npx skills add https://github.com/pbakaus/impeccable --skill impeccable -y`

## Refresh from ecosystem

1. `npx skills add https://github.com/pbakaus/impeccable --skill impeccable -y` updates `.agents/skills/impeccable/` and `skills-lock.json`.
2. Copy the skill tree into `docs/ai/skills/impeccable/` if the canonical copy needs updating.
3. Preserve this `references/upstream.md` file.
4. Run `bun run skills:sync` and `bun run skills:verify`.

Subordinate to **`docs/ai/rules/frontend.md`** for app UI work in this monorepo.

This skill is **not** updated by `bun run skills:refresh-upstream` today.
