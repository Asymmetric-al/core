# Create Issues — Skill

**Name:** `create-issues`
**Purpose:** Scan the repo and create **one** GitHub issue per run with consistent `AL-###` titles and labels.
Use this skill when asked to discover issues and create them one at a time.

**Applies when:** The user requests issue discovery or repo-wide scanning.
**Do not use when:** A specific `AL-###` issue already exists and needs drafting/updating (use `skills/write-issue/SKILL.md`).

## Rules

- Create **exactly 1** issue per run.
- Title format: `AL-<issue_number>: <short title>`.
- Labels: exactly one `complexity:*`, one `type:*`, one `status:*` (default `status:todo`).
- Prefer GitHub MCP; do not assume `gh` is available.
- If using Nia (MCP) for repo scanning, scope queries to `Asymmetric-al/core` (see `AGENTS.md#nia-mcp-usage-always-repo-scoped`).

### Label taxonomy (locked)

- Complexity: `complexity:simple | complexity:easy | complexity:medium | complexity:hard`
- Status: `status:todo | status:blocked | status:needs-review | status:ready`
- Type: `type:bug | type:feature | type:chore | type:refactor | type:docs`

## Workflow

1. Determine target repo (prefer `git remote get-url origin`).
2. Ensure labels exist via GitHub MCP; create missing labels if approved.
3. Perform a fast repo scan (docs, TODO/FIXME, stubs, CI hints).
4. Draft 2–5 candidate issues with context + acceptance criteria.
5. Ask the user to pick **one** issue to create.
6. Apply exactly three labels to the chosen issue.
7. Create the issue via GitHub MCP and rename with the `AL-###` prefix.
8. If MCP is unavailable, stop and ask how to proceed.

## Checklists

### Drafting checklist

- [ ] One issue only
- [ ] The chosen issue has context + acceptance criteria
- [ ] Titles are short and imperative

### Label checklist

- [ ] Exactly one `complexity:*`
- [ ] Exactly one `type:*`
- [ ] Exactly one `status:*`

## Minimal examples

### Title format

`AL-123: clarify onboarding copy`

### Repo signal scan

- Patterns: README\*, docs/\*\*, TODO, FIXME

## Common mistakes / pitfalls

- Creating more than one issue per run
- Applying multiple labels from the same category
- Skipping acceptance criteria
- Assuming `gh` is available instead of GitHub MCP
