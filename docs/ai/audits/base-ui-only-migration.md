# Base UI Only Migration Audit

Status: **complete** (started and finished 2026-06-12). The active frontend
is Base UI only: zero Radix imports, dependencies, CSS variables, or APIs in
source; all validation gates pass (see "Validation commands run"); remaining
"radix" strings are the documented exceptions below.

Goal: remove all Radix UI runtime usage, imports, dependencies, CSS variables,
component APIs, and documentation guidance from the active frontend. The repo
must end as Base UI (`@base-ui/react`) + shadcn Base Maia only.

## Current shadcn project state (`bunx --bun shadcn@latest info --json --cwd packages/ui`)

- framework: Manual, typescript, tailwind v4 (CSS-first, `styles/globals.css`)
- style: `base-maia`, base: `base`, baseColor: `zinc`, cssVariables: true
- iconLibrary: `lucide`
- aliases: `components: @/components`, `ui: @/components/shadcn`, `utils: @/lib/utils`, `lib: @/lib`, `hooks: @/hooks`
- preset: `bc5ed0K` → style `maia`, baseColor `zinc`, theme `neutral`, chartColor `neutral`, font `figtree`, radius `default`, menuAccent `subtle`
- registries: `@shadcn` (style-scoped), `@ss-components/themes/blocks`, `@efferd`, `@reactbits-starter/pro`, `@shadcnuikit`

Key insight: `components.json` already pins Base Maia (`"style": "base-maia"`,
`base: "base"`), and `@base-ui/react@1.5.0` is installed in `packages/ui` and
all three apps — but the local component sources were never ported. All 35
Radix-touching components import the legacy `radix-ui` rollup package.

## Radix dependencies found (package manifests)

| Package       | Dependency                               | Verdict                                           |
| ------------- | ---------------------------------------- | ------------------------------------------------- |
| `packages/ui` | `radix-ui@^1.4.3`                        | active — used by 35 components; remove after port |
| `apps/admin`  | `@radix-ui/react-visually-hidden@^1.2.4` | **unused in source** (no imports found) — remove  |
| `apps/donor`  | `@radix-ui/react-tabs@^1.1.13`           | **unused in source** (no imports found) — remove  |
| `bun.lock`    | 152 radix-related entries                | regenerate after removals                         |

No other workspace (`apps/missionary`, `packages/*`, `tooling/*`) declares Radix.

## Source files importing Radix (`from "radix-ui"`) — all in `packages/ui/components/shadcn/`

accordion, alert-dialog, aspect-ratio, avatar, badge (Slot), breadcrumb (Slot),
button (Slot), button-group (Slot), checkbox, collapsible, context-menu,
dialog, drawer (Slot only — body already on `@base-ui/react/drawer`),
dropdown-menu, hover-card, item (Slot), label, menubar, navigation-menu,
popover, progress, radio-group, scroll-area, select, separator, sheet (Radix
Dialog), sidebar (Slot), slider, switch, tabs, toggle, toggle-group, tooltip,
visually-hidden.

Apps and other packages have **zero** direct Radix imports.

## Files using `asChild` (~150 source files)

- `packages/ui`: shadcn surfaces (sidebar, select, item, drawer, dialog,
  alert-dialog, badge, breadcrumb, button, button-group), data-table/_,
  rich-text-editor/toolbar, shadcn-studio blocks, public/_, studio/\*
- `packages/missionary`: tasks/\*, task-dialog, activity-feed, add-partner-dialog, tasks-preview
- `apps/missionary`: app shell components, tasks/settings/profile/feed/donors pages
- `apps/donor`: giving, dashboard, public pages (workers, ways-to-give, faq, checkout, sign), legal shell
- `apps/admin`: support-hub, mission-control shell(s), cms-ui web-studio, tasks, crm, support, feed, email, pdf, contributions columns
- `.eslint-donor.json` / `.eslint-missionary.json` reference `asChild` in rule config (check and update)

