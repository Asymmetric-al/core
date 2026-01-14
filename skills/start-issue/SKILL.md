---
name: start-issue
description: Create a feature branch (from develop) and a draft PR for one or more Asymmetric.al GitHub issues identified by AL-###.
---

# start-issue

Create a feature branch and a draft PR for one or more Asymmetric.al GitHub issues using `AL-###` keys.

## Conventions
- Base branch: `develop`
- PR base (merge target): `develop`
- Branch name: `al-123-short-kebab-title` (use first issue key as primary)
- Commits: conventional commits; include `ref AL-###` (single or list)
- PR body: include `fixes AL-###` (one per line)

## Inputs
Ask for these if not provided:
- Issue keys: `AL-123` or `AL-123 AL-124`
- GitHub repo (owner/name) if needed for lookup
- If an issue can’t be found: short title + 1–2 sentence summary

## Workflow

### 1) Pre-flight checks
Requirements:
- Must be on `develop`
- Working tree must be clean
- Pull latest `develop`

Run:

```bash
git status
git checkout develop
git pull origin develop
```

If `git status` is not clean, STOP and ask the user to commit or stash before continuing.

### 2) Validate issue keys
- Parse user input into a list of keys.
- Each key must match: `^AL-\d+$`
- If any invalid, STOP and ask for corrected keys.

### 3) Fetch issues from GitHub (MCP only)
For each `AL-###` key:
- Use GitHub MCP to search issues by text `AL-###` (title/body).
- If multiple matches: list candidates (issue number + title) and ask the user to pick one.
- Capture:
  - Issue title
  - Issue URL/number
  - Body (especially acceptance criteria)

If an issue is not found:
- Ask the user whether to:
  - Stop and run the `write-issue` skill to create it, or
  - Provide a manual title/summary so you can proceed.

### 4) Create the branch
- Primary key = first key provided.
- Branch name:
  - `al-123-<kebab-title>`
  - `<kebab-title>` derived from the primary issue title (remove `AL-###:` prefix)

Before creating:
- If the branch exists locally or remotely, STOP and ask whether to use it, delete/recreate, or cancel.

Create:

```bash
git checkout -b al-123-short-kebab-title
```

### 5) Optional: initial empty commit
Ask the user if they want a “start work” marker commit.
If yes:

```bash
git commit --allow-empty -m "chore: start work

ref AL-123 AL-124"
```

### 6) Push the branch

```bash
git push -u origin al-123-short-kebab-title
```

### 7) Create a draft PR
Prefer `gh` if available; otherwise provide manual PR steps.

PR title format:
- `AL-123: <issue title>`

PR body template (Markdown):

```markdown
## Summary
2–5 lines summarizing the change.

## Related Issues
fixes AL-123
fixes AL-124

## Verification
- [ ] Lint/typecheck/build pass
- [ ] Tests added/updated where needed
- [ ] Manual verification completed (if applicable)
```

If `gh` is available, create the draft PR:

```bash
gh pr create --draft --base develop --title "AL-123: ISSUE_TITLE_HERE" --body "PASTE_PR_BODY_HERE"
```

If `gh` is NOT available, instruct the user:
- Open GitHub → “Compare & pull request”
- Set base branch to `develop`
- Use the same title/body requirements above (must include `fixes AL-###` lines)

### 8) Output next steps
Report:
- Branch name
- PR URL (if created)

Next:
- Implement the issue(s)
- Commit as you go with `ref AL-###`
- Run your normal checks before marking PR ready

## Success criteria
- Branch created from `develop` and pushed
- Draft PR opened targeting `develop`
- PR body includes `fixes AL-###` lines for all issue keys

## Error Handling

- If not on `develop`: guide user to switch
- If dirty working tree: commit/stash first
- If GitHub lookup fails: fall back to manual title/description
- If `gh` CLI not available: provide manual PR creation steps
