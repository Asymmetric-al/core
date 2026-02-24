# CI Reference

## Overview

Two workflow files run on every PR to `develop` and `main`, and on every push to `main`:

| Workflow    | File                                   | Jobs                                                            | Target time               |
| ----------- | -------------------------------------- | --------------------------------------------------------------- | ------------------------- |
| Fast checks | `.github/workflows/ci.yml`             | `format → lint → typecheck → build → test-unit → test-unit-cms` | < 4 min with remote cache |
| Integration | `.github/workflows/ci-integration.yml` | `migrate → smoke → test-e2e`                                    | ~5 min                    |

All fast-check jobs are **required** status checks. `test-e2e` is **informational only** (non-blocking).

---

## Fast-checks workflow (`ci.yml`)

### `format`

- _What it checks:_ Runs `bun run format:check` (Prettier). Fails if any file is not formatted.
- _Why it exists:_ Prevents formatting drift that causes noisy diffs and merge conflicts.
- _Debug locally:_ Run `bun run format:check` to see violations; run `bun run format` to auto-fix, then re-check.

### `lint` (needs: `format`)

- _What it checks:_ Runs `bun run lint` (Turborepo → ESLint flat config across all workspaces), then `bun run verify:workspace-contract` (workspace dependency contract), then `bun run verify:eslint` (ESLint config contract — no legacy `.eslintrc.*`, all packages have `eslint.config.mjs`, disable comments have tracking references).
- _Why it exists:_ Enforces consistent code quality and prevents ESLint config drift.
- _Debug locally:_ Run each command individually: `bun run lint`, `bun run verify:workspace-contract`, `bun run verify:eslint`.

### `typecheck` (needs: `lint`)

- _What it checks:_ Runs `bun run typecheck` (Turborepo → `tsc --noEmit` across all apps and packages).
- _Why it exists:_ Catches type errors that TypeScript strict mode would surface at compile time but not at runtime.
- _Debug locally:_ Run `bun run typecheck`. Per-app: `bun run typecheck:donor`, `bun run typecheck:admin`, `bun run typecheck:missionary`.

### `build` (needs: `typecheck`)

- _What it checks:_ Runs `bun run build` (Turborepo → `next build` for all apps). Uses `SKIP_ENV_VALIDATION=1` so `@asym/env` does not throw on missing real Supabase keys — stub values are injected from secrets.
- _Why it exists:_ Catches bundle errors, missing imports, and Next.js build-time failures that type-checking alone cannot catch.
- _Debug locally:_ Run `SKIP_ENV_VALIDATION=1 bun run build`. If you have real env values, omit `SKIP_ENV_VALIDATION`.

### `test-unit` (needs: `build`)

- _What it checks:_ Runs `bun run test:unit` (Vitest with coverage enabled, targets `tests/unit/**/*.test.ts(x)`, `environment: "node"`).
- _Artifacts:_ Uploads generated `coverage/` as `unit-test-coverage` (`if-no-files-found: ignore`, retained for 7 days). Current staging output includes `coverage-summary.json`, `coverage-final.json`, `v8-raw-coverage.json`, and `coverage-warnings.log`.
- _Why it exists:_ Validates pure logic, utilities, and shared package behaviour without a browser or network.
- _Debug locally:_ Run `bun run test:unit` to execute unit tests and generate coverage output in `coverage/`. For watch mode: `bunx vitest`.

### `test-unit-cms`

- _What it checks:_ Runs `bun run test:unit:cms` (focused Vitest gate on `tests/unit/cms/**/*.test.ts`).
- _Why it exists:_ Keeps tenant isolation + public CMS contract regressions visible as an explicit blocking check.
- _Debug locally:_ Run `bun run test:unit:cms`.

---

## Integration workflow (`ci-integration.yml`)

### `migrate`

- _What it does:_ Spins up a fresh `postgres:15-alpine` container, applies every file in `supabase/migrations/*.sql` in lexicographic order (using `psql` with `ON_ERROR_STOP=1`), then runs Payload migrations via `bun run cms:migrate` and verifies status with `bun run cms:migrate:status`, then applies `supabase/seed.sql`. Verifies that `public.profiles` has exactly 1 row after seeding.
- _Why it matters:_ Catches migration ordering conflicts across both SQL + Payload migration systems, plus FK/seed incompatibilities, before they reach a hosted Supabase project.
- _Debug locally:_ Run `supabase db reset --local` (applies migrations + seed against the local Supabase stack). Or run `bash ./scripts/seed-demo.sh local`.

### `smoke` (needs: `migrate`)

- _What it does:_ Starts `apps/donor` on port 3005 with `SKIP_ENV_VALIDATION=1` and stub Supabase values, polls `http://127.0.0.1:3005/api/health` for up to 60 seconds, then asserts the response contains `"status":"ok"`.
- _Why it matters:_ Verifies the app boots without a crash — catches missing imports, broken middleware, and startup-time errors that build alone cannot catch.
- _Debug locally:_ Run `bun run dev:donor` and then `curl http://localhost:3005/api/health`. Expect `{"status":"ok","timestamp":"..."}`.

### `test-e2e` (needs: `smoke`, `continue-on-error: true`)

- _What it does:_ Re-applies SQL migrations against a fresh Postgres container, runs Payload migrations + status checks, then applies seed data, starts `apps/donor` on port 3005, executes demo-auth preflight (`bun run test:e2e:auth-preflight`) for deterministic authenticated fixture validation, then runs `bun run test:e2e --project=chromium` against critical E2E specs (perf-tagged specs are excluded from default E2E). Uploads `playwright-report/` as an artifact on failure (retained 7 days).
- _Why it's non-blocking:_ The E2E suite is still growing. Failures are surfaced as informational signals without blocking merges. See branch protection section below.
- _Debug locally:_ Run `bun run test:e2e:auth-preflight` first, then `bun run test:e2e` (critical suites), `bun run test:perf` (perf-only suites), or `bun run test:e2e --project=chromium` (Chromium only). Use `bun run test:e2e:ui` for interactive debugging.

---

## Branch protection

**Required checks (must pass to merge):**

- `CI / format`
- `CI / lint`
- `CI / typecheck`
- `CI / build`
- `CI / test-unit`
- `CI / test-unit-cms`

**Informational only (not required):**

- `CI / test-e2e` — non-blocking; failures are visible but do not block merge.

**How to configure in GitHub:**

1. Go to _Settings → Branches → Branch protection rules_.
2. Add a rule for `main` (and optionally `develop`).
3. Enable **Require status checks to pass before merging**.
4. Search for and add each of the six required checks listed above.
5. Do **not** add `CI / test-e2e` as a required check.

---

## Turborepo cache

- **Remote cache (preferred):** All `ci.yml` jobs set `TURBO_TOKEN` (secret) and `TURBO_TEAM` (variable). When both are present, Turborepo uses Vercel's remote cache — unchanged tasks are skipped entirely. To verify: look for `"Remote cache hit"` in the CI job logs.
- **Local fallback:** Each job also caches `.turbo/` and app-level Next build cache directories (`apps/*/.next/cache`) via `actions/cache@v4`, keyed on `turbo-${{ runner.os }}-${{ github.sha }}` with a restore prefix of `turbo-${{ runner.os }}-`. This aligns with Next.js CI cache guidance and improves repeat build performance when remote cache is unavailable.
- **See also:** `file:.github/SECRETS.md` for how to configure `TURBO_TOKEN` and `TURBO_TEAM`.