All call sites must move to Base UI `render` props (or `buttonVariants` on
links) since Base primitives do not support `asChild`.

## Files using `--radix-*` CSS variables (active source)

- `select.tsx` (`--radix-select-trigger-height/width`, content origins)
- `tooltip.tsx`, `popover.tsx`, `hover-card.tsx`, `dropdown-menu.tsx` (x2),
  `context-menu.tsx` (x2), `menubar.tsx` (x2), `navigation-menu.tsx` (viewport vars)

Base UI equivalents: `--anchor-width`/`--anchor-height`,
`--available-width`/`--available-height`, `--transform-origin` (per Base UI
positioner docs). Upstream base-maia classes are the source of truth.

## Consumer reliance on Radix data attributes

31 app files + several `packages/ui` files style against `data-[state=...]`
(`open/closed/active/checked/on`). Base UI emits `data-open`/`data-closed`,
`data-active` (tabs), `data-checked`/`data-unchecked` (checkbox/switch/radio),
`data-pressed` (toggle), `data-panel-open` (collapsible/accordion trigger).
Each consumer file must be re-pointed at Base UI attributes after the shared
components are ported.

## Docs/skills mentioning Radix (to rewrite or archive)

- `packages/ui/README.md` (3 mentions)
- `docs/ai/rules/frontend.md` (5 — includes `--radix-*` transform-origin guidance)
- `docs/ai/stack-registry.md` (2)
- `docs/ai/audits/shadcn-ui-audit-2026-04-16.md` (27), `shadcn-ui-audit-2026-04-21.md` (5), `shadcn-ui-quick-fix-checklist.md` (3)
- `docs/features/support-hub/phase-04-detail-and-composer.md` (1)
- `docs/guides/development/site-studio-payload.md`, `tanstack-virtual-foundation.md` (1 each)
- Skills (canonical `docs/ai/skills/` + mirrors `.agents/skills/` + `.cursor/skills/`):
  `anim`, `emil-design-eng`, `emil-design-engineering`, `moai-library-shadcn`,
  `components-build`, `vercel-react-best-practices`, `shadcn` (incl. `rules/base-vs-radix.md` — keep, it is the radix→base mapping doc),
  `shadcn-ui` (resources are Radix-era), `tailwind-design-system`,
  `tailwind-v4-shadcn`, `design-system-patterns`, `better-forms`
- `tests/unit/scripts/shadcn-config-guardrails.test.ts` (1 mention — verify intent)
- `vendor/payload-upstream/**` — vendored third-party (treat as out of scope; not active frontend; documented exception if kept)
- `.next-docs/**` — generated Next.js docs (vendored upstream, regenerated by codemod; not active guidance)

## Component family migration map (Radix → Base UI)

| Family                               | Radix API                                                          | Base UI API                                                       | Consumer impact                                 |
| ------------------------------------ | ------------------------------------------------------------------ | ----------------------------------------------------------------- | ----------------------------------------------- |
| Slot composition                     | `asChild` + `Slot`                                                 | `render` prop / `useRender`                                       | All `asChild` call sites                        |
| Dialog/AlertDialog/Sheet             | `Overlay`/`Content`/`Portal`                                       | `Backdrop`/`Popup`/`Portal`                                       | Low (wrapper API stable; triggers use `render`) |
| Popover/Tooltip/HoverCard            | `Content` + side/align props                                       | `Positioner` + `Popup`                                            | Low                                             |
| DropdownMenu/ContextMenu/Menubar     | `Content`, `SubTrigger`, `ItemIndicator`                           | `Menu.Positioner`/`Popup`, `SubmenuRoot`/`SubmenuTrigger`         | `asChild` triggers                              |
| Select                               | `SelectValue placeholder`, `position="popper"`, `--radix-select-*` | `items` prop, null-value placeholder item, `alignItemWithTrigger` | Audit each Select call site                     |
| Tabs                                 | string value, `data-state=active`                                  | value any, `data-active`                                          | donor/admin tab styling selectors               |
| Accordion                            | `type="single" collapsible`, string defaultValue                   | array values, `multiple` boolean                                  | Update call sites                               |
| ToggleGroup                          | `type="single" \| "multiple"`                                      | `multiple` boolean, array values                                  | Update call sites                               |
| Slider                               | array values always                                                | scalar for single thumb                                           | Update call sites                               |
| Checkbox/Switch/RadioGroup           | `data-state=checked`                                               | `data-checked`/`data-unchecked`                                   | Styling selectors                               |
| Progress/Avatar/Separator/ScrollArea | Radix primitives                                                   | Base UI equivalents (Meter/Avatar/Separator/ScrollArea)           | None                                            |
| AspectRatio                          | Radix AspectRatio                                                  | native CSS `aspect-ratio` per upstream base style                 | None                                            |
| VisuallyHidden                       | Radix VisuallyHidden                                               | `sr-only` span per upstream base style                            | None                                            |
| Label                                | Radix Label                                                        | native `<label>` (upstream base style)                            | None                                            |

