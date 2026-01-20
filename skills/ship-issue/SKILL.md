# Ship Issue — Skill

**Name:** `ship-issue`
**Purpose:** End-to-end workflow to select an `AL-###` issue, create branch + draft PR, implement, and mark PR ready.
Use this when the user asks to "ship" an issue.

**Applies when:** The user wants a full start->implement->ready-for-review pipeline.
**Do not use when:** The user only wants to write or start an issue.

## Rules

- Issues are `AL-###` and titles follow `AL-###: ...`.
- Branches and PRs are based on `develop`.
- Commits include `ref AL-###` when applicable.
- Quality gate: `bun run format:check && bun run lint && bun run typecheck && bun run build && bun run test:unit`.
- If using Nia (MCP) for repo context during this workflow, scope queries to `Asymmetric-al/core` (see `AGENTS.md#nia-mcp-usage-always-repo-scoped`).

## Workflow

1. **Determine repo:** Prefer `git remote get-url origin`; otherwise ask for `owner/repo`.
2. **Ensure label taxonomy exists:** Use GitHub MCP to list/create labels.
3. **Select issue (deterministic):**
   - If `issue_key` provided, search title/body for `AL-###`.
   - Otherwise build a label query from `difficulty`, `type`, `status` filters.
   - Exclude `status:blocked` and `status:needs-review` unless key is explicit.
   - If multiple matches, choose oldest (lowest issue number).
4. **Start work:** Invoke `skills/start-issue/SKILL.md` for branch + draft PR.
5. **Implement:** Make minimal changes; commit with `ref AL-###`.
6. **Validate:** Run quality gate, fix failures, and re-run until clean.
7. **Finalize:** Push, update PR body, mark ready for review (GitHub MCP preferred).

## Checklists

### Selection checklist

- [ ] Issue is open
- [ ] Issue is not `status:blocked` or `status:needs-review` unless explicitly requested
- [ ] Label filters match requested difficulty/type/status

### Delivery checklist

- [ ] Draft PR created
- [ ] Commits include `ref AL-###`
- [ ] Quality gate passes
- [ ] `CI / format` passes on the PR
- [ ] PR marked ready for review

## Minimal examples

### Label filter mapping

- `difficulty=easy` -> `complexity:easy`
- `type=docs` -> `type:docs`

### Quality gate

```bash
bun run format:check && bun run lint && bun run typecheck && bun run build && bun run test:unit
```

## Common mistakes / pitfalls

- Selecting blocked issues without explicit user confirmation
- Skipping quality gate
- Marking PR ready before checks pass
