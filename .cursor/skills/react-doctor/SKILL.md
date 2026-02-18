---
name: react-doctor
description: Installs and runs Million's React Doctor to audit a Next.js/React codebase for performance, security, correctness, and architecture issues. Use when the user mentions react-doctor, React Doctor, millionco/react-doctor, performance audits, code health, bundle size, or suspicious React patterns.
---

# React Doctor (Million)

Run an automated audit of a React/Next.js codebase and turn the diagnostics into a prioritized fix list.

## Quick Start

Install/refresh the skill (optional):

```bash
npx skills add millionco/react-doctor
```

Run React Doctor in the repo root:

```bash
npx -y react-doctor@latest . --verbose
```

## Workflow

1. Confirm you are at the project root (the directory that contains `package.json`).
2. If the skill is missing/outdated, run:
   - `npx skills add millionco/react-doctor`
3. Run the audit:
   - `npx -y react-doctor@latest . --verbose`
4. Convert the output into an actionable plan:
   - Capture the overall score (0-100).
   - List the top issues by severity (errors first).
   - For each issue: include the file path, what to change, and why it matters.
5. Fix issues starting with highest severity and highest leverage (security/correctness before perf polish).
6. Re-run the audit and confirm the score improves:
   - `npx -y react-doctor@latest . --verbose`

## Next.js App Router Notes

When triaging results for Next.js App Router projects, prioritize:

- Async Client Components (often accidental `"use client"` leaks)
- Client-side fetching for server-owned data (prefer Server Components / Route Handlers)
- Missing/incorrect `metadata` exports
- Server Actions without auth checks
- Excessive client bundle growth (barrel imports, large deps)

## Expected Output (Assistant)

When reporting results back, format as:

```markdown
React Doctor score: <number>/100

Top findings:

- <severity> <short title> — <path(s)>
- ...

Fix plan:

1. <most important fix> (why)
2. ...

Verification:

- npx -y react-doctor@latest . --verbose
```

## Checklist

- [ ] (Optional) `npx skills add millionco/react-doctor`
- [ ] `npx -y react-doctor@latest . --verbose`
- [ ] Findings summarized with file paths
- [ ] Fixes applied in severity order
- [ ] Audit re-run and score verified improved
