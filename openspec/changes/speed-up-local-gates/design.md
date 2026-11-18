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

| Stage                                                                                                                      | Command                                                                             | Scope                                                                                 |
| -------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| runtime                                                                                                                    | `verify:node-version`                                                               | always                                                                                |
| format                                                                                                                     | Prettier `--check --ignore-unknown` on changed files                                | changed files that still exist, in batches; whole repository when the diff is unknown |
| verify-phase25/27/28-spec                                                                                                  | the scripts                                                                         | always                                                                                |
| openspec-validate, verify-openspec-deltas                                                                                  | the scripts                                                                         | always                                                                                |
| lint                                                                                                                       | `turbo run lint --affected` with the CI filters and `TURBO_SCM_BASE=origin/develop` | affected workspaces                                                                   |
| verify-data-boundary, verify-cms-public-sole-entry, verify-workspace-contract, verify-bun-lock-drift, verify-shadcn-config | the scripts                                                                         | always                                                                                |
| typecheck                                                                                                                  | `turbo run typecheck --affected` with the same filters                              | affected workspaces                                                                   |

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
one definition. When it returns `null`, the format stage checks the whole
repository and lint and typecheck run for every workspace.

Not in the fast profile: `skills:verify`, `verify:eslint`,
`verify:shadcn-diff` (network), `test:unit`, `test:acceptance`, and
compilation. The full profile keeps all of them and adds `test:acceptance` as
its own stage after `test:unit`.

### Stage runner output

Each stage streams its output while keeping the last 40 lines. On failure the
runner prints `==> FAIL <id> (exit N)`, `Re-run this stage alone: <command>`
and the kept lines, then stops. Script stages re-run with `bun run <script>`;
scoped stages re-run with `bun run ci:preflight -- --fast --only <id>`, which
repeats the same scope on any shell. The existing `==> CI preflight: <id>`
stage headers stay, because the factory reads them to name a failed stage.

### One shared edit hook, three thin configurations

`scripts/agent-hooks/after-edit.mjs <harness>` reads the payload from stdin:

- Claude Code `PostToolUse` (`Edit|Write`): `tool_input.file_path`.
- Codex `PostToolUse` (`apply_patch`, also matched by `Edit|Write`): the
  patch text in `tool_input.command`; paths come from its `*** Add File:`,
  `*** Update File:` and `*** Move to:` lines, relative to `cwd`.
- Cursor `afterFileEdit`: `file_path`.

For each file it finds the Core checkout that contains it (the nearest
ancestor with `tooling/eslint-config/lint.mjs`), so a hook started from the
main checkout still uses a worktree's own tools. It skips paths outside a
checkout, deleted files, generated, mirrored and vendored trees from
`docs/ai/protected-paths.md`, `.next`, `.next-docs` and `.agents`, and files
Prettier ignores. For source files under `apps/`, `packages/` or `tooling/`
(the lint-staged glob) it runs ESLint `--fix --format json` with exactly the
arguments `tooling/eslint-config/lint.mjs` builds from the repository root
(root `eslint.config.mjs`, the shared suppressions file), then for every
handled file `node node_modules/prettier/bin/prettier.cjs --ignore-unknown
--write <file>`, both from the checkout root. A unit test compares the ESLint
arguments with `lintInvocation`, so the two cannot drift. It skips
`lint.mjs`'s design-system health probe, which pre-commit and CI still run:
on the loaded Windows host the probe added about 6 s to one file (18 s
through `lint.mjs`, 12 s direct). It invokes Node directly, never a `.cmd`
shim, so it works on Windows.

ESLint is the slow part. Loading the root configuration alone took about 8 s
on the loaded host, and one file took 12 to 28 s, against under a second for
Prettier. Lint stays on by default because the owner's ruling asks for format
and lint on edit; `ASYM_EDIT_HOOK=format` skips the lint step and
`ASYM_EDIT_HOOK=off` skips the hook, for slow machines.

When the lint fix leaves errors, the hook reports up to ten lines per file.
Claude Code and Codex receive them as `PostToolUse`
`hookSpecificOutput.additionalContext` with exit 0, which both add next to the
tool result without replacing it (Codex replaces the tool result on exit 2 or
`decision: "block"`, which would hide the patch result). Cursor's
`afterFileEdit` has no documented channel back to the agent, so its errors go
to the hook log and the hook exits 0; the agent meets them at commit. A
missing tool, a timeout or an unexpected error exits 0 quietly.

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
`additional_context`. Its `tool_input` for writes is not documented, and
`afterFileEdit` is the event the page names for formatters.

### Factory candidates

The factory's role sessions load settings only from its trusted control
folder (`settingSources: ["project"]` in the installed `.archon/config.yaml`),
and Bash is denied there, so the repository's `.claude/settings.json` hook
does not run in candidate work. If a harness ever does run it in a candidate
worktree without `node_modules` or network, the hook finds no tools and exits 0.

## Risks / Trade-offs

- [The fast profile no longer runs unit, acceptance, build or the shadcn
  diff before a push] → Required CI runs unit, acceptance and build on every
  pull request; `verify:shadcn-diff` runs only in the full profile (no CI
  job runs it today), so the documents tell contributors to run
  `bun run ci:preflight` before a pull request is ready.
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
  Claude Code and Cursor run project hooks only in trusted workspaces, and
  Codex asks for review of every new or changed hook; the factory does not
  load repository settings.

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
