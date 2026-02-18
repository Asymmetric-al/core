# Working Set

Agents MUST keep this file updated during a task. Use it to build the Nia query preamble.

## Current objective
- Resolve verification Comment 1 for ticket T8 conventions documentation.
- Ensure `docs/conventions.md` satisfies required sections:
  folder structure conventions, code style tables, examples, and a pre-commit checklist.
- Ensure root `CONTRIBUTING.md` points to `docs/conventions.md`.

## Repo scope
- repository: Asymmetric-al/core
- in-scope paths:
  - docs/conventions.md
  - CONTRIBUTING.md
  - docs/ai/working-set.md

## Stack tags
- Markdown
- Documentation
- Contributing workflow
- Monorepo conventions

## Known identifiers
- files:
  - docs/conventions.md
  - CONTRIBUTING.md
  - docs/ai/working-set.md
- strings:
  - docs/conventions.md
  - Folder Structure Conventions
  - Code Style Conventions
  - Examples
  - Pre-Commit Checklist

## Expected behavior
- `docs/conventions.md` exists and includes required sections and tables.
- `CONTRIBUTING.md` includes a clear pointer to `docs/conventions.md`.
- Markdown formatting is valid and readable.

## Constraints
- Keep diff minimal and documentation-only unless a blocker appears.
- Do not invent external ticket details not present in repo evidence.
- Do not include secrets or credentials.

## Verification
- `rg -n "docs/conventions.md" CONTRIBUTING.md`
- `Get-Content docs/conventions.md -Raw`
- `git diff -- docs/conventions.md CONTRIBUTING.md docs/ai/working-set.md`

## Verification status
- In progress.
