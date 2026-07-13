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
- **List external PRs for triage**: use GitHub GraphQL because
  `gh pr list --json` does not expose `authorAssociation`.

  ```bash
  gh api graphql \
    -f owner=Asymmetric-al \
    -f name=core \
    -f query='
      query($owner: String!, $name: String!) {
        repository(owner: $owner, name: $name) {
          pullRequests(first: 100, states: OPEN, orderBy: { field: UPDATED_AT, direction: DESC }) {
            nodes {
              number
              title
              body
              author { login }
              authorAssociation
              labels(first: 25) { nodes { name } }
              comments(first: 25) { nodes { body } }
            }
          }
        }
      }
    ' \
    --jq '.data.repository.pullRequests.nodes
      | map(select(
          .authorAssociation == "CONTRIBUTOR"
          or .authorAssociation == "FIRST_TIME_CONTRIBUTOR"
          or .authorAssociation == "FIRST_TIMER"
          or .authorAssociation == "NONE"
        ))'
  ```

- **Comment / label / close**: `gh pr comment`,
  `gh pr edit --add-label` / `--remove-label`, `gh pr close`.

GitHub shares one number space across issues and PRs, so a bare `#42` may be
either. Resolve with `gh pr view 42` and fall back to `gh issue view 42`.

## When a skill says "publish to the issue tracker"

Create a GitHub issue.

Every open GitHub issue created by a skill must include exactly one `type:*`,
one `status:*`, and one `complexity:*` label. When a skill says to apply
`ready-for-agent`, use `status:ready` plus:

- `type:feature` for feature/spec/product work, `type:bug` for defects,
  `type:docs` for documentation-only work, `type:refactor` for behavior-neutral
  code restructuring, otherwise `type:chore`.
- The smallest defensible `complexity:*` from the approved scope. Use
  `complexity:medium` only when the current context does not contain enough
  evidence; call that default out in the issue body or publishing note.

For `/to-spec`, default to `type:feature` and `complexity:hard` for broad specs,
unless the synthesized scope clearly supports a narrower type or lower
complexity. For `/to-tickets`, label each generated ticket from its own slice,
not from the parent spec as a whole.

## When a skill says "fetch the relevant ticket"

Run `gh issue view <number> --comments`.

## Wayfinding Operations

Used by `/wayfinder`. The **map** is a single issue with **child** issues as
tickets.

- **Map**: a single issue labelled `wayfinder:map`, holding the
  Notes / Decisions-so-far / Fog body. Create it with
  `gh issue create --label wayfinder:map --label type:chore --label status:todo --label complexity:hard`.
- **Child ticket**: an issue linked to the map as a GitHub sub-issue. Where
  sub-issues are not enabled, add the child to a task list in the map body and
  put `Part of #<map>` at the top of the child body. Labels:
  `wayfinder:<type>` (`research`, `prototype`, `grilling`, or `task`) plus
  exactly one repo `type:*`, `status:*`, and `complexity:*` label. Use
  `status:todo` when creating a child. For `research`, `prototype`, and
  `grilling` children, use `type:chore` unless the child clearly documents a
  user-facing doc change (`type:docs`). For `task` children, use the actual work
  type (`type:bug`, `type:feature`, `type:refactor`, `type:docs`, or
  `type:chore`) and choose the smallest defensible `complexity:*`; use
  `complexity:medium` only when the map does not yet contain enough evidence.
  Once claimed, the ticket is assigned to the driving dev.
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
