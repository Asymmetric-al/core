---
description: Finalize implementation with comprehensive checks, commit final changes, and mark PR ready for review.
---

# Workflow: close-issue

# Close Issue

Finalize issue implementation with comprehensive checks, commit final changes, and mark PR ready for review.

## Context

- **Quality Gate**: `bun run lint && bun run typecheck && bun run build` must pass
- **PR Workflow**: Draft PR → Ready for Review → Approved → Merged
- **Issue System**: GitHub Issues (Asymmetric.al issue keys: `AL-###`)

## Workflow

### 1. Pre-flight Verification

**Check Git State:**

- Verify you're on a feature branch (not `develop` or `main`)
  - If on `develop`/`main`: ERROR - Cannot close issue from main branches
- Check for uncommitted changes
  - If changes exist: They will be committed in step 6

**Identify Associated Issues (`AL-###`):**

- Get current branch name
- Check latest commits for `ref AL-###` patterns
- Check PR description for `fixes AL-###` patterns
- Confirm issue IDs with user

### 2. Verify Acceptance Criteria (from GitHub issue body)

For each `AL-###`:

- Use GitHub MCP (preferred) or `gh issue view` to fetch issue details
- Extract acceptance criteria:
  - Prefer a checklist under `## Acceptance Criteria`
  - Fall back to any markdown task list items (`- [ ]`) in the body
- Show checklist to user:

```markdown
## Acceptance Criteria for {AL-###}

{List acceptance criteria}

Have all criteria been met? (y/n)
```

- If user says "no": Ask what's missing and offer to implement
- If user says "yes": Continue

### 3. Verify TODO Comments Resolved

Search codebase for TODO/FIXME comments:

```bash
git diff --name-only develop...HEAD | xargs grep -n "TODO\|FIXME" || true
```

- If TODOs found: Show them to user
  - Ask: "These TODOs were added/remain. Should they be resolved or are they intentional?"
  - If need resolution: Fix them
  - If intentional: Continue

### 4. Run Comprehensive Quality Checks

Run full quality gate:

```bash
bun run lint && bun run typecheck && bun run build
```

If this chain fails, iterate:

1. Identify failing step from output
2. Fix the issue
3. Commit + push:

```bash
git add .
git commit -m "fix: resolve quality gate failures

ref {AL-###}"
git push
```

4. Re-run local checks

**Maximum Iterations:**

- After 5 failed attempts, ask user for direction:
  - Continue fixing, share errors for manual review, or (not recommended) narrow the scope.

### 5. Check for Merge Conflicts

Verify PR has no conflicts with `develop`:

```bash
git fetch origin develop
git merge-base --is-ancestor origin/develop HEAD || echo "Behind develop"
```

If behind `develop`:

```bash
git merge origin/develop
```

- If conflicts: notify user and pause for resolution
- After merge: re-run quality checks

### 6. Commit Final Changes

If uncommitted changes exist:

```bash
git add .
git commit -m "chore: final cleanup

ref {AL-###}"
git push
```

### 7. Update PR Description

Enhance PR description (prefer GitHub MCP; otherwise `gh pr edit`) to include:

- Summary of changes
- Testing performed
- Quality gate status
- Reviewer checklist
- Related issues with `fixes AL-###`

### 8. Request Reviewer Assignment

Ask user: "Who should review this PR?"

- If user provides GitHub usernames: assign them
- If user says "auto": use GitHub’s auto-assignment (if configured)

```bash
gh pr edit --add-reviewer {github_username}
```

### 9. Add PR Comment with Summary

Add comment to PR (GitHub MCP preferred; otherwise `gh pr comment`) including:

- Completed features/fixes
- Testing results
- Anything reviewers should focus on

### 10. Mark PR as Ready for Review

```bash
gh pr ready
```

### 11. Final Confirmation

```markdown
## Issue Ready for Review ✅

### Summary
- ✅ Quality checks passed
- ✅ Changes committed and pushed
- ✅ PR marked ready for review
- ✅ Reviewer(s) assigned: {reviewers}

### PR Details
- **URL**: {pr_url}
- **Branch**: {branch_name}
- **Issues**: {AL-### list}

### Next Steps
1. Address review comments
2. Merge when approved
3. Close linked issues automatically via `fixes AL-###` when PR merges (if configured)
```

## Success Criteria

- Quality checks pass
- No unintended TODO/FIXME left behind
- No merge conflicts with `develop`
- PR description updated with `fixes AL-###`
- PR marked ready for review

## Error Handling

- If on `develop`/`main`: Prevent execution, guide user to feature branch
- If check fails: Iterate on fixes up to 5 times, then ask user
- If merge conflicts: Pause and ask user to resolve
- If PR not found: Verify branch has associated PR
- If reviewer assignment fails: Provide manual instructions
