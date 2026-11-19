---
source_name: vercel/next.js
source_url: https://github.com/vercel/next.js
source_type: github
upstream_path: skills/next-bundle-optimizer/SKILL.md
release_tag: v16.4.5
reviewed_commit: 4e5335a00314be7fbb2aace5e9be56a88e64e5a8
upstream_tree: cbd1253f81a7a2c4ecbd56fb4d39cd1f27cf13b1
skills_lock_hash: 250f8c9a2ee0934c8d572cd3869e29f085c11ae9bb444181b08b2f67770bfb2c
license: MIT
ownership: ecosystem
last_reviewed: 2026-11-18
---

# Upstream: next-bundle-optimizer

Reviewed source: https://github.com/vercel/next.js/tree/4e5335a00314be7fbb2aace5e9be56a88e64e5a8/skills/next-bundle-optimizer
Release tag `v16.4.5` matches the Next.js version installed in every Core app. Git tree `cbd1253f81a7a2c4ecbd56fb4d39cd1f27cf13b1`.
Raw upstream `SKILL.md` SHA-256: `250f8c9a2ee0934c8d572cd3869e29f085c11ae9bb444181b08b2f67770bfb2c`. The repository licence (`license.md` at the same commit) is preserved byte-for-byte in `UPSTREAM-license.md`.

Outcome: imported the complete upstream subtree (`SKILL.md`, `references/fix-patterns.md`, `references/graph-methods.md`). Both references are unchanged.

## Core adaptations

- A marked Core overlay (`<!-- CORE-OVERLAY-START -->` to `<!-- CORE-OVERLAY-END -->`) sits between the frontmatter and the upstream title. It limits the skill to the three Turbopack apps (`next analyze` works only with Turbopack, and `apps/factory-console` builds with webpack), maps the `pnpm` commands to Bun, keeps analyzer output out of the repository, sends sandbox escapes through the client's own permission request, and routes fix-mode dependency and UI changes through Core's skills and rulebooks.
- No upstream sentence is edited. The installed `SKILL.md` therefore differs from the raw upstream hash above only by the overlay block.

Next.js 16.4.0 added `next analyze export` and this skill. The installed `next@16.4.5` CLI reports `next analyze` as "Only compatible with Turbopack" and ships `next/analyze/graph-v1.schema.json`.

## Refresh

1. Use an isolated temporary checkout at the `vercel/next.js` release tag that matches the installed `next` version. Verify the tag's commit and the complete file inventory before import. Stage only this skill with `npx --yes skills@1.5.7 add <reviewed-local-checkout> --skill next-bundle-optimizer --agent codex --copy -y` from a scratch directory. Do not use global defaults, `canary`, or other pack members.
2. Compare the complete source tree and all support files. Re-insert the marked Core overlay after the frontmatter and re-check each of its facts against the installed Next.js CLI and the repository. Record raw upstream hashes separately from adapted bytes.
3. Replace the installed source directory transactionally, keeping this provenance and the licence notice. Update its lock entry and source-audit record in the same change. Never run imported scripts or tests as a refresh side effect.
4. Run `bun run skills:sync`, then non-mutating `bun run skills:verify`, then `bunx vitest run tests/unit/docs`.

Refresh all six `vercel/next.js` skills together at a Next.js upgrade, so they keep matching the installed release. This skill remains ecosystem-owned under `.agents/skills`. Repository authority, secrets policy and installed package evidence outrank generic source recipes.
