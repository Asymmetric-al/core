# /issue-implement

**Purpose:** Implement one or more `AL-###` GitHub issues with small, testable changes that match repo rules (issue lifecycle: implement).
Use this command when the user asks to implement/build/solve an issue.

**When to use:** Implementing one or more `AL-###` issues in this repo after `/issue-start`.
**Do not use when:** Drafting or opening issues (`/issue-draft` or `/issue-open`), starting work (`/issue-start`), or shipping (`/issue-ship`).

## Rules

- Issue keys must match `AL-###`.
- Prefer GitHub MCP for issue/PR lookups and updates.
- Use Nia for codebase search/trace (paths, entry points, patterns), always scoped to `Asymmetric-al/core` (see `.cursor/rules/AGENTS.md#nia-mcp-usage-always-repo-scoped`).
- Use Context7 for third-party API usage.
- Branch should already exist (use `/issue-start` if not).
- Keep diffs minimal and scoped to acceptance criteria.
- Do not edit `.md` files unless the user explicitly asks. If behavior changes, propose doc updates and get approval before editing.
- Quality gate for handoff: `bun run format:check && bun run lint && bun run typecheck && bun run build && bun run test:unit`.
- Formatting: fix with `bun run format`, verify with `bun run format:check`.

## Workflow

1. **Confirm issue key(s):** If missing, ask for `AL-###`. Validate format.
2. **Fetch issue details (MCP):** Capture title, context, acceptance criteria, and testing notes.
3. **Load rulebooks:** Always apply `.cursor/rules/general.md`. Add `.cursor/rules/frontend.md`, `.cursor/rules/backend.md`, or `.cursor/rules/testing.md` as needed.
4. **Discover code context (Nia):** Find affected paths, existing patterns, and related components. Keep Nia queries scoped to `Asymmetric-al/core` and cite exact files/functions.
5. **Draft a plan:** Summarize changes and testing, then ask for approval before editing.
6. **Implement iteratively:** Make small changes, update/add tests per acceptance criteria, and keep commits atomic.
   - If committing, use `/issue-commit` (see `skills/issue-commit/SKILL.md`) and include `ref AL-###` when applicable.
7. **Verify:** Run relevant tests during implementation (use `.cursor/rules/testing.md` to choose unit/e2e/a11y/perf). Before handoff, run the quality gate or note why it is deferred.
8. **Report status:** List changed paths, blast radius if multi-file, testing results, and verification steps. If behavior changed, propose doc updates and ask for approval.

## Checklists

### Input checklist

- [ ] `AL-###` key confirmed
- [ ] Issue details fetched via GitHub MCP
- [ ] On a feature branch (not `main`/`develop`)

### Build checklist

- [ ] Relevant rulebooks applied
- [ ] Plan approved by user
- [ ] Changes scoped to acceptance criteria
- [ ] Tests updated/added where required
- [ ] Commits are small and atomic

### Verification checklist

- [ ] Relevant tests run
- [ ] Quality gate passed (or explicitly deferred)
- [ ] Formatting fixed with `bun run format` and verified with `bun run format:check`
- [ ] Doc update approval requested if behavior changed

## Minimal examples

### Plan snippet

```markdown
## Implementation Plan (AL-123)

- Update {path} to {behavior}
- Add {test} for {scenario}
- Verify with `bun run format:check && bun run lint && bun run typecheck && bun run build && bun run test:unit`
```

### Formatting

```bash
bun run format
bun run format:check
```

### Commit with issue reference

```bash
git commit -m "feat(feature): add XYZ" -m "ref AL-123"
```

## Common mistakes / pitfalls

- Implementing without a valid `AL-###` key
- Skipping Nia when tracing affected areas
- Running unscoped Nia searches outside `Asymmetric-al/core`
- Using third-party APIs without Context7
- Editing docs without explicit user approval
- Leaving tests or quality gate unaddressed
