# Admin cleanup: unused admin modules

Part of task 5.4 in [tasks.md](../tasks.md). Base commit `629cb71dc`. Ledger
batch: `admin-unused-removal-2026-10-30`. The user approved the deletion on
2026-10-30: first the twelve modules that held findings, then Care `UI.tsx`
and the old dashboard charts.

## Scope

Nineteen admin files had no importer in product code. Together they held the
last 475 raw admin findings. They are deleted instead of restyled, because
nothing renders them:

| File                                                                            | Findings | Why it was unused                                                                                         |
| ------------------------------------------------------------------------------- | -------: | --------------------------------------------------------------------------------------------------------- |
| `apps/admin/app/web-studio/web-studio-sections.tsx`                             |      240 | Orphaned when Payload Site Studio replaced the old Web Studio page (`294175fc0`); only a test imported it |
| `apps/admin/features/mission-control/components/app-shell/index.tsx`            |      125 | Superseded by `app/mc-shell.tsx`, the live shell                                                          |
| `apps/admin/app/(app)/support/page-client.tsx`                                  |       21 | `support/page.tsx` renders `SupportInbox` directly                                                        |
| `apps/admin/features/mission-control/components/tiles/dashboard-tile.tsx`       |       20 | No importer                                                                                               |
| `apps/admin/components/dashboard/activity-item.tsx`                             |       19 | Only re-exported by the dashboard barrel, which nothing imports                                           |
| `apps/admin/components/dashboard/quick-action-card.tsx`                         |       11 | Same barrel                                                                                               |
| `apps/admin/components/dashboard/stat-card.tsx`                                 |        9 | Same barrel                                                                                               |
| `apps/admin/components/dashboard/task-item.tsx`                                 |        8 | Same barrel; only a test imported it                                                                      |
| `apps/admin/features/mission-control/care/components/UI.tsx`                    |        8 | Only `ShortcutsHelp` and two tests imported it                                                            |
| `apps/admin/features/mission-control/care/components/ShortcutsHelp.tsx`         |        7 | Only a test imported it                                                                                   |
| `apps/admin/features/mission-control/components/AdminDashboardStatsSection.tsx` |        5 | No importer                                                                                               |
| `apps/admin/features/mission-control/components/patterns/details-drawer.tsx`    |        2 | No importer                                                                                               |
| `apps/admin/components/dashboard/index.ts`                                      |        0 | The barrel itself; no importer                                                                            |
| `apps/admin/components/dashboard/charts/` (6 files)                             |        0 | Only a test imported its two chart views; nothing imported the rest                                       |

The live Mission Control charts in
`features/mission-control/components/tiles/` are unrelated and stay, so
`recharts` remains an admin dependency.

Care `UI.tsx` was trimmed in an earlier revision of the Member Care PR. That
PR now leaves it at `develop`, so every file belongs to exactly one PR.

## Changes

- The nineteen files are deleted, and their `suppressions.json` entries are
  pruned. ESLint drops entries for files that no longer exist.
- The two `design-system-exceptions.mjs` height exceptions for the deleted
  chart wrappers are removed, along with their two rows in
  `tests/unit/scripts/design-system-exceptions.test.ts`. The comment and
  test row for `reports-charts.tsx`, which still uses the exception, stay.
- Ten test cases covered only deleted modules, so they are removed. Every
  other case in those files is unchanged:
  - the Web Studio branding-labels case in `admin-revealed-a11y.test.tsx`;
  - the shortcuts-dialog and calendar cases in
    `care/base-ui-controls.test.tsx`;
  - the dashboard task-menu and checkbox cases in
    `react-cleanup-accessibility.test.tsx`;
  - the revenue and weekly tooltip case in
    `dashboard-chart-formatters.test.tsx`, whose Mission Control chart case
    stays;
  - four cases in `support-ui-structure.test.ts`, which reads route sources
    from disk and inspected only the deleted support page-client there. Two
    path-list cases in that file drop the deleted page and keep checking the
    live ticket routes.
- `deriveSupportHubStats` and its `SupportHubStats` type in
  `app/(app)/support/` were used only by the deleted support page-client.
  React Doctor reported them as a new unused export, so they are removed
  along with their single unit-test case. `deriveSupportQueueSummaries` and
  `needsFollowUp`, which share that file, are still used and stay.
- Seven React Doctor exceptions bound to deleted files are retired:
  - `web-studio-sections.tsx` animation and nested-card;
  - `app-shell/index.tsx` small form-control text;
  - Care `UI.tsx` props-spread and animation;
  - the two chart views' dynamic-import exceptions.
- One shared exception, the `packages/ui` `chart.tsx` dynamic-import
  exception, cited the deleted chart wrappers as evidence that whole-chart
  renderers are lazy-loaded at module level. Its diagnostic and source
  context are unchanged, and its reason already names live owners. After
  review, its evidence is bound to those owners instead, with a note:
  `mission-control-home.tsx`, `giving-breakdown-chart.tsx` and
  `metric-tiles.tsx`. No `packages/ui` source changes.
- Cleanup-ledger entries for the deleted files are marked complete with no
  current findings and no current source hash, under the removal batch. The
  chart files had no findings and no ledger entries.
- `docs/guides/architecture/technical-decisions.md` marks
  `AdminDashboardStatsSection.tsx` as since removed, following that
  record's existing convention.

## Verification

- Importers were re-checked immediately before each deletion, on a fresh
  `origin/develop`. Every import, re-export, dynamic import, `require`,
  `vi.mock` and Payload path-string reference in `apps`, `packages`,
  `tests`, `scripts` and `tooling` was resolved to a file. No product code
  imports any of the nineteen; only tests imported five of them.
- Admin `tsc --noEmit` passes, and the seven edited test files pass. Root
  ESLint reports nothing new in the edited files; each has fewer problems
  than on `develop`.
- Two earlier pre-push runs caught tests that name deleted files only as
  path strings, which an import scan cannot see: the disk-reading support
  structure test and the design-system exceptions test's chart rows. A
  string search for all nineteen paths in `apps`, `packages`, `tests`,
  `scripts`, `tooling` and `.github` now finds no remaining reference. The
  only match is `packages/ui`'s own, unrelated `./components/dashboard`
  export.
- `bun run verify:shadscan` and `bun run react-doctor:check` pass on this
  branch. Seven exceptions are retired, and the one rebound keeps its exact
  diagnostic and context with reviewed evidence.
- A raw admin scan on this branch leaves 2,433 findings in 146 files. Those
  are exactly the seven area PRs' files, and none is in a removed path.
- Nothing to render: none of the deleted modules was reachable from a route.

Evidence (ignored, hashed in the ledger): `.tmp/admin-lint-5-4/unused/`.
