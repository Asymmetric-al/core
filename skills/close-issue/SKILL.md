---
name: close-issue
description: Finalize an Asymmetric.al AL-### issue by verifying acceptance criteria, running the quality gate, committing and pushing changes, updating the PR, and marking it ready for review. Use when asked to close/finish/ship an AL-### issue or prepare a PR for review/merge.
---

# Close Issue

Finalize implementation with comprehensive checks, commit final changes, and mark the PR ready for review.

## Context / rules
- Quality gate must pass: `bun run lint && bun run typecheck && bun run build`
- PR workflow: Draft PR -> Ready for Review -> Approved -> Merged
- Issue identifiers: `AL-###` (GitHub Issues)
- Prefer GitHub MCP for PR/issue operations. Do not assume `gh` exists unless verified.

## Workflow

### 1) Pre-flight verification (git)
- Must be on a feature branch (not `develop`, `main`, or `master`).
- Identify whether the working tree is clean.

Run:

```bash
git status
git branch --show-current
```

If current branch is `develop`, `main`, or `master`, STOP and tell the user to checkout the feature branch.

### 2) Identify associated issues (AL-###)
Infer issue keys from:
- branch name containing `AL-\d+`
- recent commit messages containing `ref AL-\d+`

Run:

```bash
git log -20 --oneline
```

If you find issue keys:
- deduplicate and sort ascending numerically
- ask the user to confirm the final list
If you cannot find any:
- ask the user for the `AL-###` key(s) explicitly

### 3) Verify acceptance criteria (from GitHub issue body)
For each confirmed `AL-###`:
- Use GitHub MCP to locate the issue (search by `AL-###` in title/body).
- Fetch the issue body and extract acceptance criteria:
  - Prefer the section `## Acceptance Criteria`
  - Otherwise extract any markdown task list items (`- [ ]` / `- [x]`)
- Present the extracted checklist and ask the user to confirm all are met.
If not met:
- STOP and ask whether to implement missing items now.

### 4) Verify TODO/FIXME status in changed files
Check only files changed relative to `origin/develop` (if available) to avoid noise.

Run:

```bash
git fetch origin develop
git diff --name-only origin/develop...HEAD
```

Then search those files for TODO/FIXME:

```bash
git diff --name-only origin/develop...HEAD | xargs -I{} grep -n "TODO\|FIXME" "{}" || true
```

If TODO/FIXME are found:
- show the lines/paths
- ask the user whether each is intentional
- if not intentional, fix them before continuing

### 5) Run the quality gate
Run:

```bash
bun run lint && bun run typecheck && bun run build
```

If any step fails:
- identify which step failed from output
- fix the problem
- stage and commit fixes using the `commit` skill (preferred), ensuring `ref AL-###` is included when applicable
- push the branch
- rerun the quality gate

Limit: after 5 iterations, STOP and ask user how to proceed.

### 6) Commit and push any remaining changes
If there are uncommitted changes after checks pass:
- stage all
- commit using the `commit` skill (preferred)
- push

Run:

```bash
git status
git add -A
git push
```

### 7) Locate the PR for this branch (GitHub MCP preferred)
- Use GitHub MCP to find the PR associated with the current branch.
- If none exists, STOP and ask the user whether to create a draft PR using the `start-issue` skill.

### 8) Update PR description (MCP preferred)
Update the PR body to include:
- Summary of changes (3-6 bullets)
- Testing performed (what you ran)
- Quality gate status (explicitly state it passed)
- Related issues section with `fixes AL-###` lines (one per issue)

Do not remove existing useful content; append/update the relevant sections.

### 9) Request reviewers (only if user provides)
Ask: “Who should review this PR?”
- If user provides GitHub handles, add them as reviewers via GitHub MCP.
- If user does not provide reviewers, skip this step.

### 10) Add a short PR comment (optional)
If the user wants, add a comment with:
- What changed
- What to focus review on
- Any risk areas

Use GitHub MCP.

### 11) Mark PR Ready for Review
Convert the PR from draft to ready using GitHub MCP.

### 12) Final output
Return:
- PR URL
- branch name
- issues (`AL-###` list)
- confirmation that quality gate passed
- reviewers requested (if any)

## Success criteria
- Quality gate passes
- No unintended TODO/FIXME left behind
- Changes committed and pushed
- PR body includes `fixes AL-###`
- PR marked ready for review
