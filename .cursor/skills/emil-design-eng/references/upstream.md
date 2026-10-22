---
source_name: emilkowalski/skills
source_url: https://github.com/emilkowalski/skills
source_path: skills/emil-design-eng/
source_commit: 2d228630ba1446365f614a108cb8252f1feda202
upstream_skill_commit: 2d228630ba1446365f614a108cb8252f1feda202
license: MIT
last_reviewed: 2026-10-22
reviewed_commit: 2d228630ba1446365f614a108cb8252f1feda202
skills_lock_hash: ffbe68e6007fb42cb8149f089b400a1ca007d59ba23e8948e2be4476f3175939
---

# Upstream: emil-design-eng

Canonical copy in this repo: `docs/ai/skills/emil-design-eng/`, mirrored to
`.agents/skills/`, `.cursor/skills/`, and `.claude/skills/` by
`bun run skills:sync`.

- **Repository:** https://github.com/emilkowalski/skills
- **Reviewed pack commit:** `2d228630ba1446365f614a108cb8252f1feda202`
- **Source path:** `skills/emil-design-eng/`
- **Vendored upstream files:** `SKILL.md`
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
- Overlay description suffix keeps this skill a craft companion after Core's
  frontend, `emil-design-engineering`, and `anim` guidance.
- Update `source_commit`, `upstream_skill_commit`, and `last_reviewed`
  whenever the vendored upstream changes.

## Reviewed refresh, 2026-10-22

- Source: `emilkowalski/skills` at `2d228630ba1446365f614a108cb8252f1feda202`.
- Complete upstream skill tree: `skills/emil-design-eng/`; MIT notice: [LICENSE.md](LICENSE.md).
- Raw upstream `SKILL.md` SHA-256: `ffbe68e6007fb42cb8149f089b400a1ca007d59ba23e8948e2be4476f3175939`.
- Preserve Core discovery metadata, explicit-only invocation, existing overlays and compatibility corrections. Raw upstream scripts are vendored data; none were executed during this refresh.
