---
source_name: emilkowalski/skills
source_url: https://github.com/emilkowalski/skills
source_path: skills/review-animations/
source_commit: 7bb7061b5cf7de15ea1aeaf00fbd9e6592a20fce
upstream_skill_commit: f736679c420f34e5a63d2dfdc74db35520d75a7b
license: MIT
last_reviewed: 2026-07-11
---

# Upstream: review-animations

Canonical copy in this repo: `docs/ai/skills/review-animations/`, mirrored to
`.agents/skills/`, `.cursor/skills/`, and `.claude/skills/` by
`bun run skills:sync`.

- **Repository:** https://github.com/emilkowalski/skills
- **Reviewed pack commit:** `7bb7061b5cf7de15ea1aeaf00fbd9e6592a20fce`
- **Source path:** `skills/review-animations/`
- **Vendored upstream files:** `SKILL.md` and `STANDARDS.md`
- **License:** MIT; the exact upstream notice is preserved in
  [LICENSE.md](LICENSE.md).

## Refresh from upstream

1. Run `npx --yes skills@latest add emilkowalski/skills -y`.
2. Run `bun run skills:refresh-emilkowalski` to promote all five installed
   trees while preserving marked Core overlays and provenance.
3. Review the upstream tree for added or removed skills and reconcile Core's
   Base UI, motion-token, reduced-motion, and routing constraints.
4. Run `bun run skills:sync` and `bun run skills:verify`.

## Repo-specific notes

- Content between `<!-- CORE-OVERLAY-START -->` and
  `<!-- CORE-OVERLAY-END -->` is owned by Core and preserved by the focused
  refresh command.
- `docs/ai/rules/frontend.md`, `emil-design-engineering`, and `anim`
  remain higher-priority implementation guidance.
- Core qualifies the general 300ms duration rule with the documented
  modal/drawer exception, capped at 500ms and justified above 300ms.
- Update `source_commit`, `upstream_skill_commit`, and `last_reviewed`
  whenever the vendored upstream changes.
