---
name: ship-issue
description: "End-to-end pipeline for an Asymmetric.al GitHub issue: select AL-### (explicit or by label filters), start branch + draft PR, implement, run checks, and mark PR ready for review."
---

# ship-issue

## Goal
One command that:
1) Ensures there is work (creates or selects an issue),
2) Selects a target issue (`AL-###` or best match via labels),
3) Creates a branch + draft PR,
4) Implements with commits referencing `AL-###`,
5) Runs checks,
6) Marks PR ready for review (and requests reviewers if configured).

## Inputs (optional)
- `issue_key`: `AL-###` (ship exactly this issue)
- `difficulty`: `simple | easy | medium | hard` (maps to `complexity:*`)
- `type`: `bug | feature | chore | refactor | docs` (maps to `type:*`)
- `status`: `todo | ready` (maps to `status:*`; default `todo`)

If multiple filters are provided, they are AND-ed together.

Selection safety:
- Do NOT pick issues labeled `status:blocked` or `status:needs-review` unless `issue_key` is explicitly provided.

## Assumptions / conventions
- Issues are identified by `AL-###` and titles should be `AL-###: ...`
- Branches are created from `develop` and PRs target `develop`
- Commits include `ref AL-###`
- Checks command: `bun run lint && bun run typecheck && bun run build`

## Step 0 — Determine target repo
Preferred:
- Infer from git remote `origin`.

Run:

```bash
git remote get-url origin
```

If origin cannot be detected, ask user for `owner/repo`.

## Step 1 — Ensure label taxonomy exists (GitHub MCP preferred)
Ensure these labels exist; create missing labels only if user agrees.

Complexity:
- `complexity:simple`
- `complexity:easy`
- `complexity:medium`
- `complexity:hard`

Status:
- `status:todo`
- `status:blocked`
- `status:needs-review`
- `status:ready`

Type:
- `type:bug`
- `type:feature`
- `type:chore`
- `type:refactor`
- `type:docs`

Use GitHub MCP to:
- list labels
- create missing labels

If GitHub MCP label operations aren’t available, STOP and ask the user to create labels manually (do not assume `gh`).

## Step 2 — Ensure there are candidate issues
Use GitHub MCP to query **open issues** in the repo.

If there are no open issues that match selection rules:
- Ask the user whether to:
  - create a new issue now using the `write-issue` skill, or
  - stop.

## Step 3 — Select an issue (deterministic)

### 3.1 If `issue_key` is provided
Use GitHub MCP to resolve the issue by searching for `AL-###` in:
1) title (preferred)
2) body

If multiple matches, list candidates (number + title) and ask user to choose.

### 3.2 Else build a label query
Base constraints:
- state: open
- exclude labels: `status:blocked`, `status:needs-review`
- include label: `status:todo` (default) OR `status:ready` if `status=ready`

Optional filters (AND):
- `difficulty=simple` → `complexity:simple` (etc.)
- `type=docs` → `type:docs` (etc.)

Deterministic selection:
1) prefer `complexity:simple`
2) then `complexity:easy`
3) then `complexity:medium`
4) then `complexity:hard`

Within same complexity: choose the oldest issue (smallest issue number).

If no matching issue is found:
- Ask the user whether to create one via `write-issue`, or stop.

## Step 4 — Start work (branch + draft PR)
Invoke the `start-issue` skill for the selected key(s), using the selected issue as primary.

Expected outcomes:
- branch created from `develop`
- draft PR created targeting `develop` with `fixes AL-###`

## Step 5 — Implement
- Re-read the issue body and acceptance criteria.
- Make the minimal changes to satisfy the acceptance criteria.
- Commit as you go with conventional commits and `ref AL-###`.

If Nia is available and the work touches version-sensitive areas (Next.js/Supabase/Stripe/TanStack/TipTap/Tailwind):
- verify the approach with Nia before implementing (prefer package search or doc read), then proceed.

## Step 6 — Validate + mark Ready for Review
Run checks:

```bash
bun run lint && bun run typecheck && bun run build
```

Then:
- push commits
- update PR body if needed
- mark PR “Ready for review” (convert from draft) via GitHub MCP (preferred) or `gh` only if user confirms it’s available.

Request reviewers only if:
- the repo has a known reviewer convention, OR
- the user provides reviewer GitHub handles.

## Step 7 — Output
Return:
- selected issue (`AL-###`) + link
- branch name
- PR link
- short summary of what changed
- checks status (pass/fail) and any failures to address
