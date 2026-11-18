# Design

## Context

`.husky/pre-push` runs `scripts/git/pre-push.mjs`. It reads the pushed refs,
applies the production guard (`scripts/git/pre-push-guard.mjs`), clears
repository-local Git variables, and runs `bun run ci:preflight`, adding
`-- --full` when a ref targets `production`. `scripts/verify/ci-preflight.mjs`
runs about twenty stages in series with inherited output and prints
`==> PASS ci:preflight` at the end. The factory's publication
(`scripts/archon-factory/pack/.shared/publication.mjs`) pushes through the
same hook and accepts the push only when the output contains that line.

Required CI runs every preflight stage except `verify:shadcn-config` and
`verify:shadcn-diff`. Lint and typecheck on pull requests use
`turbo --affected` against `origin/develop`. The pre-commit hook runs
`node tooling/eslint-config/lint.mjs --fix` and `prettier --ignore-unknown
--write` on staged files.

The owner's ruling and the factory constraint are in proposal.md.

## Goals / Non-Goals

**Goals:**

- One preflight script with two profiles, chosen by flags, so the stage list
  stays in one tested place.
- The smallest possible factory change: an environment selector on the
  publish step.
- An edit hook whose decisions (payload parsing, path filtering, command
  construction) are pure functions with unit tests.

**Non-Goals:**

- Running only the commits of the push. The fast profile looks at the whole
  branch against `origin/develop`, like CI.
- Checking the pushed commit instead of the working tree. Both profiles, as
  before, check the files on disk.

## Decisions

### Profile selection lives in the hook, stage lists in the preflight

`pre-push.mjs` decides the profile in this order: a ref targeting
`production` → `ci:preflight -- --full`; `ASYM_PRE_PUSH_PROFILE=full` →
`ci:preflight`; unset, empty or `fast` → `ci:preflight -- --fast`; any other
value → block the push with the accepted values. The production guard runs
first, unchanged, so a blocked push still launches nothing.

Alternative considered: a Git config key or a marker file. An environment
variable is what the factory's container runner already passes (`env` on
`runInIssueRepo`), and it cannot be committed by a candidate.

### The factory sets the selector; the pass lines cannot be confused

`publication.mjs` exports `FULL_PREFLIGHT_ENV = { ASYM_PRE_PUSH_PROFILE:
"full" }` and passes it on its hooked push. The qualification script, which
mirrors that push on the VM, passes the same object. The pack cannot import
from `scripts/git` (it is installed on its own), so a unit test checks that
the two modules name the same variable and value.

The full profile ends with exactly `==> PASS ci:preflight`, as today. The fast
profile ends with `==> PASS fast pre-push profile …`, which does not contain
that substring. `hookEvidence` is unchanged; a test feeds it a real fast pass
line and expects a refusal. An older candidate whose hook ignores the
selector runs the full preflight anyway, so the factory is safe across the
transition.

### Fast profile content and scoping

Order follows the full profile so the two stay comparable:

| Stage                                                                         | Command                                                                             | Scope                                                                                 |
| ----------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| runtime                                                                       | `verify:node-version`                                                               | always                                                                                |
| format                                                                        | Prettier `--check --ignore-unknown` on changed files                                | changed files that still exist, in batches; whole repository when the diff is unknown |
| verify-phase25/27/28-spec                                                     | the scripts                                                                         | when the push changes their inputs                                                    |
| openspec-validate, verify-openspec-deltas                                     | the scripts                                                                         | when the push changes their inputs                                                    |
| lint                                                                          | `turbo run lint --affected` with the CI filters and `TURBO_SCM_BASE=origin/develop` | affected workspaces                                                                   |
| verify-data-boundary, verify-cms-public-sole-entry, verify-workspace-contract | the scripts                                                                         | when the push changes their inputs                                                    |
| verify-bun-lock-drift, verify-shadcn-config                                   | the scripts                                                                         | always (under a second each)                                                          |
| verify-shadcn-diff                                                            | the script (calls the public shadcn registry)                                       | when the push changes its inputs                                                      |
| typecheck                                                                     | `turbo run typecheck --affected` with the same filters                              | affected workspaces                                                                   |

