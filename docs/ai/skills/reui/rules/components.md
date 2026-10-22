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

The ReUI components: `alert`, `autocomplete`, `badge`, `cascader`, `code-block`, `color-picker`, `data-grid`, `date-selector`, `emoji-picker`, `event-calendar`, `file-type`, `filters`, `frame`, `gantt`, `icon-stack`, `icon-tile`, `kanban`, `number-field`, `phone-input`, `rating`, `scrollspy`, `signature-pad`, `sortable`, `stepper`, `time-picker`, `timeline`, `tree`. Examples and blocks are composed from these. `file-upload` is a ReUI component too, shipped as the `use-file-upload` hook rather than a primitive, so it is not in that list: install it as `@reui/use-file-upload`, which writes `hooks/use-file-upload.ts` (import `useFileUpload` from `@/hooks/use-file-upload`), call `get_component("file-upload")` for its API and `get_examples("file-upload")` for its free examples. There is no `@reui/file-upload`: the UI is a `c-file-upload-<n>` example, and one built on the hook installs it.

**Rule one: never guess a component's API.** Call **`get_component(name)`** for its inline `api` and share its `docsUrl` with the user, then **`get_examples(name)`** and copy a worked example. The contracts below are first-try orientation (required props, shape, the one gotcha); the `api` is the reference. A large `api` (`cascader`, `filters`, `data-grid`) is trimmed on heading boundaries: `sectionsOmitted` names what was dropped and the response's `next` hint pulls it back. `validate_usage` always checks the full API. No single block fits? Compose from components, 1 `get_examples` example each ([compose.md](./compose.md)).

## data-grid (the flagship - read its API every time)

`data-grid` wraps TanStack Table v9. It is NOT a styled `<table>` and does NOT take `data`/`columns` props directly. The contract:

- Build a TanStack table with `useTable({ features: dataGridFeatures, ... })`. `dataGridFeatures` already bundles sorting, filtering, pagination, selection, expanding, pinning, resizing and faceting: no row models to wire.
- Pass that instance to `<DataGrid table={table} recordCount={total}>`.
- Compose the body with `DataGridTable` inside `DataGrid`, and enable features through `tableLayout` (e.g. `{ headerSticky: true, columnsResizable: true }`), not ad-hoc classes.
- Server-side data: `manualPagination: true` and `rowCount: total` in `useTable`, `recordCount={total}`, and fetch with the table's `pagination` state (`DataGridPagination` changes `pageSize`).
- Columns are TanStack v9, `ColumnDef<DataGridFeatures, Order>[]`, never v8's `ColumnDef<Order>[]`; a sortable column's `header` renders `DataGridColumnHeader` (a string header cannot sort).
- Imports, each from `@/components/reui/data-grid/<file>`: `DataGrid`, `DataGridFeatures` and `dataGridFeatures` from `data-grid`, `DataGridColumnHeader` from `data-grid-column-header`, `DataGridTable` from `data-grid-table`, `DataGridPagination` from `data-grid-pagination`, `DataGridScrollArea` from `data-grid-scroll-area`; `useTable` and `ColumnDef` from `@tanstack/react-table`.
- States: `isLoading` renders skeleton rows from each column's `meta.skeleton` (a `ReactNode`: `<Skeleton className="h-4 w-20" />`); `emptyMessage` (a `ReactNode`) fills a grid with no rows: after a failed fetch, pass it the error with a Retry.
- Numeric column: `meta: { headerClassName: "text-end [&>div]:justify-end", cellClassName: "text-end tabular-nums" }`.
- Rows edited in place: `autoResetPageIndex: false` in `useTable`, or each write jumps back to page 1.
- In a Frame: `<FramePanel className="p-0">` around `DataGridScrollArea` and `DataGridTable`, plus `tableClassNames={{ base: "min-w-[720px]" }}` so on a phone the table scrolls inside the panel instead of squeezing.

```tsx
const columns = useMemo<ColumnDef<DataGridFeatures, Order>[]>(() => [
  { accessorKey: "total", header: ({ column }) => <DataGridColumnHeader title="Total" column={column} /> },
], [])
const table = useTable({ features: dataGridFeatures, data, columns })

<DataGrid table={table} recordCount={data.length}>
  <DataGridTable />
</DataGrid>
```

Never a raw `<table>` or hand-rolled pagination: the API covers sticky header, virtualization and row selection.

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
        <div className="flex items-center justify-between">
          <h3>{id}</h3>
          <KanbanColumnHandle aria-label="Move column">
            <GripVertical />
          </KanbanColumnHandle>
        </div>
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

