# CI Reference

## Overview

Two workflow files run on every PR base, including internal stacked branches,
and on every push to `develop` and `production`:

| Workflow          | File                                   | Branches                                        | Jobs                                                                         | Target time               |
| ----------------- | -------------------------------------- | ----------------------------------------------- | ---------------------------------------------------------------------------- | ------------------------- |
| Fast checks       | `.github/workflows/ci.yml`             | all PR bases; pushes on `develop`, `production` | `format`, `integrity`, `lint`, `typecheck`, `build`, `test-unit` → `ci-gate` | < 4 min with remote cache |
| Integration + E2E | `.github/workflows/ci-integration.yml` | all PR bases; pushes on `develop`, `production` | `migrate → smoke → test-e2e-smoke → test-e2e`                                | ~5–25 min                 |

Current workflow semantics:

- `ci.yml` is the always-on correctness gate for all PRs, including automation-created stacked PRs. `compilation-plan` selects affected apps only for dependency/build-configuration changes on PRs to `develop`; ordinary source/docs changes skip compilation. Missing diff context, production PRs/pushes, other PR bases, and explicit manual CI request full compilation.
- `develop` pushes retain correctness feedback but do not repeat full compilation or trigger Vercel deployments. Superseded PR runs are canceled; production push runs are not canceled.
- `ci-gate` accepts `build: skipped` only after a successful plan explicitly requests no build and all correctness prerequisites pass. A failed/canceled requested build or failed plan still blocks merging.
- `instant-nav` compiles donor only for production PRs/pushes or explicit manual integration QA. Required migration, smoke, and development smoke gates continue running.
- Explicit `qa:smoke` previews compile on the standard GitHub runner, then use `vercel deploy --prebuilt --target=preview`; Vercel does not compile the source again. Preview serving and fixed subscription costs still apply.
- `ci-integration.yml` runs on all PR bases. Pushes still run only on `develop` and `production`.
- `integrity` runs the locked workspace Shadscan audit on every CI event. The reusable `.github/workflows/shadscan.yml` publishes its retained report; audit failures block `ci-gate`. See [Shadscan](guides/development/shadscan.md) for discovery, per-app floors and evidence review.
- `test-e2e-smoke` produces `e2e-smoke-gate`; `integration-gate` summarizes
  `migrate`, `smoke`, and that gate. See § Branch protection for the dated live
  required-context inventory.
- Non-production PRs run the same placeholder Supabase E2E path as `develop`
  (`example.supabase.co`, zero-config bypass). They do **not** inherit
  `continue-on-error`; full E2E must pass. Production PRs keep hosted secrets
  and `e2e-gate`.
- `test-e2e` remains informational on `develop` and is summarized by
  `e2e-gate` on `production`.
- The canonical repository has no `main` branch. Legacy deny-only configuration
  may still mention it.

The exact live required-check sets are recorded only in § Branch protection.

### Bun toolchain

