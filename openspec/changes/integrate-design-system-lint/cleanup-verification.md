# Legacy cleanup verification

This record covers verified batches within the complete-cleanup scope. It does
not replace the full raw inventory, final repository gates, or published-head
review. Files with no current diagnostics still require appropriate evidence
before the repository-wide completion claim.

## Email Studio and shared dialog scrolling — 2026-09-23

The incoming develop refactor (`c236455724a819ec800104be3e81f563da3de86b`)
introduced separate Email Studio dialog/header files. All 11 email source
files now pass the full raw policy with zero errors or warnings. The existing
editor, persistence, template-selection, and send boundaries remain intact.

The shared `DialogContent` consumes an optional `scrollable` prop, defaulting
to false. When selected, the primitive bounds the popup to `100dvh` minus
eight existing spacing units and enables vertical scrolling. The exact
geometry allowance belongs only to that primitive. Ordinary popup height and
overflow overrides remain rejected, including on sibling primitive files.
Export, Save and Template Picker opt in because actual short-viewport checks
reproduced off-screen content/actions. Test Send retains its existing default.
The export width retains viewport margins, and the narrow header gives the
template-name field and unsaved badge a readable row.

Verification:

- 41 email/studio tests passed, including the new public dialog API checks.
- 23 actual-config content-boundary tests passed, including allowed primitive
  geometry and rejected sibling/consumer overrides.
- Final Chromium matrix on Base UI 1.8.0: 100 dialog and 20 header cases passed
  across normal/reduced motion, light/dark and 1280×800, 390×844, 375×812,
  844×390 and 320×568. Actual cached app fonts were loaded and verified.
  Geometry/screenshots were captured after animations settled. Every dialog
  fit its viewport; there were no horizontal overflows or page errors.
- Verified initial focus, Tab containment, Escape/focus return, keyboard
  scrolling, copy/download callbacks, cancelled-draft reset, last-template
  keyboard selection, test-send Enter, and header metadata/menu behavior.
- Manual screenshot review found and corrected a 26px-wide name input. The
  final input is at least 144px wide and does not overlap the unsaved badge.
  An independent root review inspected the final narrow header, short Save
  dialog and mobile Export dialog screenshots.

The initial local evidence manifest is `.tmp/email-render-audit/evidence.json`;
the final font/motion/runtime proof is `.tmp/dialog-dismissal/verification.json`.
They record source/font hashes and separately identified failing evidence.
The seven implementation/configuration files have aggregate SHA-256
`cef7fed49e77c2abe9bc4afd2e9cb459c6ff8119bcef4612461303ed1c0bb9b1`, computed
over sorted repository-relative path, NUL, file bytes, NUL. The tracked tests
are `tests/unit/packages/ui/studio/dialog-scrollable.test.tsx` and
`tests/unit/scripts/design-system-content-boundaries.test.ts`, alongside the
existing email/studio suites.

These are isolated real component and shared Tailwind/PostCSS checks. Header
provider-status and merge-tag modules are mocked; callbacks have only local
effects and non-local browser requests are blocked. This evidence does not
claim authenticated-route coverage, live email/provider writes, or complete
repository cleanup.

## Cancelled popup motion and Base UI compatibility

The real-font rerun exposed an existing Base UI 1.5.0 defect: a cancelled
`scrollbar-color` transition rejected its `finished` promise, its replacement
also cancelled, and no animations remained. The shared popup stayed mounted
with `data-closed`/`data-ending-style`; the observer never completed unmounting.
The trace preserved popup identity and showed the ordinary exit animation had
finished. Neither the new scrolling API nor an Export callback was required.