**Gotcha:** state is `Record<columnId, T[]>`. Each `KanbanColumnContent value` must match its parent `KanbanColumn value`. Omit `KanbanOverlay` and the drag preview silently breaks. `KanbanColumnHandle` is hidden until its column is hovered or it has keyboard focus, so keep the column title outside it.

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

The shape above is `mode="drill"`, the default. `mode="tree"` keeps the same parts (drop `CascaderBreadcrumb`, pass `showBack={false}`, drive expansion with `expanded`/`onExpandedChange`); `mode="columns"` REPLACES `CascaderList` + `CascaderItems` with a single `CascaderColumns`, and has no breadcrumb. Other props worth knowing before you hand-roll them: `cascade` (multi-select only, parent/child selection with indeterminate branches - pair it with `selectable="any"`, since a leaf-only tree can never cascade), `virtualize` plus `CascaderVirtualItems` for long levels, and `getChildren` for async levels (paging, retry, `prefetch`). `CascaderFooter` pins commands below the list and `CascaderSubmenu` opens one as a side flyout. To head a run of rows use `CascaderGroup` wrapping a `CascaderLabel` - a bare label inside a listbox names nothing and is dropped from the accessibility tree - and `CascaderSeparator` for the rule between runs.

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

**Gotcha:** each link's `data-scrollspy-anchor` must match a section `id`. `targetRef` is the scrollable container (defaults to the window). `smooth` defaults to true: pass `smooth={!reduceMotion}` from motion/react's `useReducedMotion()`. Mark the active link `aria-current="location"` (track it with `onUpdate`); `"page"` is for route links.

## frame

**Required:** `Frame` > `FramePanel`
**Shape:**

```tsx
<Frame>
  <FrameHeader>
    <FrameTitle>Title</FrameTitle>
    <FrameDescription>Description</FrameDescription>
  </FrameHeader>
  <FramePanel>Content</FramePanel>
  <FrameFooter>Footer</FrameFooter>
</Frame>
```

**Gotcha:** the shell for data and tool-like surfaces. `spacing` (`xs` | `sm` | `default` | `lg`) sets panel padding and the gap between panels, so pick it instead of padding classes (the 1 exception: `<FramePanel className="p-0">` around a `data-grid`); `variant` is `default` | `inverse` | `ghost`; `stacked` joins panels with shared borders; `dense` removes the frame's own inset and gap (panels sit flush), and panel padding stays; `--frame-radius` is the one radius knob (panels derive `--frame-panel-radius`).

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

**Gotcha:** the one-liner is already a complete block; every child is optional chrome, at any depth. Shiki is the only npm dependency and loads lazily on first highlight; `lines` (from `highlightCode` in `code-block-highlight`, which is server-safe and has no `"use client"`) or `highlight={false}` loads nothing at all. `maxLines` caps the height AND marks the block collapsible, which is what makes `CodeBlockExpandButton` appear. Use `variant="ghost"` when the block sits inside a surface that already has a border.

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

**Gotcha:** shadcn-compatible API. `variant`: `default | destructive | info | success | warning | invert`. The non-default variants use ReUI extended color tokens (`--success`/`--info`/`--warning`/`--invert`), which the install adds.

## badge

**Required:** none (text child).
**Shape:**

```tsx
<Badge variant="success-light">Success</Badge>
<Badge variant="outline">Draft</Badge>
```

**Gotcha:** shadcn-compatible. Rich `variant` set (solid, `-outline`, `-light` per color), `size` `xs..xl` (keep the default), `radius` `default | full`. Like `alert`, the color variants rely on ReUI extended tokens. Prefer `Badge` variants over raw color classes: `<tone>-light` for a state, `outline` for a neutral label; an omitted `variant` is the solid primary fill.

## color-picker

**Required:** none (`<ColorPicker />` alone is complete); wire `value` + `onValueChange`.
**Shape:**

```tsx
<ColorPicker value={color} onValueChange={setColor} alpha>
  <ColorPickerTrigger />
  <ColorPickerContent>
    <ColorPickerPanel>
      <ColorPickerArea />
      <ColorPickerSlider channel="hue" />
      <ColorPickerSlider channel="alpha" />
      <ColorPickerFields />
    </ColorPickerPanel>
  </ColorPickerContent>
</ColorPicker>
```

**Gotcha:** the value is a CSS color string in `format` (`"hex"` default, `"rgb"`, `"hsl"`, `"hsb"` or `"oklch"`), `null` when empty, never an object. `onValueChange` fires on every drag move, so save in `onValueCommit`. Without `alpha` the value is always opaque. A bare `ColorPickerPanel` inside the root is an inline picker; `ColorPickerInput` replaces the trigger with a typable field.