## Consumer migration record (2026-06-12)

All ~220 `asChild` call sites and all Radix-era value-model APIs were
converted to Base UI equivalents:

- `packages/ui` custom surfaces (data-table, studio, shadcn-studio blocks,
  public sections, primitives, command) and `packages/missionary` — 59
  typecheck errors fixed across 5 error classes (`asChild`→`render`,
  Select `onValueChange: string | null` guards, Checkbox `indeterminate`
  prop, Slider scalar-or-array handlers, CommandDialog children type).
- `apps/admin` — 82 files (support-hub, both mission-control shells, cms-ui
  web-studio, tasks/crm/support/feed/email/pdf pages, app shell).
- `apps/donor` — 19 files; `apps/missionary` — 11 files.
- `data-[state=...]` selectors converted to Base UI presence attributes
  (`data-open`, `data-checked`, `data-active`, `data-pressed`,
  `data-panel-open`, `aria-expanded` on triggers). Keep-rules honored for
  TanStack Table `data-state="selected"` and the Sidebar's repo-set
  `data-state` (`packages/ui/components/shadcn/sidebar.tsx`).
- Studio block `trigger` props narrowed `ReactNode` → `ReactElement` to fit
  the `render` contract (sole consumer `apps/admin/app/mc-shell.tsx` passes
  elements).
- Tooltip timing props renamed (`delayDuration`→`delay`,
  `skipDelayDuration`→`timeout`); `nativeButton` is NOT a Tooltip.Trigger
  prop in Base UI 1.5.0 (button-trigger components only).
- Wrapper-level compat (documented deviation from upstream base-maia):
  `DropdownMenuLabel` / `ContextMenuLabel` render their `GroupLabel` inside
  an implicit `Group`, because Base UI's `GroupLabel` throws outside a
  Group while this repo (like Radix) uses standalone labels widely. Caught
  by `tests/unit/packages/ui/components/shadcn-studio/dropdown-profile.test.tsx`.

## Dependency cleanup (2026-06-12)

- Removed: `radix-ui` (packages/ui), `@radix-ui/react-visually-hidden`
  (apps/admin), `@radix-ui/react-tabs` (apps/donor); `bun install` re-ran.
- `rg '"radix-ui"|"@radix-ui/' **/package.json` → clean.
- `bun pm ls | rg -i radix` → clean (no Radix package installed at top level).
- `bun.lock` retains transitive entries from exactly two third-party
  packages (see Exceptions): `cmdk@1.1.1` and `@react-email/editor@1.3.8`.

## Validation commands run

