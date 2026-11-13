**Done**

- `contrib-attention-title-1024`: attention titles now wrap. Updated the existing structural test.
- `contrib-received-detail`: shortened the Received caption while retaining net-of-refunds wording.
- `contrib-correction-name`: approval cards now say “Amount correction.” Updated copy assertions.
- `contrib-toolbar-1024`: Type and Payment move into More filters at 1024–1279px; hidden applied filters remain counted.
- `contrib-source-filter`: disclosure now reads “More filters · Source.” Added discoverability and filter-interaction tests.
- `crm-resend-summary-clip`: fieldless dialogs now focus the popup without scrolling. Added red-green regressions for cached and asynchronously loaded detail.

Changes are limited to [main-body.tsx](<C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/app/(app)/contributions/main-body.tsx>), [needs-attention-panel.tsx](<C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/app/(app)/contributions/needs-attention-panel.tsx>), [correction-approval-panel.tsx](<C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/app/(app)/contributions/correction-approval-panel.tsx>), [operation-shell.tsx](<C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/app/(app)/contributions/operation-shell.tsx>) and their four test files.

**Not needed:** None.

**Skipped / needs another owner**

- `contrib-cards-desktop`: shared [DataGridPanel](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/packages/ui/components/data-grid-panel/data-grid-panel.tsx:227) owns the column layout. Lead should add a supported denser layout with balanced trailing rows and update its test, which explicitly forbids three columns at `xl`.
- Lead browser verification remains required at 1440/1024/640/390px, especially resend-summary visibility at 1440/390px.
- Finance-owned files were untouched.

**Commands run**

- `bunx vitest run --config vitest.config.mts …`: **9 suites, 284 tests passed**. No hub-grid failures reproduced.
- `node tooling/eslint-config/lint.mjs <four changed source files>`: **passed**.
- `bunx prettier --write <eight changed files>`: **passed**.
- `bunx tsc --noEmit --incremental false -p apps/admin`: **passed**.
- `bunx --bun shadcn info --json`: confirmed Base UI, `base-maia`, Zinc.
- ReUI checklist and source scans reviewed. Browser checks and React Doctor were not run under the task boundaries.
