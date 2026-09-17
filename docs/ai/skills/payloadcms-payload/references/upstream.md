---
source_name: payloadcms/skills (payload)
source_url: https://github.com/payloadcms/skills
license: MIT
last_reviewed: 2026-09-16
skills_lock_hash: 050fc66234ef54906e34a1c0f5209ad7558f9adc59a7a0efd4db342f81427e20
---

# Upstream: payloadcms-payload

Canonical copy in this repo: `docs/ai/skills/payloadcms-payload/` (mirrored to `.cursor/skills/` and `.agents/skills/` via `bun run skills:sync`).

- **Repository:** https://github.com/payloadcms/skills
- **Upstream path:** `skills/payload/`
- **Install via Skills CLI:** `npx skills add payloadcms/skills -y`

## Refresh from upstream

1. `npx skills add payloadcms/skills -y` refreshes `.agents/skills/payload` and `.agents/skills/cms-migration`.
2. Copy the matching upstream skill into `docs/ai/skills/payloadcms-payload/`.
3. Re-apply repo-specific frontmatter, triggers, and workflow sections if the vendor copy overwrote them.
4. Run `bun run skills:sync` and `bun run skills:verify`.

## Notes for maintainers

- Do not copy secrets, tokens, or environment-specific identifiers into skill content.
- Prefer the repo's installed Payload version and `vendor/payload-upstream/` when resolving API drift versus generic upstream examples.
