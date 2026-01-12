---
description: Create a feature branch and draft PR for one or more Asymmetric.al GitHub issues.
---

# Workflow: start-issue

# Start Issue

Create a feature branch and draft PR for one or more Asymmetric.al GitHub issues, using `AL-###` keys.

## Context

- **Branch Strategy**: All branches created from `develop`, PRs merge to `develop`
- **Commit Convention**: Conventional commits with `ref AL-###`
- **PR Format**: Draft PRs with `fixes AL-###` tags
- **Issue Source**: GitHub Issues (queried via GitHub MCP or `gh issue`)

## Workflow

### 1. Pre-flight Checks

- Must be on `develop`
- Working directory must be clean
- Pull latest:

```bash
git checkout develop
git pull origin develop
```

### 2. Get Asymmetric.al Issue Key(s)

Prompt user for issue keys:

- Example: `AL-123` or `AL-123 AL-124`
- Validate format: `AL-\d+`

### 3. Fetch Issues from GitHub

For each `AL-###`:

- Use GitHub MCP to search issues by text `AL-###` (title/body/labels)
  - If multiple matches: ask user to pick
- Capture:
  - Issue title
  - Issue URL/number
  - Body (acceptance criteria)
  - Labels / milestone / project (if any)

If issue not found:

- Ask user whether to:
  - Create it now (recommended), or
  - Proceed with manual title/description

### 4. Create Git Branch

Branch naming (recommended):

- `al-123-{short-kebab-title}`
- If multiple issues: use the primary issue key

```bash
git checkout -b {branch_name}
```

Branch name conflict:

- If exists locally/remotely: offer options (use existing, delete/recreate, cancel)

### 5. Create Initial Commit

```bash
git commit --allow-empty -m "chore: start work on {issue_title}

ref {AL-### list}"
```

### 6. Push Branch

```bash
git push -u origin {branch_name}
```

### 7. Create Draft PR

- If `.github/PULL_REQUEST_TEMPLATE.md` exists, use it as the base
- Otherwise use a minimal body

```bash
gh pr create --title "{issue_title}" --body "BODY_CONTENT_HERE" --draft --base develop
```

Include in the body:

- Summary
- Checklist (testing/verification)
- Related issues:
  - `fixes AL-123`
  - `fixes AL-123 AL-124`

### 8. Next Steps

```text
✅ Branch created: {branch_name}
✅ Draft PR created: {pr_url}

Next:
1. Implement the issue(s)
2. Commit as you go (`ref AL-###`)
3. When ready, run `/close-issue`
```

## Success Criteria

- Branch created from `develop`
- Initial commit pushed with `ref AL-###`
- Draft PR created with `fixes AL-###`

## Error Handling

- If not on `develop`: guide user to switch
- If dirty working tree: commit/stash first
- If GitHub lookup fails: fall back to manual title/description
- If `gh` CLI not available: provide manual PR creation steps
