# CI Reference

## Overview

CI is split across two workflow files, and they do **not** run on exactly the same branches:

| Workflow          | File                                   | Branches                                  | Jobs                                                            | Target time               |
| ----------------- | -------------------------------------- | ----------------------------------------- | --------------------------------------------------------------- | ------------------------- |
| Fast checks       | `.github/workflows/ci.yml`             | PRs + pushes on `develop`, `main`, `epic` | `format → lint → typecheck → build → test-unit → test-unit-cms` | < 4 min with remote cache |
| Integration + E2E | `.github/workflows/ci-integration.yml` | PRs + pushes on `develop`, `main`         | `migrate → smoke → test-e2e`                                    | ~5 min                    |

Current workflow semantics:

- `ci.yml` is the always-on fast gate for the active long-lived branches (`develop`, `main`, `epic`).
- `ci-integration.yml` is intentionally skipped for `epic`.
- `test-e2e` is **informational on `develop`** (`continue-on-error: true` there).
- `test-e2e` is **enforced on `main`** through the workflow's `e2e-gate`.

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

- _What it checks:_ Runs `bun run build` (Turborepo → `next build` for all apps). The script applies CI-equivalent env defaults (`SKIP_ENV_VALIDATION=1` and stub Supabase keys) when missing.
- _Why it exists:_ Catches bundle errors, missing imports, and Next.js build-time failures that type-checking alone cannot catch.
- _Debug locally:_ Run `bun run build` for CI-equivalent behavior, or `bun run build:strict` to validate with real local env values only.

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
- _Debug locally:_ Run `bun run db:migrate:local` (applies migrations without seed) or `bun run seed:demo:local` (migrate + seed via helper script).

### `smoke` (needs: `migrate`)

- _What it does:_ Starts `apps/donor` on port 3005 with `SKIP_ENV_VALIDATION=1` and stub Supabase values, polls `http://127.0.0.1:3005/api/health` for up to 60 seconds, then asserts the response contains `"status":"ok"`.
- _Why it matters:_ Verifies the app boots without a crash — catches missing imports, broken middleware, and startup-time errors that build alone cannot catch.
- _Debug locally:_ Run `bun run test:e2e` (default CI-equivalent env) or `bun run dev:donor` with real `.env.local` values, then `curl http://localhost:3005/api/health`. Expect `{"status":"ok","checks":{"supabase":"ok"}}`.

### `test-e2e` (needs: `smoke`)

- _What it does:_ Re-applies SQL migrations against a fresh Postgres container, runs Payload migrations + status checks, then applies seed data, starts `apps/donor` on port 3005, enables deterministic test auth mode (`E2E_AUTH_BYPASS=true`) for Playwright web servers, executes demo-auth preflight (`bun run test:e2e:auth-preflight`), then runs two suites:
  1. `bun run test:e2e --project=chromium` (core donor suite, excludes `@cms`, `@perf`, `@manual`)
  2. `bun run test:e2e:cms --project=chromium` (CMS/admin suite tagged `@cms`, excludes `@manual`)
     Uploads `playwright-report/` as an artifact on failure (retained 7 days).
- _Branch behavior:_ On `develop`, this job is informational (`continue-on-error: true`). On `main`, it is enforced by the workflow's `e2e-gate`. This workflow does not run on `epic`.
- _Debug locally:_ Run `bun run test:e2e:auth-preflight` first, then `bun run test:e2e` (core suite), `bun run test:e2e:cms` (CMS/admin suite), `bun run test:e2e:strict` (core strict env), `bun run test:e2e:cms:strict` (CMS strict env), `bun run test:perf` (perf-only suites), or `bun run test:e2e --project=chromium` (Chromium only). Use `bun run test:e2e:ui` for interactive debugging.

---

## Branch protection

The workflow files are the source of truth for execution. Branch protection should mirror the behavior you want to enforce in GitHub.

### Recommended baseline checks

These are the fast checks that match the repository's default "must stay green" contract:

- `CI / format`
- `CI / lint`
- `CI / typecheck`
- `CI / build`
- `CI / test-unit`
- `CI / test-unit-cms`

### Integration checks by branch

- `develop`: `CI Integration / migrate` and `CI Integration / smoke` run; `CI Integration / test-e2e` is visible but intentionally non-blocking.
- `main`: `CI Integration / migrate`, `CI Integration / smoke`, and the workflow's `CI Integration / e2e-gate` represent the enforced path.
- `epic`: only `ci.yml` runs; `ci-integration.yml` does not trigger.

### GitHub branch rule guidance

1. Go to _Settings → Branches → Branch protection rules_.
2. Add a rule for each protected branch you care about (`main`, `develop`, and optionally `epic` if you want fast checks enforced there too).
3. Enable **Require status checks to pass before merging**.
4. Add the six fast checks listed above everywhere.
5. For `main`, also consider requiring the integration workflow's gate job so E2E failures cannot be ignored.
6. For `develop`, leave `CI Integration / test-e2e` optional if you want the current "signal, not blocker" behavior to remain intact.

---

## Turborepo cache

- **Remote cache (preferred):** All `ci.yml` jobs set `TURBO_TOKEN` (secret) and `TURBO_TEAM` (variable). When both are present, Turborepo uses Vercel's remote cache — unchanged tasks are skipped entirely. To verify: look for `"Remote cache hit"` in the CI job logs.
- **Local fallback:** Each job also caches `.turbo/` and app-level Next build cache directories (`apps/*/.next/cache`) via `actions/cache@v4`, keyed on `turbo-${{ runner.os }}-${{ github.sha }}` with a restore prefix of `turbo-${{ runner.os }}-`. This aligns with Next.js CI cache guidance and improves repeat build performance when remote cache is unavailable.
- **See also:** `file:.github/SECRETS.md` for how to configure `TURBO_TOKEN` and `TURBO_TEAM`.
