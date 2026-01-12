---
description: Write out an Asymmetric.al GitHub issue properly, and enhance it with detailed context from the codebase to prepare it for implementation.
---

# Workflow: write-issue

# Write Issue

Write out a GitHub issue properly, and enhance it with detailed context from the codebase to prepare it for implementation.

## Context

- **Project**: Asymmetric.al
- **Issue Key**: Use `AL-###` in the issue title (e.g., `AL-123: Add ingestion validator`)
- **Issue System**: GitHub Issues (via GitHub MCP or `gh issue`)

## Workflow

### 1. Get Issue Key or URL

- Ask user for:
  - `AL-###`, or
  - GitHub issue URL / number

### 2. Fetch Issue from GitHub

- Use GitHub MCP (preferred) to fetch:
  - Title, body, labels, milestone/project, assignees
- If only `AL-###` provided, search for it in issue titles/bodies.

If not found, create it:

- Title: `AL-###: {short title}`
- Body: use the template below

### 3. Analyze Codebase Context

Based on the issue description:

- Identify impacted areas/files
- Find similar patterns in the repo
- Note risks, edge cases, and testing approach

### 4. Gather Missing Details (targeted questions)

Ask only what’s required to implement:

- Scope (in/out)
- Acceptance criteria
- Dependencies
- Rollout/compat concerns
- Validation/test expectations

### 5. Update Issue Body (enhanced template)

Update the issue body to:

```markdown
## Overview
{What and why}

## Technical Context
- **Affected areas/files**:
  - {path}
- **Dependencies**:
  - {other issues / PRs}
- **Notes**:
  - {constraints, invariants}

## Implementation Approach
1. {step}
2. {step}

## Acceptance Criteria
- [ ] {specific, testable}
- [ ] {specific, testable}
- [ ] Tests pass (`bun run lint && bun run typecheck && bun run build`)

## Testing Notes
- **Unit**: {what}
- **Integration**: {what}
- **Manual**: {what to click/verify}

## Open Questions
- {only if needed}
```

### 6. Confirm

- Show the updated body
- Make final edits based on user feedback

## Success Criteria

- Issue has enough detail for implementation without follow-ups
- Acceptance criteria are unambiguous and testable
