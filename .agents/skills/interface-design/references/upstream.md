---
source_url: https://github.com/Dammyjay93/interface-design
source_type: github
upstream_path: .claude/skills/interface-design
reviewed_commit: 2f9be3206855bcb2d1d0af262c8bae25cba6658d
skills_lock_hash: 720b31a31276e899fbe3006a33cbfeaceb77a73ba4c27b80d29afd38c8b7b208
license: MIT
last_reviewed: 2026-10-22
status: reviewed
ownership: ecosystem
---

# Upstream source

This complete skill tree is vendored from [Dammyjay93/interface-design](https://github.com/Dammyjay93/interface-design/tree/2f9be3206855bcb2d1d0af262c8bae25cba6658d/.claude/skills/interface-design) at the immutable reviewed commit above. The installed Core slug is `interface-design`; the license notice is retained at `references/LICENSE.md`. Core changes are adaptations, not upstream changes.

## Core adaptations

- Preserved explicit-only invocation in discovery and UI policy; removed four superseded upstream references after complete inventory review.
- Added marked Core applicability, ecosystem ownership, and non-executing maintenance overlay.

## Imported file inventory

- `SKILL.md`
- `agents/openai.yaml`
- `references/LICENSE.md`

## Refresh workflow

1. Review the exact upstream commit, complete tree, license, and diff. Do not advance a mutable branch implicitly or execute imported scripts, tests, installers, or lifecycle hooks as part of refresh.
2. Stage the whole reviewed source directory outside the live skill directory, retaining the license notice and this provenance. Preserve the marked Core overlay and every adaptation listed above; the maintenance audit retains raw and adapted file hashes.
3. Reconcile additions and deletions against the previous owned inventory before atomic publication to `.agents/skills/interface-design`. Preserve user-owned extras explicitly rather than deleting them by inference.
4. Update the raw upstream `SKILL.md` hash and reviewed commit together; do not hash the adapted skill as if it were raw source.
5. The reviewed Core adapter is restored by `scripts/lib/ecosystem-skill-adapters.mjs` from the committed `ecosystem-core-guidance.json` and `ecosystem-core-overlays.json` configs under `scripts/refresh-overlays`. Review/update those transforms with upstream drift; they do not advance provenance automatically.
6. Run `bun run skills:sync` and non-mutating `bun run skills:verify`, then the focused metadata, reference, compatibility, and mirror tests. Bundled executables remain inert unless a separate authorized task needs them.
