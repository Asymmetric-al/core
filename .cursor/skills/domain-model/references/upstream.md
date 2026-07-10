---
source_name: repo-local alias (domain-model)
source_url: https://github.com/mattpocock/skills
source_type: repo-local-alias
upstream_path: skills/engineering/domain-modeling/SKILL.md
skills_lock_hash: n/a
last_reviewed: 2026-07-09
---

# Upstream: domain-model

Canonical copy in this repo: `docs/ai/skills/domain-model/` (mirrored to
`.agents/skills/`, `.cursor/skills/`, and `.claude/skills/` via
`bun run skills:sync`).

This is a Core compatibility alias, not a published upstream skill. The current
upstream skill is `domain-modeling`:

- **Repository:** https://github.com/mattpocock/skills
- **Upstream path:** `skills/engineering/domain-modeling/SKILL.md`
- **Install via Skills CLI:** `npx skills add mattpocock/skills -y`

## Refresh from ecosystem

1. `npx skills add mattpocock/skills -y` updates
   `.agents/skills/domain-modeling/` and `skills-lock.json`.
2. Refresh `docs/ai/skills/domain-modeling/` from that source.
3. Keep this alias pointing at `docs/ai/skills/domain-modeling/SKILL.md`.
4. Run `bun run skills:sync` and `bun run skills:verify`.
