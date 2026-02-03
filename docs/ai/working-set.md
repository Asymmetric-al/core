# Working Set (AI)

Agents MUST keep this file updated during a task. Use it to build the Nia query preamble.

## Current objective
- Draft and upgrade AL-001 (admin dashboard padding) to implementation-ready.

## Repo scope
- repository: Asymmetric-al/core
- in-scope paths (if known):
  - src/app/(admin)/mc/admin/page.tsx
  - src/app/(admin)/mc/mc-shell.tsx
  - src/app/(admin)/mc/contributions/page.tsx
  - src/app/(admin)/mc/care/page.tsx
  - src/app/globals.css

## Stack tags (pick from docs/ai/stack-registry.md)
- Next.js (App Router)
- React
- TypeScript
- Tailwind CSS v4

## Known identifiers (exact strings)
- files:
  - src/app/(admin)/mc/admin/page.tsx
  - src/app/(admin)/mc/mc-shell.tsx
  - src/app/(admin)/mc/contributions/page.tsx
  - src/app/(admin)/mc/care/page.tsx
  - src/app/globals.css
- symbols:
  - container-responsive
  - py-responsive-section
  - /mc/admin
  - /mc/contributions
  - /mc/care
- routes:
  - /mc/admin
  - /mc/contributions
  - /mc/care
- error strings:
  - N/A

## Expected behavior
- Admin dashboard homepage has consistent horizontal padding with other MC pages.

## Constraints
- avoid double padding on MC pages
- env/platform notes:
  - Issue drafting only; no code changes.

## Verification
- Manual check at 375px, 768px, 1024px for `/mc/admin` vs `/mc/contributions`.

## Nia query preamble (fill before calling Nia)
Repo: Asymmetric-al/core
Goal: Find MC admin padding patterns for AL-001
Area: src/app/(admin)/mc, src/app/globals.css
Stack: Next.js (App Router), React, TypeScript, Tailwind CSS v4
Keywords: /mc/admin, mc-shell, container-responsive, py-responsive-section, admin page
Constraints: avoid double padding; cite exact files + components
Evidence required: file paths + component names + brief explanation