- **Pinned version:** root `package.json` `packageManager` and `.bun-version` (currently `bun@1.4.3`, stable only — never canary).
- **Runtime vs package manager:** Bun is the install/script runner. Next.js apps still execute on Node.js (Vercel project `nodeVersion` is `24.x`; GitHub Actions pins Node `24.21.0`). Do not pass `bun --bun`, and do not set `bunVersion` in `apps/*/vercel.json`.
- **Vercel Functions Bun 1.4 is a separate runtime:** [Vercel's Bun 1.4 changelog](https://vercel.com/changelog/bun-1-4-is-now-available-in-vercel-functions) documents opting **Functions and Middleware** onto Bun via `"bunVersion": "1.4.x"`. That is not how you pin the package manager. `"1.x"` still selects Bun 1.3.14 on Functions. Next.js on the Bun runtime also requires `bun run --bun next dev|build` ([runtime docs](https://vercel.com/docs/functions/runtimes/bun)). Core stays on the Node path (`next dev` / `next build` / `next start`) because Payload, Stripe, Supabase SSR, and eve-runtime are validated there; Vercel treats the Bun Functions runtime as an explicit breaking-change opt-in.
- **Vercel install vs GitHub install:** App `installCommand` is `bunx bun@1.4.3 install --cwd ../.. --frozen-lockfile` (workspace root, pinned package manager, frozen lockfile), following [Vercel's documented build pin](https://vercel.com/kb/guide/how-to-pin-a-specific-bun-version-for-vercel-builds). Preview deployment `dpl_8p7c7tAFVzvdLZY5t4FB8NuTxdCx` proved that the build image's Bun 1.3.14 cannot install the current lockfile without drift. Pinning installation does not opt Functions into the Bun runtime. GitHub Actions keeps `bun ci --no-cache --backend=copyfile` for the portable file-copy backend. Corepack does **not** pin Bun (it is for pnpm/Yarn).
- **GitHub Actions:** `ci.yml`, `ci-integration.yml`, and `qa-smoke-preview-deploy.yml` set `env.BUN_VERSION` to that exact version; every first-party `oven-sh/setup-bun` step is pinned to the reviewed `v2.2.0` commit and uses `bun-version: ${{ env.BUN_VERSION }}`.
- **Workflow pin verification:** `verify:bun-version` parses workflow YAML with Bun's built-in parser, so it also works before dependencies are installed. It checks each setup step's own `with.bun-version` and the workflow/job/step environment in scope; comments, run-script text, unrelated inputs, and another job's environment cannot satisfy the pin contract. Quoted scalars and YAML aliases remain supported.
- **Live runtime verification:** `verify:vercel-build-controls` reads all three Vercel projects and requires `nodeVersion: "24.x"` with `bunVersion` absent or `null`. Any explicit Bun runtime value fails, even if source-controlled `vercel.json` files still select Node. This verifier only reads project settings.
- **Install in CI:** `bun ci --no-cache --backend=copyfile` (frozen lockfile install with Bun's portable file-copy backend). Do not use `bun install --frozen-lockfile` in workflows unless a future Bun release documents a regression.
- **Lockfile format:** `bun.lock` remains `"lockfileVersion": 1` with `"configVersion": 1` (isolated linker). Bun 1.4 writes lockfileVersion 2 for _new_ lockfiles, but does not bump an existing v1 file on re-save ([oven-sh/bun#31602](https://github.com/oven-sh/bun/pull/31602)). Do not regenerate `bun.lock` just to pick up v2, and do not run `bun install --save-text-lockfile` — that rewrite can retarget nested resolutions without a manifest change. Core preserves the qualified v1 dependency graph until a separate lockfile-format migration is verified. `bun run verify:bun-lock-drift` fails closed on any `lockfileVersion` other than `0` or `1` and tells operators to keep or restore that ceiling — not to run `bun install`, which on Bun 1.4 can rewrite a v1 lock to v2. If a future install rewrites `bun.lock` to lockfileVersion 2 or 3, copy the tree (do not rewrite the committed lock in place) and require both of these to pass on the installed turbo before accepting that lock:

```sh
bunx --no-install turbo prune @asym/donor --docker
(cd out/json && bun install --frozen-lockfile)
```

`verify:bun-lock-drift` still rejects versions above 1 and does not replace this parser check.

- **Lockfile drift:** a frozen-lockfile install does **not** notice when a `package.json` dependency is missing from `bun.lock`'s `workspaces` map — commit `ea9a7673` added a root dependency without the regenerated lockfile and CI stayed green, while every contributor's next plain `bun install` silently rewrote `bun.lock`. `bun run verify:bun-lock-drift` compares the two files directly and is the check that catches this; it is a pure file read, so it needs no install and no network.
- **Turbo cache keys** in `ci.yml` include `bun-${{ env.BUN_VERSION }}` so cache restores do not cross Bun upgrades.
- **Local parity:** match the pin (`bun run verify:bun-version`). That command also fails if a first-party `.github/workflows/*.{yml,yaml}` `BUN_VERSION` or `oven-sh/setup-bun` pin disagrees with `packageManager`. Reproducible install from a clean tree is `bun ci`. GitHub Actions uses `bun ci --no-cache --backend=copyfile` so Linux runners use Bun's portable install backend for vendored `file:` tarballs.

## Local CI parity (pre-push)

Use the local preflight command to mirror blocking GitHub checks before pushing:

```bash
bun run ci:preflight
```

`ci:preflight` runs the correctness stage order below. Its build stage is conditional under the same development policy as `.github/workflows/ci.yml`; app-specific build inputs select `build:<app>`. Use `bun run ci:preflight -- --full` for a complete QA/release checkpoint. The release command and any authorized production-targeting push always select full mode:

1. `format:check`
2. `skills:verify`
3. `verify:phase25-spec`
4. `openspec:validate`
5. `verify:openspec-deltas` (includes `verify:phase24-authority`)
6. `lint`
7. `verify:data-boundary`
8. `verify:cms-public-sole-entry`
9. `verify:workspace-contract`
10. `verify:bun-lock-drift`
11. `verify:eslint`
12. `verify:shadcn-config`
13. `verify:shadcn-diff`
14. `verify:shadscan`
15. `typecheck`
16. Conditional `build` / `build:<app>` (full in `--full` or production mode; CI-compatible env defaults)
17. `test:unit`

For edits to the adopted roadmap and Studio packets, also run
`bun run verify:program-roadmap` in the canonical WSL/Linux workspace before
publication. This read-only Python 3/Node check verifies source hashes, all45
phase entries, predecessor dependency floors, recipe/requirement/scenario
coverage, declared generated views, independent checkpoint graphs and local
links. It never executes the supplied reference scripts or claims runtime
qualification. It is a scoped documentation check in addition to the unchanged
preflight stage sequence.

Regression guards: `tests/unit/scripts/ci-preflight.contract.test.ts` (stage order),
`tests/unit/scripts/local-gates.contract.test.ts` (`bun run check`), and
`tests/unit/apps/donor-missionary-unit-smoke.contract.test.ts` (app unit smoke paths).

The `.husky/pre-push` coordinator preserves the production push guard and runs
normal CI preflight. Commit authors, committers, names, emails, and signatures
are not development gates. GitHub access authorizes people and approved
automation; see `docs/ops/github-access.md` for agent command authorization.

The team workflow from [PR #1428](https://github.com/Asymmetric-al/core/pull/1428)
is merged into `develop`. The shared parser accepts canonical GitHub HTTPS and
SSH remote forms, removes transport userinfo, and rejects malformed repository
targets before they reach pre-push or attribution queries. See
[Git attribution policy](ops/git-attribution.md) for the current proof boundaries.

### Production release guard

Direct pushes to `production` are blocked by `.husky/pre-push` unless they come from
the production release command:

```bash
bun run release:production
```

The release command checks deployment discipline, full local CI preflight, and that
`HEAD` is already reachable from fetched `develop`, then summarizes deployment
impact before pushing to `origin/production`.
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

- _What it checks:_ Runs `bun run format:check` (Prettier).
- _Why it exists:_ Reports formatting problems as formatting problems.
- _Debug locally:_ Run `bun run format:check`; if needed run `bun run format`.

### `integrity`

- _What it checks:_ Runs `bun run skills:verify` (skill mirrors),
  `bun run verify:phase25-spec`, `bun run openspec:validate`, and
  `bun run verify:openspec-deltas` (including the read-only Phase 24 authority validator).
- _Why it exists:_ Prevents mirror and specification drift under its own check
  name. `ci-gate` requires it alongside format, lint, typecheck, build, and unit
  tests.
- _Phase 24 proof:_ Preserve the normal merge-ref integrity checks, then check
  out the exact PR head (or push/workflow SHA) separately at `phase24-proof-head`
  with persisted credentials disabled. Node runs
  `scripts/cms/run-local-e2e.mjs --phase24-contract-check --candidate-sha <actual SHA>`
  from that checkout without installing dependencies there. The mode selects
  repository-only proof before runtime/environment imports and binds actual Git
  HEAD plus contract input identity; dirty tracked proof/code or a mismatched SHA
  fails the job. Capture stdout in the runner temporary directory outside both
  checkouts and upload the manifest only after success. Its favorable, adverse,
  retry and recovery evidence proves P24-01 repository graph closure with
  `runtimeProof: false`, under acceptance revision `p24-01-v2`; the broader strict
  HTTP runner retains its separate role. Local capture requires committed clean
  proof sources, and the SHA option asserts the executed checkout rather than
  assigning a caller-provided label.
- _Debug locally:_ Run the failing integrity command directly. Intentional
  skill changes use `bun run skills:sync` before `bun run skills:verify`.

### `lint`

- _What it checks:_ Runs `bun run lint` (Turborepo → ESLint flat config across all workspaces), then `bun run verify:data-boundary` (architecture/data-access boundary contract over live source; gitignored Eve `.eve`, `.nitro`, and `.output` generated trees are excluded), then `bun run verify:cms-public-sole-entry` (public CMS reads confined to the published-content reader choke-point — no raw Payload reads or `overrideAccess: true` in public code paths), then `bun run verify:workspace-contract` (workspace dependency contract), then `bun run verify:bun-lock-drift` (every workspace `package.json` dependency key and range is recorded in the matching `bun.lock` `workspaces` block), then `bun run verify:eslint` (ESLint config contract — no legacy `.eslintrc.*`, all packages have `eslint.config.mjs`, disable comments have tracking references), then `bun run verify:shadcn-config` (shared shadcn config guardrails) and `bun run verify:shadcn-diff` (pinned modern CLI review guard over all installed official components and explicit file previews; checks reviewed customizations rather than stock byte parity).
- _Why it exists:_ Enforces consistent code quality and prevents architecture, workspace, and ESLint config drift.
- _Debug locally:_ Run each command individually: `bun run lint`, `bun run verify:data-boundary`, `bun run verify:cms-public-sole-entry`, `bun run verify:workspace-contract`, `bun run verify:bun-lock-drift`, `bun run verify:eslint`, `bun run verify:shadcn-config`, and `bun run verify:shadcn-diff`.

### `typecheck`

- _What it checks:_ Runs `bun run typecheck` (Turborepo → `tsc --noEmit` across all apps and packages).
- _Why it exists:_ Catches type errors that TypeScript strict mode would surface at compile time but not at runtime.
- _Debug locally:_ Run `bun run typecheck`. Per-app: `bun run typecheck:donor`, `bun run typecheck:admin`, `bun run typecheck:missionary`.

### `build`

- _What it checks:_ Compiles apps selected by `scripts/verify/ci-build-policy.mjs`. Routine develop PR source/docs changes and develop pushes select no build; app-specific build configuration selects that app; shared dependency/build changes, missing diff context, production, and manual CI select all apps. Explicit full local preflight runs `bun run build` (Turborepo → `next build` for all apps). The script applies CI-equivalent env defaults (`SKIP_ENV_VALIDATION=1`, stub Supabase keys, and a stub `PAYLOAD_SECRET`) when missing.
- _Why it exists:_ Catches bundle errors, missing imports, and Next.js build-time failures that type-checking alone cannot catch.
- _Debug locally:_ Run `bun run build` for CI-equivalent behavior, or `bun run build:strict` to validate with real local env values only.

### `test-unit`

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
- The SQL verifier requires the reviewed field-policy census after all forward migrations and before reporting success. Policy-flag drift, uncensused columns and census execution failures block the job. Unsupported nonlocal targets are refused before any SQL runs; the old nonlocal override no longer applies. Migration and unit-test jobs fetch full Git history so the census can verify its recorded source revision.
- _Why it matters:_ Catches migration ordering conflicts across both SQL + Payload migration systems, plus FK/seed incompatibilities, before they reach a hosted Supabase project.
- _Debug locally:_ Run `bun run db:migrate:local` (applies migrations without seed) or `bun run seed:demo:local` (migrate + seed via helper script).

### `smoke` (needs: `migrate`)

- _What it does:_ Starts `apps/donor` on port 3005 with `SKIP_ENV_VALIDATION=1` and stub Supabase values, polls `http://127.0.0.1:3005/api/health` for up to 60 seconds, then asserts the response contains `"status":"ok"`.
- _Why it matters:_ Verifies the app boots without a crash — catches missing imports, broken middleware, and startup-time errors that build alone cannot catch.
- _Debug locally:_ Run `bun run test:e2e` (default CI-equivalent env) or `bun run dev:donor` with real `.env.local` values, then `curl http://localhost:3005/api/health`. Expect `{"status":"ok","checks":{"supabase":"ok"},"observability":{"surface":"donor",...}}`; `observability.release` carries the commit/ref/environment metadata when the deployment provides it.

### `test-e2e-smoke` (needs: `smoke`)

- _What it does:_ Re-applies SQL migrations against a fresh Postgres container through `node scripts/verify/supabase-migrations.mjs`, runs Payload migrations + status checks, then applies seed data. Playwright Chromium is installed before either dev server starts, so `bunx` does not mutate the module graph while Turbopack is compiling. The job then starts `apps/donor` on port 3005 with `E2E_AUTH_BYPASS=true`, waits until `/api/health` and `/api/auth/demo-account` both succeed, starts `apps/admin` on port 3030, waits for admin `/api/health`, and runs the bounded Playwright smoke suite via `bun run test:e2e:smoke` (demo auth preflight, usability smoke, donate, upload-crop under the donor-auth project, and Support Hub smoke). The job has a 25-minute cap, the Playwright smoke step has a 15-minute cap, and failures upload `playwright-smoke-report/` plus the dev-server logs.
- _Branch behavior:_ Produces `e2e-smoke-gate`; `integration-gate` also summarizes
  this result. See § Branch protection for which contexts GitHub currently
  requires.
- _Debug locally:_ Run `bun run test:e2e:smoke` after `bun run test:e2e:auth-preflight` with donor on port 3005.
- _Coverage note:_ This bounded smoke gate is not the a11y, hydration, perf, or full auth signal. Run `bun run test:a11y`, `bun run test:perf`, or the broader `bun run test:e2e` when a change affects those contracts.
- _Regression guards (unit):_ `tests/unit/scripts/ci-integration-workflow.contract.test.ts` locks `integration-gate` / `e2e-smoke-gate` / `e2e-gate` wiring; `tests/unit/e2e/e2e-flake-guards.test.ts` forbids `waitForTimeout` in `tests/e2e/**/*.spec.ts`; `tests/unit/scripts/ci-preflight.contract.test.ts` locks `ci:preflight` stage order; `tests/unit/scripts/local-gates.contract.test.ts` locks `bun run check`; `tests/unit/apps/donor-missionary-unit-smoke.contract.test.ts` keeps donor/missionary unit smoke coverage and API email mock posture.

### `test-e2e` (needs: `smoke`)

- _What it does:_ Re-applies SQL migrations against a fresh Postgres container through `node scripts/verify/supabase-migrations.mjs`, runs Payload migrations + status checks, then applies seed data, starts `apps/donor` on port 3005 and `apps/admin` on port 3030, enables deterministic test auth mode (`E2E_AUTH_BYPASS=true`) for Playwright web servers, and sets `PLAYWRIGHT_REUSE_EXISTING_SERVER=1` so Playwright reuses the already-started servers instead of trying to bind those ports again. It executes demo-auth preflight (`bun run test:e2e:auth-preflight`), then runs bounded production-release suites:
  1. `bun run test:e2e:production-gate` (donor usability, donation, About/Wallet layout and local interactions, admin Support Hub smoke and Teams controls, shared dialog-dismissal/popover-positioning/primitive-contrast and table-control accessibility coverage, and missionary summary/dashboard/chart/loading geometry)
  2. `bun run test:e2e:boneyard:admin`, `bun run test:e2e:boneyard:missionary`, and `bun run test:e2e:boneyard:donor` (visual regression smoke by app)
     The Missionary command also runs the standalone account-frame regressions.
  3. `bun run test:e2e:cms --project=chromium` (portable CMS/admin suite tagged `@cms`, excluding `@manual` and local-seed-only `@cms-local`; CI reuses the same donor/admin servers)
     The job has a 30-minute cap, and individual Playwright suite steps have 5-10 minute caps. Uploads `playwright-report/` as an artifact on failure (retained 7 days).
- _Artifacts:_ Auth preflight, production gate, and CMS invocations use distinct
  `PLAYWRIGHT_REPORT_DIR` paths under `playwright-report/`. The default reporter
  streams each test's progress and writes an atomic, bounded
  `<stage>-run-status.json` beside each HTML-owned stage directory. The default
  local path is `playwright-report-run-status.json`. Initialization invalidates
  the preceding verdict before global setup; `phase: "setup"` and
  `totalTests: null` mean inventory is not yet known. After tests,
  `phase: "reporting"` stays `status: "running"` until HTML/JSON `onEnd`
  callbacks finish; the reporter's `onExit` then finalizes the SDK result.
  A hard kill during setup, tests, or report generation retains running status
  with no `finishedAt`, including when HTML recreates its owned folder. This
  is incomplete evidence. Missing status or configuration failure before
  reporter initialization is also incomplete evidence; reconcile the current
  invocation and timestamps before using an earlier finalized report.
  Failure uploads retain `playwright-report/` and `test-results/` for status,
  screenshots and traces, with a separate raw-artifact directory per named
  stage. Status counts describe attempts, including retries. The report stage's
  basename must be unique when preserving multiple invocations in one checkout.
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

Verified through the GitHub branch-protection API on 2026-09-23:

- `develop` uses strict status checks and requires `ci-gate`,
  `e2e-smoke-gate`, `migrate`, and `smoke`.
- `production` uses strict status checks and requires `ci-gate`, `e2e-gate`,
  `e2e-smoke-gate`, `migrate`, `release-source-gate`, and `smoke`.
- Both branches enforce administrators and disable force pushes and deletion.
  `develop` requires zero approving reviews and resolved conversations;
  `production` requires resolved conversations and uses the release path rather
  than a PR-review requirement.
- `integration-gate` remains a workflow summary job but is not currently a
  required branch-protection context.
- `release-source-gate` is defined in `release-source.yml` for production PRs.
  It runs from the trusted default branch with a read-only token and verifies
  that the PR head is already reachable from `develop` through GitHub's compare
  API, without checking out PR code.
- The canonical repository has no `main` branch. Legacy `main: false`
  deployment configuration is a deny-only compatibility rule, not evidence of
  a live protected branch.

Commit metadata is not a CI or branch authorization gate. GitHub access and
native branch protection control repository writes and merges.

---

## Turborepo cache

- **Remote cache (preferred):** All `ci.yml` jobs set `TURBO_TOKEN` (secret) and `TURBO_TEAM` (variable). When both are present, Turborepo uses Vercel's remote cache — unchanged tasks are skipped entirely. To verify: look for `"Remote cache hit"` in the CI job logs.
- **Local fallback:** Each `ci.yml` job also caches `.turbo/` via `actions/cache@v4`, keyed on `turbo-${{ runner.os }}-${{ github.sha }}` with a restore prefix of `turbo-${{ runner.os }}-`. Remote cache hits still skip work when `TURBO_TOKEN` and `TURBO_TEAM` are configured.
- **See also:** `file:.github/SECRETS.md` for how to configure `TURBO_TOKEN` and `TURBO_TEAM`.

### Workspace package resolution in unit tests

The Vitest workspace pinning plugin resolves exported `@asym/*` imports through
Vite using the package in the current checkout as the self-reference anchor.
Declared export conditions, wildcard mappings and denied subpaths remain owned
by Vite/package exports. A missing declared target fails instead of falling
through to private source or another checkout. Filesystem fallback applies only
to workspace packages with no `exports` field. The focused resolver tests compare
actual Vite resolution with Node 24 for public, private and conditional paths.

The data-boundary scanner excludes generated `.output` and `.nitro` paths only
inside `packages/eve-runtime`; directories with the same names elsewhere remain
subject to the retired Twenty runtime guard.

## Development deployment checkpoints (AL-1921)

Automatic Git deployment is enabled only for `production` in all three app configs. Development hosts remain on their last successful deployment until an explicit checkpoint refreshes them. This is deliberate during active development; compile-time integration errors may be discovered at the next QA checkpoint. Dependency and build-configuration PRs still request compilation.

The existing same-repository, non-draft, `qa:smoke` gate is retained. The preview helper pins Vercel CLI, checks the selected Core app/team, pulls preview settings from the monorepo root, builds locally, and uploads prebuilt output. It removes local `.vercel` state before each app and in a finalizer, and suppresses raw CLI output that could contain environment values. Build output and downloaded environment files must never become diagnostic artifacts.

Production branch protections and source ancestry checks are unchanged. `release:production` always uses `ci:preflight -- --full`, including when its source is `develop`.
