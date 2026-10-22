---
source_name: mattpocock/skills
source_url: https://github.com/mattpocock/skills
source_type: github
upstream_path: skills/engineering/setup-matt-pocock-skills/SKILL.md
skills_lock_hash: f148858ffb7f63c03c06fca06e6fdb1d91a35c6b293244b8fdfacd5f4cc028c4
last_reviewed: 2026-10-22
source_path: skills/engineering/setup-matt-pocock-skills/
reviewed_commit: 5beb35b040e3de97e54fa9e386d7e42d15c295c2
license: MIT
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

## Reviewed refresh, 2026-10-22

- Source: `mattpocock/skills` at `5beb35b040e3de97e54fa9e386d7e42d15c295c2`.
- Complete upstream skill tree: `skills/engineering/setup-matt-pocock-skills/`; MIT notice: [LICENSE.md](LICENSE.md).
- Raw upstream `SKILL.md` SHA-256: `f148858ffb7f63c03c06fca06e6fdb1d91a35c6b293244b8fdfacd5f4cc028c4`.
- Preserve Core discovery metadata, explicit-only invocation, existing overlays and compatibility corrections. Raw upstream scripts are vendored data; none were executed during this refresh.
- Core keeps CONTEXT.md, CONTEXT-MAP.md and CONTEXT-FORMAT.md; upstream glossary filenames are remapped without renaming repository documents. Core TDD and authorization rules override generic seam, refactor and commit instructions.
