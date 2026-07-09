# Issue tracker: GitHub

Issues and PRDs for this repo live as GitHub issues on `Asymmetric-al/core`. Use the `gh` CLI for all operations.

## Conventions

- **Issue keys**: Prefer `AL-###` in titles and branch names when following `docs/ai/rules/general.md`.
- **Create an issue**: `gh issue create --title "..." --body "..."`. Use a heredoc for multi-line bodies.
- **Read an issue**: `gh issue view <number> --comments`, filtering comments by `jq` and also fetching labels.
- **List issues**: `gh issue list --state open --json number,title,body,labels,comments --jq '[.[] | {number, title, body, labels: [.labels[].name], comments: [.comments[].body]}]'` with appropriate `--label` and `--state` filters.
- **Comment on an issue**: `gh issue comment <number> --body "..."`
- **Apply / remove labels**: `gh issue edit <number> --add-label "..."` / `--remove-label "..."`
- **Close**: `gh issue close <number> --comment "..."`

Infer the repo from `git remote -v` — `gh` does this automatically when run inside a clone.

## Pull Requests As A Triage Surface

**PRs as a request surface: no.** Set this to `yes` only if this repo starts
treating external PRs as feature requests; `/triage` reads this flag.

When set to `yes`, PRs run through the same labels and states as issues, using
the `gh pr` equivalents:

- **Read a PR**: `gh pr view <number> --comments` and `gh pr diff <number>` for
  the diff.
- **List external PRs for triage**:
  `gh pr list --state open --json number,title,body,labels,author,authorAssociation,comments`,
  then keep only `authorAssociation` of `CONTRIBUTOR`,
  `FIRST_TIME_CONTRIBUTOR`, `FIRST_TIMER`, or `NONE`.
- **Comment / label / close**: `gh pr comment`,
  `gh pr edit --add-label` / `--remove-label`, `gh pr close`.

GitHub shares one number space across issues and PRs, so a bare `#42` may be
either. Resolve with `gh pr view 42` and fall back to `gh issue view 42`.

## When a skill says "publish to the issue tracker"

Create a GitHub issue.

## When a skill says "fetch the relevant ticket"

Run `gh issue view <number> --comments`.

## Wayfinding Operations

Used by `/wayfinder`. The **map** is a single issue with **child** issues as
tickets.

- **Map**: a single issue labelled `wayfinder:map`, holding the
  Notes / Decisions-so-far / Fog body. Create it with
  `gh issue create --label wayfinder:map`.
- **Child ticket**: an issue linked to the map as a GitHub sub-issue. Where
  sub-issues are not enabled, add the child to a task list in the map body and
  put `Part of #<map>` at the top of the child body. Labels:
  `wayfinder:<type>` (`research`, `prototype`, `grilling`, or `task`). Once
  claimed, the ticket is assigned to the driving dev.
- **Blocking**: use GitHub's native issue dependencies where available. Where
  dependencies are unavailable, fall back to a `Blocked by: #<n>, #<n>` line at
  the top of the child body. A ticket is unblocked when every blocker is closed.
- **Frontier query**: list the map's open children, drop any with an open
  blocker or assignee, and take the first remaining child in map order.
- **Claim**: `gh issue edit <n> --add-assignee @me`; this is the session's first
  write.
- **Resolve**: `gh issue comment <n> --body "<answer>"`, then
  `gh issue close <n>`, then append a context pointer to the map's
  Decisions-so-far.
