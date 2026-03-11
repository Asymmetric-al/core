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

- `epic` requires:
  - `ci-gate`
- `develop` requires:
  - `ci-gate`
  - `integration-gate`
- `main` requires:
  - `ci-gate`
  - `integration-gate`
  - `e2e-gate`

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
- `e2e-gate` covers:
  - `test-e2e` on `main` only
  - On `develop`, E2E remains informational (non-blocking)

## Contributor PR Checklist

- Run local baseline checks before opening/updating PR:
  - `bun run format:check && bun run lint && bun run typecheck && bun run build && bun run test:unit`
- If your change affects user flows, also run:
  - `bun run test:e2e`
- Confirm branch target is correct (`epic`, `develop`, or `main`).

## Changing Ownership

To change owners:

1. Update `/.github/CODEOWNERS` (and keep `/CODEOWNERS` in sync).
2. Open a PR describing why ownership changed.
3. Ask current owner/maintainer to approve.
