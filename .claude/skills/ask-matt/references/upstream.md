---
source_name: mattpocock/skills (ask-matt)
source_url: https://github.com/mattpocock/skills
source_type: github
upstream_path: skills/engineering/ask-matt/SKILL.md
skills_lock_hash: b25d86fb36b1d294eeead5d7db529f86135f9671f2afcd607579a63bb2213769
last_reviewed: 2026-09-16
---

# Upstream: ask-matt

Canonical copy in this repo: `docs/ai/skills/ask-matt/` (mirrored to `.agents/skills/`, `.cursor/skills/`, and `.claude/skills/` via `bun run skills:sync`).

- **Repository:** https://github.com/mattpocock/skills
- **Upstream path:** `skills/engineering/ask-matt/SKILL.md`
- **Install via Skills CLI:** `npx skills add mattpocock/skills -y`

## Refresh from ecosystem

1. `npx skills add mattpocock/skills -y` updates `.agents/skills/*` and `skills-lock.json`.
2. Run `bun run skills:refresh-ask-matt` (`--only=mattpocock/skills`) to copy
   `.agents/skills/ask-matt/` into canonical `docs/ai/skills/ask-matt/` while
   preserving this provenance file. Treat `.agents/skills/ask-matt/` as a
   temporary Skills CLI import at this point; after `bun run skills:sync`, it
   is generated mirror output again.
3. The refresh restores the marked `<!-- CORE-OVERLAY-START -->` grill-depth
   step so `/grill-for-unknowns` remains on the main flow, then remaps the
   writing-for-agents successor bullet to kept `/writing-great-skills`. Core
   does not vendor that successor.
4. Preserve or regenerate this `references/upstream.md` file with the current
   lock hash.
5. Run `bun run skills:sync` and `bun run skills:verify`.

This skill is updated by `bun run skills:refresh-ask-matt` after a Skills CLI
add. Full `bun run skills:refresh-upstream` skips the group when
`.agents/skills/ask-matt` is missing.
