# Proposal

## Why

Core's quality gates were built for hand-written code reviewed line by line.
Most code is now written by agents, and the gates miss what agents get wrong
most often: unchecked type assertions, widened types, swallowed failures and
unhandled promises. The current tools also cost more than they return:

- `bun run lint` runs each workspace's ESLint config. Bans declared only in the
  root config are not enforced in CI, and typed rules are slow enough that most
  are off.
- Root configuration, scripts and tooling are not compiled by any `tsc` run.
- No single policy covers the repository, and agents get no lint or format
  feedback they can act on before a commit.

Ultracite 8.3.0 packages Oxlint and Oxfmt presets with 18 "anti-slop" rules
aimed at those failure modes. TSRS, announced on 2026-11-17, makes type-aware
linting about eight times faster than the backend it replaces, with identical
diagnostics on Core's own code in qualification. TypeScript's native compiler
has reached 7.1 beta.

The owner asked for a complete, coherent adoption: the tools installed, the
policy enforced, and the existing code repaired until it passes, not a
baselined pass, and for the simplest setup that does it.

## What Changes

- **One root quality policy.** Ultracite 8.3.0 presets on Oxlint 1.94.0, in one
  root configuration file used by every command, hook and editor. A lint run
  fails on warnings, and a crashing rule is a tool failure, never a pass.
- **Typed lint on TSRS.** TSRS `7.1.0-beta.tsrs2` is the only installed
  typed-lint backend, selected by a small launcher. A check shows that it is
  the program that executes, on Windows and Ubuntu.
- **Compiler on TypeScript 7.1 beta.** The native compiler checks all 16
  workspaces and, for the first time, root configuration, scripts and tooling.
  Classic `typescript@6.0.3` stays for the API, parser and editor consumers.
- **BREAKING (workflow): Core retires its direct use of Prettier and the general ESLint rules.**
  Oxfmt 0.79.0 formats Core with Prettier's current style kept. ESLint keeps
  two narrow jobs: two TanStack Query rules that need type information Oxlint's
  plugin bridge cannot give, and the six shadcn rules on their existing bridge.
- **A reviewed patch for a crashing rule pair.** Two bundled anti-slop rules
  overflow the stack on valid code and then hide real findings. A small patch
  with a regression test fixes both until upstream does.
- **Zero debt at completion, without a baseline.** New-policy rules with findings are listed in
  `tooling/quality/pending.json`, which the root config reads. The list only shrinks. Each repair pull request
  cleans an entry and deletes it; the migration is complete when the list is empty and the file is deleted.
- **Module mocks are repaired.** A test that mocks one of Core's own modules
  is rewritten to drive the real module, and is shown to still fail for the
  wrong behavior. A mock of a real external boundary may stay with a reviewed
  reason.
- **Repairs that preserve behavior.** A finding is never repaired by `any`, a
  disguised assertion, an always-true guard, an empty safety comment, a way
  around mock detection, a loosened test or a removed runtime check. Repairs
  that change emitted code are made test-first, and each is reviewed by a model
  other than its author.

## Non-goals

- Changing product behavior. A repair that would change what a user sees, such
  as showing a `$0` gift amount, is filed as a follow-up.
- Replacing Vitest or Playwright.
- Compiling the central tests under `tests/`. They get strict lint-only
  programs here; their compile gate is a named follow-up change.
- Repairing the existing shadcn findings or moving those rules to Oxlint. The
  repair and the ledger's retirement belong to `integrate-design-system-lint`.
- A process-wide network guard for unit tests.
- Import sorting, Tailwind class sorting, the optional Landmines preset and the
  `prefer-query-options` rule.
- Owning the pre-push profile, the structure of CI jobs or the agent edit hook,
  which the changes in pull request #2726 own. This change updates the
  commands those gates call.
- Deciding whether accessibility lint gains an ESLint debt baseline, as the
  proposed change `enforce-jsx-a11y-lint` asks. That is an owner decision.

## Authority

The owner's assignment of 2026-11-18 authorizes the research, the plan and the
implementation, including changes to dependencies, compiler pins, version
policies, verifiers, scripts, configurations, tests, CI, engineering guidance
and integrations. It requires that product behavior, tenant isolation,
authorization, financial precision, runtime validation, accessibility and
meaningful regression coverage be preserved, and that protected records,
licensed content and provenance not be rewritten to produce a pass.

A council of three reviewers on three providers examined the plan over ten
rounds. No round reached the assignment's threshold of a 9.2 mean with no hard
gate; the owner directed that round 10 be the last and ratified plan v10 on
2026-11-19. The owner then judged that plan over-engineered. Three independent
reviewers agreed, a fourth tested each proposed cut, and an arbiter ruled on
three questions of scope, keeping module mocking in scope against the
coordinator's recommendation. Plan v11, the design of this change, is the result.
`council-record.md` gives the rounds, the scores and the simplification review.

Related active changes: `integrate-design-system-lint`,
`make-react-doctor-advisory`, `make-shadscan-advisory`,
`complete-repository-modernization`, `verify-toolchain-runtime-pins`, and those
proposed in open pull requests on 2026-11-19: `speed-up-local-gates`,
`rebalance-ci-test-scope`, `enforce-jsx-a11y-lint` and
`add-api-contract-verification`.

## Capabilities

### New Capabilities

- `code-quality-toolchain`: how Core lints, formats and type-checks its own
  source, and how lint findings may be repaired.

### Modified Capabilities

None.

## Impact

- **Dependencies:** adds `ultracite`, `oxlint`, `oxfmt`, `tsrs`,
  `@tanstack/eslint-plugin-query` and `eslint-plugin-playwright`; moves 17
  TypeScript pins to 7.1.0-beta; removes the direct Prettier dependency and
  every general ESLint plugin and shared config.
- **Root configuration:** `oxlint.config.mts`, `oxfmt.config.mts`,
  `.prettierignore`, and compiled programs for root configuration, scripts and
  tooling.
- **New tooling:** a lint launcher and the Query bridge config under
  `tooling/quality/`, a format adapter under `scripts/lib/`, and one dependency
  patch.
- **Every workspace:** `lint` and `typecheck` scripts; the three product apps
  run `next typegen` before compiling.
- **Source and tests:** formatting changes in about 233 files at the cutover;
  one mechanical spacing commit; then repairs in product code by area, with
  tests.
- **Hooks and CI:** the `lint-staged` commands, the lint and format jobs in
  `ci.yml`, and the tool calls of the agent edit hook.
- **Editors:** new `.vscode/extensions.json` and `.vscode/settings.json`.
- **Docs and skills:** a code-quality rulebook, the TypeScript guidance, the
  workspace `AGENTS.md` commands, and the Ultracite skill with its mirrors.

## Rollback

Each layer rolls back on its own. The compiler returns to 7.0.2 in one forward
commit that keeps the fixtures and repairs. The typed-lint backend has a
documented pinned replacement. The formatter cutover can be reverted before
its formatting commit; after it, problems are fixed forward. The linter cutover
is one pull request, and repairs made since stay valid under ESLint. Section 9
of the design gives each procedure.
