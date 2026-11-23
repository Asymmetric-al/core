# Proposal

## Why

First-party TypeScript and JavaScript holds about 20,900 comments in 2,620
files: about 39,500 lines that hold nothing but a comment, 4.6% of the lines
in scope. Many repeat the code. Some describe code that has since changed. Some
excuse a workaround, and agents then copy both the workaround and its excuse
into new code. The comments that record a real decision are scattered through
the source, where nobody looks one up and nothing keeps them true.

Tracked in [#2751](https://github.com/Asymmetric-al/core/issues/2751).

## Authority

The owner asked for this on 2026-11-22: "Take a look at every code comment",
sort each one as a tautology, an excuse, stale or a decision record, delete
the first and third kinds, delete an excuse "and file an issue to fix the
hacky implementation", move a decision record "into an ADR", then "create a
lint rule banning comments", "take a ratchet approach, assuming not all
comments will be deleted this PR", and "create a /delete-comment skill in
this repository so we can repeat this process later".

The request left open whether the first pass covers the whole codebase or one
section. This change takes the rule, the ratchet and the skill to the whole
codebase and the first comment-by-comment pass to `packages/auth`. That split
is the implementing agent's reading, not an owner ruling.

## What Changes

- **BREAKING (workflow):** a new lint rule, `core/no-comments`, bans comments
  in TypeScript and JavaScript under `apps/`, `packages/`, `scripts/`,
  `tests/`, `tooling/` and the repository root. It is part of the shared base
  ESLint configuration, so every workspace's `lint`, the pre-commit hook and
  the agent edit hook report it.
- Comments that a tool reads stay legal: lint, TypeScript, formatter,
  coverage, bundler and test-environment directives, shebangs, licence
  headers, a JSDoc block that carries `@deprecated`, and JSDoc type
  annotations in JavaScript files.
- A ratchet covers the comments that exist today.
  `tooling/eslint-config/comment-baseline.json` records how many comments
  each file holds. The rule allows a file that many and no more. A new gate,
  `bun run verify:comments`, fails when a file holds more comments than its
  version on the base branch, or when the baseline does not match the tree.
  It runs in `ci:preflight` (both profiles) and in the CI `lint` job. No flag
  raises a count.
- A new canonical skill, `delete-comment`, repeats the pass on any section:
  list, classify, file an issue for each excuse, move each decision record
  into an ADR beside the code, delete, lower the baseline.
  `scripts/delete-comments.mjs` lists the comments under a path and removes
  them, and writes a file only when its syntax tree is unchanged.
- First pass: 440 of the 442 comments in `packages/auth` are removed. Its
  decision records move to `packages/auth/docs/adr/`. Two JSDoc blocks stay,
  because the acceptance test for #2303 requires them.

## Out Of Scope

- The other workspaces and trees. Each is a later pass with the skill.
- Comments in SQL, Python, shell, CSS and YAML, in generated files, test
  fixtures, `public/` assets, Payload migrations, the factory pack and the
  tooling under `docs/`.
- Lint and TypeScript suppression comments. They stay until the code they
  silence is fixed.
- The paused quality-toolchain migration
  (`adopt-ultracite-quality-toolchain`). When it resumes, its parity record
  will list `core/no-comments` as a rule with no Oxlint equivalent.

## Impact

- New: `tooling/eslint-config/no-comments.mjs`,
  `tooling/eslint-config/comment-baseline.json`,
  `scripts/verify/comment-ratchet.mjs`, `scripts/delete-comments.mjs`,
  `scripts/lib/source-comments.mjs`, `docs/ai/skills/delete-comment/`,
  `packages/auth/docs/adr/`, and three unit-test files.
- Changed: `tooling/eslint-config/base.mjs`, `scripts/verify/ci-preflight.mjs`
  and its contract test, `.github/workflows/ci.yml` (one step in the `lint`
  job), `docs/ci.md`, the root `package.json`, and 42 files in
  `packages/auth` (comments only).
- A pull request that deletes comments must also commit the lowered baseline
  (`bun run verify:comments -- --write`). Two pull requests that lower the
  baseline for different files merge cleanly, because each file is one line.