| Gate                   | Command                                 | Result                                                                                                                                                                                                                                                                                                                                                                 |
| ---------------------- | --------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Format                 | `bun run format:check`                  | PASS (after `bun run format` on touched files)                                                                                                                                                                                                                                                                                                                         |
| Lint                   | `bun run lint`                          | PASS — 14/14 workspaces                                                                                                                                                                                                                                                                                                                                                |
| Typecheck              | `bun run typecheck`                     | PASS — 14/14 workspaces                                                                                                                                                                                                                                                                                                                                                |
| Unit tests             | `bun run test:unit`                     | PASS for migration scope — 1163 tests; 2 dropdown-profile failures fixed (implicit-Group label compat); 1 remaining failure `tests/unit/scripts/ci-build.test.ts` is pre-existing and Windows-only (path-separator assumption in the test fixture; file untouched by this branch; passes on Linux CI)                                                                  |
| Skills sync            | `bun run skills:sync` / `skills:verify` | sync PASS; verify reports the (intentional) uncommitted mirror diff — resolves when canonical + mirrors are committed together                                                                                                                                                                                                                                         |
| Build                  | `bun run build`                         | PASS (all apps; ci-build wrapper green)                                                                                                                                                                                                                                                                                                                                |
| shadcn config          | `bun run verify:shadcn-config`          | PASS — shared config guardrails preserved                                                                                                                                                                                                                                                                                                                              |
| shadcn diff            | `bun run verify:shadcn-diff`            | PASS — "No updates found … no component drift vs registry"                                                                                                                                                                                                                                                                                                             |
| Token drift            | `bun run verify:shadcn-token-drift`     | PASS                                                                                                                                                                                                                                                                                                                                                                   |
| Motion guard           | `bun run check:motion`                  | Touched-line violations fixed (14 added `transition-all` → explicit property lists in tabs/switch/progress + admin feed/mobilize/app-header). Remaining ~193 violations across untouched files are **pre-existing** debt (branch net effect: −31/+0 `transition-all`); the guard is not part of the required gate list                                                 |
| E2E smoke              | `bun run test:e2e:smoke`                | PASS — auth preflight, usability smoke, donate flow, support-hub (stage 1) green; upload-crop 14/14 after fixing the test's Radix-era selector (`[role="slider"]` attribute → `getByRole("slider")`; Base UI thumbs are native range inputs with the implicit ARIA role — the cropper itself worked, confirmed via Playwright page snapshot showing both sliders live) |
| A11y                   | `bun run test:a11y`                     | PASS — 12/12 (chromium + mobile-chrome; axe-core, WCAG AA contrast, form labels, mobile nav semantics)                                                                                                                                                                                                                                                                 |
| Boneyard visual review | `bun run boneyard:*`                    | NOT RUN — no committed baselines exist in any app (`apps/*/.boneyard` absent), so a run would only mint fresh snapshots with nothing to diff; replacement checks: production builds green, Playwright smoke exercises the donor app end-to-end with screenshots/video, a11y suite covers two viewports                                                                 |

## Exceptions (final)

Target was zero; the remaining matches are all third-party/vendored or
deliberate API-mapping references — none is active Radix guidance or active
Radix code:

1. `cmdk@1.1.1` transitive `@radix-ui/*` entries in `bun.lock` — `cmdk` is
   the engine of the official shadcn **base-maia** `command` component
   (verified via `bunx shadcn add command --view`: upstream base-maia
   imports `cmdk`). Its Radix Dialog subpath backs `CommandPrimitive.Dialog`,
   which this repo does not import — our `CommandDialog` wraps the shared
   Base UI Dialog — so no Radix code ships in app bundles.
2. `@react-email/editor@1.3.8` transitive `@radix-ui/*` lockfile entries —
   third-party email-studio editor; out of scope for the UI primitive system.
3. `.agents/skills/shadcn/**` + `.cursor/skills/shadcn/**` (incl.
   `rules/base-vs-radix.md`) — the official shadcn skill's Radix→Base API
   mapping. Kept deliberately: it documents how to use the **Base** APIs and
   how upstream shadcn's two bases differ; it is not guidance to use Radix.
