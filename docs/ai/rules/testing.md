# Testing Rules — Rules

**Name:** `testing-rules`
**Purpose:** Define how to run and write tests (Playwright E2E, a11y, and perf gates).
Use this when adding tests, modifying critical flows, or verifying changes.

**Applies when:** Adding/updating tests, touching critical user flows, preparing a PR for review, or asked to run tests.
**Do not use when:** Changes are purely documentation or non-functional and do not require tests.

## Rules

- **E2E framework:** Playwright (configured in `playwright.config.ts`).
- **Unit tests:** Vitest (configured for `tests/unit/**/*.test.ts(x)`).
- **Unit test env defaults:** `vitest.config.ts` provides `SKIP_ENV_VALIDATION=1` plus placeholder public Supabase values so unit tests can import env-sensitive modules. Tests that validate env schema behavior must override or clear those values intentionally. These defaults do not replace integration or production env validation, and no real secrets belong in test config.
- **Accessibility:** `@axe-core/playwright`.
- **Performance:** Playwright-based Web Vitals assertions.
- **Local CI parity:** Run `bun run ci:preflight` before push/PR-ready to mirror blocking GitHub checks.
- **Fast local gate:** `bun run check` runs `lint`, `typecheck`, and `test:unit` only. Use it for tight iteration loops.
- **Pre-push mirror:** `bun run ci:preflight` runs `scripts/verify/ci-preflight.mjs`, which mirrors the blocking stages in `.github/workflows/ci.yml` (through `test:unit`). It does **not** run `verify:deployment-discipline`; use `bun run verify:deployment-discipline` or `bun run release:production` when branch-protection or Vercel release posture changes.

## PR preview smoke label policy

Apply the GitHub label `qa:smoke` to ready PRs targeting `develop` when they
affect user-facing runtime flows:

- `apps/admin/**`, `apps/donor/**`, or `apps/missionary/**`
- `packages/ui/**`, `packages/auth/**`, or `packages/api/**`
- routing, middleware, login/session, dashboards, giving flows, or the shared
  UI shell

Do not apply `qa:smoke` for docs-only, evidence-only, formatting-only, or other
non-runtime changes. The label is the gate for
`.github/workflows/qa-smoke-preview-deploy.yml`; Vercel itself does not filter
Preview Deployments by GitHub label.

The preview smoke workflow keeps the deployed Playwright URL handoff on these
variables:

- `QA_ADMIN_BASE_URL`
- `QA_DONOR_BASE_URL`
- `QA_MISSIONARY_BASE_URL`

See `docs/qa/pr-preview-smoke.md` and
`docs/qa/claude-pr-preview-smoke-routine.md`.

## Branch protection (required)

- **Required PR checks on `epic`:** `ci-gate`, `integration-gate`, and
  `e2e-gate`.
- **Required PR checks on `develop`:** `ci-gate`, `integration-gate`, and
  `e2e-smoke-gate`.
- **Non-blocking informational checks:** raw `CI Integration / test-e2e` on
  `develop` must **not** be required; use the gate jobs as branch protection
  requirements. `e2e-gate` is production-only and is required for `epic`.
  `e2e-smoke-gate` enforces the bounded `test-e2e-smoke` Playwright suite on
  `develop`.
- **Repo admins:** Settings → Branches → Branch protection rules → Require status checks to pass:
  - Require the checks above.
  - Disable force pushes on `epic` and `develop`.
  - Keep owner emergency bypass available only for urgent production repair
    after local `bun run ci:preflight`.

See `docs/ci.md` for the full CI gate reference (what each check does, how to debug locally, and how to configure branch protection in GitHub).

## Production E2E scope

- The required `e2e-smoke-gate` on `develop` runs `bun run test:e2e:smoke`
  (demo auth preflight paths, usability smoke, donate, upload-crop, and Support
  Hub smoke). It blocks merges without running the full broad Playwright
  inventory.
- The smoke gate is not an accessibility, hydration, performance, or full auth
  gate. Changes in those areas still need the relevant command, such as
  `bun run test:a11y`, `bun run test:perf`, or the broader `bun run test:e2e`.
- The required `e2e-gate` on `epic` must run a bounded production-release suite, not the
  full broad local Playwright inventory. Use `bun run test:e2e:production-gate`
  for the release gate and keep local-seed-only CMS proof under
  `bun run test:e2e:cms:local`.
- Broad local suites (`bun run test:e2e`, `bun run test:e2e:cms`,
  `bun run test:perf`) remain useful for feature work, but do not replace the
  required gate jobs in branch protection.

