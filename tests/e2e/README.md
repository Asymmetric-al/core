# E2E Tests

## Prerequisites

1. **Playwright browsers** (after install or `@playwright/test` upgrades):

   ```bash
   bunx playwright install chromium
   ```

   On Linux CI, prefer `bunx playwright install chromium --with-deps` so system libraries are present.

2. **Port conflicts:** The default donor dev server for Playwright uses port **3005** (`playwright.config.ts`). If a run aborts mid-flight, free the port before the next suite (or stop the stray `next dev` process).

## Running E2E tests locally

`bun run test:e2e`

Uses `scripts/run-with-ci-env.mjs` so `SKIP_ENV_VALIDATION` and placeholder Supabase URLs apply unless `.env.local` overrides them.

## E2E auth bypass (`E2E_AUTH_BYPASS`)

When `E2E_AUTH_BYPASS=true` (non-production), `POST /api/auth/demo-account` sets the `asym_e2e_auth` cookie. **Middleware and `getAuthContext` must treat that cookie as a session** so protected routes (e.g. `/donor-dashboard`) and server layouts see an authenticated user without calling Supabase. That wiring lives in `@asym/auth/middleware` and `@asym/auth/context`.

Playwright config sets this automatically when `ASYM_USE_CI_ENV_DEFAULTS=1` (see root `playwright.config.ts`).

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
