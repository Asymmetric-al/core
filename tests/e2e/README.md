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

The bypass is a UI fixture, not a Supabase session. It must not mint a JWT, fabricate a caller-token client or fall back to the service key. Use the isolated local Auth/PostgREST job for tests that need real scoped reads; the field-policy reader there verifies that the same signed-in token with and without the selected tenant and assignment produces different projections.

When `E2E_AUTH_BYPASS=true` (non-production), `POST /api/auth/demo-account` sets the `asym_e2e_auth` cookie. **Middleware and `getAuthContext` must treat that cookie as a session** so protected routes (e.g. `/donor-dashboard`) and server layouts see an authenticated user without calling Supabase. That wiring lives in `@asym/auth/middleware` and `@asym/auth/context`.

The bypass cookie's organization is `E2E_AUTH_TENANT_ID`, which must be set beside `E2E_AUTH_BYPASS=true` as a lowercase canonical UUID; without it the demo login answers `503` `DEMO_E2E_BYPASS_MISCONFIGURED` and mints no cookie (AL-2676). The launchers set it to the seed's demo organization, `00000000-0000-0000-0000-000000000001`, unless you set your own, and the cookie's profile is the seeded demo profile, so dashboard routes that cross API boundaries resolve the same account shape in CI and locally. Donor portal endpoints may serve deterministic E2E fixture data in that organization when bypass auth is enabled and no Supabase service-role client is configured.

Playwright config sets both automatically when `ASYM_USE_CI_ENV_DEFAULTS=1` (see root `playwright.config.ts`).

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
CI runs the same command in `.github/workflows/local-supabase.yml`
(`docs/ci.md`, "Local Supabase stack workflow").

Mission Control's CRM data journeys run in `tests/e2e/auth-crm-reads.spec.ts`
on the auth-mail admin project. They use the sign-in form and the local Auth
server for record search, tenant navigation, notes and relationships. The
demo-bypass smoke cases assert the page shell and its session-required reply.

The same stack carries `tests/e2e/auth-request-scope-reads.spec.ts`
(AL-2675): real people sign in through each app's own form and read real rows
through each tenant-scoped read path of WP2b's first release, against the
second release's policies. Each read is pinned against what the database
owner computes with the same rule, and a switch of organization or row must
show the other set and none of the first. The database owner adds the second
organization's rows before the journeys and removes them after. Its header
says which reads go through a page and which only by a direct call to the
route, because no screen calls them. Web Studio's Payload reads the stack's
database (`PAYLOAD_DATABASE_URI`, which the config takes from the stack when it
is unset).

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
