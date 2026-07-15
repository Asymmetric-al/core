---
name: react-doctor
description: Installs and runs Million's React Doctor to audit a React or Next.js codebase for performance, security, correctness, and architecture issues. Use when the user mentions react-doctor, React Doctor, millionco/react-doctor, performance audits, code health, bundle size, or suspicious React patterns.
---

# React Doctor (Million)

Run an automated audit of a React/Next.js codebase and turn the diagnostics into a prioritized fix list.

## Quick Start

In this repository, use the repo-owned first-party helper from the repo root:

```bash
bun run react-doctor:first-party -- --full --offline --fail-on none
```

The human guide is `docs/guides/development/react-doctor.md`. It is the source of truth for configured ignores, advisory `blocking` behavior, and PR wording.

## Workflow

1. Confirm you are at the project root (the directory containing `package.json`).
2. Read `docs/guides/development/react-doctor.md`.
3. Run the configured repo audit:
   - `bun run react-doctor:first-party -- --full --offline --fail-on none`
4. Convert the output into an actionable plan:
   - Capture the overall score (0-100).
   - List the top issues by severity (errors first).
   - For each issue, include the file path, what to change, and why it matters.
5. Fix issues starting with highest severity and highest leverage (security/correctness before perf polish).
6. Re-run the configured audit and confirm the result for `apps` and `packages`.
7. Report results honestly as the configured first-party audit. Do not imply that ignored rules were fixed.

## Next.js App Router Notes

When triaging results for Next.js App Router projects, prioritize:

- Async Client Components (often accidental `"use client"` leaks)
- Client-side fetching for server-owned data (prefer Server Components / Route Handlers)
- Missing or incorrect `metadata` exports
- Server Actions without auth checks
- Excessive client bundle growth (barrel imports, large dependencies)

## Expected Output

When reporting results back, format as:

```markdown
React Doctor score: <number>/100

Top findings:

- <severity> <short title> -- <path(s)>
- ...

Fix plan:

1. <most important fix> (why)
2. ...

Verification:

- bun run react-doctor:first-party -- --full --offline --fail-on none
```

## Triggers

- User mentions react-doctor, React Doctor, or millionco/react-doctor
- User asks for a React or Next.js audit covering performance, correctness, security, or architecture
- User wants a focused code health pass on suspicious React patterns or bundle growth

## Checklist

- [ ] Read `docs/guides/development/react-doctor.md`
- [ ] `bun run react-doctor:first-party -- --full --offline --fail-on none`
- [ ] Findings summarized with file paths
- [ ] Fixes applied in severity order
- [ ] Audit re-run and configured-audit score verified
- [ ] Known ignores and advisory `blocking` behavior reported honestly
