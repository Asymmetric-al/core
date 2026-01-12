---
description: Scan the Asymmetric.al repo and create GitHub Issues (AL-###) with consistent labels: complexity, status, type.
---

# Workflow: create-issues

Create actionable GitHub issues from a fast scan of the current Asymmetric.al project folder.  
Every created issue will be labeled with:

- exactly one `complexity:*`
- exactly one `type:*`
- exactly one `status:*` (default: `status:todo`)

And the title will be normalized to: `AL-<issue_number>: <short title>`.

---

## Label taxonomy (locked)

### Complexity (exactly one)
- `complexity:simple`
- `complexity:easy`
- `complexity:medium`
- `complexity:hard`

### Status (exactly one; default `status:todo`)
- `status:todo`
- `status:blocked`
- `status:needs-review`
- `status:ready`

### Type (exactly one)
- `type:bug`
- `type:feature`
- `type:chore`
- `type:refactor`
- `type:docs`

---

## Step 1 — Determine target repo

- Prefer repo inferred from `git remote get-url origin`.
- If not detectable, prompt for `owner/repo`.

---

## Step 2 — Ensure labels exist (create if missing)

Ensure all labels from the taxonomy exist in the repo.  
Preferred: GitHub MCP label tools.  
Fallback: `gh label create`.

---

## Step 3 — Collect repo signals (fast scan)

Scan the repo for candidate work items (in this order):

1) **Docs & roadmap**
- `README*`, `docs/**`, `roadmap*`, `plans/**`, `*.md`
- Deliverables, missing sections, unclear instructions, broken links

2) **Code hotspots**
- `TODO:` / `FIXME:` / `HACK:` / `XXX:`
- obvious stubs / placeholders
- failing tests / CI hints (if visible in repo)

3) **Automation / hygiene**
- pre-commit / formatting drift
- scripts that lack safe defaults
- missing docs for workflows

---

## Step 4 — Draft issues (small batch)

Create 5–12 issues max per run.

For each issue, produce:
- **Title** (short, imperative)
- **Context**
- **Acceptance criteria** (checkboxes)
- **Notes / pointers** (paths, files, commands)

---

## Step 5 — Assign labels (consistent + predictable)

For each drafted issue, assign:

### 5.1 Type (exactly one)
Heuristic:
- docs/markdown improvements → `type:docs`
- failing behavior, incorrect output, crash → `type:bug`
- new capability / new pipeline step → `type:feature`
- dependency bumps, formatting, build/CI tweaks → `type:chore`
- restructure code without changing behavior → `type:refactor`

### 5.2 Complexity (exactly one)
Heuristic:
- **simple**: single-file, <30 min, low risk, trivial validation
- **easy**: 1–3 files, clear approach, small tests/update
- **medium**: multi-module touch, non-trivial tests, some refactor
- **hard**: unclear scope, risky refactor, broad blast radius

### 5.3 Status (exactly one)
Default: `status:todo`  
Only use `status:blocked` if you can explicitly name what is blocking it.

---

## Step 6 — Create issues in GitHub

For each draft:
- Create issue with body
- Apply the 3 labels (`complexity:*`, `type:*`, `status:*`)
- Rename issue title to include `AL-<issue_number>: ...`

Preferred: GitHub MCP issue tools.  
Fallback: `gh issue create` + `gh issue edit` + `gh issue edit --add-label`.

---

## Step 7 — Output

Return:
- list of created issues (number + `AL-###` title)
- label summary counts (by type + complexity)
