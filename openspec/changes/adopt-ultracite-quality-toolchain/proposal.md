# Proposal

## Why

Core's quality gates were built for hand-written code reviewed line by line.
Most code is now written by agents, and the gates miss what agents get wrong
most often: unchecked type assertions, widened types, module mocks that stop a
test from testing anything, swallowed failures, and tests of scripts and tools
that no compiler checks. The current tools also cost more than they return:

- `bun run lint` runs each workspace's ESLint config. Bans declared only in the
  root config are not enforced in CI, and typed rules are slow enough that most
  are off.
- About 1,788 central test files are not compiled by any `tsc` run. A
  qualification compile found between 1,000 and 1,500 errors in them.
- Prettier, more than a dozen formatter consumers and several hash-bound
  records all depend on byte-exact output, so every formatting change stales
  records that unrelated work must repair.
- No agent harness gets lint or format feedback at edit time. Agents first meet
  a failure at commit or push, where the full gate takes about 40 minutes.

Ultracite 8.3.0 packages Oxlint and Oxfmt presets with 18 "anti-slop" rules
aimed at exactly those agent failure modes. TSRS, announced on 2026-11-17,
makes type-aware linting about eight times faster than the backend it
replaces, in the reference mode Core uses, with identical diagnostics on Core's own code (25,352 of 25,352 in
qualification). TypeScript's native compiler has reached 7.1 beta.

The owner asked for a complete, coherent adoption: the tools installed, the
policy enforced, and the existing code repaired until it passes, not a
baselined pass. A council of three reviewers on three providers examined the
plan over ten rounds, and the coordinator recorded 76 evidence entries against
the repository. Plan v10 was ratified on 2026-11-19 at the owner's direction.

## What Changes

- **One root quality policy.** Ultracite 8.3.0 presets on Oxlint 1.94.0 and
  Oxfmt 0.79.0, loaded through root entry configs and used by every command,
  hook and editor. All 18 anti-slop rules are errors, with one justified
  carve-out for plain JavaScript files.
- **Typed lint on TSRS.** TSRS `7.1.0-beta.tsrs2` is the only installed
  typed-lint backend. An identity check on Windows and in the Ubuntu CI lint
  job proves which executable actually ran; a missing or substituted backend
  fails every run.
- **Compiler on TypeScript 7.1 beta.** The native compiler checks all 16
  product workspaces and, for the first time, the root, script, tooling and
  central-test programs. Classic `typescript@6.0.3` stays for the API, parser
  and editor consumers.
- **BREAKING (workflow): Prettier and the general ESLint rules are retired.**
  Oxfmt formats Core, with Prettier's current style kept. ESLint keeps two
  jobs: the two TanStack Query rules that need type information Oxlint's
  plugin bridge cannot give, and the six shadcn rules with their existing debt
  ledger, which stay on ESLint until that debt is repaired to zero and are then
  moved into Oxlint.
- **Zero debt at completion.** Existing findings are repaired in mechanical
  batches (formatting, then one safe rule at a time, each replayed and proved)
  and in owned slices with tests. No suppression file, ratchet file or UI bridge
  remains at the end.
- **Protections for behavior.** Repairs to money, tenant and auth code are
  checked by an inventory, golden hashes and a library of fault patches that
  must keep failing. Unit tests can no longer reach the network, in the test
  process or in any child process that inherits its environment; integration tests get that authority from
  their CI job, not from their file name.
- **Edit-time feedback for agents.** One hook command works in Claude Code,
  Codex and Cursor on every shell. It formats the edited file, never removes or
  rewrites code, never blocks an edit, and returns the remaining findings to
  the model. The reviewed safe fixes stay behind one explicit command.
- **Records that formatting touches are rebound with proof.** A mechanical
  batch must be reproducible from its base by replaying the transform; every
  hash change needs a proof or a reviewed note. The React Doctor ledger is
  never edited (owner ruling, 2026-11-18).

## Non-goals

- Changing product behavior. A repair that would change what a user sees, such
  as showing a `$0` gift amount, is filed as a follow-up.
- Replacing Vitest or Playwright, or switching test runners to Bun.
- Import sorting, Tailwind class sorting, the optional Landmines preset and the
  `prefer-query-options` rule. Each is deferred with its reason in the design.
- Promoting React Doctor or Shadscan findings into lint rules. Both are
  becoming advisory under their own changes.
