# Working Set (AI)

Agents MUST keep this file updated during a task. Use it to build the Nia query preamble.

## Current objective
- Add an `issue-commit` skill and `/issue-commit` command, and update AL-### issue flow docs.

## Repo scope
- repository: Asymmetric-al/core
- in-scope paths (if known):
  - AGENTS.md
  - .cursor/commands/
  - .cursor/rules/
  - skills/
  - contribution-workflow.md
  - docs/ai/

## Stack tags (pick from docs/ai/stack-registry.md)
- Node.js
- Bun
- ESLint, Prettier
- GitHub Actions

## Known identifiers (exact strings)
- files:
  - skills/issue-commit/SKILL.md
  - .cursor/commands/issue-commit.md
  - contribution-workflow.md
- symbols:
  - /issue-commit
  - issue-commit
  - ref AL-
  - fixes AL-
- routes:
  - N/A
- error strings:
  - N/A

## Expected behavior
- Skill and command docs align with AL-### issue flow and commit conventions.

## Constraints
- runtime: Node.js
- tooling: Bun/Turbo
- env/platform notes:
  - Documentation-only updates; no code behavior changes.

## Verification
- N/A (docs/workflow only)

## Nia query preamble (fill before calling Nia)
Repo: Asymmetric-al/core
Goal: Align issue-commit skill and command with AL-### workflow
Area: skills/, .cursor/commands/, AGENTS.md, contribution-workflow.md
Stack: Node.js, Bun, ESLint, Prettier, GitHub Actions
Keywords: issue-commit, /issue-commit, ref AL-, fixes AL-, Conventional Commits
Constraints: docs only; cite exact files + sections
Evidence required: file paths + headings + brief explanation
