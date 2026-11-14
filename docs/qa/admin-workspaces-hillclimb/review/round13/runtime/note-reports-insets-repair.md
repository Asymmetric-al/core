# Note and Reports scroll insets repair

Date: November 12, 2026 (Asia/Bangkok).

## Changes

- `apps/admin/app/(app)/crm/notes/page-client.tsx`: the existing sticky note header now uses `-top-6`, matching the popup padding already cancelled by its negative margins. This covers the padded strip where scrolling body text appeared above the title. Existing footer and focus ownership are preserved.
- `apps/admin/app/(app)/reports/funds-grid.tsx`: the Funds heading uses `scroll-mt-20` (80px at the existing spacing scale), clearing the 48px app header with space for context when following the hash link.
- The existing note-dialog structural assertion was adjusted for the inset. These are small CSS repairs; no artificial behavioral RED claim is made for jsdom geometry.

## Baseline

The prior browser report `runtime/money-browser/report.md` records and links native screenshots showing note text in the top padded strip and the Reports heading at viewport y16 beneath the 48px header. Root inspected `money-v5/long-note-390-bottom.png` directly before editing. This evidence predates the fresh checkpoint and is retained unchanged.

## Validation

- `bunx vitest run --config vitest.config.mts tests/unit/apps/admin/app/crm-notes-workspace.test.tsx tests/unit/apps/admin/app/reports-page.test.tsx --maxWorkers 1`: 2 files, 54 tests pass.
- `node tooling/eslint-config/lint.mjs "apps/admin/app/(app)/crm/notes/page-client.tsx" "apps/admin/app/(app)/reports/funds-grid.tsx"`: exit 0.
- Scoped Prettier write completed for both product files and the existing note test after initial format check identified newline formatting.
- `bunx tsc --noEmit --incremental false -p apps/admin`: exit 0 after the shared grid and PDF repairs.
- `bunx tsc --noEmit --incremental false -p packages/ui`: exit 0 after the shared grid repair.
- Read committed Next Link documentation, sticky-header scroll offset section, because the installed-docs discovery tool could not resolve Next in the app directory. Live MCP port3031 reported no tools; no framework upgrade was attempted.

## Browser acceptance still required

Verdict: INCONCLUSIVE for rendered geometry until fresh round13r2 capture.

At 1440/1024/640/390, open the fixture long note, scroll to its middle and bottom, and confirm no body text is visible above the pinned header; title and close controls must remain accessible. On Reports at390, follow Jump to funds with grouping/period query parameters present, confirm heading top is below the app header bottom, and retain URL/reload/history checks. Existing old round13 freeze intentionally fails after accepted repairs; do not bypass it or label old captures as current.

No Git mutations, servers, environment/provider changes, or real content writes were performed.
