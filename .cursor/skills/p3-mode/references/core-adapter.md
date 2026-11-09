# p3-stack Core adapter

p3-stack was written for T3 Code. This file maps its T3 Code tools to the
other clients that read this repository's skills, and it lists the Core rules
that apply to every p3-stack skill. It is Core-authored. It is not part of the
upstream pack.

On conflict, the current user request, root `AGENTS.md`, the nearest nested
`AGENTS.md`, and the matching `docs/ai/rules/*` rulebook win over p3-stack.

## Tool map

In T3 Code, use the tools as the skills name them. In the other clients, use
the equivalent below. When a client has no equivalent, skip the step and say
so in the reply. Do not simulate a tool you do not have.

| p3-stack (T3 Code)                                                            | Claude Code                                                                                                                                                                                                                                                                                                                          | Codex                                                                                                                                | Cursor                                                                                  |
| ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------- |
| `delegate_task`, `mode: "async"`, `task_status`, `task_cancel`                | The Agent tool with a self-contained `prompt`. Use `run_in_background: true` for async work and wait for its completion notice. Stop it with the task-stop tool.                                                                                                                                                                     | Codex's subagent tools, when the session has them, with the brief as the task. Without them, run each brief yourself, one at a time. | The Task tool with `subagent_type`. Use `run_in_background` for async work.             |
| `orchestrator_capabilities`, role lines in `p3-models.md`                     | No catalog. Every role runs `inherit-parent` unless the user names a model the Agent tool accepts.                                                                                                                                                                                                                                   | No catalog. Every role runs `inherit-parent`.                                                                                        | No catalog. Every role runs `inherit-parent`.                                           |
| `t3_thread_launch` with a worktree `workspaceStrategy`                        | `git worktree add <path> <ref>`, where `<ref>` is the step's `baseRef`, branch, or PR head SHA, so the worker sees the task's commits. Use `develop` only for new work. An `existing_worktree` strategy reuses that path. The Agent tool's worktree isolation fits new work from the current branch.                                 | Same `git worktree add`, then a separate session in that worktree.                                                                   | Same `git worktree add`, then a separate agent in that worktree.                        |
| `t3_worktree_list`, `t3_worktree_status`                                      | `git worktree list --porcelain`, then for each path `git -C <path> status --porcelain` and `git -C <path> log --oneline @{upstream}..HEAD` (no upstream means unpushed work).                                                                                                                                                        | Same as Claude Code.                                                                                                                 | Same as Claude Code.                                                                    |
| `watch_pull_request`, `unwatch_pull_request`                                  | No event wake-up. `gh pr checks <number> --watch` ends when checks finish, so it covers CI only. Before each later decision, re-read state with `gh pr view <number> --json reviewDecision,mergeStateStatus,reviews,comments`, and tell the user that continuous watching is unavailable. The `loop-on-ci` skill drives CI to green. | Same as Claude Code.                                                                                                                 | Same as Claude Code. The `ci-watcher` agent covers CI only.                             |
| `link_pull_request`, `list_thread_pull_requests`                              | Record each PR URL in the run's notes. `gh pr list --head <branch>` finds them again.                                                                                                                                                                                                                                                | Same as Claude Code.                                                                                                                 | Same as Claude Code.                                                                    |
| `schedule_task`, `run_scheduled_task_now`, `delete_scheduled_task`            | `/loop` or `/schedule`, only when the user asked for a recurring run.                                                                                                                                                                                                                                                                | No scheduler. Ask the user to rerun the step.                                                                                        | `/loop`, only when the user asked for a recurring run.                                  |
| `t3_thread_read`, `t3_thread_search`                                          | The current conversation, git history, PR threads, and the issue tracker. The user's own past sessions only when the client exposes them.                                                                                                                                                                                            | Same as Claude Code.                                                                                                                 | The current conversation and Cursor agent transcripts, plus git history and PR threads. |
| `preview_*` (browser), `browser.preview`                                      | A configured browser or Playwright tool, or the `playwright-cli` skill. Give the file path instead of a preview.                                                                                                                                                                                                                     | The `playwright-cli` skill.                                                                                                          | The `control-ui` skill or Cursor's browser tools.                                       |
| `device_*` (iOS and Android simulators)                                       | Not applicable. Core has no native mobile app.                                                                                                                                                                                                                                                                                       | Not applicable.                                                                                                                      | Not applicable.                                                                         |
| `request_secret`                                                              | Ask the user to set the secret in their own environment. Never ask them to paste it into chat.                                                                                                                                                                                                                                       | Same as Claude Code.                                                                                                                 | Same as Claude Code.                                                                    |
| `t3_queue_*`, `t3_pending_request_*`, `t3_thread_wait`, `t3_thread_interrupt` | No equivalent. Skip the step.                                                                                                                                                                                                                                                                                                        | No equivalent. Skip the step.                                                                                                        | No equivalent. Skip the step.                                                           |

