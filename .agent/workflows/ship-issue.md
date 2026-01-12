---
description: Run the full Asymmetric.al pipeline Issue → Branch → Implement → PR Ready for Review. Optionally target AL-### and/or a complexity/type/status filter.
---

# Workflow: ship-issue

## Goal

One command that:
1) Ensures there is work (creates issues if needed),
2) Selects an issue (explicit key or best match by labels),
3) Creates a branch and draft PR,
4) Implements the work with commits referencing `AL-###`,
5) Runs PR checks,
6) Marks the PR Ready for Review and requests reviewers.

This workflow expects issues to be labeled using the locked taxonomy from `/create-issues`.

---

## Inputs (optional)

- `issue_key`: `AL-###` (ship exactly this issue)
- `difficulty`: `simple | easy | medium | hard`  (maps to `complexity:*`)
- `type`: `bug | feature | chore | refactor | docs` (maps to `type:*`)
- `status`: `todo | ready` (maps to `status:*`; defaults to `todo`)
  - This workflow will NOT pick `status:blocked` or `status:needs-review` issues unless `issue_key` is explicitly provided.

If multiple filters are provided, they are AND-ed together.

---

## Step 0 — Determine target repo

- Prefer repo inferred from `git remote get-url origin`.
- If not detectable, prompt for `owner/repo`.

---

## Step 1 — Ensure label taxonomy exists

Ensure these labels exist in the repo; create them if missing.

### Complexity
- `complexity:simple`
- `complexity:easy`
- `complexity:medium`
- `complexity:hard`

### Status
- `status:todo`
- `status:blocked`
- `status:needs-review`
- `status:ready`

### Type
- `type:bug`
- `type:feature`
- `type:chore`
- `type:refactor`
- `type:docs`

Preferred: GitHub MCP label tools.  
Fallback: `gh label create`.

---

## Step 2 — Ensure there are candidate issues

Query GitHub for **open** issues. If none exist that match selection rules, run `/create-issues` once and re-query.

---

## Step 3 — Select an issue (deterministic)

### 3.1 If `issue_key` is provided
- Resolve the GitHub issue by searching for `AL-###` in title (preferred) or body.

### 3.2 Else build a query using labels

Base constraints:
- issue is **open**
- exclude: `status:blocked`, `status:needs-review`
- include: `status:todo` (default) or `status:ready` if `status=ready`

Then add optional filters:
- `difficulty=simple` → label `complexity:simple` (etc.)
- `type=docs` → label `type:docs` (etc.)

Selection rule:
1) Prefer `complexity:simple`
2) then `complexity:easy`
3) then `complexity:medium`
4) then `complexity:hard`
Within the same complexity, pick the oldest (smallest issue number) that matches.

---

## Step 4 — Start work (branch + draft PR)

Run `/start-issue` for the selected `AL-###`.

Expected outcomes:
- a new branch tied to `AL-###`
- a draft PR opened/updated referencing the issue

---

## Step 5 — Implement

- Re-read issue body and acceptance criteria.
- Make the minimal set of changes to satisfy AC.
- Use `/commit` as needed. Ensure commit messages include `ref AL-###`.

---

## Step 6 — Validate + Ready for Review

Run `/close-issue` (or equivalent steps):
- run PR checks (`bun run lint && bun run typecheck && bun run build`)
- push updates
- mark PR as **Ready for Review**
- request reviewers (if configured in the repo)

---

## Step 7 — Output

Return:
- selected issue (`AL-###`) + link
- PR link
- what was changed (short)
- commands run / checks status
