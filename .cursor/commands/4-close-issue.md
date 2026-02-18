# 4-close-issue

**Name:** `4-close-issue`
**Purpose:** Finalize an `AL-###` issue by verifying acceptance criteria, running quality gates, and marking the PR ready for review.
Use this when the user asks to close/finish/ship an issue or prepare a PR.

**Applies when:** Preparing a PR for review/merge or closing an issue.
**Do not use when:** Starting or implementing an issue (use `/1-start-issue` or `/2-implement-issue`).

## Rules

- Canonical PR-readiness gate (blocking CI in `.github/workflows/ci.yml`) must pass: `bun run format:check && bun run lint && bun run typecheck && bun run build && bun run test:unit`.
- Formatting: fix with `bun run format`, verify with `bun run format:check`.
- PR workflow: Draft -> Ready for Review -> Approved -> Merged.
- Use Linear MCP for issue details/status. For PR operations, prefer `gh` (GitHub CLI), fallback to GitHub MCP.
- If using Nia (MCP) for repo context, scope queries to `Asymmetric-al/core` (see `AGENTS.md#nia-mcp-usage-always-repo-scoped`).
- When reporting evidence, cite exact file paths (in backticks) and specific symbols (functions/components). When quoting code, use Cursor code citations (`startLine:endLine:filepath`).
- E2E is informational and must not be required for merge.

## Workflow

1. **Pre-flight:** Verify feature branch and clean working tree.
   - Run: `git status`, `git branch --show-current`.
   - If on `main`/`develop`, stop and ask to switch.
2. **Identify issue keys:** Check branch name or recent commits.
   - Run: `git log -20 --oneline`.
3. **Verify acceptance criteria:** Use Linear MCP to fetch issue body and checklist.
4. **Scan TODO/FIXME:** Check changed files for TODO/FIXME.
5. **Run relevant tests:** Use `rules/testing.md` to decide scope (unit/e2e/a11y/perf) and run the applicable commands.
6. **Run quality gate:** Fix failures and re-run until clean.
7. **Commit/push:** Use `/3-commit-issue` and `git push`.
8. **Request reviewers (CODEOWNERS):** Read `CODEOWNERS` and collect owner handles.
   - One handle per line; ignore blank lines and comments.
   - Ignore teams (lines starting with `@org/` or containing a slash).
   - If no valid user handles found, skip and note in PR summary.
   - Prefer `gh` to request reviewers on the PR; fallback to GitHub MCP if needed.
9. **Update PR:** Add summary/testing/`fixes AL-###`, then mark ready (prefer `gh`, fallback to GitHub MCP).

## Checklists

### Pre-flight checklist

- [ ] On a feature branch (not `main`/`develop`)
- [ ] Issue keys identified
- [ ] Acceptance criteria confirmed

### Final checklist

- [ ] Relevant tests run (per `rules/testing.md`)
- [ ] Quality gate passes
- [ ] Formatting fixed with `bun run format` and verified with `bun run format:check`
- [ ] `CI / format`, `CI / lint`, `CI / typecheck`, `CI / build`, `CI / test-unit` pass on the PR
- [ ] No unintended TODO/FIXME
- [ ] Reviewers requested from `CODEOWNERS`
- [ ] PR updated and ready for review

## Minimal examples

### Quality gate

```bash
bun run format:check && bun run lint && bun run typecheck && bun run build && bun run test:unit
```

### Formatting

```bash
bun run format
bun run format:check
```

### Relevant tests (example)

```bash
bun run test:unit
bun run test:e2e
```

### Find TODO/FIXME in changed files

```bash
git diff --name-only origin/develop...HEAD | xargs -I{} grep -n "TODO\|FIXME" "{}" || true
```

## Common mistakes / pitfalls

- Marking PR ready before checks pass
- Ignoring TODO/FIXME in changed files
- Closing issues without confirming acceptance criteria
- Requesting team reviewers when only users are supported