Stock Base UI 1.8.0 includes the maintained upstream
[cancelled-exit repair](https://github.com/mui/base-ui/pull/5401), released in
1.7.0, and the later [completion refinement](https://github.com/mui/base-ui/pull/5535).
The exact pin is upgraded together in the three apps and `packages/ui`; all four
resolve the same physical package. React peers and all 28 Core-used package
entrypoints remain compatible. No preset, token or component-base migration
was made. Frozen install and all 15 workspace typechecks pass.

The public-component regression in `tests/e2e/dialog-dismissal.spec.ts` fails
on stock 1.5.0 and passes on stock and installed 1.8.0. All three tests pass:
cancel without replacement completes teardown/focus restoration/reopen, a real
replacement is allowed to finish, and reduced-motion cycles leave no portal.
The fixture uses real components, compiled Core CSS and browser animations,
without mocking Base UI internals. The final Email Studio matrix above also
requires actual popup/backdrop/portal removal, beyond a visibility-only check.

## Shared text contrast

`Alert` retains its card background and existing API. Destructive text now uses
card foreground; the destructive border and icon retain severity even for
existing callers without an icon. `AvatarFallback` and `AvatarGroupCount` use
foreground on their existing muted surface. Default alert descriptions and
global theme tokens remain unchanged.

The actual rendered regression first failed at dark ratios of 3.482:1 for the
destructive title, 3.014:1 for its description, and 4.175:1 for avatar text.
An iconless-severity test also failed before the border correction. Final ratios
are 15.719:1 and 13.812:1 respectively; the existing default description remains
4.751:1. Light-mode text also passes. The four defined tests in
`tests/e2e/shared-primitive-contrast.spec.ts` pass on installed Base UI 1.8.0,
covering both themes/viewport sizes, default/destructive/iconless alerts, three
avatar sizes, group counts and loaded-image/fallback behavior. They combine
actual computed-color measurements, axe contrast checks and geometry assertions.

Both new browser specs are selected by the existing
`test:e2e:production-gate` command used by `ci-integration.yml`. Its exact local
`--list` invocation selects the three dismissal and four contrast cases among
20 tests in five files. Discovery proves CI selection, not hosted execution;
published-head CI remains a final gate.

## Checkout presentation

All 450 raw checkout findings were repaired through shared variants/composition,
semantic tokens and supported scales. The currency prefix now uses InputGroup's
focus behavior, Country has an accessible label, and shared Alert owns error
presentation. Viewport checks also corrected clipped payment labels, long
supporting names and a large success amount. Existing nonfunctional wallet
presentation receives no new payment handler.

The final 0.2.0 scoped scan has zero findings/errors/warnings. All 57 focused
checkout, donation and designation tests pass. Independent AST checks preserve
non-rendering logic, 184 existing bindings, rendering expressions and visible
text. Source SHA-256 is
`4c38b5c01561797e0553728c9215f00e0e21733fc8566839c8ac4990554b6531`.

The recorded presentation matrix covers 84 states across 14 scenarios, three
widths and both themes, plus 114 default/hover contrast audits. It uses actual
Inter/Syne fonts and checks line/element clipping, actions, keyboard focus and
the positive 5px focus-ring spread. There were no page errors or external
requests. An independent root review inspected the narrow wallet, large-amount
success and long-name summary screenshots.

The entire matrix and all 57 focused tests were repeated successfully after
the Base UI 1.8.0 upgrade, with unchanged source/fixture hashes. The refreshed
`checkout/browser/report-base-ui180.json` records actual runtime versions and
physical package manifests; all six consumed Base UI entrypoints resolve to
1.8.0. Its extracted actual
presentation functions use mocked controller, motion, links and Stripe content;
it is not live payment-runtime proof. Source/fixture hashes and detailed limits
are in `.tmp/shadcn-modernization-2026-09-22/checkout/`.

## Equivalent consumer and inline-style cleanup (2026-09-23)

The first current-runtime redundant-class batch removes 360 diagnosed tokens
from 218 literals in 106 files. Actual Base UI 1.8.0 primitive output passes
5,400 computed/render comparisons and 42 hover, focus and active comparisons.
The scoped raw scan changes from 8,698 to 8,338 findings: exactly 360 fewer
`no-restyle` messages, with every other diagnostic unchanged. Evidence and
per-file before/after hashes are under
`.tmp/shadcn-modernization-2026-09-22/redundant-base-ui180/`.

Eleven inline findings were removed from six files: preview clipping and grid
positioning now use equivalent utilities; the task indicator retains its top
reset; the password-strength meter uses the same left transform origin; an
ineffective delay on an unanimated worker-card parent is removed; and three
Unlayer inputs already overridden by its library/Core CSS are removed.
Forty before/after cases pass across two widths, themes and motion preferences,
including 120 meter updates per version with a stationary left edge. Core's
actual MotionProvider is used. The remaining diagnostic categories are
unchanged. `.tmp/inline-equivalence-2026-09-23/` records the extracted actual
presentation functions, compiled CSS, hashes and results. Next navigation,
giving adapters and provider effects are excluded; grid rows are deterministic
fixtures, and Unlayer uses its actual installed SSR DOM without loading the
remote editor. This is not full-route or virtualization-controller coverage.

Eight undefined scrollbar class markers were also removed. All five configured
stylesheet entrypoints compile without selectors for these names; source search
finds no CSS or JavaScript dependency outside the class attributes. Thirty-two
before/after native-container comparisons preserve every computed property,
scrollbar pseudo-style, geometry and scroll position. The current visible
scrollbar behavior is preserved. Evidence is
`.tmp/dead-scrollbar-classes-2026-09-23/verification.json`.

The three remaining Unlayer host properties are a separately reviewed external
API boundary, not claimed as equivalent source removals. The installed
`react-email-editor` type and implementation expose `style` but no `className`
or arbitrary DOM props. The exact file/component contract permits only width,
opacity and transition, matching the maintained adapter's internal host and
independent loading overlay. A failing acceptance fixture preceded the policy
change; all 25 content-boundary tests now pass, including negative ordinary DOM,
unrelated-property and sibling-file cases. See the official
[editor properties](https://github.com/unlayer/react-email-editor#properties)
and the installed package for the actual version's contract.

## Shared form relationships and validation contrast

Actual Add Partner rendering exposed missing label associations and error IDs
in the shared form shell. It now connects all five field types through their
existing control IDs and assigns the referenced error ID. Select receives its
existing options through Base UI's supported `items` API so the initial value
has its label before opening. All seven focused regressions failed before the
fix and pass afterward; eight Add Partner caller tests also pass. These tests
cover custom IDs, description/error resolution and removal, accessible names,
and initial selected labels. Browser caller coverage is recorded separately.

Invalid Field text also inherited the destructive color into labels and typed
inputs. Actual dark form text measured 3.6768:1; typed input text measured
3.4445:1 against its composited surface. The shared primitive now uses foreground
for readable invalid text and FieldError retains a destructive left border.
Global color tokens remain unchanged. The CI-selected primitive contrast suite
now also covers labels, typed inputs and single/multiple error messages on the
background and card surfaces. Its four light/dark and narrow/wide cases pass,
including numeric contrast, axe and error-accent assertions. This extends the
earlier alert/avatar evidence; it does not claim complete repository accessibility.

## Runtime-valued styles and giving-chart loading geometry

Five actual runtime values now use named CSS custom properties, consumed on
the same elements by Tailwind utilities. Personnel health percentages, funding
percentages, public impact percentages and per-bar loading percentages retain
their original calculations. The funding/impact meters keep the composite
`transform` property, including their existing clamping behavior; individual
CSS scale properties would have changed composition semantics.

The value-preserving pass has 552 value comparisons, 144 transition samples
and 96 dynamic updates, including reduced motion. Scoped raw findings decrease
from 597 to 592 with no other diagnostics changed. Its loading-branch check
then exposed an existing zero-height percentage container: all 13 chart bars
were invisible both before and after that migration. A separate recorded RED
preceded the geometry repair. Giving each existing column full height and
bottom alignment restores positive, proportionate bars while preserving all
13 percentages. The real exported chart's new Playwright regression passes
12 width/theme/motion cases and checks horizontal overflow. Only its metrics
hook is replaced with a deterministic loading result; no remote data is used.
Evidence, including separate intermediate/final hashes, lives under
`.tmp/shadcn-modernization-2026-09-22/runtime-inline-five/`.

The 17 redundant control classes initially withheld from the donor settings,
worker directory and missionary profile files were subsequently verified and
removed after the inline edits settled. Fresh AST matching, 216 computed/render
comparisons and 24 interaction comparisons pass. Their scoped findings change
from 619 to 602, with every remaining diagnostic unchanged. Evidence is under
`.tmp/shadcn-modernization-2026-09-22/redundant-withheld17/`.

The giving-chart loading and missionary-summary layout specs are selected by
the existing production gate alongside the earlier dialog and contrast specs.
The final selection inventory below also includes shared table and popover
coverage. Selection evidence, local component runs and hosted execution remain
distinct verification layers.

## Missionary partner form, funds summary and loading shells

`add-partner-dialog.tsx`, `balance-card.tsx` and `skeletons.tsx` retire all 143
findings with zero ordinary warnings. The partner dialog uses shared scrolling,
FieldGroup/Field composition, responsive columns and owned control variants;
its pending submit action now keeps an accessible name and busy state. The
funds summary preserves its original formatting and existing inert action API,
while wrapping unusually long amounts. Loading shells use shared semantic
styles; a reproduced 23px activity-placeholder overflow is capped to its column.

Ten focused unit/model tests and six durable layout browser tests pass. The
actual-font matrix covers ten form cases, 18 zero/negative/large balance cases
and six loading layouts, across both themes and responsive/short viewports.
It verifies keyboard containment/selection, focus return, labels, validation,
pending/reset/cancel behavior and exactly-once local insertion callbacks. Form
text, placeholders and errors have minimum measured contrast of 4.7002:1.
The final FieldGroup/flex-gap composition preserves exact geometry in all ten
form cases. The package typecheck passes; React Doctor has no finding in these
three files. Existing complexity warnings in other task components remain.

Source invariants preserve pre-render state, validation, mutation/callback/reset
logic, public props, field handlers, amount formatting and skeleton keys.
The manifest and precise limitations are in
`.tmp/missionary-surface-audit/verification.json`. These are real exported
components with local data/toast fakes, not authenticated routes or live writes.
Number/textarea/switch relationships have shared unit coverage, not coverage
from this Add Partner browser fixture. Root independently inspected the narrow
dark validation, large-amount funds and loading-shell screenshots. Independent
review also checked the shared form/Field changes and twelve positive/negative
Unlayer contract probes without substantive findings.

## Preview positioning and variant-helper analysis limits

PreviewToggle's changing left position uses `--preview-indicator-left` and the
matching static Tailwind utility. Its original `4px`/`50%` endpoints, width,
transition configuration and callbacks are preserved. Twenty-four before/after
cases pass at three widths, two root font sizes, two themes and both motion
preferences, with 96 mode changes per version. The larger root-font case proves
why substituting a rem-based `left-1` would not have preserved this API. The file
now has zero inline findings, while its other 71 styling findings remain.
Evidence is `.tmp/preview-position-2026-09-23/verification.json`; the fixture uses
the actual extracted component and Core MotionProvider, not a route or provider.

A separate actual-config probe confirms a current analyzer limit: Button
appearance overrides expressed through `cn(buttonVariants(...), ...)` on native
anchors or Next Link do not acquire Button ownership. The same padding/color
overrides directly on Button produce two `no-restyle` errors. This is recorded
in `variant-ownership-probe.json` under the combined-cleanup evidence directory
and in the canonical workflow. Manual helper/variant review remains required;
no rule was relaxed and no invalid style was accepted as a positive regression.

## Shared table control names and tabs contrast

The populated Tasks audit exposed unnamed controls in shared pagination and
the responsive toolbar. Page size now references its visible label through a
generated per-instance ID. Search toggle/clear, Refresh, Export and Columns
actions retain stable names when responsive styles hide their text. The search
toggle also exposes its expanded state. All 85 className/handler attributes are
unchanged. Six real-component browser cases pass across light/dark and
320/700/1280px, including keyboard entry/focus, search/clear, column visibility,
page-size selection/results, focus restoration, distinct label IDs and local
refresh/export callbacks. The Button focus-ring assertion uses its actual 5px
ring/offset contract; SelectTrigger is not given a different ring requirement.
Evidence is `.tmp/shared-table-accessibility/report.json`.

Existing table subscription tests pass 3/3. Their React state-during-render
warnings also occur in the earlier pre-change full unit logs; they were not
suppressed or claimed absent. The two files retain their separate 19 and 57
styling findings, which still require cleanup.

Inactive TabsTrigger text had a 4.175:1 ratio in the dark default variant.
Removing its redundant dark muted-color override restores the existing semantic
foreground/60 treatment. The actual dark default minimum is now 5.802:1; both
variants/themes pass at least 5.086:1. Variants, geometry, handlers and global
tokens stay intact. The expanded shared contrast spec retains the previous
four cases and adds eight tab contrast/keyboard cases. All twelve pass. The 48
tab measurements await actual CSS transition completion before checking initial,
selected and hovered states. Selected text agrees with the initial active text,
and corresponding settled colors agree at both tested widths. Evidence and
source hashes are in `.tmp/tabs-contrast-audit/report.json`.

## Durable browser regression selection

The earlier checkpoint's `bun run test:e2e:production-gate --list` selected 57 tests in nine files:
the existing usability, donate and Support Hub suites plus dialog dismissal,
shared primitive contrast, giving-chart loading geometry, missionary summary
layout, shared table accessibility and popover positioning. The command retains
the repository's CI environment wrapper, Chromium project and single worker.
Its exact selection log is
`.tmp/shadcn-modernization-2026-09-22/preflight-final-browser-selection.log`.

Listing tests does not execute route checks or global setup. Isolated component
verification uses separate configurations without the root auth global setup,
storage state, dependent projects or application servers. The normal release
gate retains its existing route/auth setup and must still run in its intended
CI environment; no local component pass is presented as hosted acceptance.

The following surface batch expands that command to **95 tests in 13 files**,
confirmed by `.tmp/production-selection-new-ui.log`: six About, eight Teams,
twelve dashboard/chart and eight Wallet cases, plus four added shared menu
contrast cases. Discovery proves selection; each local execution is recorded
separately below.

## Admin Tasks and the small-viewport calendar

The seven changed Tasks components retire all 407 original styling findings.
The final scoped inventory includes all sixteen Tasks source files and shared
Popover, with zero raw findings or ordinary warnings. Shared variants and
Field/Group composition replace control overrides; date/time reminders retain
their values in a usable narrow row, and long drawer content remains scrollable.
Overdue dates retain their original formatting and condition, with readable text,
a destructive icon and a screen-reader status. The final source audit preserves
all 111 original event/control bindings.

Twenty-two focused Tasks tests and the twelve-package admin typecheck pass.
The actual-font presentation matrix covers 56 form/drawer/table cases, followed
by 24 affected narrow-screen reruns and twelve populated/loading/pending table
cases. Sixteen final axe scans report zero detected violations. Incomplete checks
for focus guards or clipped/offscreen content remain explicit in the reports;
this is not a complete accessibility-conformance claim. The real rows-per-page
interaction also reproduces an existing shared table render-time React warning,
even with stable memoized fixture inputs. It remains separately tracked rather
than suppressed or attributed to the accessibility-name repair.

The due-date popup previously extended below a 320×568 viewport, and an existing
selected date could open the wrong month. Shared PopoverContent now exposes Base
UI's existing `collisionAvoidance` positioning option without changing the
default. Only this calendar opts into shifting on both axes, uses its selected
date as the initial month and supplies an accessible popup name. The public
placement regression records two failing short-viewport cases before the fix,
then five passing default/opt-in cases. Four additional actual-font Task form
cases verify last-row selection, retained values and save behavior. Independent
review found no default-prop or callback regression. Evidence and exact source
hashes are under `.tmp/admin-task-cleanup-plan/`.

## Combined raw inventory checkpoint

The complete 2026-09-23 raw scan covers 1,148 files in the same five configured
scopes and reports 13,805 findings in 363 files, with no ordinary warnings,
fatal errors or findings above the existing per-file/per-rule baseline. Source
hashes remain unchanged through both the raw scan and deliberate prune. The
pruned normal run covers those same 1,148 files with zero errors or warnings.
Reports and the source-hash inventory are in
`.tmp/combined-cleanup-2026-09-23/`. This is a verified reduction checkpoint;
13,805 remaining findings still require repair before full cleanup acceptance.

The combined `bun run ci:preflight` passes in 279.71 seconds after this batch:
all fifteen workspace typechecks, all three application builds and the complete
unit suite (4,708 tests in 607 files; four tests/two files skipped), together with
local attribution, formatting, skills, strict OpenSpec, lint and all declared
repository verifiers. The terminal log is
`.tmp/shadcn-modernization-2026-09-22/preflight-combined-cleanup-e811-acceptance.log`.
An earlier attempt needed formatting of the deliberately pruned suppression
file. The following attempt stopped on Google Fonts connection errors; all
three builds passed on retry without a source/configuration change, followed
by the successful full preflight above. These are local checks on the pending
e811fc9f develop reconciliation and do not validate the older published PR head.

The offline React Doctor 0.9.14 pass covers all five UI workspaces. Its scores
are admin 78, donor 69, missionary app 19, UI 71 and missionary library 78;
these are not repository-cleanliness claims. Its eight apparent new diagnostics
are existing complexity warnings whose source fingerprints changed with class
and accessibility attributes. Running the installed rule on both HEAD and current
source gives identical complexity metrics in all eight functions. Their ASTs
retain all 91 callback bindings and 370 branch nodes after narrowly normalizing
the 19 changed class strings and seven identified accessibility attributes.
No warning was suppressed or claimed fixed. The other five reported fixes were
not individually attributed. The source-bound comparison is
`.tmp/combined-cleanup-2026-09-23/react-doctor-complexity-proof.json`.

## Concurrent PR branch reconciliation

After the verified cleanup checkpoint `c1776795c`, the remote PR advanced to
`b518fd676c310fb89d6ee20c5a8ffaf5714b0133`. Its signed agent commits merge the
documentation reconciliation at develop `ea8086cf` and prevent cache-test Git
fixtures from inheriting the push hook's checkout environment. A normal merge
preserves those commits and their attribution. The only merge conflict is the
suppression inventory: the verified 13,805-count local inventory remains correct
for the cleaned-up source, including the already-clean Email Studio and checkout.
All 1,148 scanned production-source hashes remain unchanged by this merge.

Local attribution, both newly introduced verification stages (`verify:phase25-spec`
and `verify:openspec-deltas`), strict OpenSpec validation and full formatting pass.
The four affected script suites pass all 126 tests. Evidence is under
`.tmp/remote-lint-reconciliation-2026-09-23/`. These focused merge checks supplement
the preceding full preflight; the next combined preflight must include the new
stages. Neither this merge nor prior local checks establish final PR acceptance.

## About, dashboard and destructive menu follow-up

The public About composition and donor route retire **93 findings** with zero
ordinary warnings. They preserve all 26 text nodes, three destinations, two
image contracts and five section exports. Shared cards/buttons, semantic
inverse-surface tokens and the existing display font replace local overrides.
The route has a real main landmark and honors its existing view-transition
context; fine-pointer hover changes do not activate on touch.

All 16 focused unit/static-shell tests, six durable browser cases and 21
actual-font contexts pass. Those contexts cover seven widths, normal/reduced
motion, coarse pointer, dark parent, route context and reflow emulation. Owned
text has no clipping; four scoped axe checks detect no violations. A dark
eyebrow first failed at 4.175:1 and now uses foreground. Minimum ordinary-text
contrast is 4.751:1; the remaining 4.175:1 sample is large text. Recorded
image responses exercise controlled white/black backgrounds; they do not
validate remote image delivery. The unchanged Footer still overflows by 34px
at 1024px, and the closed mobile Navbar has a separately recorded focus issue.
Neither is claimed repaired by About. Source and context hashes are recorded
in `.tmp/public-about-audit/verification.json`.

Four missionary dashboard files retire **293 findings** with zero warnings.
Financial formatters, chart series, signed amounts, all 104 existing
nonpresentation bindings and three custom-property expressions are preserved.
Progress announcements are bounded to their declared range while retaining
the signed/overfunded value description. Large amounts wrap before the chart;
the currency axis reserves 48px after a failing glyph-bounds test reproduced
5–8px prefix clipping.

All 16 focused unit tests, 12 final chart regressions and 12 unchanged loading
regressions pass. Sixty explicitly enumerated actual-font state contexts have
zero detected axe violations; 24 incomplete entries remain recorded. Six final
axis checks prove all tick rectangles fit their SVG. The fixtures use actual
exported UI and local provider result shapes; they do not prove authenticated
portal access or financial persistence. Existing inert controls and static
funding copy remain unchanged. Exact source and evidence hashes are in
`.tmp/missionary-dashboard-cleanup/report.json` and `final-hashes.json`.

Wallet and Teams independently exposed destructive DropdownMenu text contrast
of approximately 3.03:1 focused and 3.48:1 unfocused in dark mode. Exactly two
text utilities now use existing foreground; the destructive icon and focus
tint, dimensions, callbacks and theme tokens remain unchanged. Four failing
cases become four passing menu cases, and the complete shared suite passes
16/16. Twenty-four rendered text samples have minimum contrast 13.686:1;
iconless entries, keyboard activation, one callback and focus return are
covered. The menu retains two pre-existing arbitrary min-width findings, so
this is a contrast repair rather than a complete-file cleanup claim. Evidence:
`.tmp/shared-menu-contrast/report.json`.

## Donor Wallet follow-up

Wallet retires **692 findings**, with zero ordinary warnings. It uses existing
Card, Field/InputGroup, RadioGroup, Alert and scrollable Dialog composition.
Eight previously unnamed card/address inputs now have associated labels;
payment-method selection works by keyboard, and each existing move action is
visible and named. State/action logic, ten data declarations and all eleven
input model bindings remain unchanged. Of 52 original event bindings, 51 are
identical; the selection click becomes the shared RadioGroup callback with the
same method ID. Private gradient-only metadata is removed with its renderer.

All eight durable cases pass across both themes, two widths and both motion
preferences. They exercise local add/edit/default/move/transfer/delete actions,
cancel/reset, the no-backup guard, focus return and actual popup removal. A
long saved address first extended to x1369.59 beyond its card's right edge at
x304; native wrapping now keeps every text rectangle inside the card. A
missing flex display originally separated the card-header centers by 32px;
both now align, with a durable geometry assertion. Normal-motion tests await
the previous menu's real exit before opening another method's menu.

The final real-font matrix covers **84 state checks across 14 contexts**:
light/dark, 320/768/1280px, normal/reduced motion, a 640×360 route context and a
390×844 coarse-pointer route context. It detects zero axe violations, page
errors or document overflows; 27 incomplete axe entries remain recorded.
Actual font files and all source/context hashes are pinned in
`.tmp/donor-wallet-cleanup/verification.json`. Mobile dark Wallet and the short
bank dialog were visually reviewed. Earlier failing evidence is retained.

This route still uses its original in-memory demonstration model. No payment,
bank, authentication or persistence integration is added or claimed verified.
The fixture uses real Next Image with controlled local unoptimized transport;
remote image delivery and the optimizer are outside that evidence.

## Admin Teams follow-up

Teams retires **345 findings**, with zero ordinary warnings. Existing shared
variants and field/menu/card composition replace appearance overrides. The
Manage action now opens one stable controlled Sheet outside table cells;
the old row-local owner remounted and lost its popup. Enter/Space propagation
follows the shared row-action convention. Selected tabs scroll into view within
their existing native strip, preserving focus-ring space after a measured
58px Settings-label overflow. The suspected long-heading clipping did not
reproduce, so no heading repair was made.

All eight final durable cases and eight final actual-font contexts pass,
including 32 measured bounds states, real portal teardown and focus return.
The earlier 26-context matrix and 28 axe scans found no violations and predate
only the final focus callback/scroll-padding correction. That evidence is kept
separate from the final targeted result. Five existing import tests and the
admin typecheck pass. Data declarations, filtering, table configuration and
26 existing bindings remain preserved; local creation/deletion/invitation
stubs remain inert and Save retains its existing close behavior. No provider
or persistence behavior was added. Exact hashes and evidence boundaries are
in `.tmp/admin-teams-cleanup-plan/verification.json`.

## Publication checkpoint requested on 2026-09-23

The user requested publication and wrap-up after these verified batches. The
full frozen-source scan covers **1,148 files**, with **12,382 remaining findings
in 354 files** and **zero ordinary lint warnings**. This batch removes 1,423
findings from the preceding 13,805 checkpoint. The deliberately pruned baseline
exactly matches the raw inventory; normal enforcement passes without accepting
new debt. Complete legacy cleanup remains unchecked in `tasks.md`.

The first attempted scan was rejected because Teams changed during pruning;
the final scan and prune both guard all 1,148 source hashes and pass. Evidence
is `.tmp/surface-cleanup-frozen-2026-09-23/`. Remaining Footer/Navbar issues,
the separately diagnosed TanStack pagination warning and other legacy styling
debt remain visible; this publication does not claim they are repaired.

React Doctor 0.9.14 completes all eight configured first-party targets under
Node with no skipped checks. Its full advisory inventory has 60 errors and
243 warnings; the changed-source comparison against `75f1616a` reports zero
new diagnostics and one reported fixed diagnostic, which is not separately
claimed remediated. No score API is called. The repo's Bun invocation fails
inside the scanner's `child.channel.unref` API; the equivalent installed CLI
under Node completes without changing policy, ignores or dependencies. Reports
are under `.tmp/surface-cleanup-final-2026-09-23/`.

The combined `bun run ci:preflight` passes in 591.82 seconds: **4,745 tests
across 611 files pass**, four tests in two files are skipped, all workspace
typechecks and all three production builds pass, and every declared stage
passes. The first attempt failed before code checks because the temporary WSL
interop endpoint could not reach the existing authenticated GitHub CLI; using
the live endpoint restores the unchanged attribution verifier. No credentials
or identity policy were changed. One incoming backend import-order warning
was corrected by moving its existing import; focused ESLint with
`--max-warnings 0` and formatting pass, followed by the combined build/tests.
Exact logs are
`.tmp/shadcn-modernization-2026-09-22/preflight-surface-cleanup-preflight-final.log`.
This remains local evidence; current published-head CI is a separate gate.
