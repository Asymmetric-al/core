# Design

## Context

Measurements come from GitHub run data read with `gh` on 2026-11-18. The
unit-test numbers are from the `test-unit` log of the develop push run
44258470352 (head `2e0c64593`): 1,569 files, 1,142 s of per-file test time,
712 s Vitest wall time.

| Group under `test:unit` | Files | Test time | Share |
| ----------------------- | ----: | --------: | ----: |
| `tests/unit/scripts`    |   224 |     388 s | 34.0% |
| `tests/unit/apps`       |   444 |     373 s | 32.7% |
| `tests/unit/acceptance` |   138 |     181 s | 15.8% |
| packages                |   563 |     115 s | 10.1% |
| other                   |   200 |      85 s |  7.4% |

Job durations on the last five develop pushes: `test-unit` 795-1,222 s (test
step 713-1,120 s), `acceptance-tests` 139-191 s (test step 68-91 s), `lint`
68-107 s. CI Integration medians from the pipeline audit: `migrate` 3.0 min
(p90 5.3), `smoke` 1.8, `test-e2e-smoke` 5.2 (p90 5.7), chained to about ten
minutes.

Active changes that touch the same ground: `reduce-development-builds`
(introduces `development-build-policy`), `make-core-ci-hosted` (introduces
`ci-runner-policy`, whose placement requirement says hosted placement keeps job
inventory, event coverage and dependencies; this change alters dependencies
and one job's events on purpose, not its placement), and
`retire-acceptance-byte-pins` (adds the required-checks guard in
`tests/unit/workflows/required-ci-checks.test.ts`, which every workflow edit
here must keep green).

## Goals and non-goals

Goals: every test that runs on the path to `develop` today still runs on that
path; pull requests stop paying for duplicate and provably unaffected work;
the required integration path gets shorter without renaming or removing a
required check; two guards that matter get a CI home.

Non-goals: deleting, skipping or weakening any test; a hand-maintained list of
test files; changing the local preflight, hooks or acceptance tests; changing
branch protection.

## Decisions

### 1. Acceptance runs once, in its own job

`scripts/verify/unit-tests.mjs` appends `--exclude tests/unit/acceptance/**`
(Vitest's CLI `--exclude` adds to the configured excludes). It does not add
the exclusion when any argument mentions `acceptance`, so
`bun run test:unit -- tests/unit/acceptance/<file>` (the factory check tool's
documented form) still runs the file. Over-inclusion on an unrelated filter
that happens to contain the word is harmless.

The `acceptance-tests` job stays: it has no `if` and no secrets, so it runs on
fork pull requests, and `issue-2153` pins its id and `ci-gate` wiring. Its
"no tests executed" guard stays in `scripts/verify/acceptance-tests.mjs`.
Real-database acceptance files keep running in `migrate`; in both Vitest
suites they skip without a database URL, as before.

Equivalence: on a push to `develop` the set of files executed by `test-unit`
plus `acceptance-tests` is unchanged; the acceptance files now execute once
instead of twice. The local preflight runs `test:unit` only, so after this
change it no longer runs acceptance tests; adding an acceptance stage there
belongs to the pre-push workstream (#2710), which owns
`scripts/verify/ci-preflight.mjs`.

### 2. One scoped group: the factory pack tests

Selection lives in `scripts/verify/ci-test-scope.mjs`, imported by the unit
runner. `selectUnitTests({ event, baseRef, changedFiles })` is pure: it
returns `{ full, reason, skipped[] }`. A separate impure reader computes the
changed files with `git diff --no-renames --name-only <base>...<head>` and
returns `null` on any failure or a shallow checkout. The runner turns each
skipped group into `--exclude` globs and prints one line per decision.

Full run (no skips) when: the event is not `pull_request`; the base branch is
not `develop`; the change set is `null` or empty; or any changed file matches
a full-run trigger. Full-run triggers: root `package.json`, `bun.lock`,
`bun.lockb`, `bunfig.toml`, `.bun-version`, `.node-version`, `.nvmrc`,
`.npmrc`, root `tsconfig*.json`, `tooling/typescript-config/**`, the Vitest
configuration files and `tests/setup/**`, `tests/mocks/**`, the unit runner,
the selection module, and `.github/workflows/ci.yml`. The `test-unit` job
already checks out full history (`fetch-depth: 0`); a shallow checkout would
select everything, never nothing.

The factory group is `tests/unit/scripts/archon-*.test.ts` and
`tests/unit/scripts/factory-*.test.ts` (74 files, 44.8 s of test time, 3.9% of
unit worker time). Its inputs are the group's own test files,
`scripts/archon-factory/**`, `scripts/factory/**`,
`scripts/verify/bun-lock-drift.mjs`, `scripts/verify/ci-build-policy.mjs`,
`tests/unit/helpers/**`, `tests/unit/scripts/support/**`, `.codex/**`,
`docs/ai/skills/samson-factory/**`,
`docs/guides/development/samson-codex-cloud.md` and
`openspec/changes/add-six-agent-codex-factory/**`.

Narrowness proof, recorded by inspection on 2026-11-18:

- Imports. Every relative import in the 74 test files resolves under
  `scripts/archon-factory/`, `scripts/factory/`,
  `scripts/verify/bun-lock-drift.mjs`, `tests/unit/helpers/workflow-yaml.ts`
  (used only for `parseWorkflowSource` on pack YAML) or
  `tests/unit/scripts/support/`. No relative import inside
  `scripts/archon-factory/` or `scripts/factory/` leaves those directories.
  `tests/unit/helpers/workflow-yaml.ts` imports
  `scripts/verify/ci-build-policy.mjs` and its sibling helper. No test or
  module imports a workspace package (`@asym/*`). Bare npm imports change only
  with the lockfile or manifests, which are full-run triggers.
- File reads. Seven test files resolve repository paths: five read pack files
  through `new URL("../../../scripts/archon-factory/...", import.meta.url)`;
  `factory-hosted-startup` creates a temporary directory under the working
  directory; `factory-startup-guidance.contract` reads the samson-factory
  skill, its protocol, `docs/guides/development/samson-codex-cloud.md` and the
  `add-six-agent-codex-factory` spec. Every other path string in the group is
  a fixture inside a temporary directory. Factory modules resolve the
  repository root in three places: `build-pack.mjs` (pack roles, `.codex`
  agents, the samson-factory skill; no group test imports it) and
  `scripts/factory/install-native.mjs` and `setup-cloud.mjs` (`.codex/**`, the
  samson-factory skill and `package.json`, defaults the tests replace with
  fixture roots). The inputs include all of these defaults anyway.

A structural guard (`tests/unit/scripts/ci-test-scope-inputs.test.ts`) keeps
the proof true without a list of files: for every file the group's globs
match, it follows relative imports transitively and checks `new URL(...,
import.meta.url)` targets, workspace-package imports, and, in test files that
reach the repository root (`import.meta.dirname`, `__dirname`,
`process.cwd()`), every path literal that names a top-level repository entry.
Anything outside the inputs fails the guard with the file and path. The guard
is not in the group, so it runs on every pull request. Its limits: a read
through a computed path it cannot see would escape it; the develop-push and
merge-group full runs are the backstop for that case.

Measured saving: about 45 s of test time, roughly 30-45 s of wall time, on
pull requests that do not touch the factory. That is small; it is the honest
result of the narrow-input rule.

Groups examined and not scoped: design-system tests (12 files, 75 s) read
`apps/**`, `packages/ui/**` and `tooling/**`; Phase 24 authority tests (5
files, 64 s) read `docs/adr`, `docs/prds`, `openspec/specs` and
`openspec/changes`; `supabase-migrations.test.ts` (55 s) reads
`supabase/migrations`, `docs/security/**`, acceptance harnesses and
`scripts/**`; skill tests (6 files, 30 s) copy `scripts/**`,
`docs/ai/skills/**` and `.agents/**`; `e2e-dev-server` reads `.github`.
None has narrow inputs, so all stay unscoped. The factory-console app tests
(16 files, 4.4 s) are not worth a group.

### 3. Required integration path

History: `smoke` has needed `migrate` since the repository's first commits,
with no recorded reason; in `480d602dc` (#2158) its `if` was widened so a fork
pull request still reports `smoke` as a fork rejection. `test-e2e-smoke`
gained `needs: smoke` when it was added in `1ad503553`, also without a stated
reason. `test-e2e` waits for both since `b4439fecd` to serialize self-hosted
capacity.

`test-e2e-smoke` applies its own migrations, Payload migrations and seed, and
starts its own donor and admin servers, so it depends on neither job. The
change removes only its `needs: smoke`. Without `needs`, its `if` (no
`always()`) still excludes fork pull requests, so `e2e-smoke-gate` still sees
`skipped` there and fails closed with `migrate` blamed first. `smoke` keeps
`needs: migrate`: a broken migration still fails fast there, the `issue-2201`
acceptance assertion that `smoke` waits for `migrate` stays true, and removing
it would save little because `test-e2e-smoke` (5.2 min) is now the longest
leg. Predicted required path: max(`migrate` + `smoke` ≈ 4.8 min p50,
`test-e2e-smoke` ≈ 5.2 min) ≈ 5.5 min, down from about 10. The cost: when
`migrate` or `smoke` fails, `test-e2e-smoke` still runs (about 5 hosted
runner-minutes; the repository is public, so minutes are free).

`test-e2e` keeps `needs: [smoke, test-e2e-smoke]` unchanged. Required check
names and the gates' `needs` lists do not change.

### 4. Axe spec: not promoted

The spec that best covers sign-in is `tests/e2e/accessibility.spec.ts`
(homepage, `/login`, `/register`, label and contrast checks). It runs in no CI
workflow (`test:a11y` is referenced only by `validate:full`), so it has no run
record. The five axe specs in the advisory production gate
(`data-table-accessibility`, `shared-primitive-contrast`, `ui-sdk-rating`,
`ui-sdk-sortable-list`, `ui-sdk-web-studio-column-order`) mount shared
components in network-aborted fixture pages; none covers sign-in or giving.
No axe spec covers `/checkout` or the donate flow. A required check must not
be promoted without a clean record, so nothing is promoted. What a promotion
needs is in the report: a burn-in of `accessibility.spec.ts` in the advisory
job and a clean record over enough runs.

### 5. `verify:shadcn-config` in the lint job

One step, `bun run verify:shadcn-config`, after the other `verify:*` steps in
`lint`. It runs in under a second, needs only the installed dependencies, and
makes the `base-maia` invariant blocking through `ci-gate`.

### 6. Debug-prerender diagnostics on a failed build

`scripts/verify/ci-build.mjs` records the id of an app whose `next build` step
fails into `$RUNNER_TEMP/ci-build-failed-apps` when running in GitHub Actions
outside Vercel. A new `--debug-prerender` mode reads that record and rebuilds
each recorded app with `bun run --cwd apps/<app> build -- --debug-prerender`
under the CI environment wrapper. It refuses to run when `VERCEL` is set or
outside GitHub Actions. The `build` job gains one step with `if: failure()`
that runs this mode; it does nothing when the failure happened before an app
build (for example in shared packages). The normal build command never carries
the flag, so Vercel, which runs `bun run build:<app>`, cannot deploy a debug
build. Cost: nothing on a green build; one extra app build on a red one.

### 7. `instant-nav` on develop pull requests

The job's `if` adds same-repository pull requests into `develop`. A first step
asks the selection module whether the change set can affect the guards; if
not, every later step is skipped and the log says why. Inputs: `apps/donor/**`,
`packages/**`, `tooling/**`, `vendor/**`, `scripts/**` (the donor Next.js
configuration imports several root scripts), `tests/e2e/**`,
`playwright*.config.ts`, the root manifests and lockfile, `turbo.json`, root
`tsconfig*.json` and `.github/workflows/ci-integration.yml`. An unknown change
set runs the guards. The checkout gains `fetch-depth: 0` so the diff can be
computed. Production pull requests, production pushes and manual dispatches
always run the guards, and `e2e-gate` still needs the job on production.

The dead `continue-on-error` expression is removed: it is true exactly on
develop pull requests and pushes, so once the job runs on develop pull
requests it would turn a guard failure into a green job. The job is not added
to `e2e-smoke-gate`, `integration-gate` or branch protection. The
required-checks guard treats it as advisory because no required job needs it.

`development-build-policy` is introduced by the active change
`reduce-development-builds` and is not in `openspec/specs`, so OpenSpec cannot
build a MODIFIED delta against it. The exception is an ADDED requirement in
that capability that names the scenario it qualifies; when both changes are
archived, the requirement joins the capability next to the rule it qualifies.

### 8. Next.js dev-server lock (gap check row R2)

Two Core scripts delete Next's dev-server lock: `devServerCommand` in
`tests/e2e/playwright-shared.ts` removes `apps/<app>/.next/dev/lock` before
every Playwright-launched `next dev` ("crashed runs leave it behind and block
the next start"), and `clearStaleNextLocks` in `scripts/verify/ci-build.mjs`
removes every file named `lock` under `apps/*/.next`, including a running dev
server's, whenever no `next build` is running. Both predate the installed
lock (`0047e6503`, 2026-02-21; `4d045bded`, 2026-05-16).

At Next.js 16.4.5 the lock is an operating-system lock taken by the dev
bundler (`server/lib/router-utils/setup-dev-bundler.js` calls
`Lockfile.acquireWithRetriesOrExit(<distDir>/lock, 'next dev', ...)`), and the
operating system releases it when the process dies. Experiment on this native
Windows 11 host, 2026-11-18, donor on port 3417, no deletion between runs:

1. `next dev` printed Ready after 3.5 s; `.next/dev/lock` appeared 11 s after
   start, once the bundler initialised.
2. `taskkill /T /F` of the process tree. Afterwards the lock file was gone and
   the port was free.
3. A second `next dev` printed Ready after 2.6 s and acquired the lock again
   after 9 s.

So a killed dev server does not block the next start on Windows. On POSIX the
lock file stays behind but unlocked, and the next start re-acquires it. The
deletions only let a second server start against a live server's `.next/dev`
(POSIX), which is what the guide's "reuse the running dev server" behaviour
exists to prevent. Decision: `devServerCommand` runs only the app's
`dev:playwright` script, and `clearStaleNextLocks` never deletes anything
under `.next/dev`; it still clears build locks elsewhere under `.next` after
waiting for running builds, as before.

## Risks and trade-offs

- A factory test that starts reading outside its inputs through a computed
  path would be skipped on unrelated pull requests until the develop push or
  merge-group run catches it. The guard covers imports and literal paths.
- `test-e2e-smoke` runs even when `migrate` fails, spending free runner time
  for the same red gate.
- `instant-nav` adds about 2.5 runner-minutes to qualifying develop pull
  requests, off the required path.
- The local preflight stops running acceptance tests until the pre-push
  workstream adds its own stage.

## Rollback

Revert the commits. No data, schema, credential, branch-protection or
deployment state changes.
