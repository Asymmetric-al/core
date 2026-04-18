---
source_name: resend/resend-cli (resend-cli agent skill)
source_url: https://github.com/resend/resend-cli
license: MIT
last_reviewed: 2026-04-16
---

# Upstream: Resend CLI agent skill

Canonical copy in this repo: `docs/ai/skills/resend-cli/` (mirrored to `.cursor/skills/` and `.agents/skills/` via `bun run skills:sync`).

- **Repository:** https://github.com/resend/resend-cli
- **Release tag (vendored):** https://github.com/resend/resend-cli/releases/tag/v2.0.0 (CLI **2.0.0**)
- **Announcement:** https://resend.com/blog/resend-cli-2
- **Upstream path:** `skills/resend-cli/` (includes `SKILL.md` and `references/*.md`)
- **CLI docs:** https://resend.com/docs/cli

## Not the same as platform / SDK skills

- **`resend/resend-skills`** — generic Resend platform skill (send, inbound, agent inbox). In this repo it may appear under `.agents/skills/resend/` when installed via the Skills CLI. It does **not** replace this CLI skill.
- **App integration** — tenant Resend API keys, admin UI, routes, and webhooks are documented in `docs/guides/features/resend-integration.md`. Use that guide for product code; use **`resend-cli`** for the `resend` terminal binary, scripts, and CI/CD.

## Refresh from upstream

This skill is **not** copied by `bun run skills:refresh-upstream` (that script is only for Supabase skills installed via `npx skills add supabase/agent-skills`).

1. Download the tagged tree (e.g. tarball for `v2.0.0`) or compare against https://github.com/resend/resend-cli/tree/v2.0.0/skills/resend-cli
2. Replace `docs/ai/skills/resend-cli/` contents with upstream `skills/resend-cli/` (preserve any future **This repository** section in `SKILL.md` if you add one)
3. Update `last_reviewed` in this file when you bump the vendored tag
4. `bun run skills:sync` && `bun run skills:verify`

## Notes for maintainers

- Do not copy secrets, tokens, or environment-specific identifiers into skill content.
- If `npx skills add resend/resend-cli` (or equivalent) is confirmed to install into `.agents/skills/resend-cli`, consider adding `resend-cli` to `scripts/refresh-upstream-skills.mjs` and `skills-lock.json` using the same pattern as Supabase.
