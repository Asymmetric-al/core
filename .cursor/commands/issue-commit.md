# /issue-commit

**Purpose:** Create a Conventional Commit message for staged changes during an `AL-###` issue workflow.
Use this command when you are ready to commit work and before `/issue-ship`.

**When to use:** You have staged changes tied to an `AL-###` issue and need a commit.
**Do not use when:** Nothing is staged or you are not using Git.

## Rules

- Issue keys must match `AL-###` when applicable.
- Commit format: `type(scope): subject` (scope optional).
- Header max length: 100 characters.
- Subject is imperative, not empty, and has no trailing period.
- Type must be lowercase and valid.
- No emojis in the commit message.
- Include `ref AL-###` in the body only when applicable.

## Workflow

1. **Confirm staged changes:** Run `git status` and ensure there are staged files.
2. **Review staged diff:** Understand the change set and affected areas.
3. **Detect issue context:** Check branch name, recent commits, and draft PR body for `AL-###`.
4. **Draft commit header:** Select type and optional scope; write an imperative subject.
5. **Add body (if needed):** Explain why and include `ref AL-###` line(s).
6. **Commit:** Run `git commit` with the finalized message.

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

```bash
git commit -m "fix(auth): handle empty session" -m "ref AL-123"
```

## Common mistakes / pitfalls

- Committing with no staged changes
- Using vague subjects ("update stuff")
- Exceeding header length
- Adding `ref AL-###` when no issue applies
