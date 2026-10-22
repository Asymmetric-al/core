---
source_name: leonxlnx/taste-skill
source_url: https://github.com/leonxlnx/taste-skill
source_path: skills/redesign-skill/
source_commit: ccbc15639c97057cbfcf32ecebc38ef716e4bb37
upstream_skill_commit: ccbc15639c97057cbfcf32ecebc38ef716e4bb37
license: MIT
last_reviewed: 2026-09-16
upstream_status: kept-snapshot
last_checked: 2026-10-22
checked_upstream_commit: 6010f91a9935f1c167dfc500fb1a475681892e6b
---

# Upstream: redesign-existing-projects

Canonical copy in this repo: `docs/ai/skills/redesign-existing-projects/`, mirrored to
`.agents/skills/`, `.cursor/skills/`, and `.claude/skills/` by
`bun run skills:sync`.

- **Repository:** https://github.com/leonxlnx/taste-skill
- **Reviewed pack commit:** `ccbc15639c97057cbfcf32ecebc38ef716e4bb37`
- **Source path:** `skills/redesign-skill/`
- **License:** MIT; the exact upstream notice is preserved in
  [LICENSE.md](LICENSE.md).

## Refresh from upstream

1. Refresh the lockfile-managed skill with a targeted Skills CLI add:
   `npx skills add leonxlnx/taste-skill --skill redesign-existing-projects -y`.
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

## Kept snapshot, 2026-10-22

The current upstream tree at 6010f91a9935f1c167dfc500fb1a475681892e6b no longer publishes skills/redesign-skill/. This is a **kept snapshot**: preserve the existing skill body, support files, license, discovery metadata and lock identity. The current upstream commit is an availability check, not the source revision of these retained bytes. Do not import a successor or remove this skill during refresh.
