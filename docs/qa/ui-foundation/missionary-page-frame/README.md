# Missionary home page-frame ownership

[AL-1978](https://github.com/Asymmetric-al/core/issues/1978), investigated on
October 8, 2026. **Runtime retained:** no home page-frame conflict was reproduced
in the inspected composition. This is a descriptive Missionary reference, not
a new cross-application layout policy or a visual qualification of productive
dashboard data.

## Source and evidence boundary

The worktree starts at fetched `develop`,
`c4bc0553546f8b26599bc6dbe08f7aadbef52cc1` (tree
`2c37fc4d8b39f298e3fab938239cd75de8c04031`). PRs
[#1972](https://github.com/Asymmetric-al/core/pull/1972) and
[#1973](https://github.com/Asymmetric-al/core/pull/1973) are merged; the latter
adds evidence without an application/shared implementation delta. The original
`/workspace/core` checkout at `a7b216d141c17ea2d7f9514fdb28ce4db6f4fb68` was left
untouched. This isolated branch is `chore/AL-1978-missionary-page-frame`.

The branch now includes `develop` at
`5e60ee75d831caa6e150023fac6579ea9d5d7cbb`, after #1980 and #1981 merged.
Of the 15 recorded source owners, only the layout selector changed: #1981 adds
standalone account-route handling, while home still follows the same AppShell
path. The measurements, hashes and integration record below describe the
original `c4bc055` baseline; this update adds no new browser measurements.

The private frozen install uses Bun 1.4.2, Node 24.19.0, Next 16.4.0,
React 19.3.0, Tailwind 4.3.3, Vitest 5.0.3, Playwright 1.64.0 and Chromium
156.0.8078.4. The pre-existing installation had Next 16.3.8 and was not used.
Installed Next layout/Cache Components documentation was read. Read-only
`bunx --bun shadcn@latest info --json` ran from `packages/ui`; config and CLI
confirm exact `base-maia`, Base UI, Zinc-oriented CSS variables and existing
aliases. No registry or component source was installed or overwritten.

Browser evidence uses the actual Next application at `http://localhost:4108`,
its compiled styles and an owned browser context. The committed CI environment
wrapper and demo-account authentication are used unchanged. To reproduce fixture
authentication on this alternate port, set `ASYM_E2E_AUTH_SURFACE=missionary`;
the standard Missionary port 4000 selects that surface automatically. Cache Components,
partial prefetching, providers, authentication and route transitions remain in
place. The [measurement record](./evidence.json) distinguishes these states:

- **Loading:** hold the real portal request until the loading frame is measured.
- **Error:** release that request; the CI placeholder backend returns 503. Retry
  remains reachable and requests the same endpoint again, also returning 503.
- **Loaded UI fixture:** intercept only the portal read with the exact committed
  snapshot from `tests/unit/missionary-dashboard/dashboard-home.test.tsx`.
- **Absent-data UI fixture:** map the presenter's tested absent input to JSON
  `null`; this supplements empty rendering inspection and is not a valid,
  productive empty portal response. No business values are invented.

Metrics/chart requests were not intercepted. Their separate loading or existing
demo behavior does not qualify productive metrics. Productive loaded and empty
portal data, populated partner rows and virtualizer behavior remain unverified.
No writes, account changes, data seeding or provider activation were performed.

## Current owners

Paths below identify current source at the recorded SHA. Values in pixels assume
the measured 16px root font size; media breakpoints use viewport width.

| Responsibility                        | Existing owner                                                                                                                                    | Contribution                                                                                                                                                                                                                                              |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Root/providers                        | [root layout](../../../../apps/missionary/app/layout.tsx), [layout shell](../../../../apps/missionary/app/_providers/missionary-layout-shell.tsx) | Body/app-root/providers host AppShell. The request-time role gate remains a streamed, redirect-only sibling. Boneyard is an explicit separate frame.                                                                                                      |
| Available width beside navigation     | [AppShell](../../../../apps/missionary/components/app-shell.tsx), [Sidebar](../../../../packages/ui/components/shadcn/sidebar.tsx)                | SidebarProvider is horizontal flex. SidebarInset grows into the remainder and retains `min-w-0`. Expanded sidebar is 208px; its actual mobile breakpoint is 768px.                                                                                        |
| Host maximum width and inline gutters | AppShell's `RouteMainViewTransitionBoundary`; [global utility/tokens](../../../../packages/ui/styles/globals.css)                                 | `container-responsive`: centered, full width up to 1600px; inline gutters 16px, 24px at 768px, 40px at 1024px.                                                                                                                                            |
| Home-specific width                   | [home route](../../../../apps/missionary/app/page.tsx)                                                                                            | `container mx-auto` contributes Tailwind's breakpoint width cap inside the host's padded content box. It is active at some widths, including 700px and 767px. It adds no explicit inline padding.                                                         |
| Outer vertical spacing                | AppShell, home route, [PageShell](../../../../packages/ui/components/primitives/page-shell.tsx)                                                   | Host section padding is 16/24/32px. Home adds 8px top/bottom, then 16px at 768px. Default PageShell adds 16px padding with 80px bottom below 640px, 24px all around at 640px, 32px at 1024px. These responsibilities compose.                             |
| Navbar clearance                      | [AppHeader](../../../../apps/missionary/components/app-header.tsx)                                                                                | A 48px, non-shrinking, normal-flow header with sticky top positioning. The route region follows it; home adds no fixed-navbar offset.                                                                                                                     |
| Primary landmark                      | SidebarInset in shared Sidebar                                                                                                                    | Renders the visible primary `<main>`. The home route, route-transition wrapper and PageShell render divs. No new main is needed inside this hosted composition.                                                                                           |
| Primary scrolling/footer              | Document; [DashboardFooter](../../../../apps/missionary/components/dashboard-footer.tsx)                                                          | Measured scrolling element is HTML. Home has no bounded vertical scroll container. Header/footer are normal-flow sticky siblings; route `flex-1` fills spare height. Loaded-fixture scrolling changes document scrollTop while main scrollTop stays zero. |
| Feature/header/card spacing           | [DashboardHome](../../../../packages/missionary/components/dashboard-home.tsx), PageShell                                                         | PageShell owns heading typography, header arrangement/border/padding, 40px header-to-content gap and responsive feature padding. `section-gap` separates dashboard regions. Card/table/chart internals own their own spacing.                             |
| Motion                                | [route boundary](../../../../packages/ui/components/view-transitions/route-main-boundary.tsx), PageShell                                          | Keep the existing context/feature-flag/reduced-motion contract. PageShell suppresses entrance motion when route-transition context applies. Density changes also change heading/gaps/arrangement, not just gutters.                                       |

For a hosted page example, [DonorsPageContent](../../../../apps/missionary/app/donors/donors-page-content.tsx)
and [settings route/client](../../../../apps/missionary/app/settings/page-client.tsx)
delegate outer width/gutters and the primary landmark to the existing shell,
then compose a PageHeader and feature content. Home currently has an
additional PageShell composition today; its loading, error and loaded branches
use identical default PageShell inputs. Empty content follows the loaded branch.
There is one production DashboardHome consumer: the home route. Its legacy tab
callbacks and injected slot remain unchanged.

This reference makes the supplied host frame explicit without prescribing
removal of a feature's padding or copying home's extra route container into
every page. A future intentional reading-width constraint belongs to that
page's composition and should be reviewed with the host present. PageShell's
existing `className` API and density semantics do not authorize a global default
change. DashboardHome has gained no layout API in this task.

Intentional nested regions remain separate: card padding, chart height and
metric clipping, progress-meter clipping, sidebar navigation scrolling, table
virtualization and wide-table scrolling. The existing
[task board](../../../../packages/missionary/components/task-kanban-board.tsx)
retains horizontal board overflow and vertical column overflow. The earlier
`min-w-0` document-containment fix is preserved; no global overflow mask is added.
Productive task/virtualizer interactions were not requalified by this report.

## Computed home geometry

Every viewport below has four state measurements. Title/content left edges and
their vertical positions match across those states. Document width equals
viewport width in all 32 measurements, with one visible primary main. This
establishes the inspected frame, not all possible data or navigation behavior.

| Viewport    | Host width | Home route width | Title/content left | Title top | PageShell bottom padding |
| ----------- | ---------- | ---------------- | ------------------ | --------- | ------------------------ |
| 320 × 640   | 320        | 288              | 32                 | 88        | 80                       |
| 700 × 800   | 700        | 640              | 54                 | 96        | 24                       |
| 767 × 800   | 767        | 640              | 87.5               | 96        | 24                       |
| 768 × 800   | 560        | 512              | 256                | 112       | 24                       |
| 769 × 800   | 561        | 513              | 256                | 112       | 24                       |
| 1440 × 900  | 1232       | 1152             | 280                | 128       | 32                       |
| 1920 × 1080 | 1600       | 1520             | 336                | 128       | 32                       |
| 1280 × 480  | 1072       | 992              | 280                | 128       | 32                       |

For example, at 700px the host has 16px gutters and 668px inner width. The
route caps that at 640px and centers it, then PageShell adds 24px: the title and
content both begin at 54px. This is an actual additional width constraint, but
no intended-width requirement or reproduced clipping justifies removing it.

At native **200% browser zoom**, Chrome's `chrome.tabs.getZoom` returns `2`;
the unchanged 1440 × 900 browser viewport exposes a 720 × 450 CSS viewport,
devicePixelRatio 2 and visualViewport scale 1. The error title/content left edge
is 64px, document width is 720px, HTML still owns scrolling, and retry is in the
viewport. This used browser zoom through a local test extension, not CSS zoom,
viewport resize or device-scale emulation. Loaded/empty fixture states were not
repeated at native zoom.

Short-viewport loaded-fixture checks at 320 × 480 and 1440 × 480 scroll to the
existing View All Tasks control without invoking its unfinished action.
Document scrollTop changes from 0 to 1194px / 853px; main scrollTop remains 0.
Sticky-footer placement in a full-page screenshot is not proof of clipping.

## Read-only controls and follow-ups

Settled `/donors` (Partners) and `/settings` expose the host edge at 16px on
320px and 248px on 1440px, versus home's 32px and 280px. They use PageHeader
without home's PageShell padding; different feature composition alone is not
a reason to unify these routes. Partners' current empty/unavailable surface
fits 320px after motion settles. Populated rows/virtualizer remain unverified.

Settings has a **pre-existing 390px document width at a 320px viewport** on this
unchanged source, including a widened Account Security/card region. It fits
1440px. This independent form-surface concern requires its own local ownership
investigation; no settings/shared-component fix or home workaround is included.
An initial reduced-motion application run also emitted a hydration attribute
warning showing PageShell entrance-style differences; the completed geometry
matrix used `no-preference`. No reduced-motion application pass is claimed.

Initial ad hoc inspection runs had harness-only failures (pending route teardown
and incorrect expected copy); those ignored scripts were corrected. Initial
control captures preceded motion completion and were superseded by settled
captures. The transient 324px Partners reading is excluded from final results.
The original Playwright full-page zoom capture clipped the browser surface;
the selected zoom evidence uses a CDP viewport capture and independent geometry
assertions. None of these corrections changed application code or test gates.

## Verification and handoff

Results use the starting source SHA above; the final documentation commit does
not change that runtime tree. Captures/scripts/logs remain under ignored
`test-results/missionary-page-frame/` in the isolated worktree. The committed
JSON contains measurements and selected screenshot hashes, not credentials or
auth state. Screenshots retain development overlays and are task-local evidence,
not a production or repository-wide visual pass.

| Command/check                                                                                              | Result                                                                                                                                                        |
| ---------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `bun install --frozen-lockfile`                                                                            | Passed; private installation, lockfile unchanged.                                                                                                             |
| `bunx vitest run tests/unit/missionary-dashboard`                                                          | 4 files / 21 tests passed; rendering, loading, error/retry, identity, dates and presenter. jsdom does not establish geometry.                                 |
| `bunx turbo run lint typecheck --filter=@asym/missionary-app --filter=@asym/missionary`                    | 13/13 tasks passed, no cached results.                                                                                                                        |
| `bun run test:e2e:auth:missionary` against the owned server                                                | 1 passed, zero skips; demo login and session reload.                                                                                                          |
| Missionary Playwright project: `missionary-summary-layout.spec.ts` + `missionary-dashboard-charts.spec.ts` | 18 passed. Actual component imports/compiled styles; isolated component fixtures, separate from application/provider evidence.                                |
| Ad hoc composed browser measurement / settled control capture / native zoom / document-scroll inspection   | 32 home measurements; settled narrow/wide controls; native 200% error/retry geometry; two short-viewport scroll checks. Scope and independent concerns above. |
| Scoped Prettier, referenced-path/source-hash checks, `git diff --check`                                    | Passed; 15 local links, 15 source hashes and 13 selected screenshot hashes independently verified.                                                            |
| `bun run ci:preflight`                                                                                     | Passed all 16 selected stages, including 871 files / 6,958 tests (2 files / 4 pre-existing skips). Routine documentation compilation was correctly omitted.   |

No red regression was invented for this documentation-only outcome. No runtime
build or migration is required by this diff; routine preflight's conditional
compilation result is reported separately. `qa:smoke` is not applied to an
evidence-only PR under the current testing policy.

The concurrent account-frame and Donor issues (#1976/#1977), possible sidebar
work and all frozen owners were inspected without edits. The publication check
found unchanged develop at the starting SHA and newly opened PRs #1981 (account
frame) and #1980 (Donor frame). Neither changes this report's files; their
unmerged changes are not part of the measured baseline. Overlapping source
changes would require affected browser remeasurement. Historical `docs/qa/core-ui` records and
OpenSpec task 4.1 remain untouched. No new accepted specification is invented.

Acceptance: ownership and the supplied host convention are documented; current
home geometry and scrolling are verified within the stated app/fixture scope;
no local home correction is justified. Productive loaded/empty portal data,
populated table behavior, reduced-motion hydration and loaded/empty native-zoom
checks are explicit limits. Rollback removes only this report and its evidence
record; application behavior is unaffected. The ending documentation SHA is
the PR head; the measurement source remains the starting SHA, with later
integration changes described above.
