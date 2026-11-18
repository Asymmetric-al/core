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

Goals: every test that runs on the path to `develop` today still runs on every
event that reaches it; pull requests stop paying for duplicate work and wait
less for the unit tests; the required integration path gets shorter without
renaming or removing a required check; two guards that matter get a CI home.

Non-goals: deleting, skipping or weakening any test; skipping a unit test
because of what a pull request changes; a hand-maintained list of test files;
changing the local preflight, hooks or acceptance tests; changing branch
protection.

## Decisions

### 1. Acceptance runs once, in its own job

`scripts/verify/unit-tests.mjs` appends `--exclude tests/unit/acceptance/**`
(Vitest's CLI `--exclude` adds to the configured excludes) to a run without
test filters. Whether the arguments carry filters is decided by Vitest's own
CLI parser (`parseCLI` from `vitest/node`), so `-t acceptance`, `--shard=2/3`
and anything after `--` are options, not filters, and keep the exclusion. With
filters the runner adds nothing and Vitest's filter matching decides: every
form Vitest accepts for a path inside the directory runs those files
(root-relative or absolute, either slash, `file:line`, a fragment such as
`issue-2153`, a bare file name), including
`bun run test:unit -- tests/unit/acceptance/<file>`, the factory check tool's
documented form. The exclusion only ever removes acceptance files, so dropping
it for a filter that matches none of them selects exactly the same files.

History: a first draft dropped the exclusion for any argument containing
"acceptance", so `-t acceptance` ran the whole directory (review round 6,
c1.5). The fix accepted only a root-relative or absolute path, so a fragment
or file name selected nothing (review round 8, c2a.10), and it dropped the
exclusion for a path after `--`, which Vitest does not read as a filter, so
that run executed all 134 acceptance files. The runner tests now check what
Vitest actually selects for each form, through
`tests/unit/scripts/support/vitest-run-files.mjs`.

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

### 2. Every unit test on every event, in three shards

`test-unit` runs every file `test:unit` selects (everything Vitest's
configuration includes except `tests/unit/acceptance/`) on every event,
whatever a pull request changes. It is a matrix job of three shards: shard
`i` runs `bun run test:unit --shard=<i>/${{ strategy.job-total }}`, and
`strategy.job-total` is 3 because the matrix has one dimension, `shard`, with
the values 1 to 3. Bun passes `--shard=<i>/3` to the runner, and the runner's
acceptance rule (§1) reads it as an option, not a filter.

How Vitest shards (5.0.5, read in `node_modules/vitest`): the pool sorts the
selected files by the SHA-1 of their root-relative path, written with forward
slashes on every platform, and gives each shard an equal count
(`BaseSequencer.shard` and `calculateShardRange`). The split is therefore the
same locally and on GitHub; today it is 478, 478 and 477 files. `vitest list
--filesOnly` does not apply `--shard`, so the tests ask Vitest for each shard
through `getRelevantTestSpecifications` and the configured sequencer's
`shard`, the calls the pool makes
(`tests/unit/scripts/support/vitest-run-files.mjs`). Each argument list is
resolved in its own process, because Vitest 5.0.5 carries a CLI `--exclude`
into later instances created in the same process.

`tests/unit/scripts/unit-test-shards.test.ts` reads the shard numbers and the
run line from `ci.yml` and checks that the shards together run exactly the
unsharded `test:unit` list, each file once and none of the acceptance
directory, and that `test:unit` plus the acceptance job run exactly what
Vitest's configuration includes. A runner that dropped `--shard` fails it.

Gate: `ci-gate` needs `test-unit` and passes
`"unit": "${{ needs.test-unit.result }}"` to `validateCiGate`, which accepts
only `success`. GitHub reports a matrix job's result as `success` only when
every shard succeeded. `fail-fast: false` keeps one red shard from cancelling
the others, so every failure in a run is reported. The job id, `if`, `runs-on`
and `timeout-minutes` are unchanged; GitHub lists the shards as
`test-unit (1)` to `test-unit (3)`. None of them is a required check: `develop`
requires `ci-gate`, `e2e-smoke-gate`, `migrate` and `smoke`, so no required
check name changes. The required-checks guard of `retire-acceptance-byte-pins`
passes on the sharded workflow.

Coverage: each shard uploads its own `coverage/` as `unit-test-coverage-<i>`,
covering only that shard's files. Nothing in CI or the repository reads these
artifacts, so no merged report is built; Vitest's blob reporter and
`--merge-reports` are the way to build one if it is ever needed.

Choosing three shards. Per-file test times come from the `test-unit` logs of
three develop pushes (runs 44258470352, 44245610411 and 44240784778, whose
jobs took 795, 1,169 and 1,222 s; the last five develop pushes took 795 to
1,222 s, median 1,047). The model gives each file its logged test time plus
an even share of the import, environment and setup time Vitest reports
(0.48 to 0.74 s per file), assigns files as Vitest does, divides each shard's
total by the observed parallelism (2.7 workers on the 4-vCPU runner), and adds
Vitest's start and report time (11 to 19 s), the job's setup (75 to 92 s:
checkout, canvas packages, Node, Bun, `bun ci`) and its post steps (about
6 s).

| Shards            | Slowest shard job, three runs | Billed minutes per run |
| ----------------- | ----------------------------- | ---------------------- |
| 1 (no acceptance) | 11.7, 17.0, 17.8 min          | 12, 18, 18             |
| 2                 | 6.7, 9.5, 10.1 min            | 14, 20, 21             |
| **3 (chosen)**    | **5.0, 7.0, 7.4 min**         | **17, 21, 23**         |
| 4                 | 4.3, 5.8, 6.2 min             | 18, 24, 25             |

Three shards put the slowest shard job at about 7 minutes on the slower
runners that set the median, inside the 7-8 minute target, and still above
`format` (224 to 275 s), the next longest job on develop pushes. Four would
save about one more minute of wall time for one or two more billed minutes per
run; two would leave about 10 minutes on the slower runners.

Minutes trade: each shard repeats about 1.3 to 1.5 minutes of setup, and
GitHub rounds each job up to a whole minute, so billed minutes for
`test-unit` rise from about 12-18 to about 17-23 per run (3 to 5 more), while
its wall time falls from about 12-18 minutes to about 5-7.5. The repository is
public, so hosted minutes cost nothing today; on a private plan this is the
trade to weigh. Real timings come from the pull-request run.

Equivalence, from Vitest's own selection on this branch: `test:unit` before
this change (`vitest run --coverage`) ran 1,567 files. `test:unit` now runs
1,433 for a push to `develop`, a `merge_group` run and a develop pull request
alike; `acceptance-tests` runs the other 134; none is missing, extra or run
twice. The three shards hold 478, 478 and 477 of the 1,433, with no overlap.

What was withdrawn. The first version of this change skipped the factory-pack
tests (`tests/unit/scripts/archon-*` and `factory-*`) on develop pull requests
that touched none of their inputs, after a static analysis of each test's
imports and repository reads. Review rounds 6 and 8 kept finding shapes it
missed; in round 8, 22 of 23 constructed shapes that read outside the inputs
were cleared. The saving was about 36 s of test time in a test step whose
median is about 971 s. A heuristic that keeps missing shapes is not worth
that, so the selection, its analysis, its derived full-run triggers and their
tests were removed (2026-11-18), and sharding cuts far more wall time without
skipping anything. What remained of `scripts/verify/ci-test-scope.mjs` was
the instant-nav decision (§7), now `scripts/verify/instant-navigation-scope.mjs`.

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
build. The step has its own `timeout-minutes: 6` (review round 6, c2.2):
setup takes about 1.5 minutes and the compile step up to about 5 on recent
runs, so the rebuild ends inside the 15-minute job limit and the job ends
failed with the compile error, not cancelled at the limit. Cost: nothing on a
green build; one extra app build, at most 6 minutes, on a red one.

### 7. `instant-nav` on develop pull requests

The job's `if` adds same-repository pull requests into `develop`. A first
step, `node scripts/verify/instant-navigation-scope.mjs`, decides whether the
change set can affect the guards, and runs only for a pull request into
`develop` (`if: github.event_name == 'pull_request' && github.base_ref == 'develop'`);
when it clears the change, every later step is skipped and the log says why.
Each later step runs unless the event is a pull request into `develop` and the
step's output is exactly `false`
(`github.event_name != 'pull_request' || github.base_ref != 'develop' || steps.scope.outputs.run != 'false'`).
On production pull requests, production pushes and dispatch the decision step
is skipped and the guards run, so they never depend on the script. On
`develop` a script that writes nothing (GitHub reads a missing output as `''`)
runs them, and a script that fails fails the job, because the later steps
carry an implicit `success()`. History: a first draft gated the steps on
`run == 'true'`, which would have let a broken script skip every production
guard while `e2e-gate` saw a successful job (review round 6, c2.1); the next
ran the decision step on every event, so a failing script would have failed a
production job that does not need it (review round 8, c2b.1). A unit test runs
the script exactly as the job does, with a temporary `GITHUB_OUTPUT`, and the
workflow test evaluates the decision step and every later step for each event,
for the outputs `true`, `false` and missing, and for a failed decision step.
Inputs: `apps/donor/**`, `packages/**`, `tooling/**`, `vendor/**`,
`scripts/**` (the donor Next.js
configuration imports several root scripts), `tests/e2e/**`,
`playwright*.config.ts`, the root manifests and lockfile, `turbo.json`, root
`tsconfig*.json` and `.github/workflows/ci-integration.yml`. An unknown change
set runs the guards. The checkout gains `fetch-depth: 0` so the diff can be
computed. Production pull requests, production pushes and manual dispatches
always run the guards, and `e2e-gate` still needs the job on production.

The dead `continue-on-error` expression is removed: it is true exactly on
develop pull requests and pushes, so once the job runs on develop pull
requests it would turn a guard failure into a green job. The job is not added
to `e2e-smoke-gate`, `integration-gate` or `develop`'s branch protection. The
required-checks guard treats it as advisory because no `develop`-required job
needs it. Production's `e2e-gate` does need it, so its steps keep the rule for
jobs a required check reaches: the `|| true` after printing the donor log, just
before an unconditional `exit 1`, is gone (review round 8, c2b.2).

`development-build-policy` is introduced by the active change
`reduce-development-builds` and is not in `openspec/specs`, so OpenSpec cannot
build a MODIFIED delta against it. The exception is an ADDED requirement in
that capability that names the scenario it qualifies; when both changes are
archived, the requirement joins the capability next to the rule it qualifies.

**Explicit supersession of one `reduce-development-builds` clause.** That
change's `design.md` says "Instant-navigation compilation runs only for
production or explicit QA/manual integration checks", and its task 1.4 says
"restrict instant-navigation builds to checkpoints". On the owner's
2026-11-18 "yes" (see `proposal.md`), this change supersedes exactly that
clause for one case: a same-repository pull request into `develop` whose
changes can affect the `instant()` guards gets one donor production build, in
the non-required `instant-nav` job. Everything else in
`reduce-development-builds` stays binding: develop pushes compile nothing,
routine develop pull requests compile only dependency and build inputs in the
`build` job, `ci-gate` accepts a skipped build only after a successful
no-build plan, and the required migration and smoke jobs keep running. This
follows the form `complete-repository-modernization` used for its own
supersession of a `reduce-development-builds` clause, and
`docs/ai/document-authority.md`'s rule that an intent conflict follows the
explicit supersession, not file age.

That precedent also added a pointer at the top of
`reduce-development-builds/design.md`, and this change adds the same kind of
one-line pointer there, so the supersession is recorded on both sides (review
round 8, c2b.3). `docs/ai/document-authority.md` also asks that a superseded
clause be edited itself; amending that change's design line and its task 1.4
is left to its owner, because this change edits exactly one line of another
active change (task 9.4). Archive order:
`reduce-development-builds` first, because it introduces the capability and
the requirement this one qualifies; archived the other way round,
`openspec/specs/development-build-policy` would briefly hold only the
exception.

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

Consequence for local runs (review round 6, c2.5): a `next dev` already
running for the same app on another port (`bun run dev:donor` on 3000 while
Playwright wants 3005) holds the lock, so Playwright's own server would exit.
Outside CI, `devServerCommand` therefore first runs
`tests/e2e/dev-server-lock.mjs <app> <port> <hostname>`. It reads the server
Next.js records in the lock (URL and PID) without touching the lock, and when
that process is alive and listening on its port it exits 1 with a message
naming the server, the command to stop it, and how to restart it on
Playwright's port so Playwright reuses it. A stale lock from a dead process,
or a process not listening, lets the start go ahead and leaves the decision to
Next.js. CI keeps the plain command: its jobs start each server once and set
`PLAYWRIGHT_REUSE_EXISTING_SERVER=1`. Checked on this Windows host on
2026-11-18 against a lock taken through Next's own native binding: the
recorded server is readable while the lock is held, a second acquire fails,
the check exits 1 with the message, and after the holder exits the lock file
is gone and the check exits 0.

## Risks and trade-offs

- Billed minutes for `test-unit` rise by about 3 to 5 per run (§2), because
  each shard repeats setup; wall time falls by more than half.
- Shards hold equal file counts, not equal durations. A slow file lands where
  its path hash puts it, so one shard can run longer than the others; the
  model allows for today's slowest file (`supabase-migrations`, 55 to 84 s),
  and the first runs show the real spread.
- Each coverage artifact covers one shard. Nothing reads them today; a
  consumer would need a merged report.
- The runner imports `parseCLI` from `vitest/node`. A Vitest upgrade that
  drops or changes it breaks `test:unit` loudly, never silently, and the
  runner tests check the selection through Vitest itself.
- The matrix semantics (`needs.test-unit.result`, `fail-fast: false`) and
  the shard timings are GitHub behaviour this branch cannot run locally; the
  first pull-request run confirms them.
- `test-e2e-smoke` runs even when `migrate` fails, spending free runner time
  for the same red gate.
- `instant-nav` adds about 2.5 runner-minutes to qualifying develop pull
  requests, off the required path.
- The local preflight stops running acceptance tests until the pre-push
  workstream adds its own stage.

## Rollback

Revert the commits. No data, schema, credential, branch-protection or
deployment state changes.
