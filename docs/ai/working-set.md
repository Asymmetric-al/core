# Working Set (AI)

Agents MUST keep this file updated during a task. Use it to build the Nia query preamble.

## Current objective
- Update contribution docs to enforce fork + PR workflow targeting develop (not main).

## Repo scope
- repository: Asymmetric-al/core
- in-scope paths (if known):
  - AGENTS.md
  - docs/
  - rules/
  - skills/
  - .github/

## Stack tags (pick from docs/ai/stack-registry.md)
- GitHub Actions
- Next.js

## Known identifiers (exact strings)
- files:
  - AGENTS.md
  - rules/general.md
  - CONTRIBUTING.md
  - README.md
  - MAINTAINERS.md
  - .github/
- symbols:
  - N/A
- routes:
  - N/A
- error strings:
  - N/A
- UI terms:
  - N/A
- repo terms:
  - fork
  - upstream
  - origin
  - develop
  - main
  - default branch
  - base branch
  - pull request
  - PR
  - target branch
  - merge into
  - branch policy

## Expected behavior
- Docs describe fork → branch → PR to upstream develop, with maintainer-only merges to main.

## Constraints
- runtime: N/A
- tooling: Nia + rg for fallback
- env/platform notes:
  - Docs changes only; no code changes.

## Verification
- N/A (documentation lookup)

## Nia query preamble (fill before calling Nia)
Repo: Asymmetric-al/core
Goal: Locate contribution docs and any wording that assumes direct pushes or PRs to main
Area: CONTRIBUTING.md, README.md, docs/, rules/, skills/, .github/
Stack: GitHub Actions, Next.js
Keywords: fork, upstream, origin, develop, main, "main branch", "base branch", "pull request", "PR", "push", "direct push", "protected branch"
Constraints: docs only; cite exact files + phrasing
Evidence required: file paths + exact wording + brief explanation
