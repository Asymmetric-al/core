---
name: commit
description: Analyze staged changes and generate a Conventional Commit message (max 100 char header) for Asymmetric.al, including ref AL-### in the body when applicable, then run git commit.
---

# commit

Analyze staged changes and create a Conventional Commit message that matches Asymmetric.al standards, then commit.

## Standards
- Conventional Commits types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `perf`, `ci`, `build`, `revert`
- Header format: `type(scope): subject` (scope optional)
- Header max length: 100 characters
- Subject: imperative mood, non-empty, no trailing period
- Type: lowercase
- No emojis anywhere
- If applicable: include issue references in the body as `ref AL-###` (space-separated if multiple)

## Workflow

### 1) Pre-flight checks
Confirm there is something staged.

```bash
git status
```

If there are no staged changes, STOP and tell the user to stage files (or ask if they want to commit all changes).

### 2) Analyze staged changes
Read the staged diff and affected paths:

```bash
git diff --staged
git diff --staged --name-only
```

Summarize in 3–6 bullets what changed.

### 3) Detect issue context (AL-###)
Try to infer relevant issue keys:

- Current branch name contains `AL-\d+` (e.g., `al-123-...` or `AL-123-...`)
- Staged diff mentions `AL-\d+`
- Recent commits mention `ref AL-\d+`

If one or more issue keys are found:
- Deduplicate and keep them in ascending numeric order.
- Prepare a commit body line: `ref AL-123` or `ref AL-123 AL-124`

If no issue key is found:
- Do not invent one.
- Omit the `ref` line.

### 4) Select commit type
Choose ONE type using these rules:

- `docs`: only documentation changes (README, docs, markdown)
- `test`: only tests
- `style`: formatting only, no logic change
- `ci`: CI workflow/config
- `build`: build tooling / bundlers / build scripts
- `perf`: performance improvement
- `refactor`: restructure with no user-visible behavior change
- `fix`: bug fix
- `feat`: new feature or capability
- `chore`: maintenance that doesn’t fit above (deps/config/hygiene)
- `revert`: revert a prior commit (only when explicitly reverting)

If changes span multiple categories:
- Prefer `fix` over `refactor`
- Prefer `feat` over `chore`
- Otherwise pick the type that best matches the primary intent

### 5) Select optional scope
Scope should be short and stable. Derive from the dominant area changed:
- top-level folder (e.g. `auth`, `billing`, `ui`, `supabase`, `graphql`, `tests`, `ci`)
- or package/workspace name if monorepo

If scope is unclear, omit it.

### 6) Write subject
- Imperative, specific, no period
- Avoid vague verbs (e.g., “update”, “fix stuff”)
- Keep header <= 100 chars (including `type(scope): `)

### 7) Compose commit message
Output the final message in this structure:

Header:
- `type(scope): subject` OR `type: subject`

Body (optional):
- 1–3 wrapped lines explaining WHY (not a changelog)
- final line with issue refs if applicable:
  - `ref AL-123`
  - `ref AL-123 AL-124`

### 8) Commit
Use a single commit command.
- If no body is needed:

```bash
git commit -m "type(scope): subject"
```

- If body is needed (including `ref ...`), use multiple `-m` flags:

```bash
git commit -m "type(scope): subject" -m "Body line(s) here" -m "ref AL-123"
```

Before running the commit, print the exact command you will run.

## Success criteria
- Commit succeeds
- Header complies with formatting and length
- No emojis
- Includes `ref AL-###` when applicable (and only when applicable)
