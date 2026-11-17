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

The donor demo cookie uses seeded demo tenant/profile identifiers so dashboard routes that cross API boundaries can resolve the same account shape in CI and locally. Donor portal endpoints may serve deterministic E2E fixture data when bypass auth is enabled and no Supabase service-role client is configured.

Playwright config sets this automatically when `ASYM_USE_CI_ENV_DEFAULTS=1` (see root `playwright.config.ts`).

## Auth email round trips

`tests/e2e/auth-password-recovery.spec.ts` (a password recovery email in each
app) and `tests/e2e/auth-signup-confirmation.spec.ts` (a sign-up confirmed by
email lands signed in on the host it registered on, shown on two hosts of the
donor portal) need a real Supabase Auth server and its mail catcher, so they
run against a local Supabase stack:

```bash
bun run supabase -- start   # migrations, seed, Auth and Mailpit (Docker)
bun run test:e2e:auth-mail  # starts donor, admin and missionary dev servers
```

`scripts/e2e/run-auth-mail.mjs` reads the stack's URL, keys and Mailpit
address from `supabase status` and fails when it cannot, so the journeys never
skip silently. They create and delete their own logins with the service-role
key and refuse any Supabase URL that is not on this machine. The dev servers
listen on ports 3105 (donor), 3130 (admin) and 4100 (missionary); move them
with `AUTH_MAIL_DONOR_PORT`, `AUTH_MAIL_ADMIN_PORT` and
`AUTH_MAIL_MISSIONARY_PORT`, and set `PLAYWRIGHT_REUSE_EXISTING_SERVER=0` so a
server from another checkout is not reused. For a stack started from a scratch
copy with `--workdir` (its own project ID and ports), set
`AUTH_MAIL_SUPABASE_WORKDIR` to that directory. Pass Playwright arguments after
`--`, for example `bun run test:e2e:auth-mail -- --project=auth-mail-donor`.
CI runs the same command in `.github/workflows/auth-email.yml`
(`docs/ci.md`, "Auth email workflow").

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
