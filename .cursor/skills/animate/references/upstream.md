---
source_name: emilkowalski/skills
source_url: https://github.com/emilkowalski/skills
source_path: skills/animate/
source_commit: 2d228630ba1446365f614a108cb8252f1feda202
upstream_skill_commit: 2d228630ba1446365f614a108cb8252f1feda202
license: MIT
last_reviewed: 2026-10-11
---

# Upstream: animate

Canonical copy in this repo: `docs/ai/skills/animate/`, mirrored to
`.agents/skills/`, `.cursor/skills/`, and `.claude/skills/` by
`bun run skills:sync`.

- **Repository:** https://github.com/emilkowalski/skills
- **Reviewed pack commit:** `2d228630ba1446365f614a108cb8252f1feda202`
- **Source path:** `skills/animate/`
- **Vendored upstream files:** `SKILL.md` and `RECIPES.md`
- **License:** MIT; the exact upstream notice is preserved in
  [LICENSE.md](LICENSE.md).

## Refresh from upstream

1. Fetch and review the upstream repository and record its commit.
2. Run `bun run skills:refresh-emilkowalski --emil-source-root=/path/to/reviewed/skills`
   to promote the reviewed upstream trees. Upstream `prototype` maps to
   `emil-prototype`; Core's animation-opportunity adapter remains separate.
3. Review newly added or removed upstream skills and reconcile Core's Base UI,
   motion-token, reduced-motion, and routing constraints.
4. Update the reviewed commit and date in these provenance files, then run
   `bun run skills:sync` and non-mutating `bun run skills:verify`.

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
