---
source_name: emilkowalski/skills (find-animation-opportunities)
source_url: https://github.com/emilkowalski/skills
source_type: github
upstream_path: skills/find-animation-opportunities/SKILL.md
reviewed_commit: 6bf24434f7730ad169077756cf9c7cd7bd675fc6
license: MIT
last_reviewed: 2026-07-15
---

# Upstream: find-animation-opportunities

- **Copyright:** 2026 Emil Kowalski
- **License:** MIT; see the upstream
  [`LICENSE`](https://github.com/emilkowalski/skills/blob/6bf24434f7730ad169077756cf9c7cd7bd675fc6/LICENSE).
- **Announcement source:**
  https://x.com/emilkowalski/status/2077404975555031509

No upstream skill file is vendored verbatim. Core's adapter preserves the
read-only, restraint-first opportunity gate and the required rejected-candidate
report. It replaces upstream literal durations, easings, scales, Radix examples,
height animation, and per-skill reduced-motion CSS with Core's existing tokens,
Base UI primitives, shared press/hover utilities, route-transition ownership,
layout-safety rules, and global reduced-motion baseline.

The skill remains separate from `improve-animations`: this one finds additive
opportunities and non-opportunities, while `improve-animations` audits existing
motion and writes implementation plans.

## Refresh workflow

1. Inspect the current upstream skill, repository license, and announcement.
2. Compare its opportunity gates with Core's frontend rulebook, current motion
   tokens/primitives, `emil-design-engineering`, `anim`, and
   `improve-animations`.
3. Adapt only non-duplicative guidance; update the reviewed commit and date.
4. Run `bun run skills:sync` and `bun run skills:verify`.

This Core-authored adapter is not lockfile-managed and is not updated by
`bun run skills:refresh-emilkowalski` today.
