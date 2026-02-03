# Working Set (AI)

Agents MUST keep this file updated during a task. Use it to build the Nia query preamble.

## Current objective
- Identify UI contrast issues and create a batch of AL-### GitHub issues with labels.

## Repo scope
- repository: Asymmetric-al/core
- in-scope paths (if known):
  - AGENTS.md
  - docs/
  - rules/
  - .github/

## Stack tags (pick from docs/ai/stack-registry.md)
- Next.js
- React
- TypeScript
- Tailwind CSS v4
- shadcn/ui
- MAIA theme

## Known identifiers (exact strings)
- files:
  - src/app
  - src/components
  - src/features
- symbols:
  - className
  - cn(
- routes:
  - N/A
- error strings:
  - N/A
- UI terms:
  - contrast
  - text-muted
  - text-zinc
  - text-neutral
  - text-slate
  - text-gray
  - text-foreground
  - bg-muted
  - bg-zinc
  - bg-neutral
  - bg-slate
  - bg-gray
  - bg-background
  - opacity-

## Expected behavior
- Find contrast risks in UI components/pages and translate them into actionable issues with acceptance criteria.

## Constraints
- runtime: Node.js
- tooling: Bun/Turbo
- env/platform notes:
  - No PRs, branches, commits, or tags; issues only.

## Verification
- N/A (issue discovery only)

## Nia query preamble (fill before calling Nia)
Repo: Asymmetric-al/core
Goal: Locate UI contrast risks for issue drafting
Area: src/app, src/components, src/features, styles
Stack: Next.js, React, TypeScript, Tailwind CSS v4, shadcn/ui, MAIA theme
Keywords: contrast, text-muted, text-foreground, bg-muted, bg-background, opacity-, className, cn(
Constraints: issues only; cite exact files + classes
Evidence required: file paths + class strings + brief explanation
