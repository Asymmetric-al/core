---
source_name: payloadcms/skills (payload skill)
source_url: https://github.com/payloadcms/skills
license: MIT
last_reviewed: 2026-05-16
vendored_commit: b87f7a8f6c6fd59c9e99d254b0a53e2934437c0d
---

# Upstream: Payload CMS agent skill

Canonical copy in this repo: `docs/ai/skills/payloadcms-payload/` (mirrored to `.cursor/skills/` and `.agents/skills/` via `bun run skills:sync`).

- **Repository:** https://github.com/payloadcms/skills
- **Upstream path:** `skills/payload/` (`SKILL.md`, `README.md`, `reference/*.md`)
- **Public install (Skills CLI):** `npx skills add payloadcms/skills` (installs into client skill dirs; this repo keeps a **canonical vendored copy** under `docs/ai/skills/` for deterministic routing in `AGENTS.md`)

## Refresh from upstream

This skill is **not** updated by `bun run skills:refresh-upstream` today.

1. Clone or download https://github.com/payloadcms/skills at the desired commit (compare `skills/payload/`).
2. Replace the contents of `docs/ai/skills/payloadcms-payload/` **except** keep or merge the **This repository** block at the top of `SKILL.md` if upstream overwrote it.
3. Update `vendored_commit` and `last_reviewed` in this file; refresh the attribution line at the top of `README.md` if that file is replaced.
4. Run `bun run skills:sync` and `bun run skills:verify`.

## Notes for maintainers

- Do not copy secrets, tokens, or environment-specific identifiers into skill content.
- Prefer the repo’s installed Payload version and `vendor/payload-upstream/` when resolving API drift versus generic upstream examples.