- Owning the pre-push profile or the structure of CI jobs, which issues #2710
  and #2711 own (pull request #2726). This change updates the commands those
  gates call and adds its own CI steps on develop's current structure, in
  coordinator commits: the new unit-test steps run once, outside the shard
  matrix, and the lint job is split only if it passes 20 minutes (design
  section 7.2, D13). It takes over the agent edit hook at its own hook task.
- Deciding whether accessibility lint gains an ESLint debt baseline. The
  proposed change `enforce-jsx-a11y-lint` asks for one on the configuration
  this change retires; that is an owner decision, recorded in design D13.

## Authority

The owner's assignment of 2026-11-18 authorizes the research, the plan and the
implementation, including changes to dependencies, compiler pins, version
policies, verifiers, scripts, configurations, tests, CI, engineering guidance
and integrations. It requires that product behavior, tenant isolation,
authorization, financial precision, runtime validation, accessibility and
meaningful regression coverage be preserved, and that protected records,
licensed content and provenance not be rewritten to produce a pass.

The council's ten rounds, their scores and the owner's ratification of plan v10
on 2026-11-19 are in `council-record.md`. No round reached the assignment's
threshold of a 9.2 mean with no hard gate. The owner directed that round 10 be
the last round and that the plan then be ratified, complete. The record states
that plainly, and lists what stands behind plan v10 in place of a passing
score.

Related active changes: `integrate-design-system-lint` (tasks 5.4 to 5.10 are
performed here), `make-react-doctor-advisory`, `make-shadscan-advisory`,
`complete-repository-modernization` and `verify-toolchain-runtime-pins`. Four
more were proposed in open pull requests on 2026-11-19: `speed-up-local-gates`,
`rebalance-ci-test-scope`, `enforce-jsx-a11y-lint` and
`add-api-contract-verification`. Design decision D13 says how this change
follows each of them.

## Capabilities

### New Capabilities

- `code-quality-toolchain`: how Core lints, formats and type-checks its own
  source, how exceptions and fixes are governed, and how unit tests are kept
  off the network.

### Modified Capabilities

None. The requirements of `integrate-design-system-lint` are met through that
change, which this one links and reconciles.

## Impact

- **Dependencies:** adds `ultracite`, `oxlint`, `oxfmt`, `tsrs`,
  `eslint-plugin-playwright`; moves 17 TypeScript pins to 7.1.0-beta; removes
  the direct Prettier dependency, `lint-staged` and every general ESLint plugin and shared config.
- **Root configuration:** `oxlint.config.mts`, a transition entry
  (temporary) and a fix entry, `oxfmt.config.mts`, `turbo.json`, `.prettierignore`,
  root and test `tsconfig` programs.
- **New tooling:** `tooling/quality/**` (runners, registries, rules, the hook)
  and `scripts/quality/**` (inventories and generators).
- **Every workspace:** `lint` and `typecheck` scripts; the four apps gain
  `tsconfig.typecheck.json` and run `next typegen` before compiling.
- **Source and tests:** formatting changes in about 233 files at the cutover;
  one mechanical spacing batch over about 3,150 files; then repairs to about
  57,600 findings in owned slices, with tests.
- **Tests:** a network guard in the unit setup; an integration-tier registry;
  recorder recipes replacing module mocks for Supabase and Stripe; one reviewed
  production change, a guarded test endpoint for the Stripe client.
- **Hooks and CI:** `.husky/pre-commit`, agent hook registrations, the lint,
  typecheck and unit-test jobs in `ci.yml`, the integration-tier job settings, network-test step and file selections in `ci-integration.yml` and, if #2727 has merged, the API-contract workflow.
- **Editors:** new `.vscode/extensions.json` and `.vscode/settings.json`, used
  by VS Code and Cursor. They land with the formatter cutover.
- **Docs and skills:** a new code-quality rulebook; the general, frontend,
  backend, testing and TypeScript rulebooks,
  the TypeScript readiness guide and the shared TypeScript config README,
  the workspace `AGENTS.md` commands, the Vitest and Ultracite skills and their
  mirrors, `README.md` and `CONTRIBUTING.md`.
- **Retired at completion:** `tooling/eslint-config`, the UI suppression
  ledger, `verify:eslint`, the transition entry, the typecheck ratchet.

## Rollback

Each layer rolls back on its own. The typed-lint backend has a rehearsed
replacement transaction. The compiler has a narrow forward-change procedure
that keeps the fixtures and repairs. The formatter cutover can be reverted
only before the spacing batch M1; after M1, problems are fixed forward.
Hooks are removed by deleting their registration; the explicit commands remain
the gate. The design's section 11 gives each procedure.
