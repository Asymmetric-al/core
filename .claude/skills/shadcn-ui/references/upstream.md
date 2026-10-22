---
source_url: https://github.com/google-labs-code/stitch-skills
source_type: github
upstream_path: plugins/stitch-build/skills/shadcn-ui
reviewed_commit: 0337446dadde6f8c94210444e2aa9d546126480f
skills_lock_hash: 2ddfe599ac2ba631ca019f7b6e37ee5df9cd34f83fc016f6ea9d4ba5bbfa0304
license: Apache-2.0
last_reviewed: 2026-10-22
status: reviewed
ownership: ecosystem
---

# Upstream source

This complete skill tree is vendored from [google-labs-code/stitch-skills](https://github.com/google-labs-code/stitch-skills/tree/0337446dadde6f8c94210444e2aa9d546126480f/plugins/stitch-build/skills/shadcn-ui) at the immutable reviewed commit above. The installed Core slug is `shadcn-ui`; the license notice is retained at `references/LICENSE.md`. Core changes are adaptations, not upstream changes.

## Core adaptations

- Preserved reviewed data-table Base UI render/group/type-only/gap fixes via existing sync adapter.
- Preserved all authentication example flex/gap layouts, including both card contents, six field groups and both footers.
- Reinstall recovery restores type-only table imports and horizontal gap utilities as well as the existing Base UI menu fixes; the approved data-table bytes remain identical to the baseline.
- Preserved cnfast helper/docs/setup detection, while taking upstream node_modules exclusion in find commands.
- Added marked Core applicability, ecosystem ownership, and non-executing maintenance overlay.

- Pinned README contribution link to upstream and routed its license link to the bundled Apache notice.

## Imported file inventory

- `README.md`
- `SKILL.md`
- `examples/auth-layout.tsx`
- `examples/data-table.tsx`
- `examples/form-pattern.tsx`
- `resources/component-catalog.md`
- `resources/customization-guide.md`
- `resources/migration-guide.md`
- `resources/setup-guide.md`
- `scripts/verify-setup.sh`
- `references/LICENSE.md`

## Refresh workflow

1. Review the exact upstream commit, complete tree, license, and diff. Do not advance a mutable branch implicitly or execute imported scripts, tests, installers, or lifecycle hooks as part of refresh.
2. Stage the whole reviewed source directory outside the live skill directory, retaining the license notice and this provenance. Preserve the marked Core overlay and every adaptation listed above; the maintenance audit retains raw and adapted file hashes.
3. Reconcile additions and deletions against the previous owned inventory before atomic publication to `.agents/skills/shadcn-ui`. Preserve user-owned extras explicitly rather than deleting them by inference.
4. Update the raw upstream `SKILL.md` hash and reviewed commit together; do not hash the adapted skill as if it were raw source.
5. The reviewed Core adapter is restored by `scripts/lib/ecosystem-skill-adapters.mjs` from the committed `ecosystem-core-guidance.json` and `ecosystem-core-overlays.json` configs under `scripts/refresh-overlays`. Review/update those transforms with upstream drift; they do not advance provenance automatically.
6. Run `bun run skills:sync` and non-mutating `bun run skills:verify`, then the focused metadata, reference, compatibility, and mirror tests. Bundled executables remain inert unless a separate authorized task needs them.
