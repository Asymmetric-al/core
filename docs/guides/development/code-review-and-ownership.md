# Code Review and Ownership

This document defines who owns code review decisions and what contributors should expect before merging.

## Default Owners

- Repository default code owners: `@II-ricky-bobby-II` and `@cobmojo`
- Source of truth: `/.github/CODEOWNERS` (also mirrored in `/CODEOWNERS`)

GitHub uses CODEOWNERS to route reviews on pull requests that touch owned paths.
Ownership is not authorization: listing an owner does not grant a repository
role, satisfy any independent-approval rule by itself, or bypass checks, branch
protection, conversation resolution, or the production release guard.

## Review Expectations

- Keep PRs focused and small when possible.
- Include a clear PR summary and test plan.
- Resolve reviewer feedback before merge.
- Do not merge when required status checks are failing.

## Required Gates by Branch

GitHub's live branch rules determine the required contexts. See
`docs/ci.md#branch-protection` for the dated inventory; workflow job existence
alone does not prove that GitHub requires that context. The canonical repository
has no `main` branch; do not create or target one.

## What Each Gate Covers

- `ci-gate` covers:
  - `format`
  - `lint`
  - `typecheck`
  - `build`
  - `test-unit`
- `integration-gate` covers:
  - `migrate` (DB migrations + seed verification)
  - `smoke` (app boot + health check)
  - `e2e-smoke-gate` (summary gate for `test-e2e-smoke`)
- `e2e-smoke-gate` covers:
  - `test-e2e-smoke` (`bun run test:e2e:smoke`)
- `e2e-gate` covers:
  - bounded production-release Playwright coverage through
    `bun run test:e2e:production-gate`
  - app-specific boneyard smoke checks
  - portable `@cms` coverage; local-seed-only `@cms-local` proof stays in
    `bun run test:e2e:cms:local`
  - On `develop`, the full `test-e2e` job remains informational (non-blocking);
    bounded smoke has its own `e2e-smoke-gate`, which `integration-gate` also
    depends on

## Contributor PR Checklist

- Confirm the normal PR base is `develop`. Internal developers push a canonical
  feature branch; external contributors push a fork branch.
- Run `bun run ci:preflight` before opening or updating a PR.
- If your change affects user flows, also run:
  - `bun run test:e2e:production-gate`
  - `bun run test:e2e` for broader local coverage when the change needs it
- Confirm branch target is correct: `develop` for development validation and
  `production` only for an intentional production release.

## Changing Ownership

To change owners:

1. Update `/.github/CODEOWNERS` (and keep `/CODEOWNERS` in sync).
2. Open a PR describing why ownership changed.
3. Ask an applicable current owner/maintainer to review. GitHub's live branch
   rules determine whether that review is sufficient to merge.
