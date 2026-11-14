**Done**

- `automations-settings-link`, `automations-notes-placement`: removed the unrelated Support settings link; combined management and cap guidance below the KPIs in the [Automations page](<C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/app/(app)/automations/page-client.tsx>). Added placement coverage and resolved the reported copy mismatch.
- `moderation-real-view`: removed the shell-identity prerequisite while preserving server authorization and identity-partitioned cache keys. Added readable badges and shared date formatting in the [Moderation page](<C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/app/(app)/feed/content-moderation-page-client.tsx>) and [read hook](<C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/app/(app)/feed/use-moderation-feed.ts>). Added unresolved-identity and presentation regressions.
- `org-updates-honesty`: replaced repeated notices and the disabled primary action with one shared empty state and working alternatives in [Org updates](<C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/app/(app)/feed/org-updates/page-client.tsx>). Updated its component test.
- `tasks-dates-and-scope`: used shared, month-name date formatting in the [follow-ups grid](<C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/app/(app)/tasks/follow-ups-grid.tsx>) and disclosed retired team to-dos in [Tasks](<C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/app/(app)/tasks/tasks-content.tsx>). Updated coverage.
- `workflow-chart-colours`, `workflow-chart-or-trend`: removed the duplicate outcome chart and its unused component from [Workflow runs](<C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/app/(app)/workflows/page-client.tsx>). Updated loading, summary and error tests.
- `pdf-studio-notices`, `pdf-banner-duplicate`: made one shared Alert the export-limit explanation, referenced by the disabled menu item; moved Open template into the toolbar in [PDF Studio](<C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/app/(app)/pdf/page-client.tsx>). Updated explanation coverage and added a toolbar-handler test.

**Not needed:** None.

**Skipped:** No implementation items. Live responsive, keyboard and focus verification was not run under the brief’s server/localhost prohibition.

**Needs another owner:** Lead to capture and verify changed surfaces at 1440, 1024, 640 and 390 px, especially PDF toolbar fit. No shared-package changes required.

**Commands run**

- Focused red/green Vitest runs, then `bunx vitest run --config vitest.config.mts` with owned and adjacent tools paths: **15 suites, 118 tests passed**.
- `node tooling/eslint-config/lint.mjs` on eight changed source files: **passed**.
- `bunx prettier --write` on fourteen touched files: **passed**.
- `bunx tsc --noEmit --incremental false -p apps/admin`: **passed**.

All edits stayed in `-r12`; no git state changes, servers, localhost requests, turbo or subagents.
