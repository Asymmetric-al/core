# E2E Tests

## Running E2E tests locally

`bun run test:e2e`

## Running in UI mode

`bun run test:e2e:ui`

## Viewing the HTML report

`npx playwright show-report`

## CI behavior

The `test-e2e` job in `.github/workflows/ci-integration.yml` is configured with `continue-on-error: true`, so failures are informational and do not block merges. On failure, CI uploads `playwright-report/` as an artifact for debugging.

## Growth plan - future tests to add

- Login / auth flow
- Donor checkout (full Stripe test mode)
- Admin tenant switching
- Missionary post creation
- Receipt download
