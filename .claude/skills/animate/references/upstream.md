---
source_name: emilkowalski/skills
source_url: https://github.com/emilkowalski/skills
source_path: skills/animate/
source_commit: d23d7f88a2e21c9e4b1418c7abe420f5c1052ba7
upstream_skill_commit: e879241fab3cdb22e8d95587cdbf40b57a88d7da
license: MIT
last_reviewed: 2026-08-29
---

# Upstream: animate

Canonical copy in this repo: `docs/ai/skills/animate/`, mirrored to
`.agents/skills/`, `.cursor/skills/`, and `.claude/skills/` by
`bun run skills:sync`.

- **Repository:** https://github.com/emilkowalski/skills
- **Reviewed pack commit:** `d23d7f88a2e21c9e4b1418c7abe420f5c1052ba7`
- **Source path:** `skills/animate/`
- **Vendored upstream files:** `SKILL.md` and `RECIPES.md`
- **License:** MIT; the exact upstream notice is preserved in
  [LICENSE.md](LICENSE.md).

## Refresh from upstream

1. Clone or fetch https://github.com/emilkowalski/skills and copy
   `skills/<upstream-slug>/` into `.agents/skills/<canonical-slug>/`.
   Vendor upstream `skills/prototype/` as `.agents/skills/emil-prototype/`.
2. Do **not** blindly run `npx skills add emilkowalski/skills -y`. That
   installer can overwrite Matt Pocock `.agents/skills/prototype/` and Core's
   `find-animation-opportunities` adapter.
3. Run `bun run skills:refresh-emilkowalski` to promote the lockfile-managed
   Emil trees while preserving marked Core overlays and provenance.
4. Review newly added or removed upstream skills and reconcile Core's Base UI,
   motion-token, reduced-motion, and routing constraints.
5. Run `bun run skills:sync` and `bun run skills:verify`.

## Repo-specific notes

- Content between `<!-- CORE-OVERLAY-START -->` and
  `<!-- CORE-OVERLAY-END -->` is owned by Core and preserved by the focused
  refresh command.
- `docs/ai/rules/frontend.md`, `emil-design-engineering`, and `anim`
  remain higher-priority implementation guidance.
- Prefer existing Core motion tokens over parallel duration or easing scales
  in `RECIPES.md`.
- Update `source_commit`, `upstream_skill_commit`, and `last_reviewed`
  whenever the vendored upstream changes.
