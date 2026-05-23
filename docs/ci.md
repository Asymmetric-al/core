# CI Reference

## Overview

Two workflow files run on every PR to `develop` and `epic`, and on every push to
`develop` and `epic`:

| Workflow          | File                                   | Branches                          | Jobs                                            | Target time               |
| ----------------- | -------------------------------------- | --------------------------------- | ----------------------------------------------- | ------------------------- |
| Fast checks       | `.github/workflows/ci.yml`             | PRs + pushes on `develop`, `epic` | `format → lint → typecheck → build → test-unit` | < 4 min with remote cache |
| Integration + E2E | `.github/workflows/ci-integration.yml` | PRs + pushes on `develop`, `epic` | `migrate → smoke → test-e2e-smoke → test-e2e`   | ~5–25 min                 |

Current workflow semantics:

- `ci.yml` is the always-on fast gate for the active long-lived branches (`develop`, `epic`).
- `ci-integration.yml` runs on the same active long-lived branches.
- `test-e2e-smoke` is **blocking on `develop`** through `e2e-smoke-gate` and `integration-gate`.
- `test-e2e` is **informational on `develop`** (`continue-on-error: true` there).
- `test-e2e` is enforced on `epic` through the workflow's `e2e-gate`, and
  branch protection must require `ci-gate`, `integration-gate`, and `e2e-gate`
  before production release PRs can merge.
- `main` is retired and protected historical history; active workflows do not
  treat it as staging or production.

## Local CI parity (pre-push)

Use the local preflight command to mirror blocking GitHub checks before pushing:

```bash
bun run ci:preflight
```

`ci:preflight` runs the same gate order as `.github/workflows/ci.yml`:

1. `verify:git-attribution`
2. `format:check`
3. `skills:verify`
4. `lint`
5. `verify:data-boundary`
6. `verify:workspace-contract`
7. `verify:eslint`
8. `verify:shadcn-diff`
9. `typecheck`
10. `build` (with CI-compatible env defaults for local parity)
11. `test:unit`

Regression guards: `tests/unit/scripts/ci-preflight.contract.test.ts` (stage order),
`tests/unit/scripts/local-gates.contract.test.ts` (`bun run check`), and
`tests/unit/apps/donor-missionary-unit-smoke.contract.test.ts` (app unit smoke paths).

This command is wired into `.husky/pre-push` so pushes fail fast when a blocking CI gate would fail in GitHub.

`verify:git-attribution` blocks local pushes when Git is configured as
`Codex <codex@example.com>`, when the latest commit uses that identity, or when
GitHub resolves the latest commit to `abiatarprado`. The allowed identities are
`Blake <blake@risencode.org>` and
`Blake <116130409+II-ricky-bobby-II@users.noreply.github.com>`.

### Production release guard

Direct pushes to `epic` are blocked by `.husky/pre-push` unless they come from
the production release command:

```bash
bun run release:production
```

The release command checks deployment discipline, Git attribution, local CI
preflight, and deployment impact before pushing `HEAD` to `origin/epic`.
Emergency bypasses require an explicit reason:

```bash
ASYM_PRODUCTION_PUSH_BYPASS_REASON="restore previous production deploy" git push origin HEAD:epic
```

Run this verifier after deployment-control changes:

```bash
bun run verify:deployment-discipline
bun run verify:vercel-build-controls
```

### Phase 11 reliability proof

Run these focused checks when a change touches Sentry release wiring,
release-health monitoring, Vercel deployment controls, or backup/restore proof:

```bash
bun run verify:sentry-release
bun run verify:vercel-build-controls
bun run verify:vercel-env-inventory
bun run verify:backup-restore
```

`verify:sentry-release` proves all three Next.js configs use the shared Sentry
build options, source map upload remains disabled without `SENTRY_AUTH_TOKEN`,
release/source map upload turns on when the build-only token is present, and
Turbo hashes the Sentry build inputs.

`verify:vercel-env-inventory` prints Vercel variable names and value types by
environment for `admin`, `donor`, and `missionary`. It does not print values.

`verify:backup-restore` runs `pg_dump` and `pg_restore` between disposable
Postgres containers and reports restored row counts and marker ranges. It must
not be pointed at production data.

### CRM production cutover gate

