---
source_name: obra/superpowers
source_url: https://github.com/obra/superpowers
source_path: skills/test-driven-development/
source_commit: b36e0829c6d0140e93cfef2ca599b1b07d4a7797
upstream_skill_commit: b36e0829c6d0140e93cfef2ca599b1b07d4a7797
license: MIT
last_reviewed: 2026-09-16
---

# Upstream: test-driven-development

Canonical copy in this repo: `docs/ai/skills/test-driven-development/`, mirrored to
`.agents/skills/`, `.cursor/skills/`, and `.claude/skills/` by
`bun run skills:sync`.

- **Repository:** https://github.com/obra/superpowers
- **Reviewed pack commit:** `b36e0829c6d0140e93cfef2ca599b1b07d4a7797`
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
