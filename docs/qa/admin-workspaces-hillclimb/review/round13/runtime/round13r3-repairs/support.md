# Round13r3 Support repairs

Implemented only in the r12 checkout after root closed Round13r2 collection and lifted its source freeze. Existing evidence remains historical.

## Changes

- BoardCard: unassigned marker is decorative (`aria-hidden`) instead of a generic span carrying prohibited `aria-label`. The parent conversation button retains its complete assignment label.
- TicketTime: reuse `useLocaleFormat().formatDateTime`, retaining datetime and Not scheduled. SSR and initial hydration use en-US/UTC; subsequent display uses the visitor environment.

## Regression proof

Both new cases failed before product edits: the generic marker retained aria-label, and Bangkok-host server text was 7:30 AM instead of UTC 12:30 AM. After repair the two component suites passed 12 tests. The final hydration case runs first to avoid reusing a default Intl formatter cached before changing process TZ. It verifies server text is UTC while process TZ is Los Angeles, no recoverable hydration errors, and post-hydration local text differs from UTC. TZ is restored in finally; no env file changed. This is jsdom React SSR/hydration evidence, not live Next browser evidence or a production mismatch reproduction.

Commands: bunx vitest run --config vitest.config.mts tests/unit/apps/admin/features/support-hub/components/board-card.test.tsx tests/unit/apps/admin/features/support-hub/components/tickets-table.test.tsx --maxWorkers=1. Scoped product ESLint and four-file Prettier passed. Follow-up run additionally includes tests/unit/packages/lib/use-locale-format.test.tsx; all three suites passed, 23 tests total.

## Remaining checks

Admin integration typecheck passed: bunx tsc --noEmit --incremental false -p apps/admin (exit 0). Exact browser axe aria-prohibited-attr check and affected fresh captures remain pending. Test-file lint retains two pre-existing no-restricted-imports errors in tickets-table.test.tsx at its app source/type imports; new import-order warnings were corrected, and no lint rule was weakened. No broad accessibility, visual score or final acceptance claim. No Git, provider, server, money submission or environment-file operations.
