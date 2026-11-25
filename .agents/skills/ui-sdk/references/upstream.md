---
source_name: vercel-labs/ui (ui-sdk)
source_url: https://github.com/vercel-labs/ui
source_type: github
upstream_path: packages/core/skills/ui-sdk/SKILL.md
reviewed_commit: d850982bd8aed202e07009825c3d9daf643fa24e
reviewed_commit_date: 2026-11-24
npm_package: "@ui-sdk/core@0.1.0-beta.17"
upstream_skill_md_sha256: ae96d59e4f575dbd28eb86b94a272adad34cd92271b4a8da2dd8cced1bbbf479
upstream_license_sha256: 85dc930b9f77edd477ceddd7658dd3a4bb4411186718d19e137a7a5724ee7007
skills_lock_hash: 3823077bab44eeb1a26c14cf9a39381fdcd75e7c04fe85d2ecc0b2200fd75e0e
license: Apache-2.0; preserved byte-exact as `LICENSE`
ownership: canonical
last_reviewed: 2026-11-25
---

# Upstream: ui-sdk

Canonical copy in this repo: `docs/ai/skills/ui-sdk/`. `bun run skills:sync`
publishes it to `.agents/skills/ui-sdk/`, `.claude/skills/ui-sdk/`, and
`.cursor/skills/ui-sdk/`. Do not edit those mirrors by hand.

- **Repository:** https://github.com/vercel-labs/ui
- **Upstream path:** `packages/core/skills/ui-sdk/` (`SKILL.md` and seven
  `references/*.md`; `skills.sh.json` publishes `./packages/core/skills`).
- **Reviewed commit:** `d850982bd8aed202e07009825c3d9daf643fa24e`
  (`chore: version packages (beta) (#1049)`, 2026-11-24), the commit tagged
  `@ui-sdk/core@0.1.0-beta.17` and `@ui-sdk/react@0.1.0-beta.17`.
- **Installed SDK match:** the same tree ships inside the npm package at
  `packages/ui/node_modules/@ui-sdk/core/skills/ui-sdk/`, and
  `packages/ui/package.json` pins `@ui-sdk/core` and `@ui-sdk/react` to
  `0.1.0-beta.17`. `tests/unit/docs/ui-sdk-skill.test.ts` compares the vendored
  references with that bundled copy, so a version bump without a skill refresh
  fails.
- **License:** Apache-2.0, from the repository-root `LICENSE`, which the npm
  package also ships. The copy in this directory matches the reviewed commit
  byte for byte. The repository has no `NOTICE` file.
- **Lock entry:** `skills-lock.json` → `ui-sdk` (`vercel-labs/ui`,
  `packages/core/skills/ui-sdk/SKILL.md`). `computedHash` was written by
  `skills@1.5.7`; it was not hand-computed.

## Import scope and curation

Only `ui-sdk` was imported. The repository's maintainer skills under
`.agents/skills/` (`ui-sdk-expert-review`, `ui-sdk-unslop`,
`ui-sdk-write-code`, `ui-sdk-write-docs`) are for developing UI SDK itself and
are deliberately excluded.

Core's Base UI skills cover Base UI components. `ui-sdk` covers UI SDK code,
which Core approves alongside Base UI for shared components, and the
installed-version docs bundled with the packages.

## Upstream files

