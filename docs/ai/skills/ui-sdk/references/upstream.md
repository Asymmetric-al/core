---
source_name: vercel-labs/ui (ui-sdk)
source_url: https://github.com/vercel-labs/ui
source_type: github
upstream_path: packages/core/skills/ui-sdk/SKILL.md
reviewed_commit: 8ff6bcf7100d48230a3fab8c72475d99316cc58a
reviewed_commit_date: 2026-11-13
npm_package: "@ui-sdk/core@0.1.0-beta.2"
upstream_skill_md_sha256: bbcb19f944023dd8f36f895378852c325b811ced38fdd7dae234825c3d9c858a
upstream_license_sha256: 85dc930b9f77edd477ceddd7658dd3a4bb4411186718d19e137a7a5724ee7007
skills_lock_hash: 76946872dfa4db3d144c1629ce2fe8a44b1cd4442ef70eeb82f3da4cb5f68f07
license: Apache-2.0; preserved byte-exact as `LICENSE`
ownership: canonical
last_reviewed: 2026-11-14
---

# Upstream: ui-sdk

Canonical copy in this repo: `docs/ai/skills/ui-sdk/`. `bun run skills:sync`
publishes it to `.agents/skills/ui-sdk/`, `.claude/skills/ui-sdk/`, and
`.cursor/skills/ui-sdk/`. Do not edit those mirrors by hand.

- **Repository:** https://github.com/vercel-labs/ui
- **Upstream path:** `packages/core/skills/ui-sdk/` (`SKILL.md` and seven
  `references/*.md`; `skills.sh.json` publishes `./packages/core/skills`).
- **Reviewed commit:** `8ff6bcf7100d48230a3fab8c72475d99316cc58a`
  (`chore: version packages (beta) (#444)`, 2026-11-13), the commit tagged
  `@ui-sdk/core@0.1.0-beta.2` and `@ui-sdk/react@0.1.0-beta.2`. It was also
  the remote `main` when the skill was imported on 2026-11-14.
- **Installed SDK match:** the same tree ships inside the npm package at
  `packages/ui/node_modules/@ui-sdk/core/skills/ui-sdk/`, and
  `packages/ui/package.json` pins `@ui-sdk/core` and `@ui-sdk/react` to
  `0.1.0-beta.2`. `tests/unit/docs/ui-sdk-skill.test.ts` compares the vendored
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

The skill fills a narrow catalog gap. Core's Base UI skills cover ordinary
controls; `ui-sdk` covers interactions Base UI does not ship (rating, token
input, shortcuts, reordering, custom primitives) and the installed-version
docs bundled with the packages.

## Upstream files

| File                             | Upstream sha256                                                    | Core copy                 |
| -------------------------------- | ------------------------------------------------------------------ | ------------------------- |
| `SKILL.md`                       | `bbcb19f944023dd8f36f895378852c325b811ced38fdd7dae234825c3d9c858a` | adapted (see below)       |
| `references/agent-ready.md`      | `a78c7db97260c5a4b9f6189b8ac9134d96f801df508ebfa5e17b7e4b03a49e53` | scanner comments + notice |
| `references/build-interface.md`  | `a93c3c21bfc5bc939350d0a3b02b56258df85328c49dc9f4357b78b91d05f1f1` | scanner comments + notice |
| `references/create-component.md` | `00150e2cab1266384de9292d09f8a0f9da19fd08f67c762dd8f914179cb4da58` | byte-identical            |
| `references/patterns.md`         | `6cb4f62f57d36dac0318bda20474fff285f35836597c0d04f2a488d0cf5d0cd5` | byte-identical            |
| `references/styles.md`           | `61ae4fccdce8a27bfe46fdb28aa17e36abe752ca59858f00dd878a14f53dffae` | scanner comments + notice |
| `references/testing.md`          | `9a40c6f81ec2ad032693bf709658d458774f3f2cbe20551c197064fc18d3c4d1` | byte-identical            |
| `references/web-components.md`   | `31056cc7d3b317845d4c64f50def9db020e0e4f6f3c9c62a79c505af7eb28821` | byte-identical            |
| `LICENSE` (repository root)      | `85dc930b9f77edd477ceddd7658dd3a4bb4411186718d19e137a7a5724ee7007` | byte-identical            |

`.prettierignore` keeps the vendored references out of Prettier, which would
otherwise rewrite the upstream code samples.

## Core adaptations

- `SKILL.md` keeps the upstream body. Core changed the description so the skill
  routes only to gaps in Core's Base UI components, added a short Core note under
  the title, and appended the marked Core overlay. The overlay pins the
  installed-docs path under `packages/ui/node_modules/@ui-sdk/`, keeps Base UI
  the default, places wrappers in `packages/ui/components/primitives/`, forbids
  the optional `web.css`, app-level SDK imports and `test.fails`, makes agent
  bridges opt-in, names Core's test and verification commands, and points at the
  reference Rating implementation. Its first paragraph is the Apache-2.0 §4(b)
  change notice.
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
