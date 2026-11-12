# R13 Contributions card layout

Implemented original `contrib-cards-desktop` locally in `C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12`.

The owning evidence was the frozen [wave A brief](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d/docs/qa/admin-workspaces-hillclimb/review/round13/work/wave-a-crm-contributions.md) and the [Contributions builder handoff](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/docs/qa/admin-workspaces-hillclimb/review/round13/builders/contributions.md). No new browser evidence was collected.

## Exact files changed

- [packages/ui/components/data-grid-panel/data-grid-panel.tsx](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/packages/ui/components/data-grid-panel/data-grid-panel.tsx): added the supported optional `cardLayout?: "default" | "balanced"` API and shared count-aware card placement.
- [tests/unit/packages/ui/data-grid-panel.test.tsx](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/tests/unit/packages/ui/data-grid-panel.test.tsx): added opt-in/count and compatibility coverage at the real shared component boundary. The existing default assertion that forbids `xl:grid-cols-3` remains intact.
- [apps/admin/app/(app)/contributions/main-body.tsx](<C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/app/(app)/contributions/main-body.tsx>): added only `cardLayout="balanced"` to the existing `DataGridPanel`.
- [tests/unit/apps/admin/app/contributions-hub-grid.test.tsx](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/tests/unit/apps/admin/app/contributions-hub-grid.test.tsx): added one focused assertion for the real Contributions card-view composition and ten-card trailing rows.
- This report.

The existing `DataGridPanelProps` export already exposes the new prop; no type barrel change was needed. No other source, primitive, theme, lint policy, exception, or suppression was edited.

## Layout contract

Default consumers retain the existing `grid-cols-1 md:grid-cols-2 2xl:grid-cols-3` layout. The opt-in changes placement only while cards render:

- Below `md`: the existing single-column phone list.
- From `md` through widths below `xl`: two columns; an odd final card spans the full row.
- From `xl`: six equal tracks support three cards spanning two tracks each, or two cards spanning three tracks each. A sole result spans the full row.
- When the displayed count is `3n + 1`, the last four cards form two pairs. Other incomplete desktop rows finish with a pair. Balancing reads `table.getRowModel().rows`, independently of the overall `recordCount`.

Examples: six cards form `3 + 3`; seven form `3 + 2 + 2`; ten form `3 + 3 + 2 + 2`; four form `2 + 2`. No filler cards, DOM reordering, extra wrappers, fixed card widths, arbitrary classes, or app-local card styles were introduced. Existing one-cell grids continue stretching each card and containing long text with `minmax(0, 1fr)`.

## Red / green evidence

1. Baseline: shared panel, auto-view, and Contributions hub-grid suites passed: **3 suites / 75 tests**. Raw lint of the two owning source files produced no findings.
2. Shared opt-in RED: the new six-card desktop test failed because the list still had `2xl:grid-cols-3`, with no `xl:grid-cols-6`. After adding the opt-in API and placement, the shared file passed **28 tests**.
3. Count/tail RED: explicit expected spans for displayed counts 1–10 produced **8 failures**, including narrow single/pair tails and the odd tablet tail. After balancing, the shared file passed **38 tests**. Paged-total fixtures deliberately use `recordCount={100}` to catch accidental use of the total instead of displayed rows.
4. Contributions RED: the focused ten-card integration test failed while Contributions still used the default layout. Adding the single opt-in prop made that test green.
5. Compatibility coverage exercises simulated 640px/390px phone modes, table mode, reading/keyboard order, one primary open action, select-all, loading, empty, retry/error, pagination, and load-more states. One new compatibility assertion initially assumed the loading button's entire accessible name was `Loading more`; the installed Spinner contributes `Loading`. The assertion now matches `/Loading more$/`, preserving the existing control.

## Final checks

All commands ran from this checkout unless noted. No Turbo commands were used.

```powershell
bunx --no-install vitest run --config vitest.config.mts tests/unit/packages/ui/data-grid tests/unit/packages/ui/components/data-grid-panel-auto-view.test.tsx tests/unit/apps/admin/data-grid-row-paging.test.ts tests/unit/apps/admin/app/contributions-hub-grid.test.tsx tests/unit/apps/admin/app/contributions-main-body.test.tsx tests/unit/apps/admin/app/contribution-mobile-selection.test.tsx
```

Result: **12 suites / 147 tests passed**. This includes the dedicated shared grid keyboard, editing, accessibility, export, search/filter, row-processing, auto-view, and admin paging contracts.

```powershell
node tooling/eslint-config/lint.mjs packages/ui/components/data-grid-panel/data-grid-panel.tsx 'apps/admin/app/(app)/contributions/main-body.tsx'
bunx --no-install tsc --noEmit --incremental false -p packages/ui
bunx --no-install tsc --noEmit --incremental false -p apps/admin
```

All passed. Scoped Prettier write/check covered both source files, both test files, and this report. The write reported the app source unchanged by formatting.

The shadcn info command succeeded from `packages/ui`; its returned configuration retained `base-maia` and Lucide. [packages/ui/components.json](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/packages/ui/components.json) confirms Zinc and semantic CSS variables. The live ReUI `data-grid` audit checklist was retrieved and reviewed. All six documented ReUI C1–C4 ripgrep scans ran against both changed source files: **zero findings**.

Full repository checks, React Doctor, builds, browser/axe runs, and screenshots were not run in this scoped implementation task. No git operations, servers, environment/secret-file access, production-data calls, or subagents were used. Unrelated concurrent work was preserved.

## Browser verification still required

Unit tests establish placement classes and component behavior; jsdom does not measure layout or text wrapping. Integration should verify:

- **1440px:** six cards produce two rows of three; ten produce `3 + 3 + 2 + 2`. Check counts 1/2/4/5/7 after filters or paging. Confirm long donor/organization names retain useful words rather than becoming one-word columns, and that amounts, dates, funds, statuses, receipts, and selection controls remain readable without overlap or horizontal overflow.
- **1024px:** retain two card columns; an odd trailing card fills the row. Confirm long text, equal row heights, sidebar configurations, and the existing toolbar/view toggle still fit.
- **640px and 390px:** retain the single-column phone list and existing card content, with readable names, money, receipt state, and selection controls.
- At those widths, verify real keyboard focus and view-switch behavior, light/dark presentation, and zoom. Card contents and primitive styles were intentionally unchanged; rendered readability remains unverified.

Installed: none; existing shared Core/ReUI composition reused.
Motion: none added.
States: loading, empty, error/retry, selection, paging and load-more covered in unit tests.
Checks: 147 tests, source lint, UI/admin typechecks, scoped Prettier, C1–C4 and live audit checklist; not visually verified.
Deviations: none in implementation; browser dimensions and full integration gates remain for the owning lead.
