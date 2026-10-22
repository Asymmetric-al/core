---
source_url: https://github.com/expo/skills
source_type: github
upstream_path: plugins/expo/skills/expo-dom
reviewed_commit: 3d1ca4e2a3c5ffc14817a85dde0bf1b188e9753d
skills_lock_hash: b388777e22619b24bed4b0dc76afa52e1f8c0fe23cb1e90d869d0159ba5167dd
license: MIT
last_reviewed: 2026-10-22
status: reviewed
ownership: ecosystem
---

# Upstream source

This complete skill tree is vendored from [expo/skills](https://github.com/expo/skills/tree/3d1ca4e2a3c5ffc14817a85dde0bf1b188e9753d/plugins/expo/skills/expo-dom) at the immutable reviewed commit above. The installed Core slug is `use-dom`; the license notice is retained at `references/LICENSE.md`. Core changes are adaptations, not upstream changes.

## Core adaptations

- Kept installed use-dom slug/name/UI prompt for the verified expo-dom successor and removed automatic external feedback instructions.
- Added marked Core applicability, ecosystem ownership, and non-executing maintenance overlay.

## Imported file inventory

- `SKILL.md`
- `agents/openai.yaml`
- `references/LICENSE.md`

## Refresh workflow

1. Review the exact upstream commit, complete tree, license, and diff. Do not advance a mutable branch implicitly or execute imported scripts, tests, installers, or lifecycle hooks as part of refresh.
2. Stage the whole reviewed source directory outside the live skill directory, retaining the license notice and this provenance. Preserve the marked Core overlay and every adaptation listed above; the maintenance audit retains raw and adapted file hashes.
3. Reconcile additions and deletions against the previous owned inventory before atomic publication to `.agents/skills/use-dom`. Preserve user-owned extras explicitly rather than deleting them by inference.
4. Update the raw upstream `SKILL.md` hash and reviewed commit together; do not hash the adapted skill as if it were raw source.
5. The reviewed Core adapter is restored by `scripts/lib/ecosystem-skill-adapters.mjs` from the committed `ecosystem-core-guidance.json` and `ecosystem-core-overlays.json` configs under `scripts/refresh-overlays`. Review/update those transforms with upstream drift; they do not advance provenance automatically.
6. Run `bun run skills:sync` and non-mutating `bun run skills:verify`, then the focused metadata, reference, compatibility, and mirror tests. Bundled executables remain inert unless a separate authorized task needs them.

## Stable alias

The installed `use-dom` snapshot exactly matched Expo's historical `plugins/expo-app-design/skills/use-dom/SKILL.md` at `991716e214d206384249322e9ef99a2fe059bb9b`. The reviewed source now calls this capability `expo-dom`. Core retains `use-dom` in frontmatter and the UI prompt so existing invocation stays compatible; no duplicate skill is installed.
