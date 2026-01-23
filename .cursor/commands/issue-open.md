# /issue-open

**Purpose:** Open a single GitHub issue from a fresh problem statement by partnering with the user to gather context, scope, and acceptance criteria before creating the issue (issue lifecycle: open).
Use this command when the user wants to open a new issue and needs help shaping it.

**When to use:** The user provides a new problem and wants a new `AL-###` issue opened.
**Do not use when:** The user wants to find or update an existing issue (use `/issue-draft`).

## Rules

- Create exactly **1** issue per run.
- Title format: `AL-<issue_number>: <short title>`.
- Labels: exactly one `complexity:*`, one `type:*`, one `status:*` (default `status:todo`).
- Prefer GitHub MCP; do not assume `gh` is available.
- If using Nia (MCP) for repo context, scope queries to `Asymmetric-al/core` (see `.cursor/rules/AGENTS.md#nia-mcp-usage-always-repo-scoped`).

### Label taxonomy (locked)

- Complexity: `complexity:simple | complexity:easy | complexity:medium | complexity:hard`
- Status: `status:todo | status:blocked | status:needs-review | status:ready`
- Type: `type:bug | type:feature | type:chore | type:refactor | type:docs`

## Workflow

1. Determine target repo (prefer `git remote get-url origin`).
2. Capture the problem statement and ask for `AL-###` if missing; validate format.
3. Ask focused follow-up questions to build context (who is affected, desired behavior, constraints, scope, acceptance criteria, testing).
4. Investigate repo context as needed (docs/code/TODOs) to identify impacted areas and related patterns.
5. Draft the issue body: overview, technical context (paths), approach, acceptance criteria, testing, risks.
6. Confirm the final title and labels with the user, then create the issue via GitHub MCP.
7. If MCP is unavailable, stop and ask how to proceed.

## Checklists

### Context checklist

- [ ] Problem statement captured
- [ ] `AL-###` key confirmed
- [ ] Scope and constraints documented
- [ ] Acceptance criteria are testable
- [ ] Testing notes captured

### Label checklist

- [ ] Exactly one `complexity:*`
- [ ] Exactly one `type:*`
- [ ] Exactly one `status:*`

## Minimal examples

### Title format

`AL-123: clarify onboarding copy`

### Body template (minimal)

```markdown
## Overview

What and why.

## Technical Context

- **Affected areas/files**:
  - `{path}` — {why}

## Implementation Approach

1. Step one
2. Step two

## Acceptance Criteria

- [ ] Specific, testable outcome
- [ ] Tests pass (as applicable: `bun run test:unit`, `bun run test:e2e`, `bun run lint`, `bun run typecheck`, `bun run build`)
```

## Common mistakes / pitfalls

- Creating more than one issue
- Skipping context-gathering questions
- Using `/issue-open` for existing issues (use `/issue-draft`)
- Assuming `gh` is available instead of GitHub MCP
