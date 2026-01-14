---
name: write-issue
description: Write or improve an Asymmetric.al GitHub issue identified by AL-###. Use GitHub MCP to find/fetch/update the issue, then enhance it with concrete codebase context, risks, and testable acceptance criteria so it’s ready to implement.
---

# Workflow: write-issue

## Goal
Draft or upgrade a GitHub issue for Asymmetric.al so it is implementation-ready, using **AL-###** as the identifier and enriching it with specific codebase context.

## Non-negotiables
- **Identifier**: Always use `AL-###` (e.g., `AL-123`) as the issue identifier and include it in the title as `AL-###: <short title>`.
- **System**: GitHub Issues, via **GitHub MCP**.
- **No Projects**: Do not add GitHub Projects steps unless explicitly asked by the user.

---

## Inputs (ask only if missing)
1) The `AL-###` key (required)
2) If the issue already exists: repo (owner/name) and optionally issue URL/number  
3) Short title + problem statement (required if issue does not exist)

---

## Workflow

### 1) Confirm the `AL-###` key
- If the user did not provide it, ask for it.
- Validate format: `AL-` followed by digits.

### 2) Locate the issue in GitHub (MCP)
**Preferred**: If the user provided repo + issue URL/number, fetch it and verify the title includes `AL-###`.

**Otherwise (AL-### only)**:
- Use GitHub MCP to search issues in the target repo for `AL-###` (search title/body).
- If multiple matches:
  - Prefer exact title prefix `AL-###:`
  - Otherwise, list candidates (number + title) and ask the user to choose.

**If no match is found**:
- Proceed as “new issue” and create it.

#### GitHub MCP steps (inside the skill)
- If repo is unknown: ask which repo to use (owner/name).
- Search issues for `AL-###`.
- If found: fetch issue details (title/body/labels/assignees/milestone, if present).
- If not found: create a new issue with:
  - **Title**: `AL-###: <short title>`
  - **Body**: use the template in Step 6 (initially filled from user input)

### 3) Extract requirements from the issue (or user input)
- Summarize “what + why” in 2–4 sentences.
- Identify implied constraints (performance, security, UX, data integrity).
- Identify unknowns.

### 4) Analyze codebase context (workspace)
Based on the issue description:
- Identify impacted areas/files (paths).
- Find similar patterns/precedents in the repo and reference them by path.
- Call out risks and edge cases.
- Propose a testing approach.

### 5) Ask targeted questions (only what’s required)
Ask only if you cannot produce implementation-ready detail:
- Scope: what’s explicitly in/out?
- Acceptance criteria: what must be true?
- Dependencies: other issues/PRs/services?
- Rollout/compat: flags, migrations, backwards compatibility?
- Testing: unit/integration/e2e/manual expectations?

### 6) Produce the enhanced issue body
Generate an updated issue body that is ready to paste/update:

```markdown
## Overview
{What and why}

## Technical Context
- **Affected areas/files**:
  - `{path}` — {why}
  - `{path}` — {why}
- **Related code/patterns**:
  - `{path}` — {what it demonstrates}
- **Constraints / invariants**:
  - {bullets}
- **Notes**:
  - {bullets}

## Implementation Approach
1. {step}
2. {step}
3. {step}

## Acceptance Criteria
- [ ] {specific, testable}
- [ ] {specific, testable}
- [ ] Tests pass (`bun run lint && bun run typecheck && bun run build`)

## Testing Notes
- **Unit**: {what}
- **Integration**: {what}
- **E2E/Playwright**: {what (if applicable)}
- **Manual**: {what to click/verify}

## Risks / Edge Cases
- {bullets}

## Open Questions
- {only if needed}