---
source_name: antfu/skills (vitest)
source_url: https://github.com/antfu/skills
source_type: github
upstream_path: skills/vitest/SKILL.md
reviewed_commit: a74f281a27dadc02397bc1a174b0f2c97531b6ae
skills_lock_hash: 0efd9cf8c56aada060d418d009cfe621a7915d0c73a958fe611985bc0c2fa4b8
license: MIT
last_reviewed: 2026-07-15
---

# Upstream: vitest

- **Copyright:** 2025-present Anthony Fu
- **License:** MIT; see the upstream
  [`LICENSE.md`](https://github.com/antfu/skills/blob/a74f281a27dadc02397bc1a174b0f2c97531b6ae/LICENSE.md).
- **Generated source:** upstream derives its references from Vitest docs.

The reviewed upstream skill targets Vitest 5 beta, while Core resolves Vitest
4.1.x. No upstream skill file or generated reference tree is vendored into the
canonical source. Core's adapter keeps the useful workflow topics—configuration,
filtering, mocking, environment selection, isolation, and coverage—but derives
commands and constraints from Core's checked-in Vitest 4 harness.

The optional ecosystem install remains recorded in `skills-lock.json`; the
canonical `docs/ai/skills/vitest/SKILL.md` is the routed authority inside Core.

## Refresh workflow

1. Read the exact Vitest version in `bun.lock`, the matching official Vitest
   docs, and Core's current config/setup/harness.
2. Inspect the current `antfu/skills` Vitest skill, commit, license, and target
   Vitest version.
3. Adapt only facts valid for Core's installed major version; update the
   reviewed commit, lock hash, and date above.
4. Run `bun run skills:sync` and `bun run skills:verify`.

This canonical adapter is not updated by `bun run skills:refresh-upstream`.
