# Admin Dashboard — UX/UI Standards

> Practical composition guidance for Core admin UI. The [shared UI contract](../../packages/ui/AGENTS.md), [frontend rules](rules/frontend.md), and current shared component APIs take precedence. Existing legacy styling is not a template for new work.

## Table of Contents

- [Design Philosophy](#design-philosophy)
- [Typography](#typography)
- [Color System](#color-system)
- [Layout & Spacing](#layout--spacing)
- [PageShell Component](#pageshell-component)
- [Stat Cards](#stat-cards)
- [Buttons](#buttons)
- [Sidebar](#sidebar)
- [Tables](#tables)
- [Detail Sheets](#detail-sheets)
- [Cards](#cards)
- [Motion & Animation](#motion--animation)
- [Charts](#charts)
- [Empty States](#empty-states)
- [Icons](#icons)
- [Accessibility](#accessibility)
- [Component Imports](#component-imports)
- [Pages NOT Following PageShell Pattern](#pages-not-following-pageshell-pattern)
- [Checklist for New Pages](#checklist-for-new-pages)

## Design Philosophy

Calm, predictable, fast. Use clear hierarchy, readable labels, useful density, and reachable actions. Compose existing product behavior rather than filling gaps with demo records or invented capabilities.

### Non-Negotiables

- Preserve exact `base-maia`, Base UI through `@base-ui/react`, Zinc as the configured base color, semantic CSS variables, and the existing aliases/icon system in [components.json](../../packages/ui/components.json).
- Maia includes geometry, spacing, radii, and composition. Reuse shared owners from `@asym/ui`; do not restyle their internals or create app-local primitive forks.
- Use Base UI `render` composition, not Radix `asChild`. Preserve native HTML and specialized engines where they already own behavior.
- Keep Inter, Syne, and Geist Mono through the existing font tokens. Shared primitives support light/dark; the [admin shell](../../apps/admin/app/mc-shell.tsx) deliberately forces light. Preserve that restriction, Web Studio's shell exception, Eve panel, providers, and route-transition boundary.
- ReUI is a source registry through shadcn. Follow the [Core ReUI workflow](../guides/development/reui.md) and source-license record; inspect source/dependencies and adapt accepted output to Maia. Do not initialize shadcn, replace the theme, or install a competing primitive system.

## Typography

### Fonts

| Font                     | Usage                                                                            |
| ------------------------ | -------------------------------------------------------------------------------- |
| Inter (`font-sans`)      | Default UI body and component text                                               |
| Syne (`font-display`)    | Existing editorial/display treatments; not a mandatory override on every heading |
| Geist Mono (`font-mono`) | Copyable IDs/codes and currency columns where fixed-width digits help            |

Prefer ordinary proportional text for dates, timestamps, descriptions, and labels. Add `tabular-nums` when comparing aligned numeric values; keep existing currency, units, and formatting helpers.

### Type Scale

Let the owning component set its default typography:

| Element                 | Current composition                                              |
| ----------------------- | ---------------------------------------------------------------- |
| PageShell compact title | Responsive `text-2xl` → `text-3xl` → `text-4xl`, semibold        |
| PageShell default title | Responsive `text-3xl` → `text-4xl` → `text-5xl`, bold            |
| Page description        | Readable `text-sm text-muted-foreground`, natural wrapping       |
| Section/body text       | Usually `text-base` or `text-sm`, according to hierarchy         |
| Card title/description  | Shared `CardTitle` / `CardDescription` defaults                  |
| Field labels            | Shared `FieldLabel`; explicit association with the input         |
| Statistic value         | Clear semibold numeric text; size reflects its actual importance |
| Supporting text         | Usually `text-sm` or `text-xs text-muted-foreground`             |

Do not prescribe tiny arbitrary font sizes, forced uppercase, or wide tracking for all labels/buttons. Use real heading elements where they express document structure.

## Color System

The semantic palette lives in [globals.css](../../packages/ui/styles/globals.css). Zinc is the configured palette family, not a reason to use raw Zinc classes.

| Purpose                            | Tokens / shared variants                                                                                       |
| ---------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| Canvas and primary text            | `background`, `foreground`                                                                                     |
| Cards and overlays                 | `card` / `card-foreground`, `popover` / `popover-foreground`                                                   |
| Supporting text and boundaries     | `muted-foreground`, `border`, `input`, `ring`                                                                  |
| Primary/secondary actions          | Shared Button `default`, `secondary`, `outline`, `ghost`, `destructive`                                        |
| Status meaning                     | `success`, `warning`, `info`, `destructive`; shared Badge/Alert variants                                       |
| Sidebar identity and navigation    | Existing `sidebar-*` tokens and Sidebar APIs                                                                   |
| Data series/categories             | Existing `chart-*` tokens and chart configuration                                                              |
| Intentional inverse/photo surfaces | Existing `invert` / `invert-foreground` and `media-scrim` / `media-foreground` with composited contrast review |

Use labels/icons alongside color. Preserve persisted status/category meanings; a selected label tone is not automatically an error. Do not replace global values to fix one block. A needed semantic addition belongs in the shared owner with light/dark values, actual consumers, and contrast evidence.

## Layout & Spacing

Use the existing page's shell and density. `PageShell` supplies responsive padding, a wrapping title/action header, and `default` or `compact` rhythm; compact uses smaller section/header gaps. Arrange native content grids with ordinary spacing-scale utilities.

Content may fill available width; forms, descriptions, and focused tasks may use justified width constraints. Do not impose a universal no-`max-w-*` rule or wrap every page in duplicate padding. Long text, action groups, filters, and footers must fit narrow viewports without clipping controls.

Keep Next.js Server/Client boundaries, Suspense placement, Cache Components, and route transitions intact. Do not turn an entire page into a client component solely for a registry layout.

## PageShell Component

Use [PageShell](../../packages/ui/components/primitives/page-shell.tsx) for ordinary module pages that follow its existing layout:

```tsx
<PageShell
  title="Contributions"
  description="Track and manage donations and contributions."
  density="compact"
  actions={actions}
>
  {/* Existing data-bound statistics and content */}
</PageShell>
```

The example illustrates slots; bind only actions the page actually supports. Use the existing `actions`, `breadcrumbs`, and density APIs without overriding title geometry. The compatibility `badge` prop no longer renders content.

[PageHeader](../../packages/ui/components/page-header.tsx) remains a supported shared header for suitable existing layouts, including its named title View Transition. TilePage and editor/auth shells remain valid boundaries. Do not duplicate an `<h1>` when the owning shell already provides it.

## Stat Cards

Prefer existing data-bound compositions or neutral shared `Card` slots. For a simple statistic, `label` and `value` below are the existing product label and already formatted value:

```tsx
<Card>
  <CardHeader>
    <CardDescription>{label}</CardDescription>
  </CardHeader>
  <CardContent>
    <p className="text-2xl font-semibold tabular-nums">{value}</p>
  </CardContent>
</Card>
```

Keep calculations, units, permissions, loading/error/empty states, and existing icons where useful. A trend is not inherently good or bad; retain the business meaning. Stat cards do not require staggered entrances, hover lifts, raw white/Zinc surfaces, or a custom radius.

## Buttons

Use the shared [Button variant and size APIs](../../packages/ui/components/shadcn/button-variants.ts):

```tsx
<Button>Save changes</Button>
<Button variant="outline">Cancel</Button>
<Button variant="destructive">Delete</Button>
<Button variant="ghost" size="icon-sm" aria-label="More actions">
  <MoreHorizontal aria-hidden="true" />
</Button>
```

Choose primary emphasis according to the task. Preserve submit types, disabled/pending state, names, and handlers. Shared Buttons own typography, radius, colors, focus, and press feedback; callers should not copy custom heights/padding/uppercase/hover styles. Use `buttonVariants` on Next.js `Link` for navigation-shaped buttons.

Base UI trigger composition puts the rendered Button's content inside the `render` element. Use the rendered Button's supported variant/size rather than nesting buttons or styling the trigger around it.

## Sidebar

Keep the app's existing permission-aware navigation, tenant branding, account actions, mobile controls, and provider boundaries. Use shared Sidebar slots and `sidebar-*` tokens rather than importing another app's shell wholesale.

- Use `SidebarMenuButton` with `isActive`, `render`, tooltip, and supported size APIs. Its owner supplies active/hover/focus geometry.
- Keep current route matching and collapsed/mobile behavior. `SidebarRail` toggles the sidebar; it is not a general resize engine.
- `SidebarTrigger` honors an explicit shared Button size. Its legacy default remains unchanged.
- Preserve reachable account menus and sign-out wherever the app currently locates them; do not mandate a display-only footer.
- `AppIcon` remains Lucide-based. Its animated mode currently uses a stable Motion span with `initial={false}`; it does not provide the old active-route spring entrance.
- The sidebar shortcut must leave editable controls, cancelled events, and IME composition alone.

## Tables

Use [DataTableResponsive](../../packages/ui/components/shadcn/data-table/data-table-responsive.tsx) and existing [TanStack boundary](../../packages/ui/components/shadcn/data-table/tanstack.ts). Do not import a second grid or bypass the pinned version/adapters for visual changes.

### Mobile Records and Actions

`mobileCardConfig` is optional in TypeScript, but the default responsive behavior switches to cards below 768px. **Every caller with an active card view must supply meaningful primary fields or a `renderCard`.** There is no automatic column-cell fallback: missing fields render empty strings and can produce blank records.

Field-based cards suit records that need only the configured identity/supporting/status fields. Use `renderCard` when the row needs formatted dates/currency, multiple labeled values, links, receipt controls, or other existing cell actions. Preserve existing formatter helpers and actual values.

Real source examples:

- [Partner roster](../../apps/missionary/app/donors/donors-page-roster.tsx): `name`, `location`, and `status`, with the existing record-open callback; selection intentionally disabled.
- [Contributions](<../../apps/admin/app/(app)/contributions/main-body.tsx>): formatted amount/date, donor/fund/status, anonymous identity handling, selection, and detail opening.
- [Donor History](<../../apps/donor/app/(dashboard)/donor-dashboard/history/page-content.tsx>): actual transaction values and existing receipt action.
- [Partner Giving](../../apps/missionary/app/donors/donors-page-detail.tsx): the existing Date/Type/Method/Amount/Status cells from actual gift activities.
- [Support table](../../apps/admin/features/support-hub/components/table/SupportTableView.tsx): conversation values, open action, and controlled bulk selection.

A custom `renderCard` bypasses the default card's identity, selection, and action wrappers. **It owns those controls.** When row selection applies, compose a record-named Checkbox using the actual row state (`row.getIsSelected()`, `row.getCanSelect()`, `row.toggleSelected(checked)`). Keep the Checkbox outside the record-open button/link, so selecting a row does not open it. Preserve remaining row actions and the same bulk-action payload. Opening a Support conversation is distinct from bulk row selection.

Intentionally table-only surfaces remain appropriate. For `DataTableResponsive`, use the existing explicit contract when needed:

```tsx
config={{
  enableViewToggle: false,
  defaultViewMode: "table",
  mobileBreakpoint: 0,
}}
```

`DataTableWrapper` already supplies these defaults. Current CRM, Notes, and Relationships retain their explicit table-only mode and manual operations. Verify horizontal scrolling and action reachability instead of forcing cards onto every dense table.

### Behavior and Columns

Preserve sorting, filters, saved serialization, URL/browser history, server/manual pagination and totals, stable IDs, selection, column controls, virtualization, keyboard access, exports, realtime updates, and optimistic mutations. Never apply client filtering/sorting only to the loaded server page.

Use the existing column factories and shared cell adapters. Names remain readable; currency/IDs may use `font-mono` and `tabular-nums`; dates use existing date/timezone formatters. Status labels and semantic Badge variants retain their meanings. ReUI Filters/Data Grid replacements require API/state compatibility review, not a cosmetic swap.

## Detail Sheets

Use existing shared `Sheet`, `SheetContent`, `SheetHeader`, `SheetTitle`, and description/footer slots. Let the owner provide geometry, focus, dismissal, scrolling, and close controls. Keep readable labels and long values, meaningful headings, pending/error feedback, and reachable actions at narrow/short viewports.

Preserve form payloads, dirty state, keyboard submission, async validation and focus restoration. Use TanStack Form/Zod for existing complex forms and native/server forms where intentional. For long dialogs use `DialogContent scrollable`; do not add competing consumer height/scroll implementations.

## Cards

Use shared `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, and `CardFooter` slots with their Maia defaults. Native child wrappers may arrange content; caller classes do not redefine the primitive's surface, radius, padding, focus, or motion.

Interactive cards need a real named button/link and visible keyboard focus. Static information cards do not require hover motion. Use the existing source-derived shared settings compositions where they fit live settings sections; they do not own app field/save state.

## Motion & Animation

Follow the [motion rulebook](rules/frontend.md#motion-rules) and [Core motion skill](skills/anim/SKILL.md). Use motion only when it improves feedback, continuity, or state understanding; calm static statistics/content are valid.

- Import JS motion from `@asym/lib/motion` and timing/presets from [motion-presets](../../packages/lib/motion-presets.ts). Use existing `--duration-*` / `--ease-*` CSS tokens instead of new literals.
- Shared Button press feedback is automatic. Native controls use `press-feedback` where appropriate; avoid duplicate CSS/Motion transforms.
- `hover-lift` / `hover-scale-subtle` already gate transforms to fine pointers. Avoid ungated touch hover effects and `transition-all`.
- Route entrances belong to the existing boundary. Suppress a component entrance inside a route View Transition via `useWithinViewTransitionRouteLayer()`; PageShell already handles this.
- Respect `useReducedMotion()` and keep server/initial-client markup stable. Do not require delayed stat/content entrances, springs on controls, or animations for keyboard command activation.
- Preserve existing gesture/editor exceptions and supported extension points; do not add a parallel animator.

## Charts

Retain the existing chart engine and loading boundary. Some client-only charts use `dynamic(..., { ssr: false })`; that is an existing implementation choice, not a mandate to rewrite every chart.

Use the shared `ChartContainer`, `ChartConfig`, tooltip, and legend APIs where the chart already follows them. The [Support bar chart](../../apps/admin/features/support-hub/components/reports/ReportBarChart.tsx) demonstrates semantic series and axes:

```tsx
config={{ value: { label: title, color: "var(--chart-1)" } }}
```

Its series uses `var(--color-value)`, grid uses `var(--border)`, and axes use `var(--muted-foreground)`. Preserve actual calculations, labels, currency/units, date ranges, accessible summaries and zero values. Use existing loading/empty/error chart wrappers where appropriate. Do not prescribe raw hex palettes, custom tooltip appearance, or staggered bar animation.

## Empty States

Compose the shared `Empty`, `EmptyHeader`, `EmptyMedia`, `EmptyTitle`, `EmptyDescription`, and `EmptyContent` slots. State what actually happened: no records, no filter matches, unavailable service, permission denied, and loading are different states.

Only offer actions the product supports. Preserve truthful scaffolding and existing retry/filter-reset behavior; do not invent records or activate unfinished integrations to make a screen appear complete.

## Icons

Import Lucide icons from `lucide-react`, or use the existing shared `AppIcon` API. Do not add another icon library for sidebar animation. Shared controls own their standard icon sizing; decorative icons are hidden from assistive technology, and icon-only controls have persistent accessible names.

## Accessibility

Check keyboard navigation, focus visibility/restoration, labels/errors, dialog dismissal, portal/scroll interactions, zoom/reflow, and touch behavior. Use native headings, landmarks, tables, and form associations, with Base UI behavior where appropriate.

Prefer comfortable touch hit areas and spacing through supported owner sizes or native labeled wrappers; do not restyle a shared Button's dimensions to meet a target. Check compact targets against the accessibility requirements and actual narrow layout. Status/photo contrast must be verified in the rendered light/dark or supported app mode. Automated accessibility checks complement manual interaction review.

## Component Imports

```tsx
import { Button } from "@asym/ui/components/shadcn/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@asym/ui/components/shadcn/card";
import { DataTableResponsive } from "@asym/ui/components/shadcn/data-table";
import type {
  ColumnDef,
  Row,
} from "@asym/ui/components/shadcn/data-table/tanstack";
import { PageShell } from "@asym/ui/components/primitives/page-shell";
import { Sheet, SheetContent } from "@asym/ui/components/shadcn/sheet";
import { AppIcon } from "@asym/ui/components/shadcn/icons/AppIcon";
import { SettingsCard } from "@asym/ui/components/settings";
```

Use `cn` from `@asym/ui/lib/utils` when merging allowed native/placement classes. Preserve actual business formatting imports rather than inventing a generic formatter. App feature compositions remain in their owning app; reusable controls belong in `packages/ui`.

## Pages NOT Following PageShell Pattern

| Surface                            | Existing boundary                                                                      |
| ---------------------------------- | -------------------------------------------------------------------------------------- |
| Email / PDF Studio                 | Dedicated editor chrome and supported runtime adapters                                 |
| Web Studio                         | Payload/editor and preview layout; preserve the admin shell exception                  |
| Sign Studio                        | TilePage composition                                                                   |
| Login / Register                   | Shared auth flow                                                                       |
| Other existing specialized layouts | Retain the established shell when PageShell would duplicate structure or remount state |

These exceptions preserve composition and engine ownership; their first-party chrome still follows semantic tokens, shared controls, accessibility, and supported motion.

## Checklist for New Pages

- [ ] Exact Base UI + `base-maia` configuration, shared aliases/fonts/icons/tokens preserved.
- [ ] Existing shell/provider/theme restriction retained; PageShell density or a justified existing specialized layout used.
- [ ] Shared Button/Card/field/overlay APIs used without appearance overrides or raw palettes.
- [ ] Real data, calculations, payloads, permissions, async states and supported actions preserved.
- [ ] Active mobile cards show meaningful records and all applicable controlled selection/actions; table-only layouts scroll accessibly.
- [ ] TanStack imports remain behind the Core boundary; manual/server operations and saved/URL state remain intact.
- [ ] Forms, accessible names, keyboard/focus, touch, narrow/long-text and loading/empty/error/pending states verified.
- [ ] Motion uses existing tokens, respects reduced motion and route boundaries, and does not add mandatory entrances.
- [ ] Charts use semantic configuration and retain existing engine/formatting/loading boundaries.
- [ ] Scoped design-system lint and relevant component/browser checks completed; shared changes checked across consumers.

Follow the [design-system lint workflow](skills/moai-library-shadcn/references/design-system-lint.md) and [testing rules](rules/testing.md) for the applicable checks. Registry work also follows [ReUI guidance](skills/reui/SKILL.md), source rights, and controlled source/dependency review.
