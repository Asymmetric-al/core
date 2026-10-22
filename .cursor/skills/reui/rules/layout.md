# Layout: house defaults, hierarchy, spacing, surfaces and states

## Point of view

Pick an emotional register before you compose - calm, operational, premium, editorial, dense, energetic - and let layout, spacing, surface treatment, and icon behavior all reinforce it. One or two memorable decisions and restraint everywhere else beats ten generic ones. UI with no point of view reads as generated.

**The bar:** before you finish, ask: would a product team keep this instead of replacing it? Does it still feel strong after swapping in real content? If not, reuse the shipped ReUI design harder - don't restyle it into something new - then run the [quality.md](./quality.md) gates.

## House defaults

<!-- gen:house-defaults:start -->

- **Spacing ladder**: `gap-1` to `gap-2` in a row, `gap-3` to `gap-4` between groups, `gap-6` to `gap-8` between sections, `gap-0.5` title to description. Deviate when: skip a level if you like, never invert them.
- **Panel title**: no size class on `FrameTitle` or `CardTitle`. Deviate when: never; `FrameTitle` ships `text-sm font-semibold`, `CardTitle` follows the installed style.
- **Meta text**: `text-xs`. Deviate when: never smaller, except inside illustrative mini-UI artwork.
- **Frame spacing**: `spacing="default"`, written out. Deviate when: `sm` in a sheet, dialog, drawer or popover, or for a dense data grid in a panel; `xs` or `lg` only with a stated reason.
- **Leading row icon**: `size-4`. Deviate when: never in a glyph column; `Spinner` ships `size-4`, so a loading swap keeps the width.
- **Icon inside a control**: no size class; the control sizes it per style and size. Deviate when: never pin `size-*` on an svg inside `Button`, `InputGroupButton`, `InputGroupAddon`, `DropdownMenuItem`, `DropdownMenuCheckboxItem`, `DropdownMenuRadioItem`, `DropdownMenuSubTrigger`, `SelectItem`, `CommandItem`, `Toggle`, `ToggleGroupItem`, `IconTile` or `MarkerIcon`.
- **Badge size**: `default` (leave `size` off). Deviate when: `lg` or `xl` only when the user asks; never `sm` or `xs`.
- **Neutral badge**: `variant="outline"`. Deviate when: never `secondary`, `default` or `primary-light` for an id, tag, version, count or Draft/Beta label; inline after the title, never `ml-auto`.
- **State badge**: `<tone>-light`: `success-light`, `info-light`, `warning-light`, `destructive-light`; `primary-light` for brand or pending. Deviate when: never the solid tone, `secondary` or `outline` for a state; 1 state badge per row.
- **Solid badge**: never unless asked; always name a variant (an omitted one is the solid primary fill). Deviate when: only when the user asks for a solid fill (`default`, `secondary`, `success`, `info`, `warning`, `destructive`, `focus`, `invert`).
- **Slot padding**: the primitive's own inset; set density with `Frame spacing=` or `Card size="sm"`. Deviate when: never a padding class on `CardHeader`, `CardContent`, `CardFooter`, `FrameHeader`, `FramePanel`, `FrameFooter`, `SheetHeader`, `SheetContent`, `SheetFooter`, `DialogHeader`, `DialogContent`, `DialogFooter`, `PopoverContent`, `DropdownMenuContent`, `TabsContent` or `AccordionContent`.
- **Inline separator**: `<span aria-hidden className="bg-muted-foreground/40 size-1 shrink-0 rounded-full" />`. Deviate when: never a typed `·` between rendered segments; a literal dot only inside 1 data string.
- **List rows**: dense, auto height; a row with no second line stays 1 tight line. Deviate when: never uniform height.
- **Current list item**: ghost hover fill (`bg-muted`, `dark:bg-muted/50`) plus `aria-current`. Deviate when: never a dot or a check mark.

<!-- gen:house-defaults:end -->

## Hierarchy

- 1 focal point per card or panel: the dominant metric or task, then its label, then detail. Borders, separators and surfaces make 2 to 3 bands, never equal weight everywhere.
- Overloaded? Remove, in order: decorative summaries, duplicate context, extra badges, long descriptions, secondary actions, mismatched icon treatments.

## Spacing and copy

- Siblings take the parent's `gap-*`, never their own margins; a heading sits nearer its own content than the section above it. Never pad an operational surface like a marketing page.
- Titles 1 to 3 words, a description 1 clause (about 8 words), a context line 2 segments at most, labels and buttons 1 to 2 words, a toast title 4 words at most. Copy that wraps at desktop width is over budget: cut it, never shrink the type.

## Surfaces

- `Frame` for data and operational surfaces (tables, lists, tool panels); `Card` for bounded sections and marketing.
- Prefer 1 container family per screen. With a KPI row and a table, use FramePanels for both, or Cards for the KPIs and a Frame for the table; never a Card inside a Frame or a Frame inside a Card.
- A `data-grid` inside a Frame is the one place for `<FramePanel className="p-0">`; elsewhere no padding on slots. This is the 1 exception to the Slot padding row above.
- 1 archetype per screen (operational ones and the marketing spine): [compose.md](./compose.md) lists each with its regions.

## Type and buttons

- A KPI value is `text-2xl font-semibold tracking-tight tabular-nums`.
- `size="sm"` on dense surfaces, `variant="outline"` for secondary actions, `ghost` for row actions; 1 primary per region, 1 variant per toolbar.
- A toolbar separator is `<Separator orientation="vertical" className="my-auto h-4" />`; at a 390px viewport a toolbar stays on 1 row.

## States and responsive

- Empty: a short message plus the primary action. Loading: a `Skeleton` in the real layout, never a centered spinner. Error: inline with a retry.
- No horizontal page scroll at 390px: reflow to 1 column instead of shrinking; `min-w-0` on the shrinking parent and `truncate` on single-line labels.
