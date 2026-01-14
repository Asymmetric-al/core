---
name: create-issues
description: "Scan the Asymmetric.al repo and create a small batch of GitHub Issues titled AL-issue-number: ... with exactly one complexity:*, one type:*, and one status:* label (default status:todo)."
---

# create-issues

Scan the current repo and create 5–12 actionable GitHub issues with consistent labels:
- exactly one `complexity:*`
- exactly one `type:*`
- exactly one `status:*` (default `status:todo`)

Titles must be normalized to: `AL-<issue_number>: <short title>`.

## Locked label taxonomy

Complexity (exactly one):
- `complexity:simple`
- `complexity:easy`
- `complexity:medium`
- `complexity:hard`

Status (exactly one; default `status:todo`):
- `status:todo`
- `status:blocked`
- `status:needs-review`
- `status:ready`

Type (exactly one):
- `type:bug`
- `type:feature`
- `type:chore`
- `type:refactor`
- `type:docs`

## Step 1 — Determine target repo
Preferred: infer from origin.

```bash
git remote get-url origin
```

If not detectable, ask the user for `owner/repo`.

## Step 2 — Ensure labels exist (GitHub MCP preferred)
Use GitHub MCP to:
- list labels
- create any missing labels from the taxonomy

If label operations are not available via MCP, stop and ask the user to create labels manually (do not assume `gh`).

## Step 3 — Collect repo signals (fast scan)
Perform a fast, shallow scan (no deep refactors, no large analysis). Gather candidate work items in this order:

1) Docs & roadmap
- `README*`, `docs/**`, `roadmap*`, `plans/**`, `*.md`
- missing sections, unclear instructions, broken links

2) Code hotspots
- `TODO:`, `FIXME:`, `HACK:`, `XXX:`
- stubs/placeholders
- failing tests/CI hints visible in repo (if present)

3) Automation / hygiene
- formatting drift
- scripts lacking safe defaults
- missing docs for workflows

## Step 4 — Draft a small batch (5–12)
Create 5–12 drafts max per run. For each draft, produce:

- Short imperative title (no AL prefix yet)
- Context (what/why, 2–6 bullets)
- Acceptance criteria (checkboxes, testable)
- Notes/pointers (paths, commands, links)

## Step 5 — Assign exactly 3 labels per issue

### 5.1 Type (exactly one)
Heuristics:
- docs/markdown improvements → `type:docs`
- incorrect behavior/crash/regression → `type:bug`
- new capability/new step → `type:feature`
- dependency bumps/format/build/CI tweaks → `type:chore`
- restructure without behavior change → `type:refactor`

### 5.2 Complexity (exactly one)
Heuristics:
- simple: single-file, <30 min, low risk
- easy: 1–3 files, clear approach, small tests/update
- medium: multi-module touch, non-trivial tests, some refactor
- hard: unclear scope, risky refactor, broad blast radius

### 5.3 Status (exactly one)
Default: `status:todo`
Only use `status:blocked` if the blocker is explicitly named in the issue body.

## Step 6 — Create issues in GitHub (MCP preferred)
For each draft:

1) Create the issue with the drafted body (without AL prefix in title).
2) Apply exactly these 3 labels: one `complexity:*`, one `type:*`, one `status:*`.
3) Read back the created issue number.
4) Update the issue title to: `AL-<issue_number>: <short title>`.

If MCP issue creation/editing is not available, stop and ask the user whether to proceed manually (do not assume `gh`).

## Step 7 — Output
Return:
- list of created issues (number + full `AL-###` title + link)
- label summary counts (by type + complexity)
