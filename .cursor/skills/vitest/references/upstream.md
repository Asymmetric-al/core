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

The reviewed upstream snapshot targets Vitest 5 beta; Core now resolves the
stable Vitest 5.0.5 release. No upstream skill file or generated reference tree is vendored into the
canonical source. Core's adapter keeps the useful workflow topics—configuration,
filtering, mocking, environment selection, isolation, and coverage—but derives
commands and constraints from Core's checked-in Vitest 5 harness rather than
assuming the snapshot's beta APIs match the installed release.

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

## Runtime requalification, October 21, 2026

Core's adapter was rechecked against Vitest 5.0.5 and its current official
[migration guide](https://vitest.dev/guide/migration/). The harness retains its
include scope, explicit mock clearing and isolated env defaults. The supported
`@vitest/coverage-v8@5.0.5` replaces the legacy raw collector, with measured
Istanbul reports, isolated-suite merging, TypeScript remapping, unexecuted
branches and threshold enforcement verified by the committed fixture. Default
reports cover imported source; a fixture-only filter also proves unimported
source reporting. Active configuration/helpers use `.mts` for native ESM loading. This runtime check does not claim a new upstream skill import or alter
the historical reviewed-commit metadata above.