Each candidate stage was timed alone on the Windows host while it ran at
100% CPU with other sessions' suites. Two that were expected to be cheap were
not: `skills:verify` took 183 s (it copies every skill tree to a temporary
directory and re-renders the mirrors) and `verify:eslint` took 54 s (it reads
every source file and probes six workspace configurations). Both stay in the
full profile only; the required CI `integrity` and `lint` jobs run them on
every pull request. A path filter for `skills:verify` was considered and left
out: it would add an input list that must track the sync scripts.

Changed files come from the existing `readCompilationChanges({
includeWorkingTree: true })` (branch diff against `origin/develop`, working
tree changes, untracked files), so the profile and the compilation policy use
one definition. It reads git's lists NUL-separated (`-z`): plain
`--name-only` output quotes a path with non-ASCII bytes, quotes, backslashes
or tabs, and the format stage would have dropped such a file as deleted. The
format stage passes only files it has checked exist, so it no longer needs
Prettier's `--no-error-on-unmatched-pattern`. When the reader returns `null`,
every stage runs: the format stage checks the whole repository and lint and
typecheck run for every workspace.

Not in the fast profile: `skills:verify`, `verify:eslint`, `test:unit`,
`test:acceptance`, and compilation. The full profile keeps all of them and
adds `test:acceptance` as its own stage after `test:unit`.

### Verifiers run only for changes to their inputs

The first cut ran every kept verifier on every push, about 50-60 s on the
loaded host whatever changed, and left `verify:shadcn-diff` with no routine
check (no CI job runs it). Each of these stages now runs in the fast profile
only when the push changes one of its inputs, and otherwise prints
`==> SKIP <id> (no change to its inputs; …)`. An unknown change set runs them
all.

- **Traced verifiers.** The inputs of the Phase 25, 27 and 28 projections,
  `openspec:validate`, `verify:openspec-deltas`, `verify:data-boundary`,
  `verify:cms-public-sole-entry` and `verify:workspace-contract` come from a
  trace of every path each one opened on 2026-11-18 (a Node preload that
  logged each `fs` call and child process), collapsed to the directories they
  read or list, plus their own scripts. For example, `phase24-authority`
  compares the listings of `docs/adr` and the sitestacker-parity folder, so
  both folders are inputs; `verify:data-boundary` walks `apps`, `packages`
  and `scripts` and reads `.env.example`. The lists live in `STAGE_INPUTS` in
  `ci-preflight.mjs`. Every one of these stages also runs in the required
  `integrity` or `lint` job, and a test checks that, so an input the list
  misses is still caught before merge.
