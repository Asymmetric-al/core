---
description: Analyze staged changes and create a conventional commit message following project standards.
---

# Workflow: commit

# Commit

Analyze staged changes and create a conventional commit message following project standards.

## Context

- **Project**: Asymmetric.al
- **Commit Convention**: Conventional Commits with strict rules (enforced by commitlint + husky)
- **Types**: feat, fix, docs, style, refactor, test, chore, perf, ci, build, revert
- **Format**: `type(scope): subject` (scope optional)
- **Constraints**:
  - Header max 100 characters
  - Subject cannot end with period
  - Subject cannot be empty
  - Type must be lowercase
- **Issue References**: Include `ref AL-###` in commit body when applicable

## Workflow

### 1. Check Git Status

```bash
git status
```

Read any files if you need more context.

### 2. Write commit message

DO NOT use emojis anywhere in your commit message.

#### 2.1 Detect issue context

Auto-detect if working on an Asymmetric.al issue:

- Check current branch name for issue ID pattern `AL-\d+`
- Check recent commits for `ref AL-\d+` pattern
- Check if draft PR exists with `fixes AL-\d+`

If issue detected:

- Extract issue ID(s)
- Include them in commit body as `ref AL-###` (space-separated if multiple)

#### 2.2 Analyze changes and generate message

**Determine Commit Type** based on the diff:

- `feat`: New features
- `fix`: Bug fixes
- `test`: Tests only
- `docs`: Docs only
- `style`: Formatting only (no logic changes)
- `refactor`: Restructure (no behavior change)
- `perf`: Performance improvements
- `chore`: Maintenance (deps/config)
- `ci`: CI/CD changes
- `build`: Build system/deps

#### 2.3 Determine scope (optional)

Based on affected area (workspace / package / feature).

#### 2.4 Write subject

- Imperative mood
- Clear, specific
- Keep the full header ≤ 100 chars

#### 2.5 Write body (when useful)

- Explain WHY (not what)
- Include issue refs:
  - `ref AL-123`
  - `ref AL-123 AL-124`
- Wrap lines at ~100 chars

### 3. Commit

```bash
git commit -m '<commit_message>'
```
