# React Doctor

## Triggers

- Run React Doctor before React, Next.js, or shared UI changes are considered ready.
- Run it after broad refactors, component cleanup, or before opening a UI-heavy PR.
- Use the first-party helper for this monorepo instead of scanning vendored code.

## Workflow

1. Run `bun run react-doctor:first-party -- --full --offline --fail-on none`.
2. Fix errors and high-confidence warnings in source code first.
3. Keep repo-level exceptions in `react-doctor.config.json` so repeated scans are deterministic.
4. Pair React Doctor with the normal repo gates: lint, typecheck, and unit tests.

## Checklist

- [ ] React Doctor reports `100/100` for `apps`.
- [ ] React Doctor reports `100/100` for `packages`.
- [ ] No React Doctor errors remain before exceptions are applied.
- [ ] Any new ignored rule has a repo-specific reason and is not masking a known bug.
- [ ] Relevant lint/typecheck/test commands have been run for touched surfaces.
