# Issue Commit — Skill

**Name:** `issue-commit`
**Purpose:** Create a Conventional Commit message for staged changes and run `git commit` within the AL-### issue flow.
Use this skill when you are ready to commit work tied to an `AL-###` issue.

**Applies when:** Changes are staged and you need a commit message for an `AL-###` issue.
**Do not use when:** Nothing is staged or you are not using Git.

## Context

- **Commit convention:** Conventional Commits (types below), matching repo standards.
- **Format:** `type(scope): subject` (scope optional).
- **Constraints:** Header max 100 characters, subject is imperative and does not end with a period, no emojis.
- **Issue references:** Include `ref AL-###` in the body only when applicable.

## Rules

- Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `perf`, `ci`, `build`, `revert`.
- Header format: `type(scope): subject` (scope optional).
- Header max length: 100 characters.
- Subject: imperative, not empty, no trailing period, no emojis.
- Type must be lowercase.
- Body lines should be 100 characters or less.
- Issue refs: include `ref AL-###` in the body only when applicable.

## Workflow

1. **Check git status:** Confirm there are staged changes.
2. **Review staged diff:** Understand what changed and the affected areas.
3. **Detect issue context:**
   - Check branch name for `AL-###` or `al-###` and normalize to `AL-###`.
   - Check recent commits for `ref AL-###`.
   - Check draft PR body for `fixes AL-###` (if available).
4. **Determine commit type:** Choose based on the nature of the changes.
5. **Determine scope (optional):** Use the affected area (feature/component/service/workspace).
6. **Write subject:** Clear, imperative, <= 100 chars total (including type/scope).
7. **Write body (if needed):**
   - Explain why, not what.
   - Add one `ref AL-###` line per relevant issue.
   - Leave a blank line between subject and body.
8. **Commit:** Run `git commit` with the finalized message (no emojis).

## Checklists

### Pre-commit checklist

- [ ] `git status` shows staged changes
- [ ] Issue key(s) identified or explicitly absent

### Review checklist

- [ ] Header is <= 100 characters
- [ ] Type is lowercase and valid
- [ ] Subject is imperative and has no trailing period
- [ ] No emojis
- [ ] `ref AL-###` included only when applicable

## Minimal examples

### Commit without body

```bash
git commit -m "fix(auth): handle empty session"
```

### Commit with body + issue refs

```bash
git commit -m "feat(billing): add invoice export" -m "Explain why the export is needed" -m "ref AL-123"
```

## Common mistakes / pitfalls

- Committing with no staged changes
- Using vague subjects ("update stuff")
- Exceeding header length
- Adding `ref AL-###` when no issue applies
