# CI Reference

## Overview

Two workflow files run on every PR to `develop` and `main`, and on every push to `main`:

| Workflow    | File                                   | Jobs                                            | Target time               |
| ----------- | -------------------------------------- | ----------------------------------------------- | ------------------------- |
| Fast checks | `.github/workflows/ci.yml`             | `check → typecheck → build → test-unit` + non-blocking `check-full` | < 3 min with remote cache |
| Integration | `.github/workflows/ci-integration.yml` | `migrate → smoke → test-e2e`                    | ~5 min                    |

All fast-check jobs are **required** status checks. `test-e2e` is **informational only** (non-blocking).

## Local CI parity (pre-push)

Use the local preflight command to mirror blocking GitHub checks before pushing:

```bash
bun run ci:preflight
```

`ci:preflight` runs the same gate order as `.github/workflows/ci.yml`:

1. `check`
2. `verify:data-boundary`
3. `verify:workspace-contract`
4. `verify:lint-config`
5. `typecheck`
6. `build` (with CI-compatible env defaults for local parity)
7. `test:unit`

This command is wired into `.husky/pre-push` so pushes fail fast when a blocking CI gate would fail in GitHub.

### Tooling warning audit (periodic)

Run this maintenance check to detect known test-runner deprecation warnings (for example, Vite CJS Node API deprecations) before they become CI noise:

```bash
bun run test:unit:warnings
```

This check runs unit tests and fails if blocked warning patterns are present in test output.

---

## Fast-checks workflow (`ci.yml`)

### `check`

- _What it checks:_ Runs `bun run check` (incremental Ultracite Biome check scoped to changed files in the event range), then `bun run verify:data-boundary`, then `bun run verify:workspace-contract`, then `bun run verify:lint-config`.
- _Why it exists:_ Keeps code quality enforcement non-mutating and practical while legacy lint debt is burned down incrementally.
- _Debug locally:_ Run each command individually: `bun run check`, `bun run verify:data-boundary`, `bun run verify:workspace-contract`, `bun run verify:lint-config`.

### `check-full` (non-blocking)

- _What it checks:_ Runs `bun run check:full` (full-repo Ultracite Biome scan).
- _Why it exists:_ Maintains continuous visibility into remaining baseline lint debt without blocking merges.
- _Debug locally:_ Run `bun run check:full`.

### `typecheck` (needs: `check`)

- _What it checks:_ Runs `bun run typecheck` (Turborepo → `tsc --noEmit` across all apps and packages).
- _Why it exists:_ Catches type errors that TypeScript strict mode would surface at compile time but not at runtime.
- _Debug locally:_ Run `bun run typecheck`. Per-app: `bun run typecheck:donor`, `bun run typecheck:admin`, `bun run typecheck:missionary`.

### `build` (needs: `typecheck`)

- _What it checks:_ Runs `bun run build` (Turborepo → `next build` for all apps). The script applies CI-equivalent env defaults (`SKIP_ENV_VALIDATION=1` and stub Supabase keys) when missing.
- _Why it exists:_ Catches bundle errors, missing imports, and Next.js build-time failures that type-checking alone cannot catch.
- _Lint note (Next.js 16):_ `next build` no longer runs linting. Linting is enforced by the CI `check` job.
- _Debug locally:_ Run `bun run build` for CI-equivalent behavior, or `bun run build:strict` to validate with real local env values only.

### `test-unit` (needs: `build`)

- _What it checks:_ Runs `bun run test:unit` (Vitest with coverage enabled, targets `tests/unit/**/*.test.ts(x)`, `environment: "node"`).
- _Artifacts:_ Uploads generated `coverage/` as `unit-test-coverage` (`if-no-files-found: ignore`, retained for 7 days). Current staging output includes `coverage-summary.json`, `coverage-final.json`, `v8-raw-coverage.json`, and `coverage-warnings.log`.
- _Why it exists:_ Validates pure logic, utilities, and shared package behaviour without a browser or network.
- _Debug locally:_ Run `bun run test:unit` to execute unit tests and generate coverage output in `coverage/`. For watch mode: `bunx vitest`.

---

## Integration workflow (`ci-integration.yml`)

### `migrate`

- _What it does:_ Spins up a fresh `postgres:15-alpine` container, applies every file in `supabase/migrations/*.sql` in lexicographic order (using `psql` with `ON_ERROR_STOP=1`), then applies `supabase/seed.sql`. Verifies that `public.profiles` has exactly 1 row after seeding.
- _Why it matters:_ Catches migration ordering conflicts, FK violations, and seed incompatibilities before they reach a hosted Supabase project.
- _Debug locally:_ Run `supabase db reset --local` (applies migrations + seed against the local Supabase stack). Or run `bash ./scripts/seed-demo.sh local`.

### `smoke` (needs: `migrate`)

- _What it does:_ Starts `apps/donor` on port 3005 with `SKIP_ENV_VALIDATION=1` and stub Supabase values, polls `http://127.0.0.1:3005/api/health` for up to 60 seconds, then asserts the response contains `"status":"ok"`.
- _Why it matters:_ Verifies the app boots without a crash — catches missing imports, broken middleware, and startup-time errors that build alone cannot catch.
- _Debug locally:_ Run `bun run test:e2e` (default CI-equivalent env) or `bun run dev:donor` with real `.env.local` values, then `curl http://localhost:3005/api/health`. Expect `{"status":"ok","checks":{"supabase":"ok"}}`.

### `test-e2e` (needs: `smoke`, `continue-on-error: true`)

- _What it does:_ Re-applies migrations and seed against a fresh Postgres container, starts `apps/donor` on port 3005, then runs `bun run test:e2e --project=chromium` against critical E2E specs (perf-tagged specs are excluded from default E2E). Uploads `playwright-report/` as an artifact on failure (retained 7 days).
- _Why it's non-blocking:_ The E2E suite is still growing. Failures are surfaced as informational signals without blocking merges. See branch protection section below.
- _Debug locally:_ Run `bun run test:e2e` (critical suites, CI-equivalent defaults), `bun run test:perf` (perf-only suites), or `bun run test:e2e --project=chromium` (Chromium only). Use `bun run test:e2e:ui` for interactive debugging. For strict env validation, use `bun run test:e2e:strict`.

---

## Branch protection

**Required checks (must pass to merge):**

- `CI / check`
- `CI / typecheck`
- `CI / build`
- `CI / test-unit`

**Informational only (not required):**

- `CI / check-full` — non-blocking full lint baseline visibility.
- `CI / test-e2e` — non-blocking; failures are visible but do not block merge.

**How to configure in GitHub:**

1. Go to _Settings → Branches → Branch protection rules_.
2. Add a rule for `main` (and optionally `develop`).
3. Enable **Require status checks to pass before merging**.
4. Search for and add each of the five required checks listed above.
5. Do **not** add `CI / check-full` or `CI / test-e2e` as required checks.

---

## Turborepo cache

- **Remote cache (preferred):** All `ci.yml` jobs set `TURBO_TOKEN` (secret) and `TURBO_TEAM` (variable). When both are present, Turborepo uses Vercel's remote cache — unchanged tasks are skipped entirely. To verify: look for `"Remote cache hit"` in the CI job logs.
- **Local fallback:** Each job also caches `.turbo/` via `actions/cache@v4` keyed on `turbo-${{ runner.os }}-${{ github.sha }}` with a restore prefix of `turbo-${{ runner.os }}-`. This ensures incremental builds even when the remote cache is unavailable.
- **See also:** `file:.github/SECRETS.md` for how to configure `TURBO_TOKEN` and `TURBO_TEAM`.
