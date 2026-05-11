# CI Reference

## Overview

Two workflow files run on every PR to `develop`, `main`, and `epic`, and on every push to `main`, `develop`, and `epic`:

| Workflow          | File                                   | Branches                                  | Jobs                                            | Target time               |
| ----------------- | -------------------------------------- | ----------------------------------------- | ----------------------------------------------- | ------------------------- |
| Fast checks       | `.github/workflows/ci.yml`             | PRs + pushes on `develop`, `main`, `epic` | `format → lint → typecheck → build → test-unit` | < 4 min with remote cache |
| Integration + E2E | `.github/workflows/ci-integration.yml` | PRs + pushes on `develop`, `main`         | `migrate → smoke → test-e2e`                    | ~5 min                    |

Current workflow semantics:

- `ci.yml` is the always-on fast gate for the active long-lived branches (`develop`, `main`, `epic`).
- `ci-integration.yml` is intentionally skipped for `epic`.
- `test-e2e` is **informational on `develop`** (`continue-on-error: true` there).
- `test-e2e` is **enforced on `main`** through the workflow's `e2e-gate`.

## Local CI parity (pre-push)

Use the local preflight command to mirror blocking GitHub checks before pushing:

```bash
bun run ci:preflight
```

`ci:preflight` runs the same gate order as `.github/workflows/ci.yml`:

1. `format:check`
2. `skills:verify`
3. `lint`
4. `verify:data-boundary`
5. `verify:workspace-contract`
6. `verify:eslint`
7. `verify:shadcn-diff`
8. `typecheck`
9. `build` (with CI-compatible env defaults for local parity)
10. `test:unit`

This command is wired into `.husky/pre-push` so pushes fail fast when a blocking CI gate would fail in GitHub.

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
- _Debug locally:_ Run `bun run test:e2e` (default CI-equivalent env) or `bun run dev:donor` with real `.env.local` values, then `curl http://localhost:3005/api/health`. Expect `{"status":"ok","checks":{"supabase":"ok"}}`.

### `test-e2e` (needs: `smoke`)

- _What it does:_ Re-applies SQL migrations against a fresh Postgres container through `node scripts/verify/supabase-migrations.mjs`, runs Payload migrations + status checks, then applies seed data, starts `apps/donor` on port 3005, enables deterministic test auth mode (`E2E_AUTH_BYPASS=true`) for Playwright web servers, executes demo-auth preflight (`bun run test:e2e:auth-preflight`), then runs two suites:
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

### Integration checks by branch

- `develop`: `CI Integration / migrate` and `CI Integration / smoke` run; `CI Integration / test-e2e` is visible but intentionally non-blocking.
- `main`: `CI Integration / migrate`, `CI Integration / smoke`, and the workflow's `CI Integration / e2e-gate` represent the enforced path.
- `epic`: only `ci.yml` runs; `ci-integration.yml` does not trigger.

### GitHub branch rule guidance

1. Go to _Settings → Branches → Branch protection rules_.
2. Add a rule for each protected branch you care about (`main`, `develop`, and optionally `epic` if you want fast checks enforced there too).
3. Enable **Require status checks to pass before merging**.
4. Add the five fast checks listed above everywhere.
5. For `main`, also consider requiring the integration workflow's gate job so E2E failures cannot be ignored.
6. For `develop`, leave `CI Integration / test-e2e` optional if you want the current "signal, not blocker" behavior to remain intact.

---

## Turborepo cache

- **Remote cache (preferred):** All `ci.yml` jobs set `TURBO_TOKEN` (secret) and `TURBO_TEAM` (variable). When both are present, Turborepo uses Vercel's remote cache — unchanged tasks are skipped entirely. To verify: look for `"Remote cache hit"` in the CI job logs.
- **Local fallback:** Each `ci.yml` job also caches `.turbo/` via `actions/cache@v4`, keyed on `turbo-${{ runner.os }}-${{ github.sha }}` with a restore prefix of `turbo-${{ runner.os }}-`. Remote cache hits still skip work when `TURBO_TOKEN` and `TURBO_TEAM` are configured.
- **See also:** `file:.github/SECRETS.md` for how to configure `TURBO_TOKEN` and `TURBO_TEAM`.
