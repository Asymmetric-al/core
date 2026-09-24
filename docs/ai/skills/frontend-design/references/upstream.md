---
source_name: anthropics/skills
source_url: https://github.com/anthropics/skills
source_path: skills/frontend-design/
source_commit: 34040c9c568585f6929bedeaad110ad08f079624
upstream_skill_commit: 34040c9c568585f6929bedeaad110ad08f079624
license: Apache-2.0
last_reviewed: 2026-09-16
---

# Upstream: frontend-design

Canonical copy in this repo: `docs/ai/skills/frontend-design/`, mirrored to
`.agents/skills/`, `.cursor/skills/`, and `.claude/skills/` by
`bun run skills:sync`.

- **Repository:** https://github.com/anthropics/skills
- **Reviewed pack commit:** `34040c9c568585f6929bedeaad110ad08f079624`
- **Source path:** `skills/frontend-design/`
- **License:** Apache-2.0; the exact upstream notice is preserved in
  [LICENSE.md](LICENSE.md).

## Refresh from upstream

1. Refresh the lockfile-managed skill with a targeted Skills CLI add:
   `npx skills add anthropics/skills --skill frontend-design -y`.
   Do **not** run `npx skills add emilkowalski/skills -y`.
2. Run the matching `bun run skills:refresh-*` / `skills:refresh-upstream
--only=anthropics/skills` command so marked Core overlays and this provenance
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
