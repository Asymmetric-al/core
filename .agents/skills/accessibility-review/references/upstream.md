---
source_name: ibelick/ui-skills (fixing-accessibility)
source_url: https://github.com/ibelick/ui-skills
source_type: github
upstream_path: skills/fixing-accessibility/SKILL.md
reviewed_commit: ce91b85952f76ec738242bcf8aefa8c68653592c
license: MIT
last_reviewed: 2026-07-15
---

# Upstream: fixing-accessibility

- **Copyright:** 2026 Julien Thibeaut
- **License:** MIT; see the upstream
  [`LICENSE`](https://github.com/ibelick/ui-skills/blob/ce91b85952f76ec738242bcf8aefa8c68653592c/LICENSE).
- **Discovery source:** the user-provided UI Skills/X catalog entry.

No upstream skill file is vendored verbatim. Core's `accessibility-review` is a
Core-authored adapter that keeps the useful prioritization of names, keyboard,
focus, semantics, forms, announcements, perception, and tool boundaries while
adding Base UI, `@asym/ui`, axe, Playwright, touch-token, and reduced-motion
constraints from this repository.

## Refresh workflow

1. Inspect the current `ibelick/ui-skills` skill, commit, and license.
2. Compare it with Core's frontend/testing rules, shared primitives, and test
   tooling; adapt only non-duplicative guidance.
3. Update the reviewed commit and date above.
4. Run `bun run skills:sync` and `bun run skills:verify`.

This skill is not updated by `bun run skills:refresh-upstream` today.
