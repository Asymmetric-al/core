---
source_name: obra/superpowers
source_url: https://github.com/obra/superpowers
source_path: skills/test-driven-development/
source_commit: 2ce8aa15d05bd57213e6f746f953aafb7ded7a8b
upstream_skill_commit: 2ce8aa15d05bd57213e6f746f953aafb7ded7a8b
license: MIT
last_reviewed: 2026-10-22
reviewed_commit: 2ce8aa15d05bd57213e6f746f953aafb7ded7a8b
skills_lock_hash: 64b03fce4aee5a97a93160cea8111f3ba13a17b7c001db4bd5836d67fd10705d
---

# Upstream: test-driven-development

Canonical copy in this repo: `docs/ai/skills/test-driven-development/`, mirrored to
`.agents/skills/`, `.cursor/skills/`, and `.claude/skills/` by
`bun run skills:sync`.

- **Repository:** https://github.com/obra/superpowers
- **Reviewed pack commit:** `2ce8aa15d05bd57213e6f746f953aafb7ded7a8b`
- **Source path:** `skills/test-driven-development/`
- **License:** MIT; the exact upstream notice is preserved in
  [LICENSE.md](LICENSE.md).

## Refresh from upstream

1. Refresh the lockfile-managed skill with a targeted Skills CLI add:
   `npx skills add obra/superpowers --skill test-driven-development -y`.
   Do **not** run `npx skills add emilkowalski/skills -y`.
2. Run the matching `bun run skills:refresh-*` / `skills:refresh-upstream
--only=obra/superpowers` command so marked Core overlays and this provenance
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

- Source: `obra/superpowers` at `2ce8aa15d05bd57213e6f746f953aafb7ded7a8b`.
- Complete upstream skill tree: `skills/test-driven-development/`; MIT notice: [LICENSE.md](LICENSE.md).
- Raw upstream `SKILL.md` SHA-256: `64b03fce4aee5a97a93160cea8111f3ba13a17b7c001db4bd5836d67fd10705d`.
- Preserve Core discovery metadata, explicit-only invocation, existing overlays and compatibility corrections. Raw upstream scripts are vendored data; none were executed during this refresh.
