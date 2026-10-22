# Compose a screen

Read this before you build any screen or section, then write the router's 7-line plan in your reply (Surface, Archetype, Container family, Density, Regions, States, Motion) and build exactly that plan. Style it with the topics the screen touches: [layout.md](./layout.md) (house defaults), [color.md](./color.md), [motion.md](./motion.md).

If the brief names a layout or a motion (a left nav, 2 entrances), follow the brief and name the default you overrode. Several entrances run as 1 stagger: at most 6 items, 50ms apart, never on table rows or lists of 20 or more.

## Surface

- **Operational**: a screen people work in every day (dashboard, records, settings, admin tools). Frame-led, dense (`size="sm"` on controls that take it), no hero, no page-load motion.
- **Marketing**: a page a visitor reads once (landing, pricing, features). Card-led sections on the spine below, default density.
- **Flow**: a task people finish and leave (sign in, onboarding, checkout). 1 centered Card or a Dialog, 1 primary action per step.

## Archetypes: pick 1 per screen

- **Vertical rail settings** (3 to 6 sections): a section rail on the left, 1 content column, 1 section at a time; the rail turns horizontal below `md`.
- **Horizontal tabs** (5 to 8 views of 1 object): a full-width `Tabs` rail under the header that scrolls sideways when it overflows, 1 content column.
- **Frame stack**: stacked Frames, each 1 focused group of settings or records; a flat page split by `Separator` rows when it should feel lighter.
- **Table-backed management**: header, toolbar (search, `filters`), then a `data-grid` with row actions and pagination, all in 1 Frame.
- **Dashboard grid**: a KPI row, then 1 or 2 chart or list panels, then the table.
- **Board**: header and filters, then a `kanban` board; `KanbanBoard` stacks its columns below `sm`, and a wider board scrolls inside its own region.
- **Record detail**: header (title, status `Badge`, actions), a main column of sections, a side column of facts that stacks under it below `lg`.
- **Marketing spine**: optional `Badge` eyebrow, headline (the only loud element), 1-clause subhead, action row (1 primary `Button`, a second `variant="outline"`, a third a text link), specific proof beside it ("27 reviews"), media. Omit parts; never reorder them.
- **Auth card**: 1 centered `Card` at `max-w-sm`: title, fields, 1 full-width primary `Button`, a text link to the other flow.
- **Wizard dialog**: a `Dialog` holding a `stepper`, 1 step visible, Back (`variant="outline"`) and Next (primary) in its footer.

An app shell around any of them is the shadcn `Sidebar`, which turns into a `Sheet` below `md` by itself.

## Fill each region in this order

1. The ReUI component that owns the job: the router's Owners (`data-grid`, `filters`, `kanban`), `useFileUpload` from `@/hooks/use-file-upload` for file drop, or the one whose contract in [components.md](./components.md) matches.
2. A shadcn/ui component (`Tabs`, `Dialog`, `AlertDialog`, `Sheet`, `Empty`, `Skeleton`, `sonner`).
3. A free `c-*` example from `get_examples` that already composes it: install it and adapt.
4. Your own composition of those parts. Never a hand-rolled table, modal or tabs.

Import ReUI parts file by file: `data-grid`, `filters`, `cascader`, `event-calendar` and `gantt` are folders with no index file. `data-grid`: the import line in [components.md](./components.md). `filters`, each from `@/components/reui/filters/<file>`: `Filters` from `filters`, `createFilterQuery` and `flattenFilterConditions` (1 argument, the query) from `filters-query`, the types `FilterField` and `FilterQuery` from `filters-types`.

## Wiring that works

- `data-grid`: columns are `ColumnDef<DataGridFeatures, Order>[]`, a sortable header renders `DataGridColumnHeader`, and server paging needs `manualPagination: true` and `rowCount`.
- `filters`: apply each condition by its `operator`. Negate swaps a rule to its inverse (`is` and `is_not`, `contains` and `not_contains`, `is_any_of` and `is_none_of`, `empty` and `not_empty`) and sets `negated` only when there is none: honour both.
- A Base UI `Button` that navigates: `<Button nativeButton={false} render={<Link href="/x" />}>`.
- shadcn's `CommandDialog` has no `Command` inside, unlike older shadcn: wrap `CommandInput` and `CommandList` in one. `CommandItem` search matches its `value`: omit it (text is used) or use the label; ids in `onSelect`.

## Headers

A page or panel header puts the title (1 to 3 words) and a 1-clause description on the left and the actions on the right: 1 primary `Button`, the rest `variant="outline"`, row actions `variant="ghost"`.

## Responsive

- No horizontal page scroll at 390px: grids drop to 1 column, side columns stack, `min-w-0` on every shrinking parent.
- A KPI row is `grid-cols-1 sm:grid-cols-2 xl:grid-cols-4`.
- Every header and toolbar action stays reachable at every width: a control hidden below a breakpoint moves into a menu shown only there.
- A table scrolls sideways inside its Frame, never the page (the `data-grid` contract in [components.md](./components.md)).

## States and motion

- Each data region owns its states: empty (shadcn `Empty` with a title, 1 line and the primary action), loading (`Skeleton` in the real layout; `data-grid` takes `isLoading`) and error (inline in the region, with Retry). Never 1 spinner for the whole page.
- Motion: none, or the 1 entrance per view; installed parts keep their own motion, and hover and press follow [motion.md](./motion.md). An Alert, field error, notice or data that appears after an action or a load is a reveal, not an entrance: fade it in with the reveal row.

## Remove first

Overloaded? Remove, in order: decorative summaries, duplicate context, extra badges, long descriptions, secondary actions, mismatched icon treatments. Add a region only when the brief needs it.