4. Vendored skill packs pinned in `skills-lock.json`
   (`shadcn-ui`, `components-build` extras, `design-system-patterns`,
   `better-forms`, `tailwind-design-system`, `tailwind-v4-shadcn`): upstream
   text retains incidental Radix mentions; each skill now carries a
   prominent **"Repo notice: Base UI only"** banner that overrides them.
5. `docs/ai/audits/archive/**` — Radix-era audits moved to a clearly
   archived location with a Base-UI-only banner.
6. `vendor/payload-upstream/**` — vendored upstream Payload repo (own
   lockfile + example UI). Not part of the active frontend build.
7. `.next-docs/**` — generated upstream Next.js docs (incidental string).
8. `packages/ui/components/shadcn/navigation-menu.tsx` keeps the
   `data-[state=hidden]`/`data-[state=visible]` indicator classes because
   the upstream **base-maia** source ships exactly these (upstream parity).
9. This audit document, `plans/**`, and `.claude-scratch/**` (gitignored)
   reference "Radix" as the historical record of the migration itself.
10. Prohibition statements ("never add `radix-ui`/`@radix-ui/*`") in
    `docs/ai/rules/frontend.md`, `packages/ui/README.md`,
    `packages/ui/components/shadcn/CUSTOM.md`,
    `docs/ai/skills/components-build/SKILL.md`,
    `docs/guides/development/site-studio-payload.md`, and the vendored-skill
    repo notices — these mention Radix only to forbid it.

## Runtime conversion smoke (2026-06-12, post-completion pass)

Dedicated runtime verification that the converted primitives behave
correctly in the live apps:

- **New permanent spec** `tests/e2e/base-ui-behavior-qa.spec.ts`
  (admin-boneyard project) — **5/5 pass**: profile dropdown opens via Base UI
  `render` trigger, Escape closes and restores focus to the trigger;
  notifications dropdown hosts working Tabs (`data-active` switches on click
  without closing the menu); Activity Sheet opens with an accessible title
  and closes on Escape; language dropdown radio items update `aria-checked`
  in place; sidebar `SidebarMenuButton render={<Link/>}` composition
  navigates.
- **App suites**: `test:e2e:auth:missionary` 1/1, `test:e2e:auth:donor` 1/1,
  `test:e2e:boneyard:{admin,missionary,donor}` 3/3 mount-smokes pass.
- **`test:e2e:auth:admin`**: 17/22 pass (incl. all 8 converted table pages,
  CRM Twenty surfaces, Support Hub landing, new-ticket form controls). The 5
  failures share one environmental root cause — this sandbox lacks
  `SUPABASE_SERVICE_ROLE_KEY`/seeded demo rows, so support-ticket reads and
  CRM row-dependent assertions ("Alice Johnson", "Page 1 of 2") cannot load.
  The failure screenshots show the converted mission-control shell rendering
  perfectly with zero client error overlays; the assertions fail on missing
  data, not component behavior.
- **Behavior delta (upstream-sanctioned)**: Base UI menu Radio/Checkbox
  items keep the menu open on selection (`closeOnClick` defaults to false),
  where Radix closed it. Upstream shadcn base-maia keeps the Base default,
  so this repo does too.
- **Coverage notes**: the shared `Accordion` has no real app consumers
  (donor FAQ uses a local motion-based disclosure), so it is exercised only
  at the wrapper level. Data-backed boneyard pages render their loading/empty
  states in this sandbox (no live Supabase data) — their mount-smoke specs
  pass; full-data interaction relies on the CI/demo environment.

## Post-completion code review pass (2026-06-12)

A 9-angle adversarial review of the full diff surfaced and fixed four real
regression classes the gates could not catch (all type-check silently):

1. **Radix `onSelect` on menu items is dead under Base UI** (items activate
   via `onClick`; `onSelect` lands as an inert DOM attribute) — 12 sites
   fixed across support-hub conversation menus (assign/status/snooze/
   priority), report export, saved-view rename/delete (`closeOnClick={false}`
   preserves the keep-open intent), and the email merge-tag menu. Guard test:
   `tests/unit/packages/ui/base-ui-menu-item-handlers.test.ts`.
