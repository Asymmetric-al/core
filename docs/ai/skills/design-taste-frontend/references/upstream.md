---
source_name: leonxlnx/taste-skill
source_url: https://github.com/leonxlnx/taste-skill
source_path: skills/taste-skill/
source_commit: 6010f91a9935f1c167dfc500fb1a475681892e6b
upstream_skill_commit: 6010f91a9935f1c167dfc500fb1a475681892e6b
license: MIT
last_reviewed: 2026-10-22
reviewed_commit: 6010f91a9935f1c167dfc500fb1a475681892e6b
skills_lock_hash: d955dae4ba8ab2d994f4bb06b4bf412a1d9875433a8597939c391f4bae91dd7a
---

# Upstream: design-taste-frontend

Canonical copy in this repo: `docs/ai/skills/design-taste-frontend/`, mirrored to
`.agents/skills/`, `.cursor/skills/`, and `.claude/skills/` by
`bun run skills:sync`.

- **Repository:** https://github.com/leonxlnx/taste-skill
- **Reviewed pack commit:** `6010f91a9935f1c167dfc500fb1a475681892e6b`
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

## Reviewed refresh, 2026-10-22

- Source: `leonxlnx/taste-skill` at `6010f91a9935f1c167dfc500fb1a475681892e6b`.
- Complete upstream skill tree: `skills/taste-skill/`; MIT notice: [LICENSE.md](LICENSE.md).
- Raw upstream `SKILL.md` SHA-256: `d955dae4ba8ab2d994f4bb06b4bf412a1d9875433a8597939c391f4bae91dd7a`.
- Preserve Core discovery metadata, explicit-only invocation, existing overlays and compatibility corrections. Raw upstream scripts are vendored data; none were executed during this refresh.
- Upstream v2 has folded discovery metadata and a complete reference/library/assets/scripts payload. Core retains explicit-only marketing exploration and its original discovery fields; generic app-screen recipes do not override Core product styling or owners. Review the source inventory before promotion; do not run the upstream installer or imported scripts.
