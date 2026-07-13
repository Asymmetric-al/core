---
source_name: repo-local router (prd-to-plan)
source_url: https://github.com/mattpocock/skills
source_type: repo-local-router
upstream_path: skills/engineering/to-spec/SKILL.md + skills/engineering/to-tickets/SKILL.md
skills_lock_hash: n/a
last_reviewed: 2026-07-09
---

# Upstream: prd-to-plan

Canonical copy in this repo: `docs/ai/skills/prd-to-plan/` (mirrored to
`.agents/skills/`, `.cursor/skills/`, and `.claude/skills/` via
`bun run skills:sync`).

This is a Core compatibility router, not a published upstream skill. The
current upstream flow is:

- **`to-spec`**: `skills/engineering/to-spec/SKILL.md`
- **`to-tickets`**: `skills/engineering/to-tickets/SKILL.md`
- **Install via Skills CLI:** `npx skills add mattpocock/skills -y`

## Refresh from ecosystem

1. `npx skills add mattpocock/skills -y` updates `.agents/skills/*` and
   `skills-lock.json`.
2. Refresh `docs/ai/skills/to-spec/` and `docs/ai/skills/to-tickets/`.
3. Keep this router pointing at the current spec/ticket flow.
4. Run `bun run skills:sync` and `bun run skills:verify`.
