---
source_name: jakubkrehel/skills
source_url: https://github.com/jakubkrehel/skills
source_path: skills/better-layout/
source_commit: 4c66b1fa86e9ab70187b43d7da9b6fdb29f2ef63
upstream_skill_commit: 4c66b1fa86e9ab70187b43d7da9b6fdb29f2ef63
license: MIT
last_reviewed: 2026-10-22
reviewed_commit: 4c66b1fa86e9ab70187b43d7da9b6fdb29f2ef63
skills_lock_hash: 8c5883ccb23c27c39b7c58d101154ff35e032410e0dc4794be9ab7fe070c2297
---

# Upstream: better-layout

Canonical copy in this repo: `docs/ai/skills/better-layout/`, mirrored to
`.agents/skills/`, `.cursor/skills/`, and `.claude/skills/` by
`bun run skills:sync`.

- **Repository:** https://github.com/jakubkrehel/skills
- **Reviewed pack commit:** `4c66b1fa86e9ab70187b43d7da9b6fdb29f2ef63`
- **Source path:** `skills/better-layout/`
- **License:** MIT; the exact upstream notice is preserved in
  [LICENSE.md](LICENSE.md).

## Refresh from upstream

1. Refresh the lockfile-managed skill with a targeted Skills CLI add:
   `npx skills add jakubkrehel/skills --skill better-layout -y`.
   Do **not** run `npx skills add emilkowalski/skills -y`.
2. Run the matching `bun run skills:refresh-*` / `skills:refresh-upstream
--only=jakubkrehel/skills` command so marked Core overlays and this provenance
   file are preserved.
3. Review newly added or removed upstream files against Core's Base UI,
   `base-maia`, and routing constraints.
4. Run `bun run skills:sync` and `bun run skills:verify`.

## Repo-specific notes

- Content between `<!-- CORE-OVERLAY-START -->` and
  `<!-- CORE-OVERLAY-END -->` is owned by Core and preserved by the focused
  refresh command.
- `docs/ai/rules/frontend.md`, Base UI, and `base-maia` remain
  higher-priority than generic upstream visual recipes.
- Update `source_commit`, `upstream_skill_commit`, and `last_reviewed`
  whenever the vendored upstream changes.

## Reviewed refresh, 2026-10-22

- Source: `jakubkrehel/skills` at `4c66b1fa86e9ab70187b43d7da9b6fdb29f2ef63`.
- Complete upstream skill tree: `skills/better-layout/`; MIT notice: [LICENSE.md](LICENSE.md).
- Raw upstream `SKILL.md` SHA-256: `8c5883ccb23c27c39b7c58d101154ff35e032410e0dc4794be9ab7fe070c2297`.
- Preserve Core discovery metadata, explicit-only invocation, existing overlays and compatibility corrections. Raw upstream scripts are vendored data; none were executed during this refresh.
