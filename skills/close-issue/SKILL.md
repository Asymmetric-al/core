# Close Issue — Skill
**Name:** `close-issue`
**Purpose:** Finalize an `AL-###` issue by verifying acceptance criteria, running quality gates, and marking the PR ready for review.
Use this when the user asks to close/finish/ship an issue or prepare a PR.

**Applies when:** Preparing a PR for review/merge or closing an issue.
**Do not use when:** Starting or implementing an issue (use `start-issue` or `ship-issue`).

## Rules
- Quality gate must pass: `bun run lint && bun run typecheck && bun run build`.
- PR workflow: Draft -> Ready for Review -> Approved -> Merged.
- Prefer GitHub MCP for PR/issue operations.

## Workflow
1. **Pre-flight:** Verify feature branch and clean working tree.
   - Run: `git status`, `git branch --show-current`.
   - If on `main`/`develop`, stop and ask to switch.
2. **Identify issue keys:** Check branch name or recent commits.
   - Run: `git log -20 --oneline`.
3. **Verify acceptance criteria:** Use GitHub MCP to fetch issue body and checklist.
4. **Scan TODO/FIXME:** Check changed files for TODO/FIXME.
5. **Run quality gate:** Fix failures and re-run until clean.
6. **Commit/push:** Use `skills/commit/SKILL.md` and `git push`.
7. **Update PR:** Add summary/testing/`fixes AL-###`, then mark ready.

## Checklists

### Pre-flight checklist
- [ ] On a feature branch (not `main`/`develop`)
- [ ] Issue keys identified
- [ ] Acceptance criteria confirmed

### Final checklist
- [ ] Quality gate passes
- [ ] No unintended TODO/FIXME
- [ ] PR updated and ready for review

## Minimal examples

### Quality gate
```bash
bun run lint && bun run typecheck && bun run build
```

### Find TODO/FIXME in changed files
```bash
git diff --name-only origin/develop...HEAD | xargs -I{} grep -n "TODO\|FIXME" "{}" || true
```

## Common mistakes / pitfalls
- Marking PR ready before checks pass
- Ignoring TODO/FIXME in changed files
- Closing issues without confirming acceptance criteria