Twenty CRM production cutovers use the same fast CI gate plus OpenSpec and
data-boundary checks before any domain can depend on Twenty in production.

Run this sequence for Phase 07 cutover evidence:

```bash
bun run format:check
bun run skills:verify
bun run verify:data-boundary
bun run lint
bun run typecheck
bun run build
bun run test:unit
bunx @fission-ai/openspec@latest validate integrate-twenty-crm-core --strict
```

Record the command results in the domain evidence note described by
`docs/guides/operations/twenty-crm-cutover.md`. This gate does not replace the
domain-specific production requirements for monitoring, backup/restore proof,
rollback rehearsal, security review, and support ownership.

### Tooling warning audit (periodic)

Run this maintenance check to detect known test-runner deprecation warnings (for example, Vite CJS Node API deprecations) before they become CI noise:

```bash
bun run test:unit:warnings
```

This check runs unit tests and fails if blocked warning patterns are present in test output.

---

## Fast-checks workflow (`ci.yml`)

### `format`

- _What it checks:_ Runs `bun run format:check` (Prettier) and `bun run skills:verify` (skills mirror drift gate). Fails if formatting or mirror sync is out of policy.
- _Why it exists:_ Prevents formatting drift and skill-source/mirror drift that cause noisy diffs and review confusion.
- _Debug locally:_ Run `bun run format:check`; if needed run `bun run format`. Then run `bun run skills:verify` (or `bun run skills:sync` to update mirrors) and re-check.

### `lint` (needs: `format`)

- _What it checks:_ Runs `bun run lint` (Turborepo → ESLint flat config across all workspaces), then `bun run verify:data-boundary` (architecture/data-access boundary contract), then `bun run verify:workspace-contract` (workspace dependency contract), then `bun run verify:eslint` (ESLint config contract — no legacy `.eslintrc.*`, all packages have `eslint.config.mjs`, disable comments have tracking references).
- _Why it exists:_ Enforces consistent code quality and prevents architecture, workspace, and ESLint config drift.
- _Debug locally:_ Run each command individually: `bun run lint`, `bun run verify:data-boundary`, `bun run verify:workspace-contract`, `bun run verify:eslint`.

### `typecheck` (needs: `lint`)

- _What it checks:_ Runs `bun run typecheck` (Turborepo → `tsc --noEmit` across all apps and packages).
- _Why it exists:_ Catches type errors that TypeScript strict mode would surface at compile time but not at runtime.
- _Debug locally:_ Run `bun run typecheck`. Per-app: `bun run typecheck:donor`, `bun run typecheck:admin`, `bun run typecheck:missionary`.

### `build` (needs: `typecheck`)

- _What it checks:_ Runs `bun run build` (Turborepo → `next build` for all apps). The script applies CI-equivalent env defaults (`SKIP_ENV_VALIDATION=1`, stub Supabase keys, and a stub `PAYLOAD_SECRET`) when missing.
- _Why it exists:_ Catches bundle errors, missing imports, and Next.js build-time failures that type-checking alone cannot catch.
- _Debug locally:_ Run `bun run build` for CI-equivalent behavior, or `bun run build:strict` to validate with real local env values only.

### `test-unit` (needs: `build`)

- _What it checks:_ Runs `bun run test:unit` (Vitest with coverage enabled, targets `tests/unit/**/*.test.ts(x)`, `environment: "node"`).
- _Artifacts:_ Uploads generated `coverage/` as `unit-test-coverage` (`if-no-files-found: ignore`, retained for 7 days). Current staging output includes `coverage-summary.json`, `coverage-final.json`, `v8-raw-coverage.json`, and `coverage-warnings.log`.
- _Why it exists:_ Validates pure logic, utilities, and shared package behaviour without a browser or network.
- _Debug locally:_ Run `bun run test:unit` to execute unit tests and generate coverage output in `coverage/`. For watch mode: `bunx vitest`.

Optional focused CMS unit coverage (not a `ci.yml` job today): `bun run test:unit:cms`.

### Unit feedback report

Run this when you want a structured, actionable unit-test triage report:

```bash
bun run test:unit:feedback
```

