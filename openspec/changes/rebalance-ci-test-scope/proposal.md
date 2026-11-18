# Proposal

## Why

CI spends its time in the wrong places. The 136 acceptance test files run
twice on every push: inside `test-unit` and again in the `acceptance-tests`
job, so one failure shows as two red jobs. Every pull request runs all 74
factory-pack tests, whatever it changes. The required integration path chains
`migrate`, `smoke` and `test-e2e-smoke`, so it takes about ten minutes when its
longest job takes about five. Two guards run nowhere a pull request cannot
skip (`verify:shadcn-config`), or effectively never (the `instant()`
navigation guards). And a failing production build stops at its first route
with minified stacks.

## Authority

The owner ruled on 2026-11-18. Step 3 as offered: "One batch of CI edits:
exclude the acceptance directory from `test-unit`, run script tests only on
matching paths with a develop backstop, parallelise the integration jobs,
move one axe spec and `verify:shadcn-config` into required checks". Owner:
"do #3 but it must be done very intelligently. we do want to use TDD. don't
cut too harshly."

Asked on 2026-11-18 whether the `instant()` navigation tests may run on develop
pull requests even though that compiles the donor app on source-only changes
("about 2.5 runner-minutes, not a required check"), the owner replied: "yes".

The owner also said: "work carefully to not break anything or cause any
regression in quality", and "Keep in mind there is currently active
constriction of the supabase database/rls/auth at the moment." This change
touches no migration, seed, row-level security policy or auth code.

The Next.js items come from the owner's direction to follow the practices in
the Next.js AI-agents guide (`.next-docs/01-app/02-guides/ai-agents.mdx`), as
assigned by the program's gap check (issue #2711).

## What Changes

- **Acceptance runs once.** `bun run test:unit` excludes
  `tests/unit/acceptance/` unless an argument explicitly targets it. The
  dedicated, fork-safe `acceptance-tests` job keeps running the whole
  directory with its "no tests executed" guard. Real-database acceptance files
  keep running in `migrate`.
- **Factory tests run by their inputs on pull requests.** A pure, test-first
  selection function decides, from the event and the pull request's changed
  files, whether a scoped test group may be skipped. One group qualifies: the
  factory-pack tests, whose imports and file reads stay inside the factory's
  own directories. Every uncertain case runs everything: no base, a shallow or
  failed diff, an unknown event, a change to the selection logic, the Vitest
  configuration, the root manifests or the CI workflow. Pushes to `develop`,
  `merge_group` and manual runs always run the full suite. Membership needs no
  list: before skipping, the selection follows each factory test's imports and
  repository reads and keeps any test that reaches outside the group's inputs
  in a form it recognises, or through an import it cannot follow, in the run
  (`design.md` §2 lists the forms, and the run-time-built paths it cannot
  see). The log names what was skipped, what was kept and why.
- **Shorter required integration path.** `test-e2e-smoke` stops waiting for
  `smoke`; it applies its own migrations and seed and starts its own servers.
  `smoke` keeps waiting for `migrate`. No required check is renamed or
  removed, and the advisory `test-e2e` job is unchanged.
- **`verify:shadcn-config` in CI.** The `lint` job runs it next to the other
  `verify:*` steps, so the `base-maia` invariant no longer depends on a local
  hook.
- **Build failures an agent can read.** When the CI `build` job fails, a
  failure-only step rebuilds the app that failed with
  `next build --debug-prerender`. The normal build command, which Vercel also
  runs, never carries the flag.
- **`instant()` guards on develop pull requests.** The `instant-nav` job also
  runs for same-repository pull requests into `develop` when donor,
  shared-package, toolchain or guard inputs change. It stays out of every
  required check and gate job, and its dead `continue-on-error` expression is
  removed so a failure shows as a red check.
- **A running dev server keeps its lock.** The Playwright dev-server launcher
  and the CI build script stop deleting `.next/dev/lock`. At the installed
  Next.js version the lock is released by the operating system when its
  process dies; a native Windows experiment confirmed that a killed `next dev`
  does not block the next start (see `design.md`).
- **Accuracy fixes.** A misleading comment about where instant-navigation
  compliance is enforced is corrected; `docs/ci.md` and the contributor
  documents describe the new placement.

## Non-goals

- Promoting an axe spec into the required smoke set. The spec that covers
  sign-in (`tests/e2e/accessibility.spec.ts`) runs in no CI job today, so it
  has no run record, and no axe spec covers giving. A required check must not
  be promoted without a clean record. `design.md` records what a burn-in
  needs.
- Scoping any other tooling test group. The other heavy groups read
  application, package, documentation or skill trees, so their narrowing
  cannot be proved.
- Renaming, removing or re-gating any required check, changing branch
  protection, the merge queue settings or review automation.
- Changing the local preflight (`scripts/verify/ci-preflight.mjs`), hooks, or
  any test under `tests/unit/acceptance/`.

## Capabilities

### New Capabilities

- `ci-verification-scope`: where and how often CI runs each kind of test and
  verifier, the fail-safe rules for running fewer tests on a pull request, the
  parallel required integration path, and CI diagnostics for failed builds.

### Modified Capabilities

- `development-build-policy`: adds one exception to routine conditional
  compilation, one donor production build for the `instant()` guards in a
  non-required job on develop pull requests. The capability is introduced by
  the active change `reduce-development-builds` and is not yet in
  `openspec/specs`, so the delta is an ADDED requirement that names the
  scenario it qualifies (see `design.md`).

## Impact

- Code: `scripts/verify/unit-tests.mjs`, a new selection module
  `scripts/verify/ci-test-scope.mjs`, `scripts/verify/ci-build.mjs` (the
  debug-prerender helper and the lock clean-up),
  `tests/e2e/playwright-shared.ts` (the dev-server command), and their unit
  tests.
- Workflows: `.github/workflows/ci.yml` (`lint`, `test-unit` and `build`
  jobs), `.github/workflows/ci-integration.yml` (the `test-e2e-smoke` needs
  edge and the `instant-nav` trigger).
- Documents: `docs/ci.md`, `CONTRIBUTING.md` and `docs/ai/rules/testing.md`
  where they describe the changed placement.
- Runner time: about a sixth less unit-test worker time on every run, a small
  further saving on pull requests that do not touch the factory, and about
  five minutes off the required integration path. One extra donor build on
  qualifying develop pull requests, off the required path.
- Rollback: revert the commits. No data, schema, credential, branch-protection
  or deployment change is involved.
