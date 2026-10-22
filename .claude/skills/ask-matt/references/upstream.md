---
source_name: mattpocock/skills
source_url: https://github.com/mattpocock/skills
source_type: github
upstream_path: skills/engineering/ask-matt/SKILL.md
skills_lock_hash: 1371f5ce005de0992a44b137748bfb960a56948aa9871b405fe9d90b24332e3c
last_reviewed: 2026-10-22
source_path: skills/engineering/ask-matt/
reviewed_commit: 5beb35b040e3de97e54fa9e386d7e42d15c295c2
license: MIT
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

## Reviewed refresh, 2026-10-22

- Source: `mattpocock/skills` at `5beb35b040e3de97e54fa9e386d7e42d15c295c2`.
- Complete upstream skill tree: `skills/engineering/ask-matt/`; MIT notice: [LICENSE.md](LICENSE.md).
- Raw upstream `SKILL.md` SHA-256: `1371f5ce005de0992a44b137748bfb960a56948aa9871b405fe9d90b24332e3c`.
- Preserve Core discovery metadata, explicit-only invocation, existing overlays and compatibility corrections. Raw upstream scripts are vendored data; none were executed during this refresh.
- Core keeps CONTEXT.md, CONTEXT-MAP.md and CONTEXT-FORMAT.md; upstream glossary filenames are remapped without renaming repository documents. Core TDD and authorization rules override generic seam, refactor and commit instructions.
- Keep the installed Core flow. Do not introduce routes to uninstalled implement-spec, pr, retro, to-questionnaire or wait-what; the writing successor remains the kept writing-great-skills route.
- Keep all three prototype detour steps nested under main-flow step 2; conflict resolution remains a standalone kept snapshot.
