# Create Issues — Skill

**Name:** `create-issues`
**Purpose:** Scan the repo and create a small batch of GitHub issues with consistent `AL-###` titles and labels.
Use this skill when asked to generate multiple actionable issues.

**Applies when:** The user requests a batch of issues or repo-wide issue discovery.
**Do not use when:** Only a single issue is needed (use `skills/write-issue/SKILL.md`).

## Rules

- Create **5–12** issues per run.
- Title format: `AL-<issue_number>: <short title>`.
- Labels: exactly one `complexity:*`, one `type:*`, one `status:*` (default `status:todo`).
- Prefer GitHub MCP; do not assume `gh` is available.

### Label taxonomy (locked)

- Complexity: `complexity:simple | complexity:easy | complexity:medium | complexity:hard`
- Status: `status:todo | status:blocked | status:needs-review | status:ready`
- Type: `type:bug | type:feature | type:chore | type:refactor | type:docs`

## Workflow

1. Determine target repo (prefer `git remote get-url origin`).
2. Ensure labels exist via GitHub MCP; create missing labels if approved.
3. Perform a fast repo scan (docs, TODO/FIXME, stubs, CI hints).
4. Draft 5–12 issues with context + acceptance criteria.
5. Apply exactly three labels per issue.
6. Create issues via GitHub MCP and rename with the `AL-###` prefix.
7. If MCP is unavailable, stop and ask how to proceed.

## Checklists

### Drafting checklist

- [ ] 5–12 issues max
- [ ] Each issue has context + acceptance criteria
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

- Creating more than 12 issues
- Applying multiple labels from the same category
- Skipping acceptance criteria
- Assuming `gh` is available instead of GitHub MCP
