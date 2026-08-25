# CI Reference

## Overview

Two workflow files run on every PR whose base is `develop`, `production`, or a
`cursor/**` stacked branch, and on every push to `develop` and `production`:

| Workflow          | File                                   | Branches                                                                       | Jobs                                            | Target time               |
| ----------------- | -------------------------------------- | ------------------------------------------------------------------------------ | ----------------------------------------------- | ------------------------- |
| Fast checks       | `.github/workflows/ci.yml`             | PRs on `develop`, `production`, `cursor/**`; pushes on `develop`, `production` | `format → lint → typecheck → build → test-unit` | < 4 min with remote cache |
| Integration + E2E | `.github/workflows/ci-integration.yml` | PRs on `develop`, `production`, `cursor/**`; pushes on `develop`, `production` | `migrate → smoke → test-e2e-smoke → test-e2e`   | ~5–25 min                 |

Current workflow semantics:

- `ci.yml` is the always-on fast gate for the active long-lived branches (`develop`, `production`) and for stacked Cursor Cloud PRs whose base matches `cursor/**`.
- `ci-integration.yml` runs on the same pull-request bases. Pushes still run only on `develop` and `production`.
- `Shadscan` (`.github/workflows/shadscan.yml`) uses the same pull-request bases; pushes remain `develop` only.
- `test-e2e-smoke` produces `e2e-smoke-gate`; `integration-gate` summarizes
  `migrate`, `smoke`, and that gate. See § Branch protection for the dated live
  required-context inventory.
- Stacked `cursor/**` PRs run the same placeholder Supabase E2E path as `develop`
  (`example.supabase.co`, zero-config bypass). They do **not** inherit
  `continue-on-error`; full E2E must pass. Production PRs keep hosted secrets
  and `e2e-gate`.
- `test-e2e` remains informational on `develop` and is summarized by
  `e2e-gate` on `production`.
- The canonical repository has no `main` branch. Legacy deny-only configuration
  may still mention it.

The exact live required-check sets are recorded only in § Branch protection.

### Bun toolchain

