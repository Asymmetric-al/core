# Working Set

Agents MUST keep this file updated during a task. Use it to build the Nia query preamble.

## Current objective
- Implement review follow-up for unit test coverage generation in CI.
- Ensure `bun run test:unit` generates coverage output for the existing `coverage/` artifact upload.
- Keep coverage generation stable without introducing dependency install regressions in this environment.
- Harden staging coverage behavior to reduce future break risk while preserving current CI flow.
- Update CI docs to reflect current coverage output files.

## Repo scope
- repository: Asymmetric-al/core
- in-scope paths:
  - .github/workflows/ci.yml
  - package.json
  - vitest.config.ts
  - vitest.coverage-provider.mjs
  - docs/ci.md
  - docs/ai/working-set.md

## Stack tags
- Markdown
- GitHub Actions
- Bun
- Vitest
- CI/CD

## Known identifiers
- files:
  - .github/workflows/ci.yml
  - docs/ci.md
  - package.json
  - vitest.config.ts
- strings:
  - test-unit
  - bun run test:unit
  - actions/upload-artifact@v4
  - unit-test-coverage
  - coverage/
  - if-no-files-found: ignore

## Expected behavior
- `test-unit` runs on every PR/push in `ci.yml` and remains a required check (`CI / test-unit`).
- Unit tests are executed via `bun run test:unit` with Vitest coverage enabled.
- CI uploads `coverage/` as an informational artifact without failing when files are absent.

## Constraints
- Keep application/runtime behavior unchanged.
- Keep CI gate ordering intact (`format -> lint -> typecheck -> build -> test-unit`).
- Do not include secrets or credentials.

## Verification
`rg "test:unit|coverage|customProviderModule|coverage-summary|coverage-final|coverage-warnings|v8-raw-coverage|unit-test-coverage|if-no-files-found" -n package.json vitest.config.ts vitest.coverage-provider.mjs .github/workflows/ci.yml docs/ci.md`
`bun run test:unit`

## Verification status
- `rg "test:unit|coverage|customProviderModule|coverage-summary|coverage-final|coverage-warnings|v8-raw-coverage|unit-test-coverage|if-no-files-found" ...` passed for updated files.
- `bun run test:unit` blocked in this sandbox (`spawn EPERM` from Vitest/esbuild startup).
- `bun run format:check -- ...` is noisy in this environment due an unreadable `.tmp` entry; changed files themselves are formatted.
