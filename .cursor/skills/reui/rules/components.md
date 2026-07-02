# ReUI components

The 17 ReUI building blocks: `alert`, `autocomplete`, `badge`, `data-grid`, `date-selector`, `filters`, `frame`, `icon-stack`, `kanban`, `number-field`, `phone-input`, `rating`, `scrollspy`, `sortable`, `stepper`, `timeline`, `tree`. Examples and blocks are composed from these.

**Rule one: never guess a component's API. Read it first.** Call **`get_component(name)`** for its inline `api` (props + usage, no web fetch); the result's `docsUrl` and the `/llms.txt` index are the fallback. Then call **`get_examples(name)`** to install a worked example and copy real composition. The contracts below are first-try orientation (required props, composition shape, the one gotcha); the inline `api` is the full reference. No single block fits? Compose: search the components you need, read each `get_component`, install a `get_examples` example per component, and adapt.

## data-grid (the flagship - read its API every time)

`data-grid` wraps TanStack Table v8. It is NOT a styled `<table>` and does NOT take `data`/`columns` props directly. The contract:

- Build a TanStack table instance with `useReactTable(...)` (columns, data, the feature models you need: sorting, pagination, row selection).
- Pass that instance to `<DataGrid table={table} recordCount={total}>` (`total` is the full row count for pagination, not just the current page's `data.length`).
- Compose the body with `DataGridTable` inside `DataGrid`, and enable features through `tableLayout` (e.g. `{ headerSticky: true, columnsResizable: true }`), not ad-hoc classes.
- Server-side data uses the documented fetch shape (`recordCount` is the total for pagination).

```tsx
const table = useReactTable({
  data,
  columns,
  getCoreRowModel: getCoreRowModel(),
  // add sorting/pagination/selection models per the API
})

<DataGrid table={table} recordCount={totalRowCount}>
  <DataGridTable />
</DataGrid>
```

Common mistakes:

- **Incorrect:** `<DataGrid data={rows} columns={cols} />` - these props do not exist. **Correct:** build a `useReactTable` instance and pass `table={table}` + `recordCount`.
- **Incorrect:** a raw `<table>` / hand-rolled pagination. **Correct:** use `data-grid`; read its API for sticky header, pagination, virtualization, row selection.
- **Incorrect:** styling rows/cells with arbitrary classes. **Correct:** drive layout via `tableLayout` and the documented `ColumnMeta` (e.g. `cellClassName`, `headerTitle`).

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

**Required:** `filters` (`Filter[]`), `fields` (`FilterFieldConfig[]`), `onChange`
**Shape:**

```tsx
const [filters, setFilters] = useState<Filter[]>([
  createFilter("priority", "is_any_of", ["low"]),
])
const fields: FilterFieldConfig[] = [
  { key: "priority", label: "Priority", type: "multiselect",
    options: [{ value: "low", label: "Low" }, { value: "high", label: "High" }] },
]

<Filters filters={filters} fields={fields} onChange={setFilters} />
```

**Gotcha:** always build initial filters with `createFilter(field, operator, values)` - it generates the required `id`. Never hand-construct a `Filter` object. Pairs naturally with `data-grid`.

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
<NumberField defaultValue={0}>
  <NumberFieldScrubArea label="Quantity" />
  <NumberFieldGroup>
    <NumberFieldDecrement />
    <NumberFieldInput />
    <NumberFieldIncrement />
  </NumberFieldGroup>
</NumberField>
```

**Gotcha:** import from `@/components/ui/number-field`. The accessible label goes on `NumberFieldScrubArea`, not `NumberField`. External API: https://base-ui.com/react/components/number-field

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
