---
source_name: bendc/frontend-guidelines
source_url: https://github.com/bendc/frontend-guidelines
license: unknown
last_reviewed: 2026-05-15
---

# Upstream: bendc frontend guidelines

Canonical skill in this repo: `docs/ai/skills/bendc-frontend-guidelines/` (mirrored to `.cursor/skills/` and `.agents/skills/` via `bun run skills:sync`).

- **Repository:** https://github.com/bendc/frontend-guidelines
- **Primary upstream doc:** `README.md` on the default branch (`master` at last refresh)
- **Vendored copy:** `references/readme-original.md` (plus the short attribution block prepended there)

## Refresh from upstream

This skill is **not** installed via the Skills CLI and is **not** updated by `bun run skills:refresh-upstream`.

1. Download the current `README.md` from https://raw.githubusercontent.com/bendc/frontend-guidelines/master/README.md
2. Replace `references/readme-original.md` body with upstream content, preserving (or re-adding) the short **Vendored reference** block at the top of that file
3. Re-read upstream for substantive changes; update `SKILL.md` **Precedence** or workflow bullets if guidance diverges from this repo
4. Bump `last_reviewed` in this file
5. Run `bun run skills:sync` and `bun run skills:verify`

## Notes for maintainers

- Do not copy secrets or environment-specific values into skill content.
- The skill’s `SKILL.md` is the router: it tells agents when to use bendc guidance and when repo rules (`docs/ai/rules/frontend.md`, motion skills, TypeScript/ESLint) take precedence.
- Before refreshing or expanding the vendored copy, re-check upstream license or permission and keep the attribution block. If the license is still unknown, preserve `license: unknown` metadata and do not present the vendored text as licensed source material.
