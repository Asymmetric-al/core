---
source_name: mattpocock/skills (ask-matt)
source_url: https://github.com/mattpocock/skills
source_type: github
upstream_path: skills/engineering/ask-matt/SKILL.md
skills_lock_hash: 36bdc2237661cbbe109823c6650223cc127bc7534f64edd88059152fa7300711
last_reviewed: 2026-07-09
---

# Upstream: ask-matt

Canonical copy in this repo: `docs/ai/skills/ask-matt/` (mirrored to `.agents/skills/`, `.cursor/skills/`, and `.claude/skills/` via `bun run skills:sync`).

- **Repository:** https://github.com/mattpocock/skills
- **Upstream path:** `skills/engineering/ask-matt/SKILL.md`
- **Install via Skills CLI:** `npx skills add mattpocock/skills -y`

## Refresh from ecosystem

1. `npx skills add mattpocock/skills -y` updates `.agents/skills/*` and `skills-lock.json`.
2. Copy the relevant skill tree from `.agents/skills/ask-matt/` into `docs/ai/skills/ask-matt/` if this canonical copy needs updating.
3. Reapply the Core overlay in `SKILL.md`: remove `/teach` and
   `/writing-great-skills` recommendations unless those skills are intentionally
   installed in this repo.
4. Preserve or regenerate this `references/upstream.md` file with the current
   lock hash.
5. Run `bun run skills:sync` and `bun run skills:verify`.

This skill is **not** updated by `bun run skills:refresh-upstream` today.
