**Done**

- `support-board-card-row`: moved the menu beside the avatar in [BoardCard.tsx](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/features/support-hub/components/board/BoardCard.tsx), preserving separate open/move controls.
- `support-agent-setup-alert`: added a dismissible, role-aware [setup notice](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/features/support-hub/components/alerts/SupportAgentSetupNotice.tsx), linked admins to Collaborators, and placed it above the summary.
- `support-open-card-caption`: restored a short “Awaiting first reply” caption in [StatsStrip.tsx](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/features/support-hub/components/stats/StatsStrip.tsx).
- `support-polish`: added specific settings headings and panel spacing, removed duplicate breadcrumbs, replaced the scroll glyph, standardized inline settings deletion, matched note/email typography, corrected relative-time semantics and spacing, and distinguished the agents report’s table caption.
- Added setup-notice tests; updated board, time, caption, page-chrome, and settings action/access tests. Behavior fixes used failing tests first.

**Not needed:** None.

**Skipped:** Live browser and responsive verification, per the no-server/localhost boundary.

**Needs another owner:** None outstanding. The earlier studio type error was absent on the final typecheck.

**Commands run**

- `bunx vitest run --config vitest.config.mts …`: surrounding Support run passed 566/567 tests; its caption-length failure was corrected. Final affected checks passed **46/46**.
- Settings-only recheck: **15 suites, 167/167 tests passed**. No remaining Support settings failures reproduced.
- `node tooling/eslint-config/lint.mjs <16 changed source files>`: passed.
- `bunx prettier --write <23 changed files>`: passed.
- `bunx tsc --noEmit --incremental false -p apps/admin`: final run passed.
- `shadcn info --json`: confirmed Base UI, `base-maia`, and Zinc configuration.

All edits stayed in `t3-5a24111d-r12`; no Git state changes.
