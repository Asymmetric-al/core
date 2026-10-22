---
source_url: https://github.com/wshobson/agents
source_type: github
upstream_path: plugins/javascript-typescript/skills/typescript-advanced-types
reviewed_commit: 0874a27b17a22e2b7c2e2bcd725768e0803cad06
skills_lock_hash: c32101c65134d94ef1a3305ef486020b57be6408f97ed952c9c560e3fe04188d
license: MIT
last_reviewed: 2026-10-22
status: reviewed
ownership: ecosystem
---

# Upstream source

This complete skill tree is vendored from [wshobson/agents](https://github.com/wshobson/agents/tree/0874a27b17a22e2b7c2e2bcd725768e0803cad06/plugins/javascript-typescript/skills/typescript-advanced-types) at the immutable reviewed commit above. The installed Core slug is `typescript-advanced-types`; the license notice is retained at `references/LICENSE.md`. Core changes are adaptations, not upstream changes.

## Core adaptations

- Added marked Core applicability, ecosystem ownership, and non-executing maintenance overlay.

## Imported file inventory

- `SKILL.md`
- `references/details.md`
- `references/LICENSE.md`

## Refresh workflow

1. Review the exact upstream commit, complete tree, license, and diff. Do not advance a mutable branch implicitly or execute imported scripts, tests, installers, or lifecycle hooks as part of refresh.
2. Stage the whole reviewed source directory outside the live skill directory, retaining the license notice and this provenance. Preserve the marked Core overlay and every adaptation listed above; the maintenance audit retains raw and adapted file hashes.
3. Reconcile additions and deletions against the previous owned inventory before atomic publication to `.agents/skills/typescript-advanced-types`. Preserve user-owned extras explicitly rather than deleting them by inference.
4. Update the raw upstream `SKILL.md` hash and reviewed commit together; do not hash the adapted skill as if it were raw source.
5. The reviewed Core adapter is restored by `scripts/lib/ecosystem-skill-adapters.mjs` from the committed `ecosystem-core-guidance.json` and `ecosystem-core-overlays.json` configs under `scripts/refresh-overlays`. Review/update those transforms with upstream drift; they do not advance provenance automatically.
6. Run `bun run skills:sync` and non-mutating `bun run skills:verify`, then the focused metadata, reference, compatibility, and mirror tests. Bundled executables remain inert unless a separate authorized task needs them.