## emoji-picker

**Required:** none; wire `onEmojiSelect` to insert a pick, or `value` + `onValueChange` to use it as a field.
**Shape:**

```tsx
<EmojiPicker onEmojiSelect={({ value }) => insert(value)}>
  <EmojiPickerTrigger />
  <EmojiPickerContent>
    <EmojiPickerHeader>
      <EmojiPickerSearch />
    </EmojiPickerHeader>
    <EmojiPickerCategories />
    <EmojiPickerList />
    <EmojiPickerFooter>
      <EmojiPickerPreview />
      <EmojiPickerSkinTone />
    </EmojiPickerFooter>
  </EmojiPickerContent>
</EmojiPicker>
```

**Gotcha:** the emoji data is fetched at runtime from a pinned jsDelivr path (`EMOJI_PICKER_DATA_URL`): under a strict Content Security Policy allow it in `connect-src`, self-host with `dataUrl`, or pass `data` (from `normalizeEmojibaseData`). Store the pick's `value` (the native emoji in its skin tone, or `:shortcode:` for a custom one). `multiple` makes the value a list, capped by `max`.

## file-type

**Required:** none; pass `type` (an extension, a family name or any string).
**Shape:**

```tsx
<FileType type="pdf" />
<FileType type={getFileType(file.name)} size="sm" aria-hidden="true" />
```

**Gotcha:** one `span` with `role="img"`, no children, no `"use client"` (fine in a Server Component). Resolve a file name, path, URL or MIME type with `getFileType`, never by splitting on the dot. `variant`: `outline` (default) | `solid` | `light` | `mono`; `size`: `mini` | `xs` | `sm` | `default` | `lg` | `xl` (18 to 56px); recolor with a `text-*` class. Pass `aria-hidden="true"` when the file name sits beside it.

## signature-pad

**Required:** `SignaturePad` > `SignaturePadArea`
**Shape:**

```tsx
<SignaturePad value={strokes} onValueChange={setStrokes}>
  <SignaturePadArea>
    <SignaturePadGuide />
    <SignaturePadPlaceholder />
    <SignaturePadControls>
      <SignaturePadUndo />
      <SignaturePadClear />
    </SignaturePadControls>
  </SignaturePadArea>
</SignaturePad>
```

**Gotcha:** the value is an array of strokes (`{ points: [x, y, size][], color? }`), not an image: store it as JSON, and export with `useSignaturePad()` or `apiRef` (`toSVG`, `toDataURL`, `toBlob`) or `SignaturePadSave` (`format`, `onSave`). `onValueChange` fires per finished stroke, never per pointer move. Size the area with a class (`h-40` by default); an overlay in it that is not a control needs `pointer-events-none`. Drawing needs a pointer, so offer a typed name where a signature is required.

## time-picker

**Required:** none (`<TimePicker />` alone is complete); wire `value` + `onValueChange`.
**Shape:**

```tsx
<TimePicker value={time} onValueChange={setTime}>
  <TimePickerTrigger />
  <TimePickerContent>
    <TimePickerColumns />
    <TimePickerFooter>
      <TimePickerNow />
      <TimePickerClear />
      <TimePickerConfirm />
    </TimePickerFooter>
  </TimePickerContent>
</TimePicker>
```

**Gotcha:** the value is a 24-hour `"HH:mm"` string (`"HH:mm:ss"` with `granularity="second"`) or `null`, never a `Date`, whatever `hourCycle={12}` shows. `minuteStep`, `min`, `max` and `isTimeDisabled` narrow the options; keep `isTimeDisabled` stable (module scope or memoized). `requireConfirm` holds picks as a draft until OK. `TimePickerInput` replaces `TimePickerTrigger` for a typable field, never beside it.

## base vs radix - write for the project's base

Every component ships a `base` (Base UI) and a `radix` (Radix UI) build under 1 name, and the CLI installs the one the project uses. Read `components.json` `style`: the part before the first `-` is the base (`base-nova` is **Base UI**, `radix-nova` is **Radix UI**). Write against that base; the deltas mirror shadcn's:

- Slot/composition: Base UI `render={<… />}` vs Radix `asChild`.
- `Select`: Base UI takes `items`; Radix uses `<SelectItem>` children.
- `ToggleGroup`: Base UI `multiple` boolean vs Radix `type="single" | "multiple"`.

Installed files and `c-*` examples are already in your base: reuse their wiring. When an `api` or example shows the other base's shape, translate it (or `validate_usage` to confirm).
