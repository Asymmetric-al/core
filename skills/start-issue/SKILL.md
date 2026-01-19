# Start Issue — Skill

**Name:** `start-issue`
**Purpose:** Create a feature branch and a draft PR for one or more `AL-###` issues.
Use this skill when beginning implementation work tied to GitHub issues.

**Applies when:** Starting work on one or more `AL-###` issues.
**Do not use when:** The user only wants to write issues (use `skills/write-issue/SKILL.md`).

## Rules

- Base branch: `develop`.
- PR base: `develop`.
- Branch format: `al-123-short-kebab-title` (first issue key is primary).
- PR title format: `AL-123: <issue title>`.
- PR body must include `fixes AL-###` for each issue.

## Workflow

1. **Pre-flight:** Ensure clean working tree and up-to-date `develop`.
   - Run: `git status`, `git checkout develop`, `git pull origin develop`.
   - If working tree is dirty, stop and ask to commit/stash first.
2. **Validate issue keys:** Each key must match `^AL-\d+$`.
3. **Fetch issue details:** Use GitHub MCP to find each issue and capture title/body.
   - If multiple matches, list candidates and ask the user to choose.
4. **Create branch:** Derive from the primary issue title.
   - If branch exists locally/remotely, stop and ask whether to use it.
5. **Push branch:** `git push -u origin <branch>`.
6. **Create draft PR:** Prefer GitHub MCP; fall back to `gh` only if confirmed.
7. **Report next steps:** Share branch name and PR URL.

## Checklists

### Pre-flight checklist

- [ ] On `develop`
- [ ] Working tree is clean
- [ ] `develop` is up to date

### PR checklist

- [ ] Draft PR created
- [ ] PR body includes `fixes AL-###` lines

## Minimal examples

### Branch name

`al-123-add-profile-cta`

### PR body snippet

```markdown
## Related Issues

fixes AL-123
fixes AL-124
```

### Draft PR (gh)

```bash
gh pr create --draft --base develop --title "AL-123: ISSUE_TITLE" --body "PASTE_PR_BODY_HERE"
```

## Common mistakes / pitfalls

- Creating a branch from the wrong base
- Invalid issue keys
- Missing `fixes AL-###` lines in the PR body
- Assuming `gh` exists without checking