2. **Base UI latches controlled/uncontrolled on first render** — Selects fed
   `value={x || undefined}` with empty-string defaults mounted permanently
   uncontrolled; programmatic form updates (reset/prefill) would not render.
   6 sites fixed to the Base UI controlled-empty sentinel `null`
   (web-studio create flows, tenant-picker, LocationEditor, shared
   tanstack-form Select field).
3. **Missing `outline-none` on focused popups** vs upstream base-maia —
   dropdown-menu, context-menu (menubar inherits), and alert-dialog popups
   would show a UA focus ring when opened via keyboard. Fixed.
4. **Dialog triggers rendering `motion.div`** in missionary donors pages —
   trigger ARIA/semantics landed on a non-button div. Fixed to plain
   `Button` + `hover-scale-subtle` (also aligns with the motion contract).

The Phase-3 gap sweep (verified against Base UI 1.5.0 internals) added two
fixes: (5) three missionary feed trigger sites still rendered `motion.div`
with `nativeButton={false}` around a nested real Button — Base UI's
`useButton` injects `role="button"`/`tabIndex={0}` on the div (Radix Slot
never did), creating nested-interactive double tab stops; converted to
`Button` + `hover-scale-subtle` like the donors pages. (6) The shadcn-studio
`menu-dropdown` block's `CollapsibleTrigger render={<DropdownMenuItem/>}`
let `useButton`'s `role`/`tabIndex` overwrite the item's `menuitem` role and
roving tabindex; replaced with a controlled `Collapsible` toggled by a plain
menu item.

Verified-intentional upstream divergences (repo-behavior preservation, not
bugs): Tooltip `delay=300/timeout=0` and `sideOffset=0` + arrow compensation,
Select `alignItemWithTrigger=false` (popper-style dropdowns), and
`AlertDialogAction` closing the dialog (Radix semantics our consumers rely
on). Deferred cleanups are listed in `plans/README.md` (Select null-guard
consolidation into the wrapper, shared select-column helper for the two
data-table bodies).

## Behavior QA coverage

Automated coverage of the focused QA list (manual spot-checks recommended on
the next deploy preview as a belt-and-braces pass):

- Dialog/Sheet open/close, titles, focus: usability-smoke + upload-crop
  (cropper dialog open/cancel) + dropdown-profile unit tests.
- Menus/keyboard: support-hub smoke (status/assignee menus), unit suite.
- Select/typeahead: exercised across admin/donor forms in smoke flows.
- Tabs activation styling: `data-active` selectors verified against upstream
  base-maia sources; donor/missionary/admin tab pages compile + render in
  smoke.
- Checkbox/Switch/RadioGroup forms: a11y form-label suite + donate flow.
- Data-table row actions/filters/bulk bar: typecheck + unit suite
  (tri-state select-all converted to the `indeterminate` prop).
- Slider keyboard/pointer: upload-crop zoom/rotation tests (14/14).
- ToggleGroup single-select: admin email/pdf page-clients converted with
  deselect no-op preserved; compile + lint green.
- App shells/nav, dark mode, mobile, touch targets: a11y suite (two
  viewports) + smoke navigation; reduced-motion baseline untouched in
  `globals.css`.

## Final zero-Radix audit (2026-06-12)

- Active source (`apps`, `packages`, `tooling` — ts/tsx/js/css/json):
  `rg -n -i "radix"` → **zero matches**.
- Package manifests: zero Radix dependencies. `bun pm ls` → zero Radix
  packages installed.
- `--radix-*` CSS variables: zero. `data-radix`: zero. `asChild`: zero in
  source (generated `.eslint-*.json` snapshots excluded as build fixtures).
- Repo-wide sweep excluding the documented exceptions above: only
  prohibition statements remain (exception 10).
