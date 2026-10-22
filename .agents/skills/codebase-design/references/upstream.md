---
source_name: mattpocock/skills
source_url: https://github.com/mattpocock/skills
source_type: github
upstream_path: skills/engineering/codebase-design/SKILL.md
skills_lock_hash: 2c20617f87ec8af6a434859f381b2f061a69b530444e74eb39e78bb016a6d1e2
last_reviewed: 2026-10-22
source_path: skills/engineering/codebase-design/
reviewed_commit: 5beb35b040e3de97e54fa9e386d7e42d15c295c2
license: MIT
---

# Upstream: codebase-design

Canonical copy in this repo: `docs/ai/skills/codebase-design/` (mirrored to `.agents/skills/`, `.cursor/skills/`, and `.claude/skills/` via `bun run skills:sync`).

- **Repository:** https://github.com/mattpocock/skills
- **Upstream path:** `skills/engineering/codebase-design/SKILL.md`
- **Install via Skills CLI:** `npx skills add mattpocock/skills -y`

## Refresh from ecosystem

1. `npx skills add mattpocock/skills -y` updates `.agents/skills/*` and `skills-lock.json`.
2. Reconcile the freshly installed upstream copy from `.agents/skills/codebase-design/` into canonical `docs/ai/skills/codebase-design/` if this canonical copy needs updating. Treat `.agents/skills/codebase-design/` as a temporary Skills CLI import at this point; after `bun run skills:sync`, it is generated mirror output again.
3. Preserve or regenerate this `references/upstream.md` file with the current lock hash.
4. Run `bun run skills:sync` and `bun run skills:verify`.

This skill is **not** updated by `bun run skills:refresh-upstream`.

## Reviewed refresh, 2026-10-22

- Source: `mattpocock/skills` at `5beb35b040e3de97e54fa9e386d7e42d15c295c2`.
- Complete upstream skill tree: `skills/engineering/codebase-design/`; MIT notice: [LICENSE.md](LICENSE.md).
- Raw upstream `SKILL.md` SHA-256: `2c20617f87ec8af6a434859f381b2f061a69b530444e74eb39e78bb016a6d1e2`.
- Preserve Core discovery metadata, explicit-only invocation, existing overlays and compatibility corrections. Raw upstream scripts are vendored data; none were executed during this refresh.
- Core keeps CONTEXT.md, CONTEXT-MAP.md and CONTEXT-FORMAT.md; upstream glossary filenames are remapped without renaming repository documents. Core TDD and authorization rules override generic seam, refactor and commit instructions.
