# E2E Tests

## Prerequisites

1. **Playwright browsers** (after install or `@playwright/test` upgrades):

   ```bash
   bunx playwright install chromium
   ```

   On Linux CI, prefer `bunx playwright install chromium --with-deps` so system libraries are present.

2. **Port conflicts:** The default donor dev server for Playwright uses port **3005** (`playwright.config.ts`). If a run aborts mid-flight, free the port before the next suite (or stop the stray `next dev` process).
3. **One dev server per app:** Next.js lets one `next dev` run per app directory; it holds `apps/<app>/.next/dev/lock` while it runs and the operating system releases it when the process dies, so nothing deletes that lock. If a `next dev` for the same app is already running on another port (for example `bun run dev:donor` on 3000), a local Playwright run stops before starting its own server and prints that server's URL, its PID, the command to stop it, and how to restart it on Playwright's port so it is reused (`tests/e2e/dev-server-lock.mjs`). CI never runs this check.

## Running E2E tests locally

`bun run test:e2e`

Uses `scripts/run-with-ci-env.mjs` so `SKIP_ENV_VALIDATION` and placeholder Supabase URLs apply unless `.env.local` overrides them.

## E2E auth bypass (`E2E_AUTH_BYPASS`)

When `E2E_AUTH_BYPASS=true` (non-production), `POST /api/auth/demo-account` sets the `asym_e2e_auth` cookie. **Middleware and `getAuthContext` must treat that cookie as a session** so protected routes (e.g. `/donor-dashboard`) and server layouts see an authenticated user without calling Supabase. That wiring lives in `@asym/auth/middleware` and `@asym/auth/context`.

The donor demo cookie uses seeded demo tenant/profile identifiers so dashboard routes that cross API boundaries can resolve the same account shape in CI and locally. Donor portal endpoints may serve deterministic E2E fixture data when bypass auth is enabled and no Supabase service-role client is configured.

Playwright config sets this automatically when `ASYM_USE_CI_ENV_DEFAULTS=1` (see root `playwright.config.ts`).

## Running in UI mode

`bun run test:e2e:ui`

## Viewing the HTML report

`npx playwright show-report`

## CI behavior

- `test-e2e-smoke` runs `bun run test:e2e:smoke` and is **blocking** on `develop` through `e2e-smoke-gate`, which the required `integration-gate` check depends on.
- Smoke starts donor and admin, then runs a bounded inventory: donor auth
  preflight/usability/donate, admin Support Hub, and upload-crop under the
  donor-auth Playwright project. It is not a substitute for `bun run test:a11y`,
  `bun run test:perf`, or the broader `bun run test:e2e` when those contracts
  are touched.
- `test-e2e` runs with `continue-on-error` for `develop` pull requests and pushes, so the full broad suite is informational there. On `production`, `e2e-gate` makes the bounded production-release path required.
- On failure, CI uploads the `playwright-smoke-report` artifact (smoke job) or the `playwright-report` artifact (full job) for debugging.

## Deterministic waits

- Prefer `expect.poll` or `page.waitForURL` over `page.waitForTimeout`.
- Do not stack a fixed sleep after a poll that already waited for the same condition.
- Unit guard: `tests/unit/e2e/e2e-flake-guards.test.ts` rejects `waitForTimeout(` in every `.ts` file under `tests/e2e/`.

## Growth plan - future tests to add

- Login / auth flow
- Donor checkout (full Stripe test mode)
- Admin tenant switching
- Missionary post creation
- Receipt download