Every delegated brief stands alone in every client. Give it the goal, file
pointers, constraints, and the report format. Code-writing delegates open their
brief with `docs/ai/skills/p3-mode/references/agents/p3-agent.md`. Never put
secrets, `.env` values, or tokens in a brief.

Pass skill files to a delegate by repository path, such as
`docs/ai/skills/<skill>/references/<file>`, or inline their text. A delegate
resolves a bare `references/...` path from the repository root, where it does
not exist.

## Model roles

Every p3-stack skill reads role lines from the repository-root `p3-models.md`
first and falls back to `~/.agents/p3-models.md`. A project file wins over the
global one. Without either file, a role uses its skill default, and outside
T3 Code that default is the parent model. The values `inherit-parent`,
`inherit`, and `auto` all mean the parent model: omit the model when you
delegate.

Use the operating system's temporary directory where a skill names `/tmp`.

## Core rules for every p3-stack skill

- **Authorization.** p3-stack's Autonomy section, its "full-autonomy grant"
  wording, and `principle-never-block-on-the-human` do not grant standing
  permission here. Local, reversible work proceeds. Opening, pushing, or
  merging a pull request; posting PR, issue, or chat messages; resolving review
  threads; filing tickets; scheduling recurring jobs; and starting paid or
  external runs proceed only when the user authorized that action for this
  task. A playbook step is not that authorization.
- **Branches.** Core's base branch is `develop`. It has no `main` branch.
  Read any remaining `main` or trunk wording as `develop`. Land work only
  through a pull request into `develop`. Never push to `develop` or
  `production` directly, so the Orchestrate playbook's direct landing push does
  not apply. Merge, enable auto-merge, or run `gh pr merge` only when the user
  asked to merge, land, or ship.
- **Hooks and gates.** Never skip hooks. `bun run ci:preflight` is the push
  gate. Follow `docs/ai/rules/general.md` for branches and PRs, and
  `docs/ai/rules/review-bots.md` for review-bot triage.
- **Destructive commands.** Never run `git reset --hard`, `git clean`,
  `git worktree remove --force`, `rm -rf`, or simulator and cache deletion
  against a checkout or worktree you did not create in this task, or one with
  uncommitted or unpushed work. Other agents and people may have live work in other
  worktrees and checkouts. The one exception is the Worktree and simulator
  cleanup playbook. After its audit shows a worktree clean, pushed, and not in
  use, remove it with plain `git worktree remove <path>`, without `--force`, once
  the user approves that path. Anything that needs `--force`, `rm -rf`, or cache
  or simulator deletion needs the user's yes for that exact command.
- **One writer per branch.** Before a fresh delegate writes to a branch, stop
  the previous writer or confirm that it finished. Never let two agents push the
  same branch.
- **TDD.** Core's TDD rule in root `AGENTS.md` and
  `docs/ai/skills/tdd/SKILL.md` wins over any p3-stack step that skips a test.
- **Skills.** Canonical skills live in `docs/ai/skills/<name>/`. A new or edited
  skill goes there, followed by `bun run skills:sync` and
  `bun run skills:verify`. Never hand-edit `.agents/skills/`,
  `.claude/skills/`, or `.cursor/skills/`. Do not edit a vendored skill as a
  side effect of other work.
- **Run state.** `p3-models.md` at the repository root and the Orchestrate
  playbook's `orchestrate/` store are gitignored. Decision logs and other run
  state stay out of commits unless the user asks for them.
- **Secrets and exposure.** Follow root `AGENTS.md` on secrets. Never expose
  Core apps, admin surfaces, or environment data on a network, and never
  install system software without the user's explicit yes.

## Renamed skills

| Upstream name | Core name  | Reason                                                  |
| ------------- | ---------- | ------------------------------------------------------- |
| `tdd`         | `p3-tdd`   | Core's `tdd` is the authoritative TDD skill.            |
| `teach`       | `p3-teach` | Core's `teach` is a different learning-workspace skill. |

The upstream `agents/p3-agent.md` and `agents/comment-sicko.md` prompt briefs
live in `docs/ai/skills/p3-mode/references/agents/`. They are briefs for
delegated workers, not harness agent definitions.
