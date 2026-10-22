---
source_name: mattpocock/skills (prototype)
source_url: https://github.com/mattpocock/skills
source_type: github
upstream_path: skills/engineering/prototype/SKILL.md
skills_lock_hash: 714de632d116bb73f65cdb5a882db15b9369a6713b9a47c0fad827848f0bfbe3
last_reviewed: 2026-10-22
reviewed_commit: 5beb35b040e3de97e54fa9e386d7e42d15c295c2
license: MIT
---

# Upstream: prototype

Canonical copy in this repo: `docs/ai/skills/prototype/` (mirrored to `.agents/skills/`, `.cursor/skills/`, and `.claude/skills/` via `bun run skills:sync`).

- **Repository:** https://github.com/mattpocock/skills
- **Upstream path:** `skills/engineering/prototype/SKILL.md`
- **Install via Skills CLI:** `npx skills add mattpocock/skills -y`

## Refresh from ecosystem

1. `npx skills add mattpocock/skills -y` updates `.agents/skills/*` and `skills-lock.json`.
2. Reconcile the freshly installed upstream copy from `.agents/skills/prototype/` into canonical `docs/ai/skills/prototype/` if this canonical copy needs updating. Treat `.agents/skills/prototype/` as a temporary Skills CLI import at this point; after `bun run skills:sync`, it is generated mirror output again.
3. Preserve or regenerate this `references/upstream.md` file with the current lock hash.
4. Run `bun run skills:sync` and `bun run skills:verify`.

This skill is **not** updated by `bun run skills:refresh-upstream`.

## Reviewed refresh, 2026-10-22

Complete reviewed upstream tree at `5beb35b040e3de97e54fa9e386d7e42d15c295c2`: SKILL.md, LOGIC.md, UI.md and agents/openai.yaml. Preserve the exact MIT notice in [UPSTREAM-LICENSE](UPSTREAM-LICENSE). Core keeps the stable prototype identity, explicit invocation metadata and native policy, frontend ownership, isolated route boundary, and user authorization for branch/commit/publication actions. The logic demo now uses one shareable HTML file; the primary-source artifact capture workflow replaces the old terminal/delete guidance.
