# Working Set

Agents MUST keep this file updated during a task. Use it to build the Nia query preamble.

## Current objective
- Run a follow-up docs consistency pass after `@asym/env` landed.
- Remove stale "placeholder/T6" wording for `packages/env`.
- Ensure monorepo package counts/examples reflect `@asym/env`.

## Repo scope
- repository: Asymmetric-al/core
- in-scope paths:
  - README.md
  - docs/guides/architecture/overview.md
  - docs/guides/development/getting-started.md
  - docs/ai/working-set.md

## Stack tags
- Markdown
- Documentation
- Monorepo conventions
- Environment schema

## Known identifiers
- files:
  - README.md
  - docs/guides/architecture/overview.md
  - docs/guides/development/getting-started.md
- strings:
  - packages/env
  - @asym/env
  - shared packages
  - placeholder
  - T6

## Expected behavior
- Root README workspace contract describes `packages/env` as active shared env schema/config.
- Architecture and onboarding docs list the correct shared package count and include `@asym/env`.
- Import examples/path aliases include `@asym/env` where package examples are shown.

## Constraints
- Keep changes docs-only and minimal.
- Do not change runtime behavior.
- Do not include secrets or credentials.

## Verification
- `rg "placeholder workspace|implemented in T6|six shared packages" -n README.md docs/guides`
- `rg "@asym/env|packages/env" -n README.md docs/guides/architecture/overview.md docs/guides/development/getting-started.md`
- `git diff -- README.md docs/guides/architecture/overview.md docs/guides/development/getting-started.md docs/ai/working-set.md`

## Verification status
- `rg "placeholder workspace|implemented in T6|six shared packages" -n README.md docs/guides` returns no matches.
- `rg "@asym/env|packages/env" -n README.md docs/guides/architecture/overview.md docs/guides/development/getting-started.md` confirms updated references.
- `git diff -- README.md docs/guides/architecture/overview.md docs/guides/development/getting-started.md docs/ai/working-set.md` reviewed.