- **Shared inputs** run every traced verifier: `bun.lock`, `bunfig.toml`,
  `.npmrc`, `.node-version`, any `package.json` or `package.yaml` (workspace
  manifests, script definitions and Prettier's option lookup), any Prettier
  or EditorConfig file, and the selection code itself.
- **`verify:shadcn-diff`** takes exactly what `shadcnDiffInputs(baseline)` in
  `scripts/verify/shadcn-diff.mjs` derives from the verifier and its review
  baseline: the script, `tooling/shadcn/upstream-review-baseline.json`, every
  proof, protected and reviewed component source it hashes, and what the
  upstream CLI reads through `createUpstreamSourceView` (the root manifest,
  lock and tsconfig files, and the UI package's manifest, `components.json`,
  tsconfig, `components`, `lib`, `hooks` and `styles`), which now uses the
  same exported lists. An unreadable baseline runs it. It calls the public
  registry for every component and took 889 s on the loaded host (it passed),
  so it does not take the shared inputs; it runs whenever `bun.lock` or the
  root manifest changes because the CLI reads both.
- `verify:bun-lock-drift` and `verify:shadcn-config` stay unscoped: each took
  under a second.

Timed alone under the tracer on the loaded host (100% CPU), the scoped
verifiers took: phase 25 0.2 s, phase 28 11.1 s, `openspec:validate` 7.7 s,
`verify:openspec-deltas` 20.2 s, data-boundary 12.7 s, cms-public-sole-entry
6.6 s, workspace-contract 4.2 s. The Phase 27 renderer runs under Bun and
could not be traced with the Node preload; its inputs come from reading
`render-spec.mjs` (its packet, PRD, OpenSpec projection and
`scripts/lib/openspec-contracts.mjs`, with the contract files that module
reads, as the traced Phase 28 renderer shows) and from tracing its evidence
check.

### Stage runner output

Each stage streams its output while keeping the last 40 lines. On failure the
runner prints `==> FAIL <id> (exit N)`, `Re-run this stage alone: <command>`
and the kept lines, then stops. Script stages re-run with `bun run <script>`;
stages whose commands the profile builds (format, lint, typecheck) re-run
with `bun run ci:preflight -- --fast --only <id>`, which repeats the same
scope on any shell. The existing `==> CI preflight: <id>`
stage headers stay, because the factory reads them to name a failed stage.

### One shared edit hook, three thin configurations

`scripts/agent-hooks/after-edit.mjs <harness>` reads the payload from stdin:

- Claude Code `PostToolUse` (`Edit|Write`): `tool_input.file_path`.
- Codex `PostToolUse` (`apply_patch`, also matched by `Edit|Write`): the
  patch text in `tool_input.command`; paths come from its `*** Add File:`,
  `*** Update File:` and `*** Move to:` lines, relative to `cwd`. Headers
  match only at the start of a line: a content or context line carries a
  `+`, `-` or space prefix, so one that only reads like a header is not
  taken as an edited file.
- Cursor `afterFileEdit`: `file_path`.

It acts only on files inside the checkout that holds the script itself
(`HOOK_ROOT`). Each harness starts the checkout's own copy (Claude Code's
project directory, the Codex repository top level, Cursor's project root), so
a session in a worktree runs that worktree's hook and tools; a file in any
other tree is skipped, even one that holds `tooling/eslint-config/lint.mjs`,
so the hook never executes another tree's ESLint, Prettier or configuration.
It also skips deleted files, generated, mirrored and vendored trees from
`docs/ai/protected-paths.md`, `.next`, `.next-docs` and `.agents`, and files
Prettier ignores.

For one edit it starts at most two processes, from the checkout root, with
Node directly (never a `.cmd` shim, so it works on Windows):

1. `node node_modules/prettier/bin/prettier.cjs --ignore-unknown --write`
   over every handled file;
2. then ESLint `--format json` over the source files among them (under
   `apps/`, `packages/` or `tooling/`, the lint-staged glob), with exactly the
   arguments `tooling/eslint-config/lint.mjs` builds from the repository root
   (root `eslint.config.mjs`, the shared suppressions file) except `--fix`.
   A unit test compares the arguments with `lintInvocation`, so they cannot
   drift. It skips `lint.mjs`'s design-system health probe, which pre-commit
   and CI still run: on the loaded Windows host the probe added about 6 s to
   one file.

Formatting first means the line numbers ESLint reports match the file the
agent sees next.

#### No ESLint autofix at edit time

`eslint --fix` on each edit deleted an import the agent had added one edit
before using it, and reordered or rewrote imports, so the agent's next edit
could fail to match or silently lose code (review d2.2). These are the
autofixable rules the root configuration enables, read from the resolved
configuration with ESLint's `calculateConfigForFile` for `.ts`, `.tsx` and
`.mjs` files under `apps/`, `packages/` and `tooling/`:

| Rule                                             | What the fix does                             | Kind           |
| ------------------------------------------------ | --------------------------------------------- | -------------- |
| `unused-imports/no-unused-imports`               | removes an unused import                      | removes code   |
| `@typescript-eslint/no-unused-vars`              | removes an unused import                      | removes code   |
| `unused-imports/no-unused-vars`                  | marked fixable; would remove code             | removes code   |
| `import-x/order`                                 | reorders imports, adds or removes blank lines | moves code     |
| `import-x/no-duplicates`                         | merges duplicate imports                      | moves, removes |
| `@typescript-eslint/consistent-type-imports`     | rewrites imports to inline `type` imports     | rewrites code  |
| `prefer-const`                                   | `let` to `const`                              | rewrites code  |
| `no-var`                                         | `var` to `let`/`const`                        | rewrites code  |
| `@typescript-eslint/no-array-constructor`        | `new Array(a, b)` to `[a, b]`                 | rewrites code  |
| `@typescript-eslint/no-wrapper-object-types`     | `String` to `string` and similar              | rewrites code  |
| `@typescript-eslint/prefer-as-const`             | `"a" as "a"` to `"a" as const`                | rewrites code  |
| `@typescript-eslint/prefer-namespace-keyword`    | `module X {}` to `namespace X {}`             | rewrites code  |
| `@typescript-eslint/no-extra-non-null-assertion` | `a!!` to `a!`                                 | rewrites code  |
| `@typescript-eslint/no-explicit-any`             | `any` to `unknown` only with `fixToUnknown`   | rewrites code  |
| `react-hooks/exhaustive-deps`                    | edits a dependency array                      | rewrites code  |

None changes only layout, which Prettier already owns. Several rewrites are
harmless in finished code, but mid-task each one can break the next edit:
`prefer-const` turns `let x` into `const x` before the edit that reassigns
it. So the hook applies no ESLint fix. It reports errors and every fixable
problem it left in place, warnings included (`[fixable, not fixed]`), and
pre-commit's `eslint --fix` applies those fixes once the code is complete. A
test runs the hook in a scratch checkout on a file whose new import is not
used yet and on one with misordered imports, and checks both files are
unchanged and both problems are reported.

#### Time budget

Every harness kills the hook at 120 s. The hook stops at 100 s
(`HOOK_BUDGET_MS`): each tool gets only the time left, a tool is not started
with less than 5 s left, and a tool that runs out is killed. The hook then
names the files it did not format or lint, says pre-commit and CI still
check them, and exits 0. An ESLint exit 2 (a configuration or internal
failure) is reported the same way rather than passing as a clean file.
Measured on the loaded Windows host (100% CPU, about 110 node and bun
processes), lint on: one file 10.8-12.3 s, a five-file Codex patch
10.9-15.1 s; format only: about 1 s either way. The first version, one
ESLint and one Prettier process per file, took 16.9 s and 52.5 s for the same
edits.

#### Root configuration, not each workspace's

ESLint 10 can resolve each file's own `eslint.config.mjs` (it looks the
configuration up from the file's directory when no `--config` is given). The
workspace configurations add typed rules (`projectService`) and cost far
more: two files, one in `apps/admin` and one in `packages/api`, took 219 s
that way against 58 s with the root configuration on the same loaded host,
with no finding either way. The hook keeps the root configuration that
pre-commit uses. A clean edit hook therefore does not mean `turbo run lint`
is clean: workspace-only rules are first checked by the fast profile's lint
stage and CI.

Lint stays on by default because the owner's ruling asks for format and lint
on edit; `ASYM_EDIT_HOOK=format` skips the lint step and `ASYM_EDIT_HOOK=off`
skips the hook, for slow machines.

#### What each harness shows the agent

Claude Code and Codex receive the report as `PostToolUse`
`hookSpecificOutput.additionalContext` with exit 0, which both add next to the
tool result without replacing it (Codex replaces the tool result on exit 2 or
`decision: "block"`, which would hide the patch result). Cursor's
`afterFileEdit` documents no output, so there the hook formats the file and
writes its lint report to stderr, which Cursor does not pass to the agent:
the Cursor agent meets lint problems at commit. A missing tool or an
unexpected error exits 0 quietly.

Configurations (one hook each, as documented on 2026-11-18):

- Claude Code (<https://code.claude.com/docs/en/hooks>): exec form
  `"command": "node", "args": ["${CLAUDE_PROJECT_DIR}/scripts/agent-hooks/after-edit.mjs", "claude"]`,
  matcher `Edit|Write`, timeout 120.
- Codex (<https://learn.chatgpt.com/docs/hooks>): `.codex/hooks.json`,
  `PostToolUse`, matcher `^apply_patch$`, timeout 120, command
  `node "$(git rev-parse --show-toplevel)/scripts/agent-hooks/after-edit.mjs" codex`
  as the page recommends for repository hooks. Codex runs a project hook only
  after the user trusts it with `/hooks`.
- Cursor (<https://cursor.com/docs/agent/hooks>): `.cursor/hooks.json`,
  `version: 1`, `afterFileEdit`, command
  `node scripts/agent-hooks/after-edit.mjs cursor` (project hooks run from the
  project root; the workspace must be trusted).

Alternative considered: `PostToolUse` in Cursor, which can return
`additional_context`. Re-read on 2026-11-18: the page lists `Write` among its
matcher values but does not say that agent file edits fire it or what
`tool_input` holds for them, and `afterFileEdit` is the event it names for
formatters.

### Factory candidates

The factory's role sessions load settings only from its trusted control
folder (`settingSources: ["project"]` in the installed `.archon/config.yaml`),
and Bash is denied there, so the repository's `.claude/settings.json` hook
does not run in candidate work. If a harness ever does run it in a candidate
worktree without `node_modules` or network, the hook finds no tools and exits 0.

## Risks / Trade-offs

- [The fast profile no longer runs unit, acceptance or build before a push]
  → Required CI runs them on every pull request.
- [`verify:shadcn-diff` has no CI job] → The fast profile runs it whenever a
  push changes one of its derived inputs, and the full profile and the
  production release always run it. It needs the network and took 889 s on
  the loaded host, and every `bun.lock` change selects it, so such a push is
  slow and fails offline.
- [A traced verifier reads a path its input list misses] → The fast profile
  then skips a check it should have run; the required `integrity` or `lint`
  job still runs it on the pull request. A change to a verifier's own script
  selects it.
- [Skill mirror drift and malformed `eslint-disable` comments are no longer
  caught before a push] → Pre-commit and the edit hook do not catch them
  either; the required `integrity` and `lint` jobs do, and
  `bun run ci:preflight` runs both.
- [`turbo --affected` without a local `origin/develop`] → Turbo then treats
  every workspace as affected, which is slower but not weaker.
- [Until workstream C removes `tests/unit/acceptance` from `test:unit`, the
  full profile runs the acceptance tests twice] → Accepted: the full profile
  is explicit, and C is scheduled next.
- [Codex on Windows: the shell that runs hook commands is not documented] →
  The command uses only `$(…)` inside double quotes, which POSIX shells and
  PowerShell both expand. Recorded as unverified.
- [A changed hook file in a pull request runs on the next agent edit] →
  Claude Code and Cursor run project hooks only in trusted workspaces. Codex
  records trust against the hook definition; its documentation promises a
  new review after a script change only for plugin-bundled hooks, so a
  changed `after-edit.mjs` runs without one once the definition is trusted.
  Pull-request review covers it, and the factory's scope validator protects
  `scripts/agent-hooks/**`, `.codex/hooks.json` and `.cursor/hooks.json`
  beside `.claude/**`; the factory does not load repository settings.
- [The Next.js managed-block test requires
  `next/dist/server/lib/generate-agent-files.js`, an internal module semver
  does not cover] → Intended, so a Next.js upgrade updates the five blocks; a
  release that moves or renames the module fails that docs test with a
  `TypeError` instead of a block mismatch, and the upgrade then updates the
  test.

## Migration Plan

Merge normally. Developers get the fast profile on their next push; Codex
users trust the new hook once with `/hooks`. The factory's pack carries the
selector to the VM with its next installation (`installation/install.mjs`).
Until then, a candidate based on this change, pushed by the old pack, runs
the fast profile, prints no `==> PASS ci:preflight`, and the old
`hookEvidence` refuses it as `hooks-unverified`: it fails closed, never
accepted on a fast pass. Install the updated pack before the factory
publishes such a candidate. Candidates based on older commits ignore the
selector and run the full preflight as before. Rollback: revert the
commits.
