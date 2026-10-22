---
source_name: mattpocock/skills
source_url: https://github.com/mattpocock/skills
source_type: github
upstream_path: skills/engineering/triage/SKILL.md
skills_lock_hash: 917b0baf74be583e74f110857ed45df2766617f75c00baf61fd136d7af515edf
last_reviewed: 2026-10-22
source_path: skills/engineering/triage/
reviewed_commit: 5beb35b040e3de97e54fa9e386d7e42d15c295c2
license: MIT
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

## Reviewed refresh, 2026-10-22

- Source: `mattpocock/skills` at `5beb35b040e3de97e54fa9e386d7e42d15c295c2`.
- Complete upstream skill tree: `skills/engineering/triage/`; MIT notice: [LICENSE.md](LICENSE.md).
- Raw upstream `SKILL.md` SHA-256: `917b0baf74be583e74f110857ed45df2766617f75c00baf61fd136d7af515edf`.
- Preserve Core discovery metadata, explicit-only invocation, existing overlays and compatibility corrections. Raw upstream scripts are vendored data; none were executed during this refresh.
- Core keeps CONTEXT.md, CONTEXT-MAP.md and CONTEXT-FORMAT.md; upstream glossary filenames are remapped without renaming repository documents. Core TDD and authorization rules override generic seam, refactor and commit instructions.
