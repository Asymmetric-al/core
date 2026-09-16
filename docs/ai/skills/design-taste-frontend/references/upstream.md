---
source_name: leonxlnx/taste-skill
source_url: https://github.com/leonxlnx/taste-skill
source_path: skills/taste-skill/
source_commit: ccbc15639c97057cbfcf32ecebc38ef716e4bb37
upstream_skill_commit: ccbc15639c97057cbfcf32ecebc38ef716e4bb37
license: MIT
last_reviewed: 2026-09-16
---

# Upstream: design-taste-frontend

Canonical copy in this repo: `docs/ai/skills/design-taste-frontend/`, mirrored to
`.agents/skills/`, `.cursor/skills/`, and `.claude/skills/` by
`bun run skills:sync`.

- **Repository:** https://github.com/leonxlnx/taste-skill
- **Reviewed pack commit:** `ccbc15639c97057cbfcf32ecebc38ef716e4bb37`
- **Source path:** `skills/taste-skill/`
- **License:** MIT; the exact upstream notice is preserved in
  [LICENSE.md](LICENSE.md).

## Refresh from upstream

1. Refresh the lockfile-managed skill with a targeted Skills CLI add:
   `npx skills add leonxlnx/taste-skill --skill design-taste-frontend -y`.
   Do **not** run `npx skills add emilkowalski/skills -y`.
2. Run the matching `bun run skills:refresh-*` / `skills:refresh-upstream
--only=leonxlnx/taste-skill` command so marked Core overlays and this provenance
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
