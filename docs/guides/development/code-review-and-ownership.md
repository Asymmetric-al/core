# Code Review and Ownership

This document defines who owns code review decisions and what contributors should expect before merging.

## Default Owner

- Repository default code owner: `@II-ricky-bobby-II`
- Source of truth: `/.github/CODEOWNERS` (also mirrored in `/CODEOWNERS`)

GitHub uses CODEOWNERS to automatically request reviews on pull requests that touch owned paths.

## Review Expectations

- Keep PRs focused and small when possible.
- Include a clear PR summary and test plan.
- Resolve reviewer feedback before merge.
- Do not merge when required status checks are failing.

## Required Gates by Branch

The repo uses gate jobs as merge controls. Gate jobs are summary checks that fail when any prerequisite check fails.

- `production` requires:
  - `ci-gate`
  - `integration-gate`
  - `e2e-gate`
- `develop` requires:
  - `ci-gate`
  - `integration-gate`
  - `e2e-smoke-gate`
- `main` is retired/protected historical history and is not an active PR or
  deploy target.

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
    bounded smoke is enforced separately through `e2e-smoke-gate`

## Contributor PR Checklist

- Run local baseline checks before opening/updating PR:
  - `bun run format:check && bun run lint && bun run typecheck && bun run build && bun run test:unit`
- If your change affects user flows, also run:
  - `bun run test:e2e:production-gate`
  - `bun run test:e2e` for broader local coverage when the change needs it
- Confirm branch target is correct: `develop` for staging validation, `production`
  only for an intentional production release, and never `main`.

## Changing Ownership

To change owners:

1. Update `/.github/CODEOWNERS` (and keep `/CODEOWNERS` in sync).
2. Open a PR describing why ownership changed.
3. Ask current owner/maintainer to approve.