The command runs `bun run test:unit`, writes ignored artifacts to `test-results/unit-feedback/latest.md` and `test-results/unit-feedback/latest.json`, and exits with the underlying unit-test status. On failure, it reruns each failing test file with `bunx vitest run <test-file>` and classifies failures into remediation categories: import path, server/client boundary, fallback routing, rich-text image policy, or unrelated.

To post only failing reports to a tracking issue:

```bash
UNIT_FEEDBACK_GITHUB_ISSUE=203 bun run test:unit:feedback
```

Current coverage caveat: the repo's custom raw V8 fallback provider writes coverage artifacts, but `coverage-summary.json` is not a line/statement/branch quality signal while it reports `totalScripts: 0`.

---

## Integration workflow (`ci-integration.yml`)

### `migrate`

- _What it does:_ Spins up a fresh `postgres:15-alpine` container, runs `node scripts/verify/supabase-migrations.mjs` to bootstrap the minimal Supabase `auth`/`storage` compatibility schemas and apply timestamped forward migrations from `supabase/migrations/`, then runs Payload migrations via `bun run cms:migrate` and verifies status with `bun run cms:migrate:status`, then applies `supabase/seed.sql`. Verifies that `public.profiles` has exactly 1 row after seeding.
- _Why it matters:_ Catches migration ordering conflicts across both SQL + Payload migration systems, plus FK/seed incompatibilities, before they reach a hosted Supabase project.
- _Debug locally:_ Run `bun run db:migrate:local` (applies migrations without seed) or `bun run seed:demo:local` (migrate + seed via helper script).

### `smoke` (needs: `migrate`)

- _What it does:_ Starts `apps/donor` on port 3005 with `SKIP_ENV_VALIDATION=1` and stub Supabase values, polls `http://127.0.0.1:3005/api/health` for up to 60 seconds, then asserts the response contains `"status":"ok"`.
- _Why it matters:_ Verifies the app boots without a crash — catches missing imports, broken middleware, and startup-time errors that build alone cannot catch.
- _Debug locally:_ Run `bun run test:e2e` (default CI-equivalent env) or `bun run dev:donor` with real `.env.local` values, then `curl http://localhost:3005/api/health`. Expect `{"status":"ok","checks":{"supabase":"ok"},"observability":{"surface":"donor",...}}`; `observability.release` carries the commit/ref/environment metadata when the deployment provides it.

### `test-e2e-smoke` (needs: `smoke`)

- _What it does:_ Re-applies SQL migrations against a fresh Postgres container through `node scripts/verify/supabase-migrations.mjs`, runs Payload migrations + status checks, then applies seed data, starts `apps/donor` on port 3005 and `apps/admin` on port 3030 with `E2E_AUTH_BYPASS=true`, waits for both `/api/health` endpoints, and runs the bounded Playwright smoke suite via `bun run test:e2e:smoke` (demo auth preflight, usability smoke, donate, upload-crop under the donor-auth project, and Support Hub smoke). The job has a 25-minute cap, the Playwright smoke step has a 15-minute cap, and failures upload `playwright-smoke-report/`.
- _Branch behavior:_ Blocking on `develop` through `e2e-smoke-gate` and `integration-gate`.
- _Debug locally:_ Run `bun run test:e2e:smoke` after `bun run test:e2e:auth-preflight` with donor on port 3005.
- _Coverage note:_ This bounded smoke gate is not the a11y, hydration, perf, or full auth signal. Run `bun run test:a11y`, `bun run test:perf`, or the broader `bun run test:e2e` when a change affects those contracts.
- _Regression guards (unit):_ `tests/unit/scripts/ci-integration-workflow.contract.test.ts` locks `integration-gate` / `e2e-smoke-gate` / `e2e-gate` wiring; `tests/unit/e2e/e2e-flake-guards.test.ts` forbids `waitForTimeout` in `tests/e2e/**/*.spec.ts`; `tests/unit/scripts/ci-preflight.contract.test.ts` locks `ci:preflight` stage order; `tests/unit/scripts/local-gates.contract.test.ts` locks `bun run check`; `tests/unit/apps/donor-missionary-unit-smoke.contract.test.ts` keeps donor/missionary unit smoke coverage and API email mock posture.

### `test-e2e` (needs: `smoke`)

