# ReUI components

<!-- BEGIN:core-reui-overlay -->

## Core usage

Use the current installed `packages/ui` source and manifests alongside the
live API when maintaining existing components. The upstream contracts below
reflect this pinned bundle, not proof that every component has been installed
or upgraded. Standard app tables keep Core's shared `DataTableResponsive`;
ReUI `data-grid` is for its specific composition through the shared package.
The v9 APIs below replace the older v8 examples; inspect the pinned TanStack
version before adapting either. Filters now use a query tree; do not use the
retired flat-list API against a freshly installed Filters component.
`createFilterQuery(rules?, combinator?, id?)` takes a root ID string;
`createFilterRule({ id, path, operator, value?, negated? })` takes an explicit
rule ID. An ID factory supplies those strings, not a helper argument. Use
Core's exported `@asym/ui/components/shadcn/number-field` wrapper and label its
input through `htmlFor`/`id`; it does not export `NumberFieldScrubArea`.
See [Core workflow](../SKILL.md#this-repository-asymmetric-alcore).

<!-- END:core-reui-overlay -->

The 24 ReUI building blocks: `alert`, `autocomplete`, `badge`, `cascader`, `code-block`, `data-grid`, `date-selector`, `event-calendar`, `filters`, `frame`, `gantt`, `icon-stack`, `icon-tile`, `kanban`, `number-field`, `phone-input`, `rating`, `scrollspy`, `signature-pad`, `sortable`, `stepper`, `time-picker`, `timeline`, `tree`. Examples and blocks are composed from these. `file-upload` is a ReUI component too, shipped as the `use-file-upload` hook rather than a primitive, so it is not in the 24: install it as `@reui/use-file-upload`, call `get_component("file-upload")` for its API and `get_examples("file-upload")` for its free examples.

**Rule one: never guess a component's API. Read it first.** Call **`get_component(name)`** for its inline `api` (props + usage, no web fetch), and **share the result's `docsUrl`** (the component's API documentation page) with the user whenever you work with that component's API, so they have the full reference (the `/llms.txt` index is a further fallback). Then call **`get_examples(name)`** to install a worked example and copy real composition. The contracts below are first-try orientation (required props, composition shape, the one gotcha); the inline `api` is the deeper reference. Do not assume you received all of it: a very large API (`cascader`, `filters`, `data-grid`) is trimmed on heading boundaries to fit your context, and every dropped heading is named in `sectionsOmitted`, so a trimmed capsule is a partial read - follow the response's own `next` hint to pull back the part you need instead of guessing at it. `validate_usage` always checks the FULL API, trimmed capsule or not. No single block fits? Compose: search the components you need, read each `get_component`, install a `get_examples` example per component, and adapt.

## data-grid (the flagship - read its API every time)

`data-grid` wraps TanStack Table v9. It is NOT a styled `<table>` and does NOT take `data`/`columns` props directly. The contract:

- Build a TanStack table instance with `useTable({ features: dataGridFeatures, ... })` (columns, data). `dataGridFeatures` is exported by the primitive and already bundles sorting, filtering, pagination, row selection, expanding, pinning, resizing and faceting, so there are no per-table row models to wire.
- Pass that instance to `<DataGrid table={table} recordCount={total}>`.
- Compose the body with `DataGridTable` inside `DataGrid`, and enable features through `tableLayout` (e.g. `{ headerSticky: true, columnsResizable: true }`), not ad-hoc classes.
- Server-side data uses the documented fetch shape (`recordCount` is the total for pagination).

```tsx
const table = useTable({
  features: dataGridFeatures,
  data,
  columns,
})

<DataGrid table={table} recordCount={data.length}>
  <DataGridTable />
</DataGrid>
```

Common mistakes:

- **Incorrect:** `<DataGrid data={rows} columns={cols} />` - these props do not exist. **Correct:** build a `useTable({ features: dataGridFeatures, ... })` instance and pass `table={table}` + `recordCount`.
- **Incorrect:** a raw `<table>` / hand-rolled pagination. **Correct:** use `data-grid`; read its API for sticky header, pagination, virtualization, row selection.
- **Incorrect:** styling rows/cells with arbitrary classes. **Correct:** drive layout via `tableLayout` and the primitive's `DataGridColumnMeta` (e.g. `cellClassName`, `headerTitle`), set through the bundle's `columnMeta` slot.

## event-calendar

**Required:** events via `events`/`onEventsChange` (controlled) or `defaultEvents` (uncontrolled), plus a height on the root.
**Shape:**

```tsx
<EventCalendar defaultEvents={events} defaultView="month" className="h-[560px]">
  <EventCalendarNav />
  <EventCalendarContent />
</EventCalendar>
```

**Gotcha:** headless-first: `EventCalendarContent` renders the active view (month/week/day/days/agenda; a resource view activates when `resources` is passed) - there is no per-view JSX to compose. Events are `{ id, title, start, end (exclusive), allDay?, color?, recurrence?, resourceId? }`. Mutations flow through `onEventUpdate`/`canDropEvent` (return `false` to reject); the root needs an explicit height because it is a min-h-0 flex column.

## gantt

**Required:** `resources` (the left tree) plus bars via `events`/`defaultEvents` attached by `resourceId`.
**Shape:**

```tsx
<Gantt
  defaultEvents={bars}
  resources={tasks}
  defaultScale="month"
  className="h-[480px]"
>
  <GanttNav />
  <GanttView />
</Gantt>
```

**Gotcha:** bars move along the time axis only (never across rows) and are all-day spans with exclusive `end`; `progress` is 0-100. Scales are `day | week | month | quarter | year`. Zoom control, infinite scroll, summary rollups, and row checkboxes are ON by default - turn off what you do not need. Same `onEventUpdate`/`canDropEvent` commit pipeline as `event-calendar`; the root needs an explicit height.

## kanban

**Required:** `value` (`Record<string, T[]>`), `onValueChange`, `getItemValue`
**Shape:**

```tsx
<Kanban value={cols} onValueChange={setCols} getItemValue={(i) => i.id}>
  <KanbanBoard>
    {Object.entries(cols).map(([id, items]) => (
      <KanbanColumn key={id} value={id}>
        <KanbanColumnHandle>
          <h3>{id}</h3>
        </KanbanColumnHandle>
        <KanbanColumnContent value={id}>
          {items.map((i) => (
            <KanbanItem key={i.id} value={i.id}>
              <KanbanItemHandle>{i.title}</KanbanItemHandle>
            </KanbanItem>
          ))}
        </KanbanColumnContent>
      </KanbanColumn>
    ))}
  </KanbanBoard>
  <KanbanOverlay>
    <div className="bg-muted size-full rounded-md" />
  </KanbanOverlay>
</Kanban>
```

**Gotcha:** state is `Record<columnId, T[]>`. Each `KanbanColumnContent value` must match its parent `KanbanColumn value`. Omit `KanbanOverlay` and the drag preview silently breaks.

## sortable

**Required:** `value` (`T[]`), `onValueChange`, `getItemValue`
**Shape:**

```tsx
<Sortable value={items} onValueChange={setItems} getItemValue={(i) => i.id}>
  {items.map((i) => (
    <SortableItem key={i.id} value={i.id}>
      <SortableItemHandle>
        <GripVertical />
      </SortableItemHandle>
      {i.label}
    </SortableItem>
  ))}
</Sortable>
```

**Gotcha:** a flat 1D reorder list (not columns - that is `kanban`). `getItemValue` must return a stable, unique string. Pass `layout="grid"` or `layout="nested"` for non-list layouts.

## filters

**Required:** `fields` (`FilterField[]`). The value is ONE `FilterQuery` tree - `query` + `onQueryChange`, or uncontrolled `defaultQuery`.
**Shape:**

```tsx
const fields: FilterField[] = [
  { id: "title", label: "Title", type: "text" },
  {
    id: "status",
    label: "Status",
    type: "select",
    options: [
      { value: "active", label: "Active" },
      { value: "archived", label: "Archived" },
    ],
  },
]
const [query, setQuery] = useState<FilterQuery>(() => createFilterQuery())

<Filters fields={fields} query={query} onQueryChange={setQuery} />
```

**Gotcha:** the state is a TREE, not a list of chips. `FilterQuery` is a group of rules joined by `and`/`or` and a group may hold another group, so `(A and B) or C` is expressible; a rule is `{ id, type: "rule", path: ["status"], operator, value }` and `path` is the whole nested attribute path, root first. The pre-rewrite API is GONE: there is no `filters`/`onChange` prop, no `FilterFieldConfig` (fields are `FilterField`, nested through their own `fields`, keyed `id` not `key`), and no `createFilter()` - it minted ids inside a pure function and broke hydration. `createFilterQuery(rules?, combinator?, id?)` defaults to an empty `and` group with root ID `"root"`; `createFilterRule({ id, path, operator, value?, negated? })` requires an explicit ID. `createFilterIdFactory(seed)` returns a function producing deterministic ID strings and the primitive seeds its internal factory from `useId`. The query and rule helpers take the resulting strings in their ID fields, not the factory itself. Read the query back with `flattenFilterConditions` (`{ path, field, operator, values, negated }` per rule, incomplete rules skipped) and walk the tree yourself when the parentheses carry meaning - the primitive compiles nothing, no SQL, no query string.

`variant` picks the chrome over that one query: `"basic"`, the default, is the flat chip row for a toolbar over a table; `"advanced"` is the condition builder, hung off a trigger or rendered in place with `advancedMode="inline"`. Both read and write the same tree, so a saved view built in one opens in the other. Other props worth knowing before you hand-roll them: `size` is two rungs, `"sm" | "default"`, resolved per style (there is no `lg`); `reorderable` turns on drag and Alt+Arrow row moves in the builder; `onBeforeQueryChange` is the ONE veto point for every write (return `false` to refuse, it cannot rewrite); `editors` registers custom value editors a field selects by `editor` name; `labels` / `operatorLabels` own every rendered string; `pathCollapse` + `maxPathSegments` shorten deep attribute paths; `renderChip` / `renderValue` / `renderEmpty` replace rendered parts. On a field, `loadOptions` supplies async options with paging and `resolveValues` renders a chip restored from a saved view whose option was never loaded. Pairs naturally with `data-grid`.

## cascader

**Required:** `items` (a tree of `{ value, label, children? }`), plus the panel parts inside `CascaderContent`.
**Shape:**

```tsx
<Cascader items={items} value={value} onValueChange={setValue}>
  <CascaderTrigger render={<Button variant="outline" />}>
    <CascaderValue placeholder="Select an attribute" />
  </CascaderTrigger>
  <CascaderContent className="w-80">
    <CascaderPanel>
      <CascaderNav>
        <CascaderBreadcrumb />
        <CascaderInput />
      </CascaderNav>
      <CascaderEmpty />
      <CascaderList maxHeight={288}>
        <CascaderItems />
      </CascaderList>
      <CascaderStatus />
    </CascaderPanel>
  </CascaderContent>
</Cascader>
```

**Gotcha:** pressing a branch NAVIGATES, it does not select - only leaves are selectable until you pass `selectable="any"` or a predicate, and once a branch is selectable its chevron becomes the only way to open it. `CascaderInput` must stay inside `CascaderContent` (Base UI refills the query from the selection when the input sits outside the popup). Always include `CascaderStatus`: it is the live region announcing level changes, which the visual breadcrumb does not provide to screen readers. Accepts a flat adjacency list via `getParent` as well as nested `children`. `searchScope="deep"` searches the current level and everything under it, `searchScope="global"` the whole tree from any level, and both annotate results with their path; `multiple` gives checkbox rows; `inline` + a bare `CascaderPanel` embeds it with no popover.

The shape above is `mode="drill"`, the default. `mode="tree"` keeps the same parts (drop `CascaderBreadcrumb`, pass `showBack={false}`, drive expansion with `expanded`/`onExpandedChange`); `mode="columns"` REPLACES `CascaderList` + `CascaderItems` with a single `CascaderColumns`, and has no breadcrumb. Other props worth knowing before you hand-roll them: `cascade` (multi-select only, parent/child selection with indeterminate branches - pair it with `selectable="any"`, since a leaf-only tree can never cascade), `indicator={false}` to drop the single-select check and its gutter (visual only, no-op with `multiple`), `virtualize`/`virtualizeThreshold` plus `CascaderVirtualItems` for long levels, and `getChildren` for async levels with cursor paging, retry on failure and optional `prefetch`. `CascaderFooter` pins commands below the list (`actions` is the quick path) and `CascaderSubmenu` opens one as a side-anchored flyout with the full menu keyboard model. To head a run of rows use `CascaderGroup` wrapping a `CascaderLabel` - a bare label inside a listbox names nothing and is dropped from the accessibility tree - and `CascaderSeparator` for the rule between runs. Every rendered string comes from `labels`, and the panel is RTL-correct under a `DirectionProvider` or `dir="rtl"`.

## date-selector

**Required:** none, but wire `onChange` to capture the value.
**Shape:**

```tsx
const [value, setValue] = useState<DateSelectorValue | undefined>()

<DateSelector value={value} onChange={setValue} label="Due date" />
```

**Gotcha:** the value is a structured `DateSelectorValue` (period / operator / start+end dates), NOT a `Date` - never pass a raw `Date`. Use `allowRange={false}` to lock single-date picking. Read `get_component("date-selector")` for the value shape.

## tree

**Required:** `tree` (a `@headless-tree/core` instance you construct)
**Shape:**

```tsx
<Tree tree={tree}>
  {tree.getItems().map((item) => (
    <TreeItem key={item.getId()} item={item}>
      <TreeItemLabel />
    </TreeItem>
  ))}
</Tree>
```

**Gotcha:** `Tree` is a styled shell - it takes a headless-tree instance via `tree`, NOT `data`/`items` props. Build the instance with `@headless-tree/react`. External API: https://headless-tree.lukasbach.com/

## stepper

**Required:** `StepperItem step` (number), `StepperContent value` (number)
**Shape:**

```tsx
<Stepper defaultValue={1}>
  <StepperNav>
    <StepperItem step={1}>
      <StepperTrigger>
        <StepperIndicator>1</StepperIndicator>
      </StepperTrigger>
      <StepperSeparator />
    </StepperItem>
    <StepperItem step={2}>
      <StepperTrigger>
        <StepperIndicator>2</StepperIndicator>
      </StepperTrigger>
    </StepperItem>
  </StepperNav>
  <StepperPanel>
    <StepperContent value={1}>Step 1 content</StepperContent>
    <StepperContent value={2}>Step 2 content</StepperContent>
  </StepperPanel>
</Stepper>
```

**Gotcha:** steps are 1-indexed. Without `StepperPanel` + `StepperContent` you render the nav trail but no body. Put `StepperSeparator` in every `StepperItem` except the last.

## timeline

**Required:** `TimelineItem step` (number)
**Shape:**

```tsx
<Timeline>
  <TimelineItem step={1}>
    <TimelineHeader>
      <TimelineDate>March 2024</TimelineDate>
      <TimelineTitle>Project initialized</TimelineTitle>
    </TimelineHeader>
    <TimelineIndicator />
    <TimelineSeparator />
    <TimelineContent>Repo and architecture set up.</TimelineContent>
  </TimelineItem>
</Timeline>
```

**Gotcha:** each item needs a unique `step`. `orientation` is `"vertical"` (default) or `"horizontal"`. This is a static event display, not interactive like `stepper`.

## autocomplete

**Required:** `items` (array; each item has at least `value`)
**Shape:**

```tsx
<Autocomplete items={items}>
  <AutocompleteInput placeholder="Search..." />
  <AutocompleteContent>
    <AutocompleteEmpty>No results found.</AutocompleteEmpty>
    <AutocompleteList>
      {(item) => (
        <AutocompleteItem key={item.value} value={item}>
          {item.label}
        </AutocompleteItem>
      )}
    </AutocompleteList>
  </AutocompleteContent>
</Autocomplete>
```

**Gotcha:** `AutocompleteList` takes a render-prop `(item) => ReactNode`, NOT a mapped array of children. External API: https://base-ui.com/react/components/autocomplete

## phone-input

**Required:** none, but wire `onChange`.
**Shape:**

```tsx
<PhoneInput
  placeholder="Enter phone number"
  defaultCountry="US"
  value={value}
  onChange={setValue}
/>
```

**Gotcha:** `value`/`onChange` use an E.164 string (e.g. `"+14155551234"`), not a display-formatted string; `onChange` can fire `undefined`. `defaultCountry` is a 2-letter ISO code. Wraps `react-phone-number-input`.

## number-field

**Required:** wrap the controls in `NumberFieldGroup`.
**Shape:**

```tsx
import { Label } from "@asym/ui/components/shadcn/label";
import {
  NumberField,
  NumberFieldDecrement,
  NumberFieldGroup,
  NumberFieldIncrement,
  NumberFieldInput,
} from "@asym/ui/components/shadcn/number-field";

<NumberField defaultValue={0}>
  <Label htmlFor="quantity">Quantity</Label>
  <NumberFieldGroup>
    <NumberFieldDecrement />
    <NumberFieldInput id="quantity" />
    <NumberFieldIncrement />
  </NumberFieldGroup>
</NumberField>;
```

**Gotcha:** Core imports the existing shared wrapper from `@asym/ui/components/shadcn/number-field`. Associate `Label` with `NumberFieldInput` through matching `htmlFor` and `id`; this wrapper does not export `NumberFieldScrubArea`. External API: https://base-ui.com/react/components/number-field

## rating

**Required:** `rating` (number)
**Shape:**

```tsx
<Rating rating={4.5} showValue editable onRatingChange={setRating} />
```

**Gotcha:** supports decimals (partial stars). Pass `editable` + `onRatingChange` for interactive input; omit both for a read-only display.

## scrollspy

**Required:** `targetRef` (the scroll container ref)
**Shape:**

```tsx
<Scrollspy targetRef={containerRef}>
  <a href="#s1" data-scrollspy-anchor="s1">Section 1</a>
  <a href="#s2" data-scrollspy-anchor="s2">Section 2</a>
</Scrollspy>
<div ref={containerRef}>
  <div id="s1">...</div>
  <div id="s2">...</div>
</div>
```

**Gotcha:** each link's `data-scrollspy-anchor` must match a section `id`. `targetRef` is the scrollable container (defaults to the window).

## frame

**Required:** `Frame` > `FramePanel`
**Shape:**

```tsx
<Frame>
  <FramePanel>
    <FrameHeader>
      <FrameTitle>Title</FrameTitle>
      <FrameDescription>Description</FrameDescription>
    </FrameHeader>
    <div className="p-5">Content</div>
    <FrameFooter>Footer</FrameFooter>
  </FramePanel>
</Frame>
```

**Gotcha:** a structured card shell for tool-like surfaces. `stacked` connects multiple panels with shared borders; `dense` removes panel padding; radius via the `--frame-radius` CSS variable.

## icon-stack

**Required:** one child icon
**Shape:**

```tsx
<IconStack aria-hidden="true">
  <InboxIcon className="size-4" />
</IconStack>
```

**Gotcha:** isometric layered artwork for empty states and illustrations; style the inner icon via its own `className`. Mark purely decorative stacks `aria-hidden="true"` and keep the real label in surrounding copy.

## icon-tile

**Required:** one child icon
**Shape:**

```tsx
<IconTile variant="elevated" size="lg">
  <PackageIcon />
</IconTile>
```

**Gotcha:** the square container an icon sits in, so every list row, feature card and empty state shares one affordance. `variant`: `outline` (default) | `elevated` (muted fill, raised ring) | `soft` (tinted nested, tone from currentColor) | `solid` (filled tone, contrasting glyph) | `frame` (double container). `soft` and `solid` retint from one text color class (they default to `text-primary`). `size`: `xs | sm | default | lg | xl` (24/32/40/48/64px tile, glyph scales 12/14/16/20/24px). `radius`: `default | full`. Do not set a `size-*` class on the child icon unless you mean to override the tile's glyph size; recolor with `className` on the tile, not the icon.

## code-block

**Required:** `code` + `language`, or pre-highlighted `lines`.
**Shape:**

```tsx
<CodeBlock code={code} language="tsx" />

<CodeBlock code={code} language="tsx" showLineNumbers maxLines={20}>
  <CodeBlockHeader>
    <CodeBlockTitle>use-totals.ts</CodeBlockTitle>
    <CodeBlockLanguage />
    <CodeBlockCopyButton className="ml-auto" />
  </CodeBlockHeader>
  <CodeBlockExpandButton />
</CodeBlock>
```

**Gotcha:** the one-liner is already a complete block; every child (header, title, language label, copy button, wrap toggle, expand button, line actions) is optional chrome, at any depth. Shiki is the only npm dependency and loads lazily, one chunk per language, on first highlight; `lines` (from `highlightCode` in `code-block-highlight`, which is server-safe and has no `"use client"`) or `highlight={false}` loads nothing at all. `maxLines` caps the height AND marks the block collapsible, which is what makes `CodeBlockExpandButton` appear. Use `variant="ghost"` when the block sits inside a surface that already has a border.

## alert

**Required:** `Alert` > `AlertTitle`
**Shape:**

```tsx
<Alert variant="success">
  <ShieldCheckIcon />
  <AlertTitle>Security update</AlertTitle>
  <AlertDescription>Enable two-factor authentication.</AlertDescription>
  <AlertAction>
    <Button size="xs">Update</Button>
  </AlertAction>
</Alert>
```

**Gotcha:** shadcn-compatible API. `variant`: `default | destructive | info | success | warning | invert`. The non-default variants use ReUI extended color tokens (`--success`/`--info`/`--warning`/`--invert`), which the install adds. Defer generic alert rules to the shadcn skill.

## badge

**Required:** none (text child).
**Shape:**

```tsx
<Badge variant="success-light" size="sm">Success</Badge>
<Badge variant="outline" radius="full">Pill</Badge>
```

**Gotcha:** shadcn-compatible. Rich `variant` set (solid, `-outline`, `-light` per color), `size` `xs..xl`, `radius` `default | full`. Like `alert`, the color variants rely on ReUI extended tokens. Prefer `Badge` variants over raw color classes for statuses.

## base vs radix - write for the project's base

ReUI ships every component in two builds: `base` (Base UI) and `radix` (Radix UI). The install command and name are identical, and the CLI installs the build matching the project. But you must write/adapt code against the **right base**, because their APIs differ.

**Detect the base first.** Read `components.json` -> `style` and take the segment before the first `-`:

- `"style": "base-nova"` -> **Base UI**
- `"style": "radix-nova"` -> **Radix UI**

**Then use that base's API.** The deltas mirror shadcn's base-vs-radix split:

- Slot/composition: Base UI `render={<… />}` vs Radix `asChild`.
- `Select`: Base UI takes `items`; Radix uses `<SelectItem>` children.
- `ToggleGroup`: Base UI `multiple` boolean vs Radix `type="single" | "multiple"`.

The safest path is to **read the installed files and `c-*` examples** - they're already in your base, so reuse their wiring instead of guessing. When `get_component`'s inline `api` or an example shows the other base's shape, translate it to your base (or `validate_usage` to confirm). Defer the generic base/radix mechanics to the shadcn skill.
