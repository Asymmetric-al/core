---
source_name: vercel/next.js
source_url: https://github.com/vercel/next.js
source_type: github
upstream_path: skills/next-partial-prefetching-adoption/SKILL.md
release_tag: v16.4.5
reviewed_commit: 4e5335a00314be7fbb2aace5e9be56a88e64e5a8
upstream_tree: ae20d672e38bcd4ab6c5e9b348e98e6872a9231d
skills_lock_hash: 258989169e683a33512ce0c7078314a82cd0ad6aa721f0207753773088d8902b
license: MIT
ownership: ecosystem
last_reviewed: 2026-11-18
---

# Upstream: next-partial-prefetching-adoption

Reviewed source: https://github.com/vercel/next.js/tree/4e5335a00314be7fbb2aace5e9be56a88e64e5a8/skills/next-partial-prefetching-adoption
Release tag `v16.4.5` matches the Next.js version installed in every Core app. Git tree `ae20d672e38bcd4ab6c5e9b348e98e6872a9231d`.
Raw upstream `SKILL.md` SHA-256: `258989169e683a33512ce0c7078314a82cd0ad6aa721f0207753773088d8902b`. The repository licence (`license.md` at the same commit) is preserved byte-for-byte in `UPSTREAM-license.md`.

Outcome: imported the complete upstream subtree (`SKILL.md`, `rig-template.md`). `rig-template.md` is unchanged.

## Core adaptations

- A marked Core overlay (`<!-- CORE-OVERLAY-START -->` to `<!-- CORE-OVERLAY-END -->`) sits between the frontmatter and the upstream title. It records that Core already runs `partialPrefetching: true` in every app, sends the agent to the installed Next.js skills instead of `canary` links and `npx skills add`, rules out the unpinned `@next/codemod@latest agents-md` and `@next/codemod@canary remove-partial-prefetch` commands, `--force` and `git stash`, points at Core's `instant-nav.rig.md`, and keeps commits and pull requests under `docs/ai/rules/general.md`.
- No upstream sentence is edited. The installed `SKILL.md` therefore differs from the raw upstream hash above only by the overlay block.

Imported because the installed `next-cache-components-adoption` names it as its follow-up, and the Next.js AI-agents guide lists it among the official skills.

## Refresh

1. Use an isolated temporary checkout at the `vercel/next.js` release tag that matches the installed `next` version. Verify the tag's commit and the complete file inventory before import. Stage only this skill with `npx --yes skills@1.5.7 add <reviewed-local-checkout> --skill next-partial-prefetching-adoption --agent codex --copy -y` from a scratch directory. Do not use global defaults, `canary`, or other pack members.
2. Compare the complete source tree and all support files. Re-insert the marked Core overlay after the frontmatter and re-check each of its facts against the repository. Record raw upstream hashes separately from adapted bytes.
3. Replace the installed source directory transactionally, keeping this provenance and the licence notice. Update its lock entry and source-audit record in the same change. Never run imported scripts or tests as a refresh side effect.
4. Run `bun run skills:sync`, then non-mutating `bun run skills:verify`, then `bunx vitest run tests/unit/docs`.

Refresh all six `vercel/next.js` skills together at a Next.js upgrade, so they keep matching the installed release. This skill remains ecosystem-owned under `.agents/skills`. Repository authority, secrets policy and installed package evidence outrank generic source recipes.
