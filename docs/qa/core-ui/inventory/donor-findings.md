# Donor UI source coverage

The opportunities below describe the original baseline. Current source dispositions, focused results and limitations are recorded in [donor.json](./donor.json). Commercial permission and actual source reuse are recorded separately.

26 routes, 2 global fallback surfaces, 89 TSX files / 13,040 lines indexed. Browser evidence is pending and no checks were run by this read-only audit.

The route/import/source ledger is [donor.json](./donor.json). Root owns shared public/auth primitives and research/license approval. Current client exposes no ReUI MCP tools.

## Material candidates

### D01 — Dashboard shared shell

Evidence: `apps/donor/app/(dashboard)/donor-dashboard/layout.tsx:32; dashboard-shell-skeleton.tsx:11`.

Hardcoded bg-zinc-50 conflicts with central semantic background; preserve hierarchy and auth sibling/Suspense contracts.

Composition: Existing shadcn Card/Skeleton + Core shell; no new registry dependency.

### D02 — Donor reading hierarchy

Evidence: `features/donor/components/ImpactTile.tsx:58; donor-dashboard-main-body.tsx:203; history/page-content.tsx:191; feed/page-client.tsx:206; settings/page-client.tsx:1013; wallet/page-client.tsx:1281`.

Small uppercase tracking-heavy descriptions/prose/fields and low-contrast Zinc-300/400 impede scanning; standardize headings, sentence-case body/labels, semantic muted/foreground/Card/border while preserving data and copy.

Composition: Official shadcn Card/Field/Badge/Alert/Empty composition already installed.

### D03 — Feed controls

Evidence: `app/(dashboard)/donor-dashboard/feed/page-client.tsx:73; :104`.

Use shared Button for pressed filters/bookmark, explicit accessible bookmark name and pressed state; eliminate spring press from ordinary action. Preserve local saved override and ReactionBar transport.

Composition: Official shadcn Button / Base UI button; no feed data migration.

### D04 — History chart and toolbar

Evidence: `app/(dashboard)/donor-dashboard/history/page-content.tsx:161; :363`.

Use semantic chart/tooltip tokens and ordinary shared controls; keep table boundary/configuration, filters/calculations/links intact. Do not install vendor DataGrid that targets incompatible TanStack.

Composition: Existing DataTableResponsive/shadcn Chart conventions; ReUI free data-grid documentation research only until pinned-beta compatibility review.

### D05 — Recurring status

Evidence: `app/(dashboard)/donor-dashboard/pledges/page-client.tsx:42`.

Map existing active/paused meanings to centralized success/warning token names; keep normalized mapping/currency/date and billing portal behavior.

Composition: Official shadcn Badge + semantic status tokens.

### D06 — Settings accessibility

Evidence: `app/(dashboard)/donor-dashboard/settings/page-client.tsx:94; :1017`.

Use controlled Base UI Tabs with accessible orientation and panels; preserve remount behavior/unsaved state and profile API. Password visibility control needs visible focus and shared touch geometry.

Composition: Official shadcn Tabs/Button already installed; substantive keyboard behavior TDD required.

### D07 — FAQ search and cards

Evidence: `app/(public)/(hero)/faq/faq-client.tsx:159; :260; :270`.

Adopt InputGroup with shared icon action and ring state, preserve search/category/Accordion public seam; semantic card/open-panel text colors.

Composition: Official shadcn InputGroup/Button/Accordion already installed.

### D08 — Financial chart tokens

Evidence: `app/(public)/(hero)/financials/financials-client.tsx:14; :289`.

Replace raw pie fill/tooltip/light card styles with central chart and semantic tokens while preserving exact static allocation values and Recharts lazy/error engine.

Composition: Official shadcn chart styling patterns; no chart-engine migration.

### D09 — Public surface coherence

Evidence: `app/(public)/(hero)/ways-to-give/ways-to-give-client.tsx:22; workers/workers-client.tsx:214; (solid)/[...cmsSlug]/page.tsx:60; help/about/page.tsx:25; (hero)/latest-ministry-updates.tsx:26`.

Retain existing editorial structures and copy but unify semantic background/card/border/text/buttons/radii/shadows; inverse sections need central token-aware composition, not direct light/dark raw color mappings.

Composition: Official shadcn Card/Button/Badge + existing public compositions. Retain this existing composition for product/compatibility fit; licensed Pro settings source is integrated separately under the owner-confirmed agreement.

### D10 — Worker visual contrast and giving

Evidence: `app/(public)/(hero)/workers/workers-client.tsx:88; app/(public)/(solid)/workers/[id]/giving-widget.tsx:76`.

Directory empty opacity overlay is not a scrim; put a real semantic media scrim under white image text. Preserve named transition surfaces. Giving amount control can compose shared InputGroup without changing type/validation/amount/link semantics.

Composition: Existing shadcn InputGroup/RadioGroup/Meter; native semantic render is allowed. ReUI examples API review when possible.

### D11 — Quick give affordances

Evidence: `features/giving/components/QuickGiveInput.tsx:88; :132`.

Current expanded action uses motion.button/plain input with raw slate/white and invalid action only visually disabled; use shared component touch/focus styling while retaining invalid-click focus and Enter-to-navigation behavior.

Composition: Official shadcn InputGroup/Button; supported native render; motion occupancy tests must remain.