- _What it does:_ Re-applies SQL migrations against a fresh Postgres container through `node scripts/verify/supabase-migrations.mjs`, runs Payload migrations + status checks, then applies seed data, starts `apps/donor` on port 3005 and `apps/admin` on port 3030, enables deterministic test auth mode (`E2E_AUTH_BYPASS=true`) for Playwright web servers, and sets `PLAYWRIGHT_REUSE_EXISTING_SERVER=1` so Playwright reuses the already-started servers instead of trying to bind those ports again. It executes demo-auth preflight (`bun run test:e2e:auth-preflight`), then runs bounded production-release suites:
  1. `bun run test:e2e:production-gate` (donor usability, donation, and admin Support Hub smoke coverage)
  2. `bun run test:e2e:boneyard:admin`, `bun run test:e2e:boneyard:missionary`, and `bun run test:e2e:boneyard:donor` (visual regression smoke by app)
  3. `bun run test:e2e:cms --project=chromium` (portable CMS/admin suite tagged `@cms`, excluding `@manual` and local-seed-only `@cms-local`; CI reuses the same donor/admin servers)
     The job has a 30-minute cap, and individual Playwright suite steps have 5-10 minute caps. Uploads `playwright-report/` as an artifact on failure (retained 7 days).
- _Branch behavior:_ On `develop`, this job is informational (`continue-on-error: true`). On `epic`, `e2e-gate` converts this job into a required production-bound signal.
- _Donor-only default projects:_ When a local or CI caller sets
  `PLAYWRIGHT_INCLUDE_ADMIN=0`, `playwright.config.ts` omits the admin web
  server and the default `chromium`/`mobile-chrome` projects ignore specs that
  require admin, missionary, CMS, Support Hub, or boneyard servers. Dedicated
  admin, missionary, CMS, and boneyard scripts keep their own configs and should
  be run separately when those surfaces are in scope.
- _Debug locally:_ Run `bun run test:e2e:auth-preflight` first, then `bun run test:e2e:production-gate` for the required production gate, `bun run test:e2e` for the broader local suite, `bun run test:e2e:cms` for portable CMS/admin coverage, `bun run test:e2e:cms:local` for the local seed-dependent CMS proof, `bun run test:e2e:strict` (core strict env), `bun run test:e2e:cms:strict` (CMS strict env), `bun run test:perf` (perf-only suites), or `bun run test:e2e --project=chromium` (Chromium only). Use `bun run test:e2e:ui` for interactive debugging.

---

## Branch protection

The workflow files are the source of truth for execution. Branch protection should mirror the behavior you want to enforce in GitHub.

### Required checks by branch

- `develop`: `ci-gate`, `integration-gate`, and `e2e-smoke-gate` are enforced; the full `CI Integration / test-e2e` job remains visible but intentionally non-blocking.
- `epic`: `ci-gate`, `integration-gate`, and `e2e-gate` are enforced; production release is handled by `bun run release:production`.
- `main`: retired/protected historical branch only; do not treat it as production or staging in this repo.

### GitHub branch rule guidance

1. Go to _Settings → Branches → Branch protection rules_.
2. Keep rules for `epic` and `develop`.
3. Enable **Require status checks to pass before merging**.
4. Require `ci-gate`, `integration-gate`, and `e2e-gate` on `epic`.
5. Require `ci-gate`, `integration-gate`, and `e2e-smoke-gate` on `develop`.
6. Disable force pushes on both branches.
7. For `develop`, leave `CI Integration / test-e2e` optional if you want the current "signal, not blocker" behavior to remain intact.

---

## Turborepo cache

- **Remote cache (preferred):** All `ci.yml` jobs set `TURBO_TOKEN` (secret) and `TURBO_TEAM` (variable). When both are present, Turborepo uses Vercel's remote cache — unchanged tasks are skipped entirely. To verify: look for `"Remote cache hit"` in the CI job logs.
- **Local fallback:** Each `ci.yml` job also caches `.turbo/` via `actions/cache@v4`, keyed on `turbo-${{ runner.os }}-${{ github.sha }}` with a restore prefix of `turbo-${{ runner.os }}-`. Remote cache hits still skip work when `TURBO_TOKEN` and `TURBO_TEAM` are configured.
- **See also:** `file:.github/SECRETS.md` for how to configure `TURBO_TOKEN` and `TURBO_TEAM`.
