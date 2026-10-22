---
source_name: mattpocock/skills
source_url: https://github.com/mattpocock/skills
source_type: github
upstream_path: skills/productivity/grilling/SKILL.md
skills_lock_hash: befdff1e27a1dfe2a294d5871169ac1afe16d983911daa4f32627514a48c1e15
last_reviewed: 2026-10-22
source_path: skills/productivity/grilling/
reviewed_commit: 5beb35b040e3de97e54fa9e386d7e42d15c295c2
license: MIT
---

# Upstream: grilling

Canonical copy in this repo: `docs/ai/skills/grilling/` (mirrored to `.agents/skills/`, `.cursor/skills/`, and `.claude/skills/` via `bun run skills:sync`).

- **Repository:** https://github.com/mattpocock/skills
- **Upstream path:** `skills/productivity/grilling/SKILL.md`
- **Install via Skills CLI:** `npx skills add mattpocock/skills -y`

## Refresh from ecosystem

1. `npx skills add mattpocock/skills -y` updates `.agents/skills/*` and `skills-lock.json`.
2. Reconcile the freshly installed upstream copy from `.agents/skills/grilling/` into canonical `docs/ai/skills/grilling/` if this canonical copy needs updating. Treat `.agents/skills/grilling/` as a temporary Skills CLI import at this point; after `bun run skills:sync`, it is generated mirror output again.
3. Preserve or regenerate this `references/upstream.md` file with the current lock hash.
4. Run `bun run skills:sync` and `bun run skills:verify`.

This skill is **not** updated by `bun run skills:refresh-upstream`.

## Reviewed refresh, 2026-10-22

- Source: `mattpocock/skills` at `5beb35b040e3de97e54fa9e386d7e42d15c295c2`.
- Complete upstream skill tree: `skills/productivity/grilling/`; MIT notice: [LICENSE.md](LICENSE.md).
- Raw upstream `SKILL.md` SHA-256: `befdff1e27a1dfe2a294d5871169ac1afe16d983911daa4f32627514a48c1e15`.
- Preserve Core discovery metadata, explicit-only invocation, existing overlays and compatibility corrections. Raw upstream scripts are vendored data; none were executed during this refresh.
- Core keeps CONTEXT.md, CONTEXT-MAP.md and CONTEXT-FORMAT.md; upstream glossary filenames are remapped without renaming repository documents. Core TDD and authorization rules override generic seam, refactor and commit instructions.
