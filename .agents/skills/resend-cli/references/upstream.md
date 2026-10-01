---
source_name: resend/resend-cli (resend-cli agent skill)
source_url: https://github.com/resend/resend-cli
license: MIT
last_reviewed: 2026-09-16
skills_lock_hash: 7ac3852492006d9439582db0a68e0ec21723aff4b89be799fe4e62361a12c47c
---

# Upstream: Resend CLI agent skill

Canonical copy in this repo: `docs/ai/skills/resend-cli/` (mirrored to `.cursor/skills/` and `.agents/skills/` via `bun run skills:sync`).

- **Repository:** https://github.com/resend/resend-cli
- **Latest release tag at review:** https://github.com/resend/resend-cli/releases/tag/v2.21.0
- **Announcement:** https://resend.com/blog/resend-cli-2
- **Upstream path:** `skills/resend-cli/` (includes `SKILL.md` and `references/*.md`)
- **CLI docs:** https://resend.com/docs/cli
- **Install via Skills CLI:** `npx skills add resend/resend-cli --skill resend-cli -y`

## Not the same as platform / SDK skills

- **`resend/resend-skills`** — generic Resend platform skill (send, inbound, agent inbox). In this repo it may appear under `.agents/skills/resend/` when installed via the Skills CLI. It does **not** replace this CLI skill.
- **App integration** — tenant Resend API keys, admin UI, routes, and webhooks are documented in `docs/guides/features/resend-integration.md`. Use that guide for product code; use **`resend-cli`** for the `resend` terminal binary, scripts, and CI/CD.

## Refresh from upstream

This skill is **not** copied by `bun run skills:refresh-upstream`.

1. `npx skills add resend/resend-cli --skill resend-cli -y` updates `.agents/skills/resend-cli/` and `skills-lock.json`.
2. Copy the skill tree into `docs/ai/skills/resend-cli/`, restoring the **This repository** overlay in `SKILL.md`.
3. Preserve this `references/upstream.md` file and update `last_reviewed`.
4. `bun run skills:sync` && `bun run skills:verify`

## Notes for maintainers

- Do not copy secrets, tokens, or environment-specific identifiers into skill content.
- Do not refresh this skill from `resend/resend-skills`; that package is a different CLI id (`resend`).
