---
source_name: jakubkrehel/skills
source_url: https://github.com/jakubkrehel/skills
source_path: skills/better-accessibility/
source_commit: 267330e1adfc66a718fb65fa6918c1f06d0a689e
upstream_skill_commit: 267330e1adfc66a718fb65fa6918c1f06d0a689e
license: MIT
last_reviewed: 2026-09-16
---

# Upstream: better-accessibility

Canonical copy in this repo: `docs/ai/skills/better-accessibility/`, mirrored to
`.agents/skills/`, `.cursor/skills/`, and `.claude/skills/` by
`bun run skills:sync`.

- **Repository:** https://github.com/jakubkrehel/skills
- **Reviewed pack commit:** `267330e1adfc66a718fb65fa6918c1f06d0a689e`
- **Source path:** `skills/better-accessibility/`
- **License:** MIT; the exact upstream notice is preserved in
  [LICENSE.md](LICENSE.md).

## Refresh from upstream

1. Refresh the lockfile-managed skill with a targeted Skills CLI add:
   `npx skills add jakubkrehel/skills --skill better-accessibility -y`.
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
