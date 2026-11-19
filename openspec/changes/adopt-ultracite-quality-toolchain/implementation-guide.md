# Implementation guide

How to work on this change. `design.md` says what is built and why; `tasks.md` tracks it. If this guide and the design
disagree, the design wins and this guide is corrected in the same commit.

## 1. Who does what

**The coordinator** is the main agent in the thread that owns this change. Only the coordinator edits the lockfile,
manifests, root configs, `turbo.json`, workflows, hooks and `.prettierignore`, makes the mechanical commits,
integrates, and pushes.

**Delegates** work in their own worktrees on disjoint paths. A delegate's brief names: the base commit, the paths it
may write, the design sections to read, the checks it must run, and what to hand back (a patch of named, staged
files and a short report). A delegate never commits to the integration branch, never pushes, and never starts its own
delegates. It reads the sections its brief names, not the whole design.

**Models.** Delegates are a mix of GPT 6.2 Astra at xhigh, Gemini 4 Neon at xhigh through Antigravity, and Claude
Opus 5.5 at xhigh or high. None runs at low effort. A review uses a different model from the work's author. When a
subscription reports a real limit, move the work to another authorized instance with the same brief and record it;
a slow task is not a limit. Keep heavy work off the coordinator's own subscription: a limit there stops everything.
Prefer an instance that supports the same model and effort; otherwise use another authorized Claude Code or Codex
instance and record the change. Select its actual `providerInstanceId` through the supported delegation interface
on a fresh task. Before reassigning work, stop or cancel the superseded task and confirm that it no longer owns
overlapping paths. Keep its partial work, and have the replacement inspect that work before finishing it.

If the coordinator itself is blocked, use only a continuation or switch that T3 actually exposes. If a person must
select the replacement, leave the exact T3 action and a checkpoint that names the next task. Never copy credentials,
log out another session, change global account directories, call private switching APIs or move to paid API billing.

**Verification.** A delegate's report is not verification. The coordinator reruns the task's check on the integrated
tree and records the command, the revision and the result in `tasks.md`.

**Checkpoints.** Before a long run and at each pull request, record the branch and revision, uncommitted changes,
the plan version, each open task with its owner and its completed evidence, unresolved findings, active delegates
and the next step, so another agent can resume.

## 2. Rules for this machine

Each of these has cost a full gate run before.

1. **Windows cannot pass the pre-push gate** (develop has Windows-only unit failures). Edit and run focused checks in
   a Windows worktree; commit and push from a standalone clone in WSL.
2. **One pre-push gate at a time.** Take the shared lock before a push and hold it until the hook ends:
   `exec 9>/tmp/core-prepush-gate.lock; flock -n 9 || exit`. The gate takes 15 to 40 minutes.
3. **Do not run a gate while delegates are testing.** A loaded machine turns the unit stage into timeouts. Export
   `VITEST_MAX_WORKERS=4` for the push.
4. **Never kill by process name in WSL.** Sessions share one distro and user.
5. **Push with** `-c http.version=HTTP/1.1`, `GIT_TERMINAL_PROMPT=0`, and private `TMPDIR`, `TEMP`, `TMP` and
   `BUN_INSTALL_CACHE_DIR`, each exported in its own statement.
6. **Never `git add -A`**, never a bare `git stash`, never `--no-verify`.
7. **A new worktree needs `bun install --frozen-lockfile`** before any check.
8. **Line endings.** Normalize a file written on Windows with `tr -d '\r'` before it goes to the WSL clone. Run
   `skills:sync` on Linux only.
9. **`verify:shadcn-diff` contacts `ui.shadcn.com`**, which rate-limits this machine. Wait and retry later; a skipped
   run is reported as skipped.
10. **Typed lint under parallel agents:** set `CORE_LINT_PARALLEL=1`; at most four typed lints or typechecks at once.
11. **Read a pipeline's log, not its exit code,** when a command's output was piped.

## 3. Every pull request

1. Branch from the pull request below it in the stack, or from develop for the first.
2. Before deleting or renaming a path, script or command, search every tracked file for references to it.
3. Commit in coherent steps. Every commit passes the hooks. A commit that changes a file a live record hashes
   refreshes that hash in the same commit, after re-checking the record's claim (design L12).
4. Before pushing: `bun run lint`, `bun run typecheck`, `bun run format:check`, the tests for what changed, then
   `bun run ci:preflight` in the WSL clone, then the push under the lock.
5. A failing gate is diagnosed first. A failure the change caused is fixed in the change. A failure that also occurs
   on develop at the same base is recorded with its evidence and reported. Never widen an ignore, add a suppression
   or loosen a test to get a pass.

## 4. A repair pull request

1. Remove your entries from `tooling/quality/pending.json` locally and run `bun run lint:fast -- <paths>` (and the
   typed run where your rules are typed) to see the findings.
2. Repair each finding by the rules of design section 4.5. Write the test first where the emitted code changes.
3. Run the suites for what you touched, and the TanStack suites of section 4.4 where they apply.
4. Add one seeded violation per rule you enable to the config smoke test. State in the pull request: the rules and
   scope cleaned, the pending entries deleted, every behavior change with its test, and every disable added with
   its reason.
5. The reviewer, a different model, reads the diff against the forbidden repairs, reads every changed test file and
   every new type guard, helper and `SAFETY:` comment, and compares the test names (and the Playwright list, for
   changed specs) before and after on one platform.

## 4a. A mechanical commit

One writer, a clean tree, one transform, nothing else in the commit, and the exact command in the commit message.
The reviewer checks out the parent, runs that command, and compares the result with the commit: only record files
the message lists may differ. A second pass must change nothing. Then typecheck and tests.

## 5. If something goes wrong

<!-- prettier-ignore -->
| Symptom | Action |
|---|---|
| The launcher exits 2 | A tool failure, not findings: read the message. A plugin crash on valid code is a defect to reproduce and report |
| TSRS will not run, or the proof fails | Stop. Do not fall back silently. The fallback of design L4 is a recorded, reviewed decision |
| A compiler regression blocks a gate after remedies | The rollback of design L8, in one reviewed commit |
| The pre-commit hook rejects a commit as "Stale evidence" | A file the Shadscan ledger cites changed: re-check the entry's claim and refresh its hash in the same commit |
| A pinned acceptance test fails after formatting | Re-check what the pin protects; update the pin with a comment naming this change, keeping the check |
| A hook or workflow file conflicts with the open stack | Resolve to develop's version and re-apply this change's edits |
| A gate dies with SIGTERM in WSL | Another session's kill or load; check before retrying |
| A fact contradicts the design | Record it in `evidence.md`, update the affected decision and task, and get a focused independent review of that change before continuing |
