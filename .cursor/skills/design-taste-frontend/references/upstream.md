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

## Reviewed Core safety repairs, 2026-10-22

Core replaces the chart asset's dynamic HTML interpolation with explicit DOM
nodes and text content. Tooltip labels, series names, formatter output, ring
labels/subtitles, plan notes, and bullet labels remain literal text; the intended
emphasis, layout, tracks, and target markers remain structured DOM. The reviewed
raw chart asset SHA-256 is
`89071120bd09eb276d9e568bab433ed035ea8b3a1b72750a1fa204a63e3d4ab4`.
The data-only chart adapter normalizes with the trusted repository formatter,
applies six exact reviewed replacements, and rejects unknown or mixed source
before writing. Synthetic DOM fixtures reproduce the upstream markup injection
and exercise the repaired public chart API; no real application or business data
was used.

Core removes the embedded filesystem servers from inspect/scenes. Both tools
require an explicit HTTP(S) dev-server URL; local paths and file/data/script URLs
are rejected before browser startup. Follow Core's existing development-server
workflow for local pages. This portable adapter never grants browser content an
HTTP view of the checkout.

Scene screenshot filenames derive only from a bounded scene index and the
desktop/phone viewport name. Original scene IDs remain report data and render
through text content in contact-sheet captions. The data-only preview adapter
accepts only hash-reviewed raw or repaired tool files and copies a checked Core
helper template. Synthetic fixtures verify CLI refusal, URL handoff, literal
captions and generated filenames; no repository secrets or real browsers are
used by these tests.
