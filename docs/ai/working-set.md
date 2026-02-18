# Working Set

Agents MUST keep this file updated during a task. Use it to build the Nia query preamble.

## Current objective
- Implement verification review comments for ESLint monorepo coverage.
- Ensure every `packages/*` workspace participates in the unified ESLint flat-config strategy.
- Prevent type-aware lint failures in placeholder packages by adding missing `tsconfig.json` coverage.

## Repo scope
- repository: Asymmetric-al/core
- in-scope paths:
  - package.json
  - scripts/verify-eslint-config.mjs
  - tooling/eslint-config/base.mjs
  - tooling/eslint-config/library.mjs
  - tooling/eslint-config/README.md
  - packages/*
  - docs/ai/working-set.md

## Stack tags
- TypeScript
- Node.js
- Bun
- Turborepo
- ESLint

## Known identifiers
- files:
  - package.json
  - scripts/verify-eslint-config.mjs
  - tooling/eslint-config/base.mjs
  - tooling/eslint-config/library.mjs
  - packages/env/package.json
  - packages/env/tsconfig.json
- symbols:
  - libraryConfig
  - baseConfig
  - eslint.config.mjs
  - verify:eslint
  - turbo run lint
  - Parsing error: project not found

## Expected behavior
- Every package workspace has an `eslint.config.mjs` that re-exports `libraryConfig`.
- Package lint tasks cover package workspaces under `turbo run lint`.
- Verification script fails when package-level ESLint configs are missing.
- `packages/env` has a minimal `tsconfig.json` so type-aware ESLint can resolve project config.

## Constraints
- Keep diffs minimal and scoped to lint/config verification behavior.
- Avoid introducing placeholder-specific exceptions unless explicitly temporary and documented.
- Do not add secrets or credentials.

## Verification
- `bun run verify:eslint`
- `bun run lint -- --filter=@asym/env --filter=@asym/missionary`
- `git status`

## Verification status
- `bun run verify:eslint` now passes with strict disable-comment format enforcement (no baseline bypass).
- `bun run lint` passes in `packages/env`.
- `bun run lint` now passes in `packages/missionary` via documented temporary strict-rule relaxation while keeping `libraryConfig` as the base.
- `bun run lint` at repo root passes (warnings only), confirming the rollout is non-breaking.
- CI now contains an explicit `verify-eslint-config` job running `bun run verify:eslint`.
- `verify:eslint` now blocks package-level rule disables unless the config includes a tracking `TODO(...)` marker.
- `packages/auth`, `packages/graphql`, and `packages/lib` were cleaned to zero warnings under current rules via safe autofix + explicit `any` type removal.
- `packages/env/package.json` now includes `lint` and `typecheck` scripts so `bun run verify:eslint` passes for all workspaces.
- Shared base ignore patterns now include nested build outputs (for example `**/.next/**`) to prevent generated artifacts from being linted during direct app-path runs.
- App-by-app lint stabilization pass completed:
  - `apps/donor`: warning count reduced to 10 (all `no-explicit-any`).
  - `apps/missionary`: warning count reduced to 14 (all `no-explicit-any`).
  - `apps/admin`: now at 0 warnings after file-by-file cleanup (import ordering, unused symbols, and explicit typing replacements).
- `bun run lint`, `bun run verify:eslint`, and `bunx lint-staged --allow-empty` all pass with no lint errors.