### D12 — Narrow checkout confidence

Evidence: `app/(public)/(solid)/checkout/checkout-client.tsx:1425; :452`.

Expose existing summary target/gift/fees/total below lg without duplicate state, and aria-current=step on progress. No payment data, request, form validation, or provider behavior changes.

Composition: Existing SummaryCard/shadcn Card/Collapsible or native details semantic composition. Test mobile summary exact quoted values at same fixtures.

### D13 — Signing scaffold layout

Evidence: `app/(public)/(solid)/sign/[token]/page-client.tsx:118; :138`.

Signature/date row fixed w-64 horizontal layout overflows small viewports; responsive stack and shared Button/Card semantics improve current prototype without activating business capability.

Composition: Official shadcn Button/Card/Dialog, no signature engine.

### D14 — Map control shell

Evidence: `app/(public)/(solid)/where-we-work/map-wrapper.tsx:44; :535; :785; :848`.

Handbuilt icon functions can use Lucide. Close/search/selected buttons need shared focus/touch/press; marker classes/legend can use appropriate central chart/category tokens. Leave MapLibre engine and keyboard dialog/sheet behavior.

Composition: Official shadcn Button/Dialog/Sheet/Command + existing Map specialized wrapper; no map replacement.

### D15 — Global status UI

Evidence: `app/global-error.tsx:22; :41; global-not-found.tsx:15; no-access/page.tsx:18`.

Replace one-off raw card/button styling with shared Maia semantic status composition; preserve standalone html/body global error/not-found shape, Sentry, reset, metadata and hrefs.

Composition: Official shadcn Card/Button/Empty; global fallback must not depend on failing application providers.

## Deliberate retention

DonorSubNav command palette, current-route naming, shared Maia buttons, permission shell/role gate, forced-light root theme, global providers, OpenPolicy customization seam, worker profile Base UI Tabs and request-fresh giving Suspense leaf are sound. Wallet is a tokenized local prototype using Field, InputGroup, RadioGroup, Dialog, Tabs and Empty; preserve those compositions and all local state.

Unreachable legacy exports WorkerProfileClient, MissionBriefing, donor DashboardFooter and QuickGive have no traced product route consumer. Do not claim they are changed visible screens or remove them opportunistically.

Notifications/security/wallet/signing/report/instruction/marketing surfaces retain intentional scaffolds. Broader Phase25 donor-source implementation and native auth/payment/provider qualification are outside this UI task.

## Verification limits

All route entries list narrow/wide and important state expectations. Separate browser agent must attach matching before/after screenshots and current runtime outcome; source inspection alone establishes no visual audit result. Relevant unit/E2E seams are listed in the JSON.

Final checkout visual correction: actual matching wide/narrow review exposed the preset RadioGroupItem caller leaving the shared default size-4 width while setting h-24, so all four amount labels overflowed thin vertical pills. The existing caller now sets w-full to fit its grid cell; Base UI values, handlers, keyboard semantics, custom amount, fee calculation, details values and payment state/model remain unchanged. Five existing meaningful checkout suites passed85 tests (4.44s); targeted lint, formatting and diff checks passed. Diagnostic images are retained as reviews/donor-checkout-presets-before-final-fix-wide.png and -narrow.png. Runtime matching recapture and measured label/button bounds are pending at source handoff; no class-string tests or extra registry dependency were introduced.

Final V04 mobile-history correction (D04): actual narrow screenshot showed three blank cards while wide view rendered three actual transactions because the only donor DataTableResponsive caller omitted mobileCardConfig. A local renderCard now uses real row cells via Core TanStack boundary flexRender to preserve recipient/payment metadata, exact existing date/currency formatters, category/status Badge variants and successful receipt/annual statement links. Native Maia cards provide readable named articles; sorting/filtering/data/query/pagination/virtualization remain owned by the existing standard table. Public HistoryTransactionsCard test with canonical demo snapshot records reproduced two RED failures (missing names/receipt links), then four relevant files/eight tests passed. Donor typecheck/scoped lint/format/diff passed. Previous actual screenshot diagnostics are reviews/donor-history-before-mobile-fix-wide.png and -narrow.png. Matching runtime recapture and keyboard actions remain pending at source handoff. Rollback is this local renderCard mapping/export/test only; no engine/config/dependency/data rollback.

Final V06 public navigation contrast correction (D07/D08/D09): FAQ, Financials and WaysToGive actual unscrolled wide/narrow screenshots had white hero-navigation controls over their existing light reserved pt20 area. Only these page roots now position an aria-hidden/pointer-events-none decorative h20 bg-invert strip behind the fixed transparent navigation. Existing central invert colors/contrast govern; the rest of page content, home dark hero, static Navbar variant, route/provider boundaries, mobile Sheet and solid-on-scroll behavior remain unchanged. Navbar source uses responsive vertical padding rather than a hardcoded80px height; runtime will prove the actual foreground control bounds and contrast at wide/narrow. Three FAQ accessibility/hydration+motion files/fifteen tests pass, donor typecheck/scopedlint0errors0warnings/format/diff pass. Root-owned FAQ Clear focus fix is retained. Diagnostics are reviews/donor-{faq,financials,ways-to-give}-before-nav-strip-{wide,narrow}.png; matching browser proof pending at source handoff. Rollback removes these three local decorative strips and relative positioning only.
