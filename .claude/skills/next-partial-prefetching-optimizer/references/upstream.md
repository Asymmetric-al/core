---
source_name: vercel/next.js
source_url: https://github.com/vercel/next.js
source_type: github
upstream_path: skills/next-partial-prefetching-optimizer/SKILL.md
release_tag: v16.4.5
reviewed_commit: 4e5335a00314be7fbb2aace5e9be56a88e64e5a8
upstream_tree: a3818456a2fa20adf76d7c08ab088a2e8efcb8dd
skills_lock_hash: 876634c57c5cfbace95edcbe6c7e9bdea199fa53c09cd177990dc936876db345
license: MIT
ownership: ecosystem
last_reviewed: 2026-11-18
---

# Upstream: next-partial-prefetching-optimizer

Reviewed source: https://github.com/vercel/next.js/tree/4e5335a00314be7fbb2aace5e9be56a88e64e5a8/skills/next-partial-prefetching-optimizer
Release tag `v16.4.5` matches the Next.js version installed in every Core app. Git tree `a3818456a2fa20adf76d7c08ab088a2e8efcb8dd`.
Raw upstream `SKILL.md` SHA-256: `876634c57c5cfbace95edcbe6c7e9bdea199fa53c09cd177990dc936876db345`. The repository licence (`license.md` at the same commit) is preserved byte-for-byte in `UPSTREAM-license.md`.

Outcome: imported the complete upstream subtree (`SKILL.md`, `rig-template.md`, `reference/red-test-robustness.md`) unchanged. Core adaptations: none. Its commands defer to the project's existing rig, and Core's root `instant-nav.rig.md` supplies the Bun commands.

Imported because the installed `next-cache-components-optimizer` hands off to it, and the Next.js AI-agents guide lists it among the official skills.

## Refresh

1. Use an isolated temporary checkout at the `vercel/next.js` release tag that matches the installed `next` version. Verify the tag's commit and the complete file inventory before import. Stage only this skill with `npx --yes skills@1.5.7 add <reviewed-local-checkout> --skill next-partial-prefetching-optimizer --agent codex --copy -y` from a scratch directory. Do not use global defaults, `canary`, or other pack members.
2. Compare the complete source tree and all support files. Record raw upstream hashes separately from adapted bytes.
3. Replace the installed source directory transactionally, keeping this provenance and the licence notice. Update its lock entry and source-audit record in the same change. Never run imported scripts or tests as a refresh side effect.
4. Run `bun run skills:sync`, then non-mutating `bun run skills:verify`, then `bunx vitest run tests/unit/docs`.

Refresh all six `vercel/next.js` skills together at a Next.js upgrade, so they keep matching the installed release. This skill remains ecosystem-owned under `.agents/skills`. Repository authority, secrets policy and installed package evidence outrank generic source recipes.