- **Pinned version:** root `package.json` `packageManager` (currently `bun@1.3.14`).
- **GitHub Actions:** both workflows set `env.BUN_VERSION` to that exact version; every `oven-sh/setup-bun@v2` step uses `bun-version: ${{ env.BUN_VERSION }}`.
- **Install in CI:** `bun ci --no-cache --backend=copyfile` (frozen lockfile install with Bun's portable file-copy backend). Do not use `bun install --frozen-lockfile` in workflows unless a future Bun release documents a regression.
- **Lockfile drift:** a frozen-lockfile install does **not** notice when a `package.json` dependency is missing from `bun.lock`'s `workspaces` map — commit `ea9a7673` added a root dependency without the regenerated lockfile and CI stayed green, while every contributor's next plain `bun install` silently rewrote `bun.lock`. `bun run verify:bun-lock-drift` compares the two files directly and is the check that catches this; it is a pure file read, so it needs no install and no network.
- **Turbo cache keys** in `ci.yml` include `bun-${{ env.BUN_VERSION }}` so cache restores do not cross Bun upgrades.
- **Local parity:** match the pin (`bun run verify:bun-version`); reproducible install from a clean tree is `bun ci`. GitHub Actions uses `bun ci --no-cache --backend=copyfile` so Linux runners use Bun's portable install backend for vendored `file:` tarballs.

## Local CI parity (pre-push)

Use the local preflight command to mirror blocking GitHub checks before pushing:

```bash
bun run ci:preflight
```

`ci:preflight` runs the same gate order as `.github/workflows/ci.yml`:

1. `verify:git-attribution`
2. `format:check`
3. `skills:verify`
4. `openspec:validate`
5. `lint`
6. `verify:data-boundary`
7. `verify:cms-public-sole-entry`
8. `verify:workspace-contract`
9. `verify:bun-lock-drift`
10. `verify:eslint`
11. `verify:shadcn-config`
12. `verify:shadcn-diff`
13. `typecheck`
14. `build` (with CI-compatible env defaults for local parity)
15. `test:unit`

Regression guards: `tests/unit/scripts/ci-preflight.contract.test.ts` (stage order),
`tests/unit/scripts/local-gates.contract.test.ts` (`bun run check`), and
`tests/unit/apps/donor-missionary-unit-smoke.contract.test.ts` (app unit smoke paths).

The `.husky/pre-push` coordinator reads Git's ref updates once, preserves the
production guard, and passes the complete outgoing commit set into
`ci:preflight`. Existing remote history is not attributed to the current
developer.

`verify:git-attribution` requires exact registered internal tuples on canonical
pushes, rejects forbidden legacy identities, and preserves attributable external
authors. Fork pull requests may use external authors and committers without
granting them canonical push authority. The exact human and automation tuples
and secure Windows/WSL setup are in `docs/ops/git-attribution.md`.

Remote actor-or-signature verification runs inside the `format` job before
formatting. Pull requests check the complete event `base..head` graph. Protected
pushes reject non-fast-forwards and check the first-parent integration spine:
`develop` requires exact merged-PR provenance, while `production` must already
be reachable from canonical `develop`. Every protected integration commit must
be a two-parent GitHub platform merge with a valid `web-flow` signature.
Signatures and rerun actors are resolved to immutable account IDs; commit-email
association alone is not proof. The result is inherited by `ci-gate`, not a new
branch-protection context.

### Production release guard

Direct pushes to `production` are blocked by `.husky/pre-push` unless they come from
the production release command:

```bash
bun run release:production
```

The release command checks deployment discipline, Git attribution, local CI
preflight, and deployment impact before pushing `HEAD` to `origin/production`.
Emergency bypasses require an explicit reason:

```bash
ASYM_PRODUCTION_PUSH_BYPASS_REASON="restore previous production deploy" git push origin HEAD:production
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

> **Note (2026-07-06):** this cutover will never occur — Twenty CRM has been
> retired ([ADR-0001](adr/0001-asym-postgres-owns-crm-truth-twenty-retired.md));
> the section is retained for history until the cleanup ticket removes it.

Twenty CRM is retired. Historical cutover evidence remains in
`docs/guides/operations/twenty-crm-cutover.md` and the archived OpenSpec change
`openspec/changes/archive/2026-07-02-integrate-twenty-crm-core/`. Do not re-run
that change's validation as a live production gate.

Current OpenSpec validation uses the locally pinned CLI:

```bash
bun run openspec:validate
```

### Tooling warning audit (periodic)

Run this maintenance check to detect known test-runner deprecation warnings (for example, Vite CJS Node API deprecations) before they become CI noise:

```bash
bun run test:unit:warnings
```

This check runs unit tests and fails if blocked warning patterns are present in test output.

---

## Fast-checks workflow (`ci.yml`)

### `format`

- _What it checks:_ Checks out full history, runs remote
  `verify:git-attribution` for the event-specific commit scope, then runs
  `bun run format:check` (Prettier) and `bun run skills:verify` (skills mirror
  drift gate).
- _Why it exists:_ Rejects unproven registered identity claims, forbidden event
  principals, and unresolvable GitHub metadata inside `ci-gate`, then prevents
  formatting and skill-mirror drift.
- _Debug locally:_ Run `bun run verify:git-attribution`, then
  `bun run format:check`; if needed run `bun run format`. Run
  `bun run skills:verify` (or `bun run skills:sync` to update mirrors) and
  re-check. Event-actor and signature proof require CI metadata and GitHub APIs.

### `lint` (needs: `format`)

- _What it checks:_ Runs `bun run lint` (Turborepo → ESLint flat config across all workspaces), then `bun run verify:data-boundary` (architecture/data-access boundary contract over live source; gitignored Eve `.eve`, `.nitro`, and `.output` generated trees are excluded), then `bun run verify:cms-public-sole-entry` (public CMS reads confined to the published-content reader choke-point — no raw Payload reads or `overrideAccess: true` in public code paths), then `bun run verify:workspace-contract` (workspace dependency contract), then `bun run verify:bun-lock-drift` (every workspace `package.json` dependency key and range is recorded in the matching `bun.lock` `workspaces` block), then `bun run verify:eslint` (ESLint config contract — no legacy `.eslintrc.*`, all packages have `eslint.config.mjs`, disable comments have tracking references), then `bun run verify:shadcn-config` (shared shadcn config guardrails) and `bun run verify:shadcn-diff` (component drift guard).
- _Why it exists:_ Enforces consistent code quality and prevents architecture, workspace, and ESLint config drift.
- _Debug locally:_ Run each command individually: `bun run lint`, `bun run verify:data-boundary`, `bun run verify:cms-public-sole-entry`, `bun run verify:workspace-contract`, `bun run verify:bun-lock-drift`, `bun run verify:eslint`, `bun run verify:shadcn-config`, and `bun run verify:shadcn-diff`.

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
- _Artifacts:_ Uploads generated `coverage/` as `unit-test-coverage` (`if-no-files-found: ignore`, retained for 7 days). Current development output includes `coverage-summary.json`, `coverage-final.json`, `v8-raw-coverage.json`, and `coverage-warnings.log`.
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
- _Branch behavior:_ Produces `e2e-smoke-gate`; `integration-gate` also summarizes
  this result. See § Branch protection for which contexts GitHub currently
  requires.
- _Debug locally:_ Run `bun run test:e2e:smoke` after `bun run test:e2e:auth-preflight` with donor on port 3005.
- _Coverage note:_ This bounded smoke gate is not the a11y, hydration, perf, or full auth signal. Run `bun run test:a11y`, `bun run test:perf`, or the broader `bun run test:e2e` when a change affects those contracts.
- _Regression guards (unit):_ `tests/unit/scripts/ci-integration-workflow.contract.test.ts` locks `integration-gate` / `e2e-smoke-gate` / `e2e-gate` wiring; `tests/unit/e2e/e2e-flake-guards.test.ts` forbids `waitForTimeout` in `tests/e2e/**/*.spec.ts`; `tests/unit/scripts/ci-preflight.contract.test.ts` locks `ci:preflight` stage order; `tests/unit/scripts/local-gates.contract.test.ts` locks `bun run check`; `tests/unit/apps/donor-missionary-unit-smoke.contract.test.ts` keeps donor/missionary unit smoke coverage and API email mock posture.

### `test-e2e` (needs: `smoke`)

- _What it does:_ Re-applies SQL migrations against a fresh Postgres container through `node scripts/verify/supabase-migrations.mjs`, runs Payload migrations + status checks, then applies seed data, starts `apps/donor` on port 3005 and `apps/admin` on port 3030, enables deterministic test auth mode (`E2E_AUTH_BYPASS=true`) for Playwright web servers, and sets `PLAYWRIGHT_REUSE_EXISTING_SERVER=1` so Playwright reuses the already-started servers instead of trying to bind those ports again. It executes demo-auth preflight (`bun run test:e2e:auth-preflight`), then runs bounded production-release suites:
  1. `bun run test:e2e:production-gate` (donor usability, donation, and admin Support Hub smoke coverage)
  2. `bun run test:e2e:boneyard:admin`, `bun run test:e2e:boneyard:missionary`, and `bun run test:e2e:boneyard:donor` (visual regression smoke by app)
  3. `bun run test:e2e:cms --project=chromium` (portable CMS/admin suite tagged `@cms`, excluding `@manual` and local-seed-only `@cms-local`; CI reuses the same donor/admin servers)
     The job has a 30-minute cap, and individual Playwright suite steps have 5-10 minute caps. Uploads `playwright-report/` as an artifact on failure (retained 7 days).
- _Branch behavior:_ On `develop`, this job is informational (`continue-on-error: true`). On `production`, `e2e-gate` requires both this job and the deterministic `instant-nav` job (`--retries=0`) to succeed.
- _Donor-only default projects:_ When a local or CI caller sets
  `PLAYWRIGHT_INCLUDE_ADMIN=0`, `playwright.config.ts` omits the admin web
  server and the default `chromium`/`mobile-chrome` projects ignore specs that
  require admin, missionary, CMS, Support Hub, or boneyard servers. Dedicated
  admin, missionary, CMS, and boneyard scripts keep their own configs and should
  be run separately when those surfaces are in scope.
- _Debug locally:_ Run `bun run test:e2e:auth-preflight` first, then `bun run test:e2e:production-gate` for the required production gate, `bun run test:e2e` for the broader local suite, `bun run test:e2e:cms` for portable CMS/admin coverage, `bun run test:e2e:cms:local` for the local seed-dependent CMS proof, `bun run test:e2e:strict` (core strict env), `bun run test:e2e:cms:strict` (CMS strict env), `bun run test:perf` (perf-only suites), or `bun run test:e2e --project=chromium` (Chromium only). Use `bun run test:e2e:ui` for interactive debugging.

---

## Branch protection

Workflow YAML is the source of truth for the jobs Core emits. GitHub's
branch-protection API is the source of truth for which contexts are currently
required. Those two sets must not be conflated.

### Live required checks

Verified through the GitHub branch-protection API on 2026-08-25:

- `develop` uses strict status checks and requires `ci-gate`,
  `e2e-smoke-gate`, `migrate`, and `smoke`.
- `production` uses strict status checks and requires `ci-gate`, `e2e-gate`,
  `e2e-smoke-gate`, `migrate`, `release-source-gate`, and `smoke`.
- Both branches enforce administrators and disable force pushes and deletion.
  `develop` requires one approving review and resolved conversations;
  `production` requires resolved conversations and uses the release path rather
  than a PR-review requirement.
- `integration-gate` remains a workflow summary job but is not currently a
  required branch-protection context.
- `release-source-gate` remains required on `production`, although no current
  workflow file defines that job. Reconcile that drift separately before
  relying on a production promotion.
- The canonical repository has no `main` branch. Legacy `main: false`
  deployment configuration is a deny-only compatibility rule, not evidence of
  a live protected branch.

Attribution remains a step inherited by `ci-gate`; it does not create a new
required context or grant branch authorization. Changes to live branch
protection require a separate, explicitly reviewed platform reconciliation.

---

## Turborepo cache

- **Remote cache (preferred):** All `ci.yml` jobs set `TURBO_TOKEN` (secret) and `TURBO_TEAM` (variable). When both are present, Turborepo uses Vercel's remote cache — unchanged tasks are skipped entirely. To verify: look for `"Remote cache hit"` in the CI job logs.
- **Local fallback:** Each `ci.yml` job also caches `.turbo/` via `actions/cache@v4`, keyed on `turbo-${{ runner.os }}-${{ github.sha }}` with a restore prefix of `turbo-${{ runner.os }}-`. Remote cache hits still skip work when `TURBO_TOKEN` and `TURBO_TEAM` are configured.
- **See also:** `file:.github/SECRETS.md` for how to configure `TURBO_TOKEN` and `TURBO_TEAM`.
