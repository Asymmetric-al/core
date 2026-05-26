---
source_name: payloadcms/skills (cms-migration skill)
source_url: https://github.com/payloadcms/skills
license: MIT
last_reviewed: 2026-05-16
vendored_commit: b87f7a8f6c6fd59c9e99d254b0a53e2934437c0d
---

# Upstream: CMS migration to Payload skill

Canonical copy in this repo: `docs/ai/skills/payloadcms-cms-migration/` (mirrored to `.cursor/skills/` and `.agents/skills/` via `bun run skills:sync`).

- **Repository:** https://github.com/payloadcms/skills
- **Upstream path:** `skills/cms-migration/` (`SKILL.md`, `reference/PAYLOAD-FIELD-REFERENCE.md`)
- **Public install (Skills CLI):** `npx skills add payloadcms/skills`

## Refresh from upstream

This skill is **not** updated by `bun run skills:refresh-upstream` today.

1. Clone or download https://github.com/payloadcms/skills at the desired commit (compare `skills/cms-migration/`).
2. Replace the contents of `docs/ai/skills/payloadcms-cms-migration/` **except** preserve or merge the **This repository** block at the top of `SKILL.md` if upstream overwrote it.
3. Update `vendored_commit` and `last_reviewed` in this file.
4. Run `bun run skills:sync` and `bun run skills:verify`.

## Notes for maintainers

- Do not copy secrets or customer export data into the repo.
- Migration plans that touch Supabase or shared APIs must stay aligned with **`docs/ai/rules/backend.md`** and **`docs/guides/architecture/data-access-boundary.md`**.