| File                             | Upstream sha256                                                    | Core copy                 |
| -------------------------------- | ------------------------------------------------------------------ | ------------------------- |
| `SKILL.md`                       | `ae96d59e4f575dbd28eb86b94a272adad34cd92271b4a8da2dd8cced1bbbf479` | adapted (see below)       |
| `references/agent-ready.md`      | `afe0ac7ac996d4262052b25d1627c42d3e082cb13254dd3abff741ff0d39381c` | scanner comments + notice |
| `references/build-interface.md`  | `60a5d24a6b7460945158a1bf53c3cb152ea318bcd8db822fb51112b88f39ced6` | scanner comments + notice |
| `references/create-component.md` | `bf71094e5ce2e3e7b8d47ebde22859b3734fc1bfc08e1ad495642ceda07f61d3` | byte-identical            |
| `references/patterns.md`         | `6cb4f62f57d36dac0318bda20474fff285f35836597c0d04f2a488d0cf5d0cd5` | byte-identical            |
| `references/styles.md`           | `bad68082b51891f0052f9f2719ca73236c56e43b785c36c4bb88517baee9d235` | scanner comments + notice |
| `references/testing.md`          | `79d1fef48a574646dd07a9969ca72887fd715331b3e70d413a61e0de2902ae4a` | byte-identical            |
| `references/web-components.md`   | `7992570e605af1cea5576aeb4b759dd94c3312b00d4923c46b74fabe8452d483` | byte-identical            |
| `LICENSE` (repository root)      | `85dc930b9f77edd477ceddd7658dd3a4bb4411186718d19e137a7a5724ee7007` | byte-identical            |

`.prettierignore` keeps the vendored references out of Prettier, which would
otherwise rewrite the upstream code samples.

## Core adaptations

- `SKILL.md` keeps the upstream body. Core rewrote the description so the skill
  loads for UI SDK evaluation and SDK code rather than whenever the package is
  installed, added a short Core note under the title, and appended the marked
  Core overlay. The overlay pins the installed-docs path under
  `packages/ui/node_modules/@ui-sdk/`, keeps shared reuse the starting point,
  places wrappers in `packages/ui/components/primitives/`, forbids the optional
  `web.css`, app-level SDK imports and `test.fails`, names Core's shared UI SDK
  owners (the shortcut owner, the sortable list, the single agent bridge and
  the pattern checks), names Core's test and verification commands, and points
  at the reference Rating implementation. Its first paragraph is the
  Apache-2.0 §4(b) change notice.
- `bun run skills:sync` appends the secret scanner's allowlist HTML comment to
  Markdown lines that name credential fields, and
  `node scripts/update-skill-audit-hashes.mjs` requires the canonical copy to
  match the synced one. The three affected references therefore carry those
  comments here, plus a trailing modification notice. The other references
  and `LICENSE` are unchanged.

## Refresh workflow

1. Check the release first: a refresh follows a deliberate bump of the exact
   `@ui-sdk/core` and `@ui-sdk/react` pins in `packages/ui/package.json`. The
   vendored skill must come from the commit tagged for that release.
2. Inspect the live upstream tree, `git log -- packages/core/skills/ui-sdk`,
   and `LICENSE` at the release commit. Clone with `core.autocrlf=false` so the
   bytes stay LF, and confirm the tree equals
   `packages/ui/node_modules/@ui-sdk/core/skills/ui-sdk/`.
3. In an isolated scratch directory (not this repo), stage only ui-sdk:
   `npx --yes skills@1.5.7 add <reviewed-checkout>/packages/core --skill ui-sdk --agent codex --copy -y`.
   With `skills@1.5.7`, both `<checkout>` and the GitHub form
   (`npx skills add vercel-labs/ui --skill ui-sdk`) report no matching skill,
   because that CLI does not read upstream's `skills.sh.json`; the package
   directory form above discovers it. Its `computedHash` is the CLI folder hash
   of the reviewed tree. Record the lock entry with `source: vercel-labs/ui`,
   `sourceType: github` and the upstream `skillPath`.
4. Reconcile the upstream diff into `docs/ai/skills/ui-sdk/`, preserving the
   description, Core note, marked overlay and notices. Run `bun run skills:sync`
   and copy back any reference lines it annotates. Re-copy `LICENSE` if it
   changed. Then run `bunx prettier --write docs/ai/skills/ui-sdk/SKILL.md`.
5. Update the commit, version, hashes and dates above, the upstream file table,
   and the `ui-sdk` entry in `skills-lock.json`. Publish them together with the
   tree.
6. Run `bun run skills:sync` and `bun run skills:verify`, then update the
   installed payload hashes with
   `node scripts/update-skill-audit-hashes.mjs --skill ui-sdk`, and run
   `tests/unit/docs/ui-sdk-skill.test.ts`.

This skill is **not** updated by `bun run skills:refresh-upstream`.