## Development deployment smoke

- A separate headless smoke suite targets the live development hosts
  (`development-admin` / `development-donor` / `development-missionary`).
- Config: `playwright.development-smoke.config.ts`. Specs:
  `tests/e2e/development-smoke/*.spec.ts`.
- Run with committed package scripts after exporting local-only secrets:
  `bun run test:e2e:development-smoke[:admin|:donor|:missionary]`.
- Uses Vercel Protection Bypass for Automation via **headers**
  (`x-vercel-protection-bypass`, `x-vercel-set-bypass-cookie`), never query
  params. Secrets live in `.claude/settings.local.json` (gitignored). Do not
  commit secrets and do not put bypass tokens in URLs, scripts, or CI logs.
- This is a **smoke** suite, not regression coverage, and is not required for
  branch protection. See `docs/qa/development-headless-smoke.md` for details.

## Workflow

1. Decide the test scope (unit, e2e, a11y, perf, or specific user flow).
2. Add coverage to the appropriate Playwright specs if needed.
3. Run `bun run ci:preflight` before push/PR-ready.
4. Run the relevant Playwright command(s) before marking a PR ready.
5. Fix failures before proceeding.
6. For user-facing/runtime PRs targeting `develop`, apply `qa:smoke` when the
   PR is ready for preview smoke QA.

## Checklists

### Implementation checklist

- [ ] New pages added to `tests/e2e/accessibility.spec.ts`
- [ ] Performance thresholds are preserved
- [ ] Critical user flows have Playwright coverage
- [ ] Unit tests added for new logic/utils where applicable
- [ ] Local CI parity gate passed (`bun run ci:preflight`)
- [ ] `qa:smoke` applied for eligible user-facing/runtime PRs, or skipped with
      docs-only/non-runtime rationale

### Review checklist

- [ ] Tests are isolated and deterministic
- [ ] Locators use `getByRole` or `getByText`
- [ ] No XPath or brittle CSS selectors
- [ ] Test commands captured in PR summary when closing issues
- [ ] Unit tests avoid network calls and shared state

## Minimal examples

### Run all E2E tests

```bash
bun run test:e2e
```

### Run unit tests

```bash
bun run test:unit
```

### Run a11y checks

```bash
bun run test:a11y
```

### Run perf checks

```bash
bun run test:perf
```

### Run in UI mode

```bash
bun run test:e2e:ui
```

### Debug mode

```bash
bun run test:e2e --debug
```

### View report

```bash
npx playwright show-report
```

## E2E stability (required)

- Prefer `expect.poll`, `page.waitForURL`, or `page.waitForLoadState` over
  `page.waitForTimeout` fixed sleeps. Fixed sleeps hide race conditions and
  slow CI without improving signal.
- After an assertion already polls for readiness, do not add a redundant sleep.
- CI enables Playwright retries (`retries: 2` when `CI=1`); keep specs
  idempotent so retries remain meaningful.
- `tests/unit/e2e/e2e-flake-guards.test.ts` fails if `waitForTimeout` re-enters
  `tests/e2e/**/*.spec.ts`.

## Unit and gate regression guards (required)

- `tests/unit/scripts/ci-preflight.contract.test.ts` locks `ci:preflight` stage
  order against `docs/ci.md` and ensures deployment discipline stays out of
  preflight.
- `tests/unit/scripts/local-gates.contract.test.ts` locks `bun run check` and
  per-app `lint:*` / `typecheck:*` scripts for donor and missionary.
- `tests/unit/apps/donor-missionary-unit-smoke.contract.test.ts` keeps baseline
  donor/missionary unit smoke files, `tests/setup/unit-env.ts`, and the
  `importOriginal` `@asym/email` mock pattern in `connect.test.ts`.
- `tests/unit/packages/api/email/resend-snapshot-contract.test.ts` guards the
  Resend snapshot helpers used by `packages/api` email connect flows.
- `tests/unit/scripts/deployment-discipline.test.ts` and
  `scripts/verify/deployment-discipline.mjs` enforce `e2e-smoke-gate` on
  `develop` and `e2e-gate` on `epic`.
- `tests/unit/unit-test-harness.test.ts` and `tests/setup/unit-env.ts` keep unit
  tests off live secrets (`SUPABASE_SERVICE_ROLE_KEY` cleared globally).

## Common mistakes / pitfalls

- Adding Jest/Vitest without a request
- Ignoring a11y failures
- Writing brittle selectors or XPath
- Allowing tests to depend on each other
- Using `page.waitForTimeout` instead of polling for real UI or URL state
