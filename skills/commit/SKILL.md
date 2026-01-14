# Commit — Skill
**Name:** `commit`
**Purpose:** Create a Conventional Commit message for staged changes and run `git commit`.
Use this skill when you are ready to commit work in this repo.

**Applies when:** Changes are staged and you need a commit message.
**Do not use when:** Nothing is staged or you are not using Git.

## Rules
- Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `perf`, `ci`, `build`, `revert`.
- Header format: `type(scope): subject` (scope optional).
- Header max length: 100 characters.
- Subject: imperative, no trailing period, no emojis.
- Issue refs: include `ref AL-###` in the body only when applicable.

## Workflow
1. Confirm something is staged.
2. Review staged diff and affected paths.
3. Detect relevant `AL-###` keys (branch, diff, or recent commits).
4. Choose the best commit type and optional scope.
5. Write an imperative subject (<= 100 chars).
6. Compose the commit message, then run `git commit`.

## Checklists

### Pre-commit checklist
- [ ] `git status` shows staged changes
- [ ] Issue key(s) identified or explicitly absent

### Review checklist
- [ ] Header is <= 100 characters
- [ ] Type is lowercase and valid
- [ ] No emojis
- [ ] `ref AL-###` included only when applicable

## Minimal examples

### Commit without body
```bash
git commit -m "fix(auth): handle empty session"
```

### Commit with body + issue refs
```bash
git commit -m "feat(billing): add invoice export" -m "Add export endpoint and UI action" -m "ref AL-123"
```

## Common mistakes / pitfalls
- Committing with no staged changes
- Using vague subjects ("update stuff")
- Exceeding header length
- Adding `ref AL-###` when no issue applies
