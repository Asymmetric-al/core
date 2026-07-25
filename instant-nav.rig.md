# instant-nav rig: give-hope (Asymmetric-al/core)

Rig file for the `next-cache-components-optimizer` workflow (`instant()` guards
in `tests/e2e/instant-navigation.spec.ts`). The guards need a **production**
build with the Next.js testing API exposed; `next dev` cannot produce a valid
verdict (no prefetching, unreliable lock).

- BUILD: local production build + start, per app. Donor (primary target):
  `VERCEL_ENV=preview EXPOSE_TESTING_API=1 bun run build:donor`
  then
  `VERCEL_ENV=preview EXPOSE_TESTING_API=1 node scripts/run-with-ci-env.mjs -- bun run --cwd apps/donor start -- --port 3006 --hostname 127.0.0.1`.
- EXPOSE: `experimental.exposeTestingApiInProductionBuild` requires both
  `EXPOSE_TESTING_API=1` and `VERCEL_ENV=preview` in each app `next.config.ts`.
  `EXPOSE_TESTING_API` is set only for this rig's build/start; Vercel production
  builds never set it.
- RUN: `INSTANT_NAV_RIG=1 PLAYWRIGHT_BASE_URL=http://127.0.0.1:3006 node scripts/run-with-ci-env.mjs -- node node_modules/@playwright/test/cli.js test tests/e2e/instant-navigation.spec.ts --project=chromium`.
  The spec self-skips unless `INSTANT_NAV_RIG=1`, so dev-server CI jobs
  (`.github/workflows/ci-integration.yml` runs apps with `next dev`) never
  record a vacuous verdict.
  **Under `CI=true` two more vars are required**, or `playwright.config.ts`
  still defines a `webServer` and spawns `next dev` — colliding with the
  production server on 3006, and measuring a dev server if it resolved the
  other way, which is exactly the untrustworthy verdict the skip exists to
  prevent:
  - `PLAYWRIGHT_REUSE_EXISTING_SERVER=1` — reuse the production server
    (health-checked via `/api/playwright-ready`) instead of spawning one.
  - `PLAYWRIGHT_INCLUDE_ADMIN=0` — don't also start the admin dev server.
    The `instant-nav` job in `.github/workflows/ci-integration.yml` is the
    canonical invocation.
- TEST USER: donor public routes run unauthenticated. Authenticated routes use
  the demo donor session via `installDemoSessionInBrowser(page, "donor")`
  (POST `/api/auth/demo-account`, zero-config E2E bypass on loopback).
- DRIFT: E2E auth bypass vs real Supabase sessions; placeholder Supabase env
  (`run-with-ci-env.mjs`) vs hosted data; seeded demo/mock data on public
  pages; no feature flags on the donor public site today.
- LOOP: local build → start → test (no push needed). Agent limits: none for
  the local rig. Windows walls apply (see WALLS).
- LIVENESS: n/a — the local rig always serves the freshly built artifact.
- WALLS: Bun isolated-linker hollow workspace links break builds
  (`scripts/repair-workspace-links.mjs` self-heals in postinstall and
  `scripts/verify/ci-build.mjs`); worktrees need `run-with-ci-env.mjs` for
  `NEXT_PUBLIC_*` env; builds on Windows dev machines are slow (~30 min cold),
  so keep the built `.next` around and only rebuild when app code changes.
