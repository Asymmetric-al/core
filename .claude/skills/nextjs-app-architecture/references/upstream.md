---
source_name: aurorascharff/nextjs-app-architecture-skill (nextjs-app-architecture)
source_url: https://github.com/aurorascharff/nextjs-app-architecture-skill
source_type: github
upstream_path: SKILL.md
reviewed_commit: f2902b8538b25610da694394ecf88e69adf5f96a
skills_lock_hash: 94f700fb57aef401e135ddbb0d13a2986d6416820ee4e1b2bf1fd8e17fae0d66
license: MIT
last_reviewed: 2026-08-28
---

# Upstream: nextjs-app-architecture

Canonical copy in this repo: `docs/ai/skills/nextjs-app-architecture/` (mirrored to `.agents/skills/`, `.cursor/skills/`, and `.claude/skills/` via `bun run skills:sync`).

- **Repository:** https://github.com/aurorascharff/nextjs-app-architecture-skill
- **Upstream path:** `SKILL.md` plus `references/{cache-components,components,example,feature-folders,pages-suspense,queries-actions,single-page-applications,ux-patterns}.md`
- **License:** MIT; copyright Aurora Scharff (see the ecosystem `LICENSE` copied by the Skills CLI)
- **Install via Skills CLI:** `npx --yes skills@1.5.7` with the reviewed local checkout below

The skill packages next-beats-style RSC composition for Next.js 16 App Router: synchronous pages, feature-owned async server components, colocated skeletons, and Cache Components practice. Inside Core it stays subordinate to installed Next.js docs, `docs/ai/rules/frontend.md`, and the data-access boundary.

## Refresh from ecosystem

1. Select the exact reviewed upstream commit. The current raw upstream pin is
   `f2902b8538b25610da694394ecf88e69adf5f96a`; advancing it requires reviewing the
   new tree and its diff, not following a mutable branch or dist-tag. Prepare an
   isolated checkout and install outside Core before copying any canonical file:

   ```bash
   set -eu
   refresh_dir=$(mktemp -d)
   reviewed_commit=f2902b8538b25610da694394ecf88e69adf5f96a
   git clone --no-checkout https://github.com/aurorascharff/nextjs-app-architecture-skill "$refresh_dir/source"
   git -C "$refresh_dir/source" checkout --detach "$reviewed_commit"
   test "$(git -C "$refresh_dir/source" rev-parse HEAD)" = "$reviewed_commit"
   mkdir "$refresh_dir/install"
   (cd "$refresh_dir/install" && npx --yes skills@1.5.7 add "$refresh_dir/source" --skill nextjs-app-architecture --agent codex --copy -y)
   ```

2. Compare the installed `SKILL.md` and `references/*` with that verified Git
   tree and review all additions/deletions before copying into
   `docs/ai/skills/nextjs-app-architecture/`. Preserve this provenance file.
   Reconcile upstream-deleted reference files explicitly; copying only existing
   files would retain stale recipes. Stop on an unexpected tree or hash mismatch.
3. Preserve/reapply the **This repository** and **Core remaps** sections and
   every in-place `CORE: skip file creation` annotation. Retain published API
   examples, real client transports, client-only browser hooks, API-owned tags,
   installed-doc references, pending-attribute wiring, canonical optimistic-state
   commits, variable-height boundary grouping, metadata/cache qualifications,
   and corrected portal snapshot guidance. These are Core adaptations, not
   upstream changes. Review the complete local adaptation diff before syncing.
4. Keep `.claude/skills/nextjs-app-architecture/` as a required generated runtime
   mirror, alongside `.agents/skills/` and `.cursor/skills/`; never delete it as
   an allegedly unused install. Run `bun run skills:sync` only after canonical
   reconciliation, then `bun run skills:verify` and the architecture reference,
   boundary, and routing tests. Do not hand-edit any generated mirror.
5. If the reviewed source actually changed, update `reviewed_commit` and the raw
   upstream `computedHash` from the pinned install's `skills-lock.json` together.
   Preserve the GitHub source identity rather than committing the scratch local
   path; raw provenance must never be recomputed from Core-adapted content. A
   restore of the existing pin keeps both current hashes unchanged. Retain the
   raw tree, hash, reviewed diff, and validation as refresh evidence.

This skill is **not** updated by `bun run skills:refresh-upstream` today.
