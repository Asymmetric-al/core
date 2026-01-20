# Write Issue — Skill

**Name:** `write-issue`
**Purpose:** Draft or upgrade a single Asymmetric.al GitHub issue so it is implementation-ready.
Use this skill for one issue at a time.

**Applies when:** Writing or improving a single `AL-###` issue.
**Do not use when:** Creating a batch of issues (use `skills/create-issues/SKILL.md`).

## Rules

- Issue identifier must be `AL-###` and appear in the title.
- Use GitHub MCP for issue search/create/update.
- Do not add GitHub Projects steps unless asked.

## Workflow

1. **Confirm the key:** Ask for `AL-###` if missing; validate format.
2. **Locate the issue (MCP):** Search title/body for `AL-###`.
   - If multiple matches, list candidates and ask the user to choose.
3. **If missing, create:** Title must be `AL-###: <short title>`.
4. **Extract requirements:** Summarize what/why, constraints, and unknowns.
5. **Analyze codebase context:** Identify impacted paths and related patterns.
6. **Ask minimal questions:** Only fill gaps that block implementation-ready criteria.
7. **Produce updated issue body:** Include overview, context, approach, acceptance criteria, testing, risks.
8. **Update the issue:** Apply the new body via MCP.

## Checklists

### Input checklist

- [ ] `AL-###` key confirmed
- [ ] Repo identified (owner/name)
- [ ] Short title and problem statement collected

### Output checklist

- [ ] Acceptance criteria are testable
- [ ] Testing notes are explicit
- [ ] Risks/edge cases captured

## Minimal examples

### Title format

`AL-456: add empty-state for invoices`

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

- Missing `AL-###` in the title
- Vague acceptance criteria
- Skipping codebase context and risks
- Updating issues without GitHub MCP
